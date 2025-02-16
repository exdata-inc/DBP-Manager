import os
import shutil
import stat
import requests
import paramiko
import json
from datetime import datetime, timedelta
from paramiko import SSHConfig
import boto3
from botocore.exceptions import NoCredentialsError
import tempfile
import time
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.utils.timezone import now
from .models import RealWorldDataMoveDemands
from consts import *
from django.core.exceptions import MultipleObjectsReturned, ObjectDoesNotExist
from .models import RealWorldDataStoringInfo

# Function to send progress
def send_progress(uploaded, total, group_name='part_progress', message=None, error=None):
    channel_layer = get_channel_layer()
    progress = (uploaded / total) * 100 if total > 0 else 0

    progress_data = {
        'uploaded': uploaded,
        'total': total,
        'progress': progress
    }

    if message:
        progress_data['message'] = message
    if error:
        progress_data['error'] = error

    try:
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'send_progress',
                'progress_data': progress_data
            }
        )
        print(f"Progress sent: {progress_data}")
    except Exception as e:
        print(f"Failed to send progress update: {e}")

def add_move_demand(dataset_instance, filtered_distributions, end_storage_url):
    fields_data = dataset_instance.fields or {}
    dataset_url = fields_data.get("@id") or "http://localhost:8001/api/v0/dataset/unknown/?format=json"
    created_time_str = now().isoformat()
    existing_demands = RealWorldDataMoveDemands.objects.all()
    for item in filtered_distributions:
        move_to_url = end_storage_url              # dbp:moveTo
        move_from_url = item.get("@id")             # dbp:moveFrom
        current_dataset_url = dataset_url           # dbp:dataset
        
        if is_duplicate_demand(
            existing_demands=existing_demands,
            dataset_url=current_dataset_url,
            move_from_url=move_from_url,
            move_to_url=move_to_url
        ):
            print(f"同じ移動需要が既に存在するためスキップ: dataset={current_dataset_url}, from={move_from_url}, to={move_to_url}")
            continue

        move_demand_data = {
            "@type": "dbp:RealWorldDataMoveDemand",
            "@context": {
                "dbp": "https://exdata.co.jp/dbp/schema/",
                "schema": "https://schema.org/"
            },
            "dbp:moveTo": {
                "@id": move_to_url,
                "@type": "dbp:RealWorldDataStoringInfo"
            },
            "dbp:dataset": {
                "@id": current_dataset_url,
                "@type": "dbp:RealWorldDataset"
            },
            "schema:name": f"{dataset_instance.fields.get('schema:name')} : データ移動",
            "dbp:moveFrom": {
                "@id": move_from_url,
                "@type": "dbp:RealWorldDataStoringInfo"
            },
            "schema:dateCreated": created_time_str
        }
        new_demand = RealWorldDataMoveDemands.objects.create(author_id=1, fields=move_demand_data)
        generated_url = API_URL_PREFIX + "/" + MOVE_DEMANDS + f"/{new_demand.id}" + "/?format=json"
        move_demand_data["@id"] = generated_url
        new_demand.fields = move_demand_data
        new_demand.save()

        print(f"move demand を登録しました: {generated_url}")

def is_duplicate_demand(existing_demands, dataset_url, move_from_url, move_to_url):
    for demand in existing_demands:
        d_fields = demand.fields or {}
        d_dataset_id = d_fields.get("dbp:dataset", {}).get("@id")
        d_move_from_id = d_fields.get("dbp:moveFrom", {}).get("@id")
        d_move_to_id   = d_fields.get("dbp:moveTo", {}).get("@id")
        if (d_dataset_id == dataset_url 
            and d_move_from_id == move_from_url 
            and d_move_to_id == move_to_url):
            return True
    return False

# Function to filter distributions by date
def filter_distributions_by_date(distributions, start_time, end_time):
    start_time_dt = datetime.strptime(start_time, '%Y-%m-%d')
    end_time_dt = datetime.strptime(end_time, '%Y-%m-%d')

    filtered_distributions = []
    for dist in distributions:
        dist_start = datetime.strptime(dist['dbp:startTime'], '%Y-%m-%d')
        dist_end = datetime.strptime(dist['dbp:endTime'], '%Y-%m-%d')

        if dist_start <= end_time_dt and dist_end >= start_time_dt:
            filtered_distributions.append(dist)

    return filtered_distributions

# Functino to upload dataset         
def update_dataset_in_db(dataset_instance, filtered_distributions, update_storage_id):
    fields_data = dataset_instance.fields or {}
    distribution_list = fields_data["schema:distribution"]
    modified = False
    for dist in filtered_distributions:
        for i, distribution in enumerate(distribution_list):
            if (distribution.get("dbp:startTime") == dist.get("dbp:startTime") and
                distribution.get("dbp:endTime") == dist.get("dbp:endTime")):
                distribution_list[i]["@id"] = update_storage_id
                modified = True

    if modified:
        fields_data["schema:distribution"] = distribution_list
        dataset_instance.fields = fields_data
        dataset_instance.save()
        print("DB更新が成功しました。")
    else:
        print("filtered_distributions に該当する distribution が見つかりませんでした。")

# Function to load MinIO client from environment variables
def create_s3_client():
    s3_client_config = {
        "endpoint": os.environ.get("MINIO_ENDPOINT"),
        "access_key": os.environ.get("MINIO_ACCESS_KEY"),
        "secret_key": os.environ.get("MINIO_SECRET_KEY"),
    }
    return boto3.client(
        "s3",
        endpoint_url=s3_client_config["endpoint"],
        aws_access_key_id=s3_client_config["access_key"],
        aws_secret_access_key=s3_client_config["secret_key"],
    )

# Funciton to load ssh infomation from environment variables
def validate_and_get_ssh_info(storage_data, label):
    ssh_name = storage_data.get("schema:name")
    ssh_info = get_ssh_config(ssh_name)
    print(ssh_info)
    if not ssh_info:
        raise ValueError(f"{label} 用の SSH情報が取得できませんでした: {ssh_name}")
    return ssh_info

def get_ssh_config(hostname):
    ssh_config_path = os.path.expanduser("~/.ssh/config")
    if not os.path.exists(ssh_config_path):
        print(f"SSH config file not found: {ssh_config_path}")
        return None

    with open(ssh_config_path) as f:
        config = SSHConfig()
        config.parse(f)

    return config.lookup(hostname)

def get_storinginfo_by_id_url(url: str) -> dict | None:
    try:
        storing_obj = RealWorldDataStoringInfo.objects.get(fields__contains={"@id": url})
        return storing_obj.fields
    except ObjectDoesNotExist:
        print(f"Cannot find RealWorldDataStoringInfo with @id={url}")
        return None
    except MultipleObjectsReturned:
        print(f"Multiple RealWorldDataStoringInfo found for @id={url}, returning the first match.")
        storing_obj = RealWorldDataStoringInfo.objects.filter(fields__contains={"@id": url}).first()
        return storing_obj.fields if storing_obj else None

# Function to move data
def transfer_data(fields_data, start_time, end_time, start_storage_url, end_storage_url):
    start_date = datetime.strptime(start_time, "%Y-%m-%d")
    end_date = datetime.strptime(end_time, "%Y-%m-%d")
    
    total_days = (end_date - start_date).days + 1
    days_processed = 0
    send_progress(days_processed, total_days, group_name='date_progress')

    # for each day in the date range
    current_date = start_date

    # Fetch storage information
    start_storage_info = get_storinginfo_by_id_url(start_storage_url)
    end_storage_info   = get_storinginfo_by_id_url(end_storage_url)

    while current_date <= end_date:
        send_progress(0, 0)
        print(f"Processing date: {(current_date.strftime('%Y-%m-%d'))}")
        days_processed += 1
        send_progress(days_processed, total_days, group_name='date_progress', message=f"Processing date: {(current_date.strftime('%Y-%m-%d'))}")

        # Extract storage information
        start_storage_base_url = start_storage_info["dbp:baseUrl"]
        start_storage_pattern = start_storage_info["dbp:pattern"]
        end_storage_base_url = end_storage_info["dbp:baseUrl"]
        
        # Extract extend storage information
        if "dbp:extendedPathPatternFormats" in start_storage_info:
            for item in start_storage_info["dbp:extendedPathPatternFormats"]:
                placeholder = item["dbp:pattern"] 
                dataset_property = item["dbp:datasetProperty"]
                item_value = fields_data.get(dataset_property, "")
                start_storage_pattern = start_storage_pattern.replace(placeholder, item_value)
                
        # Generate path 
        formatted_path = current_date.strftime(start_storage_pattern)
        dir_path = os.path.dirname(formatted_path)

        try:
            # start_storage_base_url starts with "aws://"
            if start_storage_base_url.startswith("aws://") and end_storage_base_url.startswith("aws://"):
                start_full_path = os.path.join(start_storage_base_url.replace("aws:///", ""), dir_path).replace(os.sep, '/') + "/"
                end_full_path = os.path.join(end_storage_base_url.replace("aws:///", ""), dir_path).replace(os.sep, '/') + "/"            
                s3_client = create_s3_client()
                upload_from_aws_to_aws(s3_client, start_full_path, end_full_path, start_storage_info["schema:name"], end_storage_info["schema:name"])
            
            elif start_storage_base_url.startswith("aws://") and end_storage_base_url.startswith("ssh://"):
                start_full_path = os.path.join(start_storage_base_url.replace("aws:///", ""), dir_path).replace(os.sep, '/') + "/"
                end_full_path = os.path.join(end_storage_base_url.replace("ssh://", ""), dir_path).replace(os.sep, '/')
                s3_client = create_s3_client()
                end_ssh_info = validate_and_get_ssh_info(end_storage_info, "end_storage_info")
                upload_from_aws_to_ssh(s3_client, end_ssh_info, start_full_path, end_full_path, start_storage_info["schema:name"])
            
            elif start_storage_base_url.startswith("aws://") and end_storage_base_url.startswith("file://"):
                start_full_path = os.path.join(start_storage_base_url.replace("aws:///", ""), dir_path).replace(os.sep, '/') + "/"
                end_full_path = os.path.join(end_storage_base_url.replace("file://", ""), dir_path).replace(os.sep, '/')
                s3_client = create_s3_client()
                upload_from_aws_to_local(s3_client, start_full_path, end_full_path, start_storage_info["schema:name"])
            
            # start_storage_base_url starts with "ssh://"
            elif start_storage_base_url.startswith("ssh://") and end_storage_base_url.startswith("aws://"):
                start_full_path = os.path.join(start_storage_base_url.replace("ssh://", ""), dir_path).replace(os.sep, '/')
                end_full_path = os.path.join(end_storage_base_url.replace("aws://", ""), dir_path).replace(os.sep, '/')
                start_ssh_info = validate_and_get_ssh_info(start_storage_info, "start_storage_info")
                s3_client = create_s3_client()
                upload_from_ssh_to_aws(s3_client, start_ssh_info, start_full_path, end_full_path, end_storage_info["schema:name"])
            
            elif start_storage_base_url.startswith("ssh://") and end_storage_base_url.startswith("ssh://"):
                start_full_path = os.path.join(start_storage_base_url.replace("ssh://", ""), dir_path).replace(os.sep, '/')
                end_full_path = os.path.join(end_storage_base_url.replace("ssh://", ""), dir_path).replace(os.sep, '/')
                start_ssh_info = validate_and_get_ssh_info(start_storage_info, "start_storage_info")
                end_ssh_info = validate_and_get_ssh_info(end_storage_info, "end_storage_info")
                upload_from_ssh_to_ssh(start_ssh_info, end_ssh_info, start_full_path, end_full_path)
            
            elif start_storage_base_url.startswith("ssh://") and end_storage_base_url.startswith("file://"):
                start_full_path = os.path.join(start_storage_base_url.replace("ssh://", ""), dir_path).replace(os.sep, '/')
                end_full_path = os.path.join(end_storage_base_url.replace("file://", ""), dir_path).replace(os.sep, '/')
                start_ssh_info = validate_and_get_ssh_info(start_storage_info, "start_storage_info")
                upload_from_ssh_to_local(start_ssh_info, start_full_path, end_full_path)
            
            # start_storage_base_url starts with "file://"
            elif start_storage_base_url.startswith("file://") and end_storage_base_url.startswith("aws://"):
                start_full_path = os.path.join(start_storage_base_url.replace("file://", ""), dir_path).replace(os.sep, '/')
                end_full_path = os.path.join(end_storage_base_url.replace("aws://", ""), dir_path).replace(os.sep, '/')
                s3_client = create_s3_client()
                upload_from_local_to_aws(s3_client, start_full_path, end_full_path, end_storage_info["schema:name"])
            
            elif start_storage_base_url.startswith("file://") and end_storage_base_url.startswith("ssh://"):
                start_full_path = os.path.join(start_storage_base_url.replace("file://", ""), dir_path).replace(os.sep, '/')
                end_full_path = os.path.join(end_storage_base_url.replace("ssh://", ""), dir_path).replace(os.sep, '/')
                end_ssh_info = validate_and_get_ssh_info(end_storage_info, "end_storage_info")
                upload_from_local_to_ssh(end_ssh_info, start_full_path, end_full_path)

            elif start_storage_base_url.startswith("file://") and end_storage_base_url.startswith("file://"):
                start_full_path = os.path.join(start_storage_base_url.replace("file://", ""), dir_path).replace(os.sep, '/')
                end_full_path = os.path.join(end_storage_base_url.replace("file://", ""), dir_path).replace(os.sep, '/')
                upload_from_local_to_local(start_full_path, end_full_path)

            current_date += timedelta(days=1)

        except Exception as e:
            print(f"Error processing data: {e}")

def count_local_files(local_path):
    count = 0
    if os.path.isdir(local_path):
        for root, _, files in os.walk(local_path):
            count += len(files)
    else:
        count = 1
    return count

def count_remote_files(sftp, remote_path):
    count = 0
    try:
        if stat.S_ISDIR(sftp.stat(remote_path).st_mode):
            for item in sftp.listdir(remote_path):
                item_path = os.path.join(remote_path, item).replace("\\", "/")
                count += count_remote_files(sftp, item_path)
        else:
            count = 1
    except IOError:
        pass
    return count

def count_files_in_s3(s3_client, bucket_name, prefix):
    total_files = 0
    paginator = s3_client.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=bucket_name, Prefix=prefix):
        if "Contents" in page:
            total_files += len(page["Contents"])
    return total_files

def ensure_remote_directory(sftp, remote_dir):
    path_parts = remote_dir.split("/")
    current_path = ""
    for part in path_parts:
        if part:
            current_path = f"{current_path}/{part}".replace("//", "/")
            try:
                sftp.stat(current_path)
            except IOError:
                sftp.mkdir(current_path)
                
def ensure_local_directory(local_dir):
    if not os.path.exists(local_dir):
        os.makedirs(local_dir, exist_ok=True)
        
def establish_ssh_and_sftp(ssh_info):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(
        hostname=ssh_info.get('hostname'),
        username=ssh_info.get('user'),
        port=int(ssh_info.get('port', 22)),
        key_filename=ssh_info.get('identityfile', [None])[0]
    )

    sftp = ssh.open_sftp()
    return ssh, sftp

def is_remote_directory(sftp, remote_path):
    try:
        return stat.S_ISDIR(sftp.stat(remote_path).st_mode)
    except IOError:
        return False

# Function to upload data from local -> local
def upload_from_local_to_local(start_full_path, end_full_path):
    try:
        total_files = count_local_files(start_full_path)
        copied_files = 0

        def copy_file(src_file, dest_file):
            ensure_local_directory(os.path.dirname(dest_file))
            shutil.copy2(src_file, dest_file)
            nonlocal copied_files
            copied_files += 1
            send_progress(copied_files, total_files)

        def copy_directory(src_dir, dest_dir):
            for root, _, files in os.walk(src_dir):
                for file in files:
                    src_file = os.path.join(root, file)
                    dest_file = os.path.join(dest_dir, os.path.relpath(src_file, src_dir))
                    copy_file(src_file, dest_file)

        # Main copy logic
        if os.path.isdir(start_full_path):
            copy_directory(start_full_path, end_full_path)
        else:
            dest_file = os.path.join(end_full_path, os.path.basename(start_full_path))
            copy_file(start_full_path, dest_file)

        send_progress(copied_files, total_files)
        print(f"All files from '{start_full_path}' have been copied to '{end_full_path}'.")

    except Exception as e:
        send_progress(0, 0, error=str(e))
        print(f"Error during local copy: {e}")

# Function to upload data from local -> remote server 
def upload_from_local_to_ssh(ssh_info, start_full_path, end_full_path):
    try:
        ssh, sftp = establish_ssh_and_sftp(ssh_info)

        def upload_file(local_file, remote_file):
            ensure_remote_directory(sftp, os.path.dirname(remote_file))
            print(f"Uploading file: '{local_file}' to '{remote_file}'")
            sftp.put(local_file, remote_file)

        def upload_directory(local_dir, remote_dir):
            ensure_remote_directory(sftp, remote_dir)
            for item in os.listdir(local_dir):
                local_path = os.path.join(local_dir, item)
                remote_path = os.path.join(remote_dir, item).replace("\\", "/")
                if os.path.isdir(local_path):
                    upload_directory(local_path, remote_path)
                else:
                    upload_file(local_path, remote_path)

        # Upload logic
        if os.path.isdir(start_full_path):
            upload_directory(start_full_path, end_full_path)
        else:
            remote_file = os.path.join(end_full_path, os.path.basename(start_full_path)).replace("\\", "/")
            upload_file(start_full_path, remote_file)

        # Close connections
        sftp.close()
        ssh.close()

        print(f"All files from '{start_full_path}' have been uploaded to '{end_full_path}' on the remote server.")

    except Exception as e:
        print(f"Error during SSH upload: {e}")

# Function to upload data from local -> aws
def upload_from_local_to_aws(s3_client, start_full_path, end_full_path, bucket_name):
    try:
        total_files = count_local_files(start_full_path)
        uploaded_files = 0

        def upload_file_to_s3(local_file, object_key):
            print(f"Uploading file: '{local_file}' to S3 bucket '{bucket_name}' as '{object_key}'")
            s3_client.upload_file(local_file, bucket_name, object_key)

        def upload_directory_to_s3(local_dir, s3_base_path):
            nonlocal uploaded_files
            for root, _, files in os.walk(local_dir):
                for file in files:
                    local_file = os.path.join(root, file)
                    relative_path = os.path.relpath(local_file, start_full_path)
                    object_key = os.path.join(s3_base_path, relative_path).replace("\\", "/")
                    upload_file_to_s3(local_file, object_key)
                    uploaded_files += 1
                    send_progress(uploaded_files, total_files)

        # Upload logic
        if os.path.isdir(start_full_path):
            upload_directory_to_s3(start_full_path, end_full_path)
        else:
            object_key = os.path.join(end_full_path, os.path.basename(start_full_path)).replace("\\", "/")
            upload_file_to_s3(start_full_path, object_key)
            uploaded_files += 1
            send_progress(uploaded_files, total_files)

        send_progress(uploaded_files, total_files)
        print(f"All files from '{start_full_path}' have been uploaded to bucket '{bucket_name}' under '{end_full_path}'.")

    except Exception as e:
        send_progress(0, 0, error=str(e))
        print(f"Error uploading to S3: {e}")

# Function to download data from remote server -> local
def upload_from_ssh_to_local(ssh_info, start_full_path, end_full_path):
    try:
        ssh, sftp = establish_ssh_and_sftp(ssh_info)

        def download_file(remote_file, local_file):
            ensure_local_directory(os.path.dirname(local_file))
            print(f"Downloading file: '{remote_file}' to '{local_file}'")
            sftp.get(remote_file, local_file)

        def download_directory(sftp, remote_dir, local_dir):
            ensure_local_directory(local_dir)
            for item in sftp.listdir(remote_dir):
                remote_path = os.path.join(remote_dir, item).replace("\\", "/")
                local_path = os.path.join(local_dir, item)
                try:
                    if is_remote_directory(sftp, remote_path):
                        download_directory(remote_path, local_path)
                    else:
                        download_file(remote_path, local_path)
                        nonlocal downloaded_files
                        downloaded_files += 1
                        send_progress(downloaded_files, total_files)                    
                        
                except IOError as e:
                    print(f"Error accessing: {remote_path}, {e}")

        total_files = count_remote_files(sftp, start_full_path)
        downloaded_files = 0

        # Download logic
        if is_remote_directory(sftp, start_full_path):
            download_directory(sftp, start_full_path, end_full_path)
        else:
            local_file = os.path.join(end_full_path, os.path.basename(start_full_path))
            download_file(start_full_path, local_file)
            downloaded_files += 1
            send_progress(downloaded_files, total_files)

        # Close connections
        sftp.close()
        ssh.close()

        send_progress(downloaded_files, total_files, message="Download completed successfully.")
        print(f"All files from '{start_full_path}' have been downloaded to '{end_full_path}' on the local machine.")

    except Exception as e:
        send_progress(0, 0, error=str(e))
        print(f"Error during SSH download: {e}")

# Function to download data from remote server -> server
def upload_from_ssh_to_ssh(start_ssh_info, end_ssh_info, start_full_path, end_full_path):
    try:
        start_ssh, start_sftp = establish_ssh_and_sftp(start_ssh_info)
        end_ssh, end_sftp = establish_ssh_and_sftp(end_ssh_info)

        def transfer_file(src_sftp, dst_sftp, src_file, dst_file):
            ensure_remote_directory(dst_sftp, os.path.dirname(dst_file))
            print(f"Transferring file: '{src_file}' to '{dst_file}'")
            with src_sftp.file(src_file, 'rb') as file_stream:
                dst_sftp.putfo(file_stream, dst_file)

        def transfer_directory(src_sftp, dst_sftp, src_dir, dst_dir):
            ensure_remote_directory(dst_sftp, dst_dir)
            for item in src_sftp.listdir(src_dir):
                src_path = os.path.join(src_dir, item).replace("\\", "/")
                dst_path = os.path.join(dst_dir, item).replace("\\", "/")
                if is_remote_directory(src_sftp, src_path):
                    transfer_directory(src_sftp, dst_sftp, src_path, dst_path)
                else:
                    transfer_file(src_sftp, dst_sftp, src_path, dst_path)
                    nonlocal transferred_files
                    transferred_files += 1
                    send_progress(transferred_files, total_files)

        total_files = count_remote_files(start_sftp, start_full_path)
        transferred_files = 0

        # Transfer logic
        if is_remote_directory(start_sftp, start_full_path):
            transfer_directory(start_sftp, end_sftp, start_full_path, end_full_path)
        else:
            dst_file = os.path.join(end_full_path, os.path.basename(start_full_path)).replace("\\", "/")
            transfer_file(start_sftp, end_sftp, start_full_path, dst_file)
            transferred_files += 1
            send_progress(transferred_files, total_files)

        # Close connections
        start_sftp.close()
        end_sftp.close()
        start_ssh.close()
        end_ssh.close()

        send_progress(transferred_files, total_files, message="Transfer completed successfully.")
        print(f"All files from '{start_full_path}' have been transferred to '{end_full_path}' on the destination server.")

    except Exception as e:
        send_progress(0, 0, error=str(e))
        print(f"Error during SSH to SSH transfer: {e}")

# Function to download data from remote server -> aws
def upload_from_ssh_to_aws(s3_client, start_ssh_info, start_full_path, end_full_path, bucket_name):
    try:
        start_ssh, start_sftp = establish_ssh_and_sftp(start_ssh_info)

        def upload_file_to_s3(local_stream, remote_file, bucket_name, s3_key):
            print(f"Uploading file from SSH: '{remote_file}' to S3 bucket '{bucket_name}' as '{s3_key}'")
            s3_client.upload_fileobj(local_stream, bucket_name, s3_key)

        def transfer_files_to_s3(sftp, remote_path, s3_base_path):
            nonlocal uploaded_files
            if is_remote_directory(sftp, remote_path):
                for item in sftp.listdir(remote_path):
                    remote_item_path = os.path.join(remote_path, item).replace("\\", "/")
                    s3_item_path = os.path.join(s3_base_path, item).replace("\\", "/")
                    transfer_files_to_s3(sftp, remote_item_path, s3_item_path)
            else:
                s3_key = os.path.join(end_full_path, os.path.basename(remote_path)).replace("\\", "/")
                with sftp.file(remote_path, 'rb') as file_stream:
                    upload_file_to_s3(file_stream, remote_path, bucket_name, s3_key)
                uploaded_files += 1
                send_progress(uploaded_files, total_files)

        total_files = count_remote_files(start_sftp, start_full_path)
        uploaded_files = 0

        # Transfer logic
        transfer_files_to_s3(start_sftp, start_full_path, end_full_path)

        # Close connections
        start_sftp.close()
        start_ssh.close()

        send_progress(uploaded_files, total_files, message="Upload to S3 completed successfully.")
        print(f"All files from '{start_full_path}' have been uploaded to S3 bucket '{bucket_name}' under '{end_full_path}'.")

    except Exception as e:
        send_progress(0, 0, error=str(e))
        print(f"Error during SSH to AWS transfer: {e}")

# Function to download data from aws -> local
def upload_from_aws_to_local(s3_client, start_full_path, end_full_path, bucket_name):
    try:
        def download_file(s3_key, local_file_path):
            ensure_local_directory(os.path.dirname(local_file_path))
            print(f"Downloading file: 's3://{bucket_name}/{s3_key}' to '{local_file_path}'")
            s3_client.download_file(bucket_name, s3_key, local_file_path)

        # Count total files for progress tracking
        total_files = count_files_in_s3(s3_client, bucket_name, start_full_path)
        downloaded_files = 0

        # List objects in the specified S3 path
        paginator = s3_client.get_paginator("list_objects_v2")
        found_objects = False
        for page in paginator.paginate(Bucket=bucket_name, Prefix=start_full_path):
            if "Contents" not in page:
                continue

            found_objects = True
            for obj in page["Contents"]:
                s3_key = obj["Key"]

                # Calculate local path
                relative_path = os.path.relpath(s3_key, start_full_path)
                local_file_path = os.path.join(end_full_path, relative_path)

                # Download the file
                download_file(s3_key, local_file_path)
                downloaded_files += 1
                send_progress(downloaded_files, total_files)
                time.sleep(3.0)

        if not found_objects:
            print(f"No files found in S3 path: s3://{bucket_name}/{start_full_path}")

        send_progress(downloaded_files, total_files, message="Download from S3 completed successfully.")
        print(f"All files from S3 path '{start_full_path}' in bucket '{bucket_name}' have been downloaded to '{end_full_path}'.")

    except Exception as e:
        send_progress(0, 0, error=str(e))
        print(f"Error downloading from S3 to local: {e}")

def upload_from_aws_to_ssh(s3_client, ssh_info, start_full_path, end_full_path, bucket_name):
    try:
        ssh, sftp = establish_ssh_and_sftp(ssh_info)

        def upload_file_to_ssh(local_file, remote_file):
            ensure_remote_directory(sftp, os.path.dirname(remote_file))
            print(f"Uploading file: '{local_file}' to '{remote_file}'")
            sftp.put(local_file, remote_file)

        # Count total files for progress tracking
        total_files = count_files_in_s3(s3_client, bucket_name, start_full_path)
        uploaded_files = 0

        # List objects in the specified S3 path
        paginator = s3_client.get_paginator("list_objects_v2")
        for page in paginator.paginate(Bucket=bucket_name, Prefix=start_full_path):
            if "Contents" not in page:
                print(f"No files found in S3 path: s3://{bucket_name}/{start_full_path}")
                return

            for obj in page["Contents"]:
                s3_key = obj["Key"]
                relative_path = os.path.relpath(s3_key, start_full_path)
                remote_file_path = os.path.join(end_full_path, relative_path).replace("\\", "/")

                # Download the file from S3
                with tempfile.NamedTemporaryFile() as temp_file:
                    temp_file_path = temp_file.name
                    print(f"Downloading file: 's3://{bucket_name}/{s3_key}' to temporary file '{temp_file_path}'")
                    s3_client.download_file(bucket_name, s3_key, temp_file_path)

                    # Upload the file to SSH
                    upload_file_to_ssh(temp_file_path, remote_file_path)
                    uploaded_files += 1
                    send_progress(uploaded_files, total_files)

        # Close the SFTP session and SSH connection
        sftp.close()
        ssh.close()

        send_progress(uploaded_files, total_files, message="Transfer from S3 to SSH completed successfully.")
        print(f"All files from S3 path '{start_full_path}' in bucket '{bucket_name}' have been uploaded to '{end_full_path}' on SSH server '{ssh_info.get('hostname')}'.")

    except Exception as e:
        send_progress(0, 0, error=str(e))
        print(f"Error transferring files from AWS to SSH: {e}")

def upload_from_aws_to_aws(s3_client, start_full_path, end_full_path, start_bucket_name, end_bucket_name):
    try:
        # Count total files for progress tracking
        total_files = count_files_in_s3(s3_client, start_bucket_name, start_full_path)
        copied_files = 0

        # List objects in the source bucket
        paginator = s3_client.get_paginator("list_objects_v2")
        for page in paginator.paginate(Bucket=start_bucket_name, Prefix=start_full_path):
            if "Contents" not in page:
                print(f"No files found in S3 path: s3://{start_bucket_name}/{start_full_path}")
                return

            for obj in page["Contents"]:
                source_key = obj["Key"]
                destination_key = source_key.replace(start_full_path, end_full_path, 1)

                # Copy the object
                copy_source = {"Bucket": start_bucket_name, "Key": source_key}
                print(f"Copying file: 's3://{start_bucket_name}/{source_key}' to 's3://{end_bucket_name}/{destination_key}'")
                s3_client.copy_object(
                    CopySource=copy_source,
                    Bucket=end_bucket_name,
                    Key=destination_key
                )

                copied_files += 1
                send_progress(copied_files, total_files)

        send_progress(copied_files, total_files, message="S3 to S3 copy completed successfully.")
        print(f"All files from 's3://{start_bucket_name}/{start_full_path}' have been copied to 's3://{end_bucket_name}/{end_full_path}'.")

    except Exception as e:
        send_progress(0, 0, error=str(e))
        print(f"Error during S3 to S3 transfer: {e}")
