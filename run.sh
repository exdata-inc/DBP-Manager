#!/bin/bash
python server/manage.py makemigrations
python server/manage.py migrate
python server/manage.py createcustomsuperuser --username $RWDB_SU_USERNAME --password $RWDB_SU_PASSWORD --noinput --email $RWDB_SU_EMAIL
python server/manage.py createPredicate5W1H
python server/manage.py runserver 0.0.0.0:8000 --noreload