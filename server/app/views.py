from django.shortcuts import render, redirect
from django.views.generic import View
from .models import *
from .forms import *
from .mixins import *
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse, FileResponse, HttpResponse
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib import messages
from django.urls import reverse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from urllib.parse import urlencode
from django.contrib.auth.models import User
from drf_multiple_model.viewsets import ObjectMultipleModelAPIViewSet

from datetime import datetime, timedelta
import copy
import os
import json
import re
import requests

from rest_framework import viewsets, filters
from .serializer import *

from .move import *

#####
def createPredicate5W1H():
    # when
    Predicate.objects.get_or_create(author=User(id=1), predicate="data:when", description="データを取得した日時を表す。")
    # where
    Predicate.objects.get_or_create(author=User(id=1), predicate="data:place", description="データを取得した場所の名前を表す。")
    Predicate.objects.get_or_create(author=User(id=1), predicate="place:lat", description="ある場所の緯度を表す。")
    Predicate.objects.get_or_create(author=User(id=1), predicate="place:lon", description="ある場所の経度を表す。")
    # who
    Predicate.objects.get_or_create(author=User(id=1), predicate="data:organization", description="データを取得した組織を表す。")
    Predicate.objects.get_or_create(author=User(id=1), predicate="data:person", description="データを取得した人を表す。")
    Predicate.objects.get_or_create(author=User(id=1), predicate="org2person", description="ある組織に所属する人を表す。")
    # what
    Predicate.objects.get_or_create(author=User(id=1), predicate="data:what", description="データの形を表す。")
    # why
    Predicate.objects.get_or_create(author=User(id=1), predicate="data:reason", description="データが取得された理由を表す。")
    #how
    Predicate.objects.get_or_create(author=User(id=1), predicate="data:device_type", description="データを取得したデバイスのタイプを表す。")
    Predicate.objects.get_or_create(author=User(id=1), predicate="data:device_model", description="データを取得したデバイスのモデルを表す。")
    Predicate.objects.get_or_create(author=User(id=1), predicate="data:device_id", description="データを取得したデバイスの固有IDを表す。")
    Predicate.objects.get_or_create(author=User(id=1), predicate="device:type2model", description="あるデバイスタイプのデバイスモデルを表す。")
    Predicate.objects.get_or_create(author=User(id=1), predicate="device:model2id", description="あるデバイスモデルのデバイスの固有IDを表す。")
    #history
    Predicate.objects.get_or_create(author=User(id=1), predicate="data:history", description="データをダウンロードした日付を表す。")

# Docker上でmakemigrationsしようとすると、DBにはないカラムを呼び出すことになってしまい、うまくいかない
# -> コメントアウトして、makemigrationsとmigrateを行う
# createPredicate5W1H()

def createWhereDouble(author, place):
    place_data, _ = Node.objects.get_or_create(author=author, node=place)
    Double.objects.get_or_create(author=author, predicate=Predicate.objects.get(predicate="data:place"), object_node=place_data)

def createWhoDouble(author, organization, person):
    organization_data, _ = Node.objects.get_or_create(author=author, node=organization)
    Double.objects.get_or_create(author=author, predicate=Predicate.objects.get(predicate="data:organization"), object_node=organization_data)
    person_data, _ = Node.objects.get_or_create(author=author, node=person)
    Double.objects.get_or_create(author=author, predicate=Predicate.objects.get(predicate="data:person"), object_node=person_data)
    Triple.objects.get_or_create(author=author, subject_node=organization_data, predicate=Predicate.objects.get(predicate="org2person"), object_node=person_data)

def createWhatDouble(author, what):
    what_data, _ = Node.objects.get_or_create(author=author, node=what)
    Double.objects.get_or_create(author=author, predicate=Predicate.objects.get(predicate="data:what"), object_node=what_data)

def createWhyDouble(author, reason):
    reason_data, _ = Node.objects.get_or_create(author=author, node=reason)
    Double.objects.get_or_create(author=author, predicate=Predicate.objects.get(predicate="data:reason"), object_node=reason_data)

def createHowDouble(author, device_type, device_model, device_id):
    device_type_data, _ = Node.objects.get_or_create(author=author, node=device_type)
    Double.objects.get_or_create(author=author, predicate=Predicate.objects.get(predicate="data:device_type"), object_node=device_type_data)
    device_model_data, _ = Node.objects.get_or_create(author=author, node=device_model)
    Double.objects.get_or_create(author=author, predicate=Predicate.objects.get(predicate="data:device_model"), object_node=device_model_data)
    device_id_data, _ = Node.objects.get_or_create(author=author, node=device_id)
    Double.objects.get_or_create(author=author, predicate=Predicate.objects.get(predicate="data:device_id"), object_node=device_id_data)
    Triple.objects.get_or_create(author=author, subject_node=device_type_data, predicate=Predicate.objects.get(predicate="device:type2model"), object_node=device_model_data)
    Triple.objects.get_or_create(author=author, subject_node=device_model_data, predicate=Predicate.objects.get(predicate="device:model2id"), object_node=device_id_data)

def createTriplebyDouble(author, subject_RW, double: Double):
    predicate_data = double.predicate
    object_node_data = double.object_node
    Triple.objects.get_or_create(author=author, subject_RW=subject_RW, predicate=predicate_data, object_node=object_node_data)

def createRWTriple(author, file, when: datetime, place, organization, person, what, reason, device_type, device_model, device_id):
    RW_data, _ = RW_adminDB_rdf.objects.get_or_create(author=author, file=file)
    when_data, _ = Node.objects.get_or_create(author=author, node=when.isoformat())
    Triple.objects.get_or_create(author=author, subject_RW=RW_data, predicate=Predicate.objects.get(predicate="data:when"), object_node=when_data)
    createTriplebyDouble(author, RW_data, Double.objects.get(predicate=Predicate.objects.get(predicate="data:place"), object_node=Node.objects.get(node=place)))
    createTriplebyDouble(author, RW_data, Double.objects.get(predicate=Predicate.objects.get(predicate="data:organization"), object_node=Node.objects.get(node=organization)))
    createTriplebyDouble(author, RW_data, Double.objects.get(predicate=Predicate.objects.get(predicate="data:person"), object_node=Node.objects.get(node=person)))
    createTriplebyDouble(author, RW_data, Double.objects.get(predicate=Predicate.objects.get(predicate="data:what"), object_node=Node.objects.get(node=what)))
    createTriplebyDouble(author, RW_data, Double.objects.get(predicate=Predicate.objects.get(predicate="data:reason"), object_node=Node.objects.get(node=reason)))
    createTriplebyDouble(author, RW_data, Double.objects.get(predicate=Predicate.objects.get(predicate="data:device_type"), object_node=Node.objects.get(node=device_type)))
    createTriplebyDouble(author, RW_data, Double.objects.get(predicate=Predicate.objects.get(predicate="data:device_model"), object_node=Node.objects.get(node=device_model)))
    createTriplebyDouble(author, RW_data, Double.objects.get(predicate=Predicate.objects.get(predicate="data:device_id"), object_node=Node.objects.get(node=device_id)))
#####

class InitView(LoginRequiredMixin, View):
    def get(self, request, *args, **kwargs):
        RW_datas = RW_adminDB.objects.order_by('-id')
        MAX_RW_DATA_NUM = 3
        paginator = Paginator(RW_datas, MAX_RW_DATA_NUM)
        page = request.GET.get(key="page", default=1)
        pages = paginator.page(page)
        """
        RW_datas = RW_adminDB.objects.order_by('-id')   # order_by('-id):最新順にデータ格納
        data_java = {
            "RW_datas_fileurl": [RW_data.file.url for RW_data in RW_datas],
            "RW_datas_filename": [RW_data.file.name for RW_data in RW_datas],
        }
        
        data_java = {
            "RW_data_min_id": pages[-1].id,
            "RW_data_max_id": pages[0].id,
            "RW_datas_fileurl": [RW_data.file.url for RW_data in pages],
            "RW_datas_filename": [RW_data.file.name for RW_data in pages],
            "RW_datas_id": [RW_data.id for RW_data in pages],
        }
        """
        return render(request, "app/init.html", {
            "pages": pages,
            #"data_java": json.dumps(data_java),
        })

    def post(self,request,*args,**kwargs):
        RW_data_id = int(request.POST.get("RW_data_index"))
        RW_data = RW_adminDB.objects.get(id=RW_data_id)
        RW_data.data_used_count += 1
        RW_data.save()
        DataHistory_data = DataHistory()
        DataHistory_data.author = request.user
        DataHistory_data.target_data = RW_data
        DataHistory_data.save()
        d = {
                "nexturl": "."
            }
        return JsonResponse(d)

def RW_adminDB_download(request, RW_data_id):
    #print(request, type(request))
    RW_data = RW_adminDB.objects.get(id=RW_data_id)
    RW_data.data_used_count += 1
    RW_data.save()
    DataHistory_data = DataHistory()
    DataHistory_data.author = request.user
    DataHistory_data.target_data = RW_data
    DataHistory_data.save()
    file_path = os.path.join("app", RW_data.file.url[1:])
    file_name = RW_data.file.name
    #####
    RW_data_rdf = RW_adminDB_rdf.objects.get(id=RW_data_id)
    RW_data_rdf.data_used_count += 1
    RW_data_rdf.save()
    history_data, _ = Node.objects.get_or_create(author=request.user, node=datetime.now().isoformat())
    Triple.objects.get_or_create(author=request.user, subject_RW=RW_data_rdf, predicate=Predicate.objects.get(predicate="data:history"), object_node=history_data)
    #####
    return FileResponse(open(file_path, "rb"), as_attachment=True, filename=file_name)

class RW_adminDB_new(LoginRequiredMixin, View):
    def get(self, request, *args, **kwargs):
        where_init = self.request.GET.get(key="where", default=0)
        who_init = self.request.GET.get(key="who", default=0)
        what_init = self.request.GET.get(key="what", default=0)
        why_init = self.request.GET.get(key="why", default=0)
        how_init = self.request.GET.get(key="how", default=0)
        initial = {
            "when": timezone.now,
            "where": where_init,
            "who": who_init,
            "what": what_init,
            "why": why_init,
            "how": how_init,
        }
        RW_form = RW_adminDBForm(request.POST or None, initial=initial)
        return render(request, "app/RW_adminDB_new.html", {
            "RW_form": RW_form,
        })

    def post(self, request, *args, **kwargs):
        print(request.POST["when"])
        when = {
            "year": int(request.POST["when"].split("-")[0]),
            "month": int(request.POST["when"].split("-")[1]),
            "day": int(request.POST["when"].split("T")[0][-2:]),
            "hour": int(request.POST["when"].split(":")[0][-2:]),
            "minute": int(request.POST["when"].split(":")[1]),
            "second": int(request.POST["when"].split(":")[2]),
        }
        RW_form = RW_adminDBForm(request.POST or None,request.FILES or None)
        if RW_form.is_valid() or True:
            RW_data = RW_adminDB()
            RW_data.author = request.user
            RW_data.file = RW_form.cleaned_data["file"]
            RW_data.when = datetime(when["year"], when["month"], when["day"], when["hour"], when["minute"], when["second"])
            RW_data.where = RW_form.cleaned_data["where"]
            RW_data.who = RW_form.cleaned_data["who"]
            RW_data.what = RW_form.cleaned_data["what"]
            RW_data.why = RW_form.cleaned_data["why"]
            RW_data.how = RW_form.cleaned_data["how"]
            RW_data.save()
            createRWTriple(request.user,
                           RW_form.cleaned_data["file"],
                           datetime(when["year"], when["month"], when["day"], when["hour"], when["minute"], when["second"]),
                           RW_form.cleaned_data["where"].place,
                           RW_form.cleaned_data["who"].organization, RW_form.cleaned_data["who"].person,
                           RW_form.cleaned_data["what"].what,
                           RW_form.cleaned_data["why"].reason,
                           RW_form.cleaned_data["how"].device_type, RW_form.cleaned_data["how"].device_model, RW_form.cleaned_data["how"].device_id)
        return redirect("/")

class W4H1_new(LoginRequiredMixin, View):
    def get(self, request, *args, **kwargs):
        Where_form = WhereForm(request.POST or None)
        Who_form = WhoForm(request.POST or None)
        What_form = WhatForm(request.POST or None)
        Why_form = WhyForm(request.POST or None)
        How_form = HowForm(request.POST or None)
        return render(request, "app/W4H1_new.html", {
            "Where_form": Where_form,
            "Who_form": Who_form,
            "What_form": What_form,
            "Why_form": Why_form,
            "How_form": How_form,
        })

    def post(self, request, *args, **kwargs):
        query = "?"
        Where_form = WhereForm(request.POST or None,request.FILES or None)
        if Where_form.is_valid() and len(Where_form.cleaned_data["place"]) > 0:
            Where_data = Where()
            Where_data.author = request.user
            Where_data.place = Where_form.cleaned_data["place"]
            Where_data.save()
            createWhereDouble(request.user, Where_form.cleaned_data["place"])
            if query == "?":
                query += "where="+str(Where_data.id)
            else:
                query += "&where="+str(Where_data.id)
        Who_form = WhoForm(request.POST or None,request.FILES or None)
        if Who_form.is_valid() and (len(Who_form.cleaned_data["organization"]) > 0 or len(Who_form.cleaned_data["person"]) > 0):
            Who_data = Who()
            Who_data.author = request.user
            Who_data.organization = Who_form.cleaned_data["organization"]
            Who_data.person = Who_form.cleaned_data["person"]
            Who_data.save()
            createWhoDouble(request.user, Who_form.cleaned_data["organization"], Who_form.cleaned_data["person"])
            if query == "?":
                query += "who="+str(Who_data.id)
            else:
                query += "&who="+str(Who_data.id)
        What_form = WhatForm(request.POST or None,request.FILES or None)
        if What_form.is_valid() and len(What_form.cleaned_data["what"]) > 0:
            What_data = What()
            What_data.author = request.user
            What_data.what = What_form.cleaned_data["what"]
            What_data.save()
            createWhatDouble(request.user, What_form.cleaned_data["what"])
            if query == "?":
                query += "what="+str(What_data.id)
            else:
                query += "&what="+str(What_data.id)
        Why_form = WhyForm(request.POST or None,request.FILES or None)
        if Why_form.is_valid() and len(Why_form.cleaned_data["reason"]) > 0:
            Why_data = Why()
            Why_data.author = request.user
            Why_data.reason = Why_form.cleaned_data["reason"]
            Why_data.save()
            createWhyDouble(request.user, Why_form.cleaned_data["reason"])
            if query == "?":
                query += "why="+str(Why_data.id)
            else:
                query += "&why="+str(Why_data.id)
        How_form = HowForm(request.POST or None,request.FILES or None)
        if How_form.is_valid() and (len(How_form.cleaned_data["device_type"]) > 0 or len(How_form.cleaned_data["device_model"]) > 0 or len(How_form.cleaned_data["device_id"]) > 0):
            How_data = How()
            How_data.author = request.user
            How_data.device_type = How_form.cleaned_data["device_type"]
            How_data.device_model = How_form.cleaned_data["device_model"]
            How_data.device_id = How_form.cleaned_data["device_id"]
            How_data.save()
            createHowDouble(request.user, How_form.cleaned_data["device_type"], How_form.cleaned_data["device_model"], How_form.cleaned_data["device_id"])
            if query == "?":
                query += "how="+str(How_data.id)
            else:
                query += "&how="+str(How_data.id)
        return redirect("/RW_adminDB/new/"+query)

class W4H1_add_select(LoginRequiredMixin, View):
    def get(self, request, *args, **kwargs):
        return render(request, "app/W4H1_add_select.html", {})

class W4H1_add(LoginRequiredMixin, View):
    select_keys = {"where": [WhereForm, "データの取得場所について"],
                   "who": [WhoForm, "データの収集者について"],
                   "what": [WhatForm, "データの形について"],
                   "why": [WhyForm, "データの取得理由について"],
                   "how": [HowForm, "データの取得方法について"]}
    def get(self, request, *args, **kwargs):
        select = self.request.GET.get(key="select", default="none")
        if select == "none" or select not in self.select_keys.keys():
            return redirect("/W4H1/adding/select/")
        select_form = self.select_keys[select][0]
        select_sentence = self.select_keys[select][1]
        return render(request, "app/W4H1_add.html", {
            "select_form": select_form,
            "select_sentence": select_sentence,
        })
    
    def post(self, request, *args, **kwargs):
        select = self.request.GET.get(key="select", default="none")
        select_form = copy.deepcopy(self.select_keys[select][0])(request.POST or None,request.FILES or None)
        select_form.full_clean()    # cleaned_data を生成
        if select == "where":
            Where_data = Where()
            Where_data.author = request.user
            Where_data.place = select_form.cleaned_data["place"]
            Where_data.local = select_form.cleaned_data["local"]
            Where_data.local_x = select_form.cleaned_data["local_x"]
            Where_data.local_y = select_form.cleaned_data["local_y"]
            Where_data.save()
            createWhereDouble(request.user, select_form.cleaned_data["place"])
        elif select == "who":
            Who_data = Who()
            Who_data.author = request.user
            Who_data.organization = select_form.cleaned_data["organization"]
            Who_data.person = select_form.cleaned_data["person"]
            Who_data.save()
            createWhoDouble(request.user, select_form.cleaned_data["organization"], select_form.cleaned_data["person"])
        elif select == "what":
            What_data = What()
            What_data.author = request.user
            What_data.what = select_form.cleaned_data["what"]
            What_data.save()
            createWhatDouble(request.user, select_form.cleaned_data["what"])
        elif select == "why":
            Why_data = Why()
            Why_data.author = request.user
            Why_data.reason = select_form.cleaned_data["reason"]
            Why_data.save()
            createWhyDouble(request.user, select_form.cleaned_data["reason"])
        elif select == "how":
            How_data = How()
            How_data.author = request.user
            How_data.device_type = select_form.cleaned_data["device_type"]
            How_data.device_model = select_form.cleaned_data["device_model"]
            How_data.device_id = select_form.cleaned_data["device_id"]
            How_data.save()
            createHowDouble(request.user, select_form.cleaned_data["device_type"], select_form.cleaned_data["device_model"], select_form.cleaned_data["device_id"])
        messages.success(request, "データ詳細に追加しました。")
        select_form = self.select_keys[select][0]
        redirect_url = reverse("W4H1_add")
        parameters = urlencode({"select": select})
        url = f'{redirect_url}?{parameters}'
        return redirect(url)

def DB_detail(request, RW_data_id):
    RW_data_detail = RW_adminDB.objects.get(pk=RW_data_id)
    map_url = f"https://www.google.co.jp/maps/@{RW_data_detail.where.lat},{RW_data_detail.where.lon},17z?hl=ja"
    return render(request, "app/DB_detail.html", {"RW_data_detail":RW_data_detail, "map_url":map_url})


def api_triple(request):
    response = []
    triple_datas = Triple.objects.all()
    for triple_data in triple_datas:
        triple = {}
        # subject
        if triple_data.subject_RW is not None:
            triple["s"] = {
                "id": "R"+str(triple_data.subject_RW.id),
                "name": str(triple_data.subject_RW)
            }
        elif triple_data.subject_node is not None:
            triple["s"] = {
                "id": "N"+str(triple_data.subject_node.id),
                "name": str(triple_data.subject_node)
            }
        # predicate
        triple["v"] = {
            "id": "V"+str(triple_data.predicate.id),
            "name": str(triple_data.predicate)
        }
        # object
        if triple_data.object_RW is not None:
            triple["o"] = {
                "id": "R"+str(triple_data.object_RW.id),
                "name": str(triple_data.object_RW)
            }
        elif triple_data.object_node is not None:
            triple["o"] = {
                "id": "N"+str(triple_data.object_node.id),
                "name": str(triple_data.object_node)
            }
        response.append(triple)

    json_str = json.dumps(response, ensure_ascii=False, indent=2) 
    return HttpResponse(json_str)


class RWDBViewSet(CreateModelMixin,
                   RetrieveModelJsonFieldMixin,
                   UpdateModelMixin,
                   DestroyModelMixin,
                   ListModelMixin,
                   viewsets.GenericViewSet):
    pass


class AllViewSet(ListModelMixinMulti, ObjectMultipleModelAPIViewSet):
    id_prefix = API_URL_PREFIX + "/" + ALL + "/"
    querylist = [
        {
            'queryset': Where.objects.all(),
            'serializer_class': WhereSerializer,
            'label': WHERE,
        },
        {
            'queryset': Who.objects.all(),
            'serializer_class': WhoSerializer,
            'label': WHO,
        },
        {
            'queryset': What.objects.all(),
            'serializer_class': WhatSerializer,
            'label': WHAT,
        },
        {
            'queryset': Who.objects.all(),
            'serializer_class': WhoSerializer,
            'label': WHO,
        },
        {
            'queryset': Why.objects.all(),
            'serializer_class': WhySerializer,
            'label': WHY,
        },
        {
            'queryset': How.objects.all(),
            'serializer_class': HowSerializer,
            'label': HOW,
        },
        {
            'queryset': RealWorldDataHistory.objects.all(),
            'serializer_class': RealWorldDataHistorySerializer,
            'label': HISTORY,
        },
        {
            'queryset': RealWorldDataset.objects.all(),
            'serializer_class': RealWorldDatasetSerializer,
            'label': DATASET,
        },
        {
            'queryset': RealWorldDataBrewerInfo.objects.all(),
            'serializer_class': RealWorldDataBrewerInfoSerializer,
            'label': BREWER_INFO,
        },
        {
            'queryset': RealWorldDataBrewerInput.objects.all(),
            'serializer_class': RealWorldDataBrewerInputSerializer,
            'label': BREWER_INPUT,
        },
        {
            'queryset': RealWorldDataBrewerOutput.objects.all(),
            'serializer_class': RealWorldDataBrewerOutputSerializer,
            'label': BREWER_OUTPUT,
        },
        {
            'queryset': RealWorldDataBrewingArgument.objects.all(),
            'serializer_class': RealWorldDataBrewingArgumentSerializer,
            'label': BREWER_ARGUMENT,
        },
        {
            'queryset': RealWorldDataCollectionInfo.objects.all(),
            'serializer_class': RealWorldDataCollectionInfoSerializer,
            'label': COLLECTION_INFO,
        },
        {
            'queryset': RealWorldDataStoringInfo.objects.all(),
            'serializer_class': RealWorldDataStoringInfoSerializer,
            'label': STORING_INFO,
        },
        {
            'queryset': RealWorldDataStructureInfo.objects.all(),
            'serializer_class': RealWorldDataStructureInfoSerializer,
            'label': STRUCTURE_INFO,
        },
        {
            'queryset': RealWorldDataStoringInfo.objects.all(),
            'serializer_class': RealWorldDataStoringInfoSerializer,
            'label': STORING_INFO,
        },
        {
            'queryset': RealWorldDataRegisterDemands.objects.all(),
            'serializer_class': RealWorldDataRegisterDemandsSerializer,
            'label': REGISTER_DEMANDS,
        },
        {
            'queryset': RealWorldDataRegisterSupplies.objects.all(),
            'serializer_class': RealWorldDataRegisterSuppliesSerializer,
            'label': REGISTER_SUPPLIES,
        },
        {
            'queryset': RealWorldDataCollectionDemands.objects.all(),
            'serializer_class': RealWorldDataCollectionDemandsSerializer,
            'label': COLLECTION_DEMANDS,
        },
        {
            'queryset': RealWorldDataCollectionSupplies.objects.all(),
            'serializer_class': RealWorldDataCollectionSuppliesSerializer,
            'label': COLLECTION_SUPPLIES,
        },
        {
            'queryset': RealWorldDataCollectionStatus.objects.all(),
            'serializer_class': RealWorldDataCollectionStatusSerializer,
            'label': COLLECTION_STATUS,
        },
        {
            'queryset': RealWorldDataBrewingDemands.objects.all(),
            'serializer_class': RealWorldDataBrewingDemandsSerializer,
            'label': BREWING_DEMANDS,
        },
        {
            'queryset': RealWorldDataBrewingSupplies.objects.all(),
            'serializer_class': RealWorldDataBrewingSuppliesSerializer,
            'label': BREWING_SUPPLIES,
        },
        {
            'queryset': RealWorldDataPeriodicBrewingConfigs.objects.all(),
            'serializer_class': RealWorldDataPeriodicBrewingConfigsSerializer,
            'label': PERIODIC_BREWING_CONFIGS,
        },
        {
            'queryset': RealWorldDataReadDemands.objects.all(),
            'serializer_class': RealWorldDataReadDemandsSerializer,
            'label': READ_DEMANDS,
        },
        {
            'queryset': RealWorldDataReadSupplies.objects.all(),
            'serializer_class': RealWorldDataReadSuppliesSerializer,
            'label': READ_SUPPLIES,
        },
        {
            'queryset': RealWorldDataWriteDemands.objects.all(),
            'serializer_class': RealWorldDataWriteDemandsSerializer,
            'label': WRITE_DEMANDS,
        },
        {
            'queryset': RealWorldDataWriteSupplies.objects.all(),
            'serializer_class': RealWorldDataWriteSuppliesSerializer,
            'label': WRITE_SUPPLIES,
        },
        {
            'queryset': RealWorldDataMoveDemands.objects.all(),
            'serializer_class': RealWorldDataMoveDemandsSerializer,
            'label': MOVE_DEMANDS,
        },
        {
            'queryset': RealWorldDataMoveSupplies.objects.all(),
            'serializer_class': RealWorldDataMoveSuppliesSerializer,
            'label': MOVE_SUPPLIES,
        },
        {
            'queryset': RealWorldDataPeriodicMoveConfigs.objects.all(),
            'serializer_class': RealWorldDataPeriodicMoveConfigsSerializer,
            'label': PERIODIC_MOVE_CONFIGS,
        },
        {
            'queryset': RealWorldDataRemoveDemands.objects.all(),
            'serializer_class': RealWorldDataRemoveDemandsSerializer,
            'label': REMOVE_DEMANDS,
        },
        {
            'queryset': RealWorldDataRemoveSupplies.objects.all(),
            'serializer_class': RealWorldDataRemoveSuppliesSerializer,
            'label': REMOVE_SUPPLIES,
        },
        {
            'queryset': RealWorldDataPeriodicRemoveConfigs.objects.all(),
            'serializer_class': RealWorldDataPeriodicRemoveConfigsSerializer,
            'label': PERIODIC_REMOVE_CONFIGS,
        },
        {
            'queryset': Any.objects.all(),
            'serializer_class': AnySerializer,
            'label': ANY,
        }
    ]
    filter_backends = [filters.SearchFilter]
    search_fields = ['fields__schema:name', 'fields__schema:description']

class WhereViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + WHERE + "/"
    # モデルのオブジェクトを取得
    queryset = Where.objects.all()
    # シリアライザーを取得
    serializer_class = WhereSerializer

class WhoViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + WHO + "/"
    queryset = Who.objects.all()
    serializer_class = WhoSerializer

class WhatViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + WHAT + "/"
    queryset = What.objects.all()
    serializer_class = WhatSerializer

class WhyViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + WHY + "/"
    queryset = Why.objects.all()
    serializer_class = WhySerializer

class HowViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + HOW + "/"
    queryset = How.objects.all()
    serializer_class = HowSerializer

class RW_adminDBViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/admin_db/"
    queryset = RW_adminDB.objects.all()
    serializer_class = RW_adminDBSerializer


# データ使用履歴
class RealWorldDataHistoryViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + HISTORY + "/"
    queryset = RealWorldDataHistory.objects.all()
    serializer_class = RealWorldDataHistorySerializer


# 実世界データセット本体
class RealWorldDatasetViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + DATASET + "/"
    queryset = RealWorldDataset.objects.all()
    serializer_class = RealWorldDatasetSerializer


# データ醸造・醸造プログラム情報
class RealWorldDataBrewerInfoViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + BREWER_INFO + "/"
    queryset = RealWorldDataBrewerInfo.objects.all()
    serializer_class = RealWorldDataBrewerInfoSerializer


# データ醸造・入力データ
class RealWorldDataBrewerInputViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + BREWER_INPUT + "/"
    queryset = RealWorldDataBrewerInput.objects.all()
    serializer_class = RealWorldDataBrewerInputSerializer


# データ醸造・出力データ
class RealWorldDataBrewerOutputViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + BREWER_OUTPUT + "/"
    queryset = RealWorldDataBrewerOutput.objects.all()
    serializer_class = RealWorldDataBrewerOutputSerializer


# データ醸造・パラメータ
class RealWorldDataBrewingArgumentViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + BREWER_ARGUMENT + "/"
    queryset = RealWorldDataBrewingArgument.objects.all()
    serializer_class = RealWorldDataBrewingArgumentSerializer


# 収集情報
class RealWorldDataCollectionInfoViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + COLLECTION_INFO + "/"
    queryset = RealWorldDataCollectionInfo.objects.all()
    serializer_class = RealWorldDataCollectionInfoSerializer


# 保存先情報
class RealWorldDataStoringInfoViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + STORING_INFO + "/"
    queryset = RealWorldDataStoringInfo.objects.all()
    serializer_class = RealWorldDataStoringInfoSerializer


# 構造情報
class RealWorldDataStructureInfoViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + STRUCTURE_INFO + "/"
    queryset = RealWorldDataStructureInfo.objects.all()
    serializer_class = RealWorldDataStructureInfoSerializer


# データ登録系需給
class RealWorldDataRegisterDemandsViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + REGISTER_DEMANDS + "/"
    queryset = RealWorldDataRegisterDemands.objects.all()
    serializer_class = RealWorldDataRegisterDemandsSerializer

class RealWorldDataRegisterSuppliesViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + REGISTER_SUPPLIES + "/"
    queryset = RealWorldDataRegisterSupplies.objects.all()
    serializer_class = RealWorldDataRegisterSuppliesSerializer


# データ収集系需給・収集ステータス
class RealWorldDataCollectionDemandsViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + COLLECTION_DEMANDS + "/"
    queryset = RealWorldDataCollectionDemands.objects.all()
    serializer_class = RealWorldDataCollectionDemandsSerializer

class RealWorldDataCollectionSuppliesViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + COLLECTION_SUPPLIES + "/"
    queryset = RealWorldDataCollectionSupplies.objects.all()
    serializer_class = RealWorldDataCollectionSuppliesSerializer

class RealWorldDataCollectionStatusViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + COLLECTION_STATUS + "/"
    queryset = RealWorldDataCollectionStatus.objects.all()
    serializer_class = RealWorldDataCollectionStatusSerializer


# データ醸造系需給・定期醸造設定
class RealWorldDataBrewingDemandsViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + BREWING_DEMANDS + "/"
    queryset = RealWorldDataBrewingDemands.objects.all()
    serializer_class = RealWorldDataBrewingDemandsSerializer

class RealWorldDataBrewingSuppliesViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + BREWING_SUPPLIES + "/"
    queryset = RealWorldDataBrewingSupplies.objects.all()
    serializer_class = RealWorldDataBrewingSuppliesSerializer

class RealWorldDataPeriodicBrewingConfigsViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + PERIODIC_BREWING_CONFIGS + "/"
    queryset = RealWorldDataPeriodicBrewingConfigs.objects.all()
    serializer_class = RealWorldDataPeriodicBrewingConfigsSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = {
            'author': request.user.id if request.user.id is not None else 1,
            JSON_FIELDS: request.data,
        }
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        queryset = self.filter_queryset(self.get_queryset())
        if queryset._prefetch_related_lookups:
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance,
            # and then re-prefetch related objects
            instance._prefetched_objects_cache = {}
            prefetch_related_objects([instance], *queryset._prefetch_related_lookups)

        serializer.data[JSON_FIELDS]['@id'] = self.id_prefix + str(serializer.data['id']) + "/?format=json"
        return Response(serializer.data[JSON_FIELDS])


# timePeriod: ([+-]?, [0-9]+, [YmdHMS])
def timePeriod2dt(timePeriod: str) -> datetime:
    tp_match = re.fullmatch(r'([+-]?)([0-9]+)([YmdHMS])', timePeriod)
    """
    if tp_match.group(3) == 'Y':
        if tp_match.group(1) == '-':
            return timezone.localtime() - relativedelta(years=int(tp_match.group(2)))
        else:
            return timezone.localtime() + relativedelta(years=int(tp_match.group(2)))
    elif tp_match.group(3) == 'm':
        if tp_match.group(1) == '-':
            return timezone.localtime() - relativedelta(months=int(tp_match.group(2)))
        else:
            return timezone.localtime() + relativedelta(months=int(tp_match.group(2)))
    """
    if tp_match.group(3) == 'd':
        if tp_match.group(1) == '-':
            return timezone.localtime() - timedelta(days=int(tp_match.group(2)))
        else:
            return timezone.localtime() + timedelta(days=int(tp_match.group(2)))
    elif tp_match.group(3) == 'H':
        if tp_match.group(1) == '-':
            return timezone.localtime() - timedelta(hours=int(tp_match.group(2)))
        else:
            return timezone.localtime() + timedelta(hours=int(tp_match.group(2)))
    elif tp_match.group(3) == 'M':
        if tp_match.group(1) == '-':
            return timezone.localtime() - timedelta(minutes=int(tp_match.group(2)))
        else:
            return timezone.localtime() + timedelta(minutes=int(tp_match.group(2)))
    elif tp_match.group(3) == 'S':
        if tp_match.group(1) == '-':
            return timezone.localtime() - timedelta(seconds=int(tp_match.group(2)))
        else:
            return timezone.localtime() + timedelta(seconds=int(tp_match.group(2)))


def isoformat2dt(isoformat: str) -> datetime:
    period_split = isoformat.split('.')
    if len(period_split) == 2:
        plus_split = period_split[1].split('+')
        if len(plus_split) == 2:
            if len(plus_split[0]) > 6:
                plus_split[0] = plus_split[0][:6]
            period_split[1] = plus_split[0] + '+' + plus_split[1]
        isoformat = period_split[0] + '.' + period_split[1]
    return datetime.fromisoformat(isoformat)


def timePeriod2cronConfig(timePeriod: tuple):
    now_dt = timezone.localtime()
    """
    if timePeriod[2] == 'Y':
        return
    elif timePeriod[2] == 'm':
        return
    """
    if timePeriod[2] == 'd':
        tp_dt = now_dt + timedelta(hours=12)
        return " ".join([str(tp_dt.minute), str(tp_dt.hour), "*", "*", "*"])
    elif timePeriod[2] == 'H':
        tp_dt = now_dt + timedelta(minutes=30)
        return " ".join([str(tp_dt.minute), "*", "*", "*", "*"])
    elif timePeriod[2] == 'M':
        tp_dt = now_dt + timedelta(minutes=30)
        return " ".join([str(tp_dt.minute), "*", "*", "*", "*"])
    elif timePeriod[2] == 'S':
        tp_dt = now_dt + timedelta(minutes=30)
        return " ".join([str(tp_dt.minute), "*", "*", "*", "*"])


# データ読み込み需給（ by other programs ）
class RealWorldDataReadDemandsViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + READ_DEMANDS + "/"
    queryset = RealWorldDataReadDemands.objects.all()
    serializer_class = RealWorldDataReadDemandsSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = {
            'author': request.user.id if request.user.id is not None else 1,
            JSON_FIELDS: request.data,
        }
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        queryset = self.filter_queryset(self.get_queryset())
        if queryset._prefetch_related_lookups:
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance,
            # and then re-prefetch related objects
            instance._prefetched_objects_cache = {}
            prefetch_related_objects([instance], *queryset._prefetch_related_lookups)

        serializer.data[JSON_FIELDS]['@id'] = self.id_prefix + str(serializer.data['id']) + "/?format=json"
        
        # 登録されたReadDemandからMoveDemandとPeriodicMoveConfigを追加する
        if "dbp:dataset" in request.data and "@id" in request.data["dbp:dataset"] and "dbp:timePeriodEnd" in request.data and "dbp:timePeriodStart"  in request.data:
            dataset_j = requests.get(request.data["dbp:dataset"]["@id"]).json()
            end_match = re.fullmatch(r'([+-]?)([0-9]+)([dHMS]?)', request.data["dbp:timePeriodEnd"])
            start_match = re.fullmatch(r'([+-]?)([0-9]+)([dHMS])', request.data["dbp:timePeriodStart"])
            if end_match and start_match:
                if "schema:distribution" in dataset_j and isinstance(dataset_j["schema:distribution"], list):
                    storingInfos_j = [requests.get(dist["@id"]).json() for dist in dataset_j["schema:distribution"] if "@id" in dist]
                    storingInfos_j = [si_j for si_j in storingInfos_j if "@context" in si_j]    # 登録されてないstoringInfoを除く
                    if len(storingInfos_j) >= 2:
                        # calculate appropriate period
                        timePeriodEnd = start_match.group(1) + str(int(start_match.group(2))) + start_match.group(3)
                        timePeriodStart = start_match.group(1) + str(int(start_match.group(2))+1) + start_match.group(3)
                        cronConfig = timePeriod2cronConfig(start_match.groups())
                        # decide moveFrom (periodicだとfromは変わっちゃう。。)
                        #timePeriodEnd_dt = timePeriod2dt(timePeriodEnd)
                        #timePeriodStart_dt = timePeriod2dt(timePeriodStart)
                        #movefroms = [si for si in storingInfos_j if isoformat2dt(si["dbp:startTime"]) <= timePeriodStart_dt and timePeriodEnd_dt <= isoformat2dt(si["dbp:endTime"])]
                        movefroms = storingInfos_j  # とりあえずデータの日時に関するフィルタはなし
                        # decide distribution
                        storingInfosWithType_j = [si_j for si_j in storingInfos_j if "dbp:storageType" in si_j.keys()]
                        if len(storingInfosWithType_j) > 0:
                            # 遅いストレージを探索
                            isSetMoveto = False
                            for si_j in storingInfosWithType_j:
                                if si_j["dbp:storageType"] == "HDD":
                                    moveto = si_j
                                    isSetMoveto = True
                            if not isSetMoveto:
                                moveto = storingInfos_j[0]
                        else:
                            moveto = storingInfos_j[0]
                        if len(movefroms) >= 1:
                            movefrom = movefroms[0]
                            # add moveDemand
                            moveDemand = {
                                "@id": "",
                                "@type": "dbp:RealWorldDataMoveDemand",
                                "@context": {
                                    "dbp": "https://exdata.co.jp/dbp/schema/",
                                    "schema": "https://schema.org/"
                                },
                                "schema:name": "読込需要からの自動検知",
                                "dbp:moveTo": {
                                    "@id": moveto["@id"],
                                    "@type": "dbp:RealWorldDataStoringInfo"
                                },
                                "dbp:moveFrom": {
                                    "@id": movefrom["@id"],
                                    "@type": "dbp:RealWorldDataStoringInfo"
                                },
                                "dbp:dataset": {
                                    "@id": dataset_j["@id"],
                                    "@type": "dbp:RealWorldDataset"
                                },
                                "dbp:timePeriodEnd": timePeriodEnd,
                                "schema:dateCreated": timezone.localtime().isoformat(),
                                "dbp:timePeriodStart": timePeriodStart
                            }
                            res = requests.post(API_URL_PREFIX + "/" + MOVE_DEMANDS + "/?format=json" , data=json.dumps(moveDemand), headers = {"Content-Type" : "application/json"})
                            if res.status_code == requests.codes.created:
                                # add PeriodicMoveConfig
                                periodicMoveConfig = {
                                    "@id": "",
                                    "@type": "dbp:RealWorldDataPeriodicMoveConfig",
                                    "@context": {
                                        "dbp": "https://exdata.co.jp/dbp/schema/",
                                        "schema": "https://schema.org/"
                                    },
                                    "schema:name": "読込需要からの自動検知",
                                    "dbp:cronConfig": cronConfig,  # cronConfig
                                    "dbp:moveConfig": {
                                        "@id": res.json()["@id"],
                                        "@type": "dbp:RealWorldDataMoveDemand"
                                    },
                                    "schema:dateCreated": timezone.localtime().isoformat()
                                }
                                res = requests.post(API_URL_PREFIX + "/" + PERIODIC_MOVE_CONFIGS + "/?format=json" , data=json.dumps(periodicMoveConfig), headers = {"Content-Type" : "application/json"})

        return Response(serializer.data[JSON_FIELDS])

class RealWorldDataReadSuppliesViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + READ_SUPPLIES + "/"
    queryset = RealWorldDataReadSupplies.objects.all()
    serializer_class = RealWorldDataReadSuppliesSerializer


# データ書き込み需給（ by other programs ）
class RealWorldDataWriteDemandsViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + WRITE_DEMANDS + "/"
    queryset = RealWorldDataWriteDemands.objects.all()
    serializer_class = RealWorldDataWriteDemandsSerializer

class RealWorldDataWriteSuppliesViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + WRITE_SUPPLIES + "/"
    queryset = RealWorldDataWriteSupplies.objects.all()
    serializer_class = RealWorldDataWriteSuppliesSerializer


# データ移動需給
class RealWorldDataMoveDemandsViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + MOVE_DEMANDS + "/"
    queryset = RealWorldDataMoveDemands.objects.all()
    serializer_class = RealWorldDataMoveDemandsSerializer

class RealWorldDataMoveSuppliesViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + MOVE_SUPPLIES + "/"
    queryset = RealWorldDataMoveSupplies.objects.all()
    serializer_class = RealWorldDataMoveSuppliesSerializer

class RealWorldDataPeriodicMoveConfigsViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + PERIODIC_MOVE_CONFIGS + "/"
    queryset = RealWorldDataPeriodicMoveConfigs.objects.all()
    serializer_class = RealWorldDataPeriodicMoveConfigsSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = {
            'author': request.user.id if request.user.id is not None else 1,
            JSON_FIELDS: request.data,
        }
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        queryset = self.filter_queryset(self.get_queryset())
        if queryset._prefetch_related_lookups:
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance,
            # and then re-prefetch related objects
            instance._prefetched_objects_cache = {}
            prefetch_related_objects([instance], *queryset._prefetch_related_lookups)

        serializer.data[JSON_FIELDS]['@id'] = self.id_prefix + str(serializer.data['id']) + "/?format=json"
        return Response(serializer.data[JSON_FIELDS])


# データ削除需給
class RealWorldDataRemoveDemandsViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + REMOVE_DEMANDS + "/"
    queryset = RealWorldDataRemoveDemands.objects.all()
    serializer_class = RealWorldDataRemoveDemandsSerializer

class RealWorldDataRemoveSuppliesViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + REMOVE_SUPPLIES + "/"
    queryset = RealWorldDataRemoveSupplies.objects.all()
    serializer_class = RealWorldDataRemoveSuppliesSerializer

class RealWorldDataPeriodicRemoveConfigsViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + PERIODIC_REMOVE_CONFIGS + "/"
    queryset = RealWorldDataPeriodicRemoveConfigs.objects.all()
    serializer_class = RealWorldDataPeriodicRemoveConfigsSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = {
            'author': request.user.id if request.user.id is not None else 1,
            JSON_FIELDS: request.data,
        }
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        queryset = self.filter_queryset(self.get_queryset())
        if queryset._prefetch_related_lookups:
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance,
            # and then re-prefetch related objects
            instance._prefetched_objects_cache = {}
            prefetch_related_objects([instance], *queryset._prefetch_related_lookups)

        serializer.data[JSON_FIELDS]['@id'] = self.id_prefix + str(serializer.data['id']) + "/?format=json"
        return Response(serializer.data[JSON_FIELDS])

class AnyViewSet(RWDBViewSet):
    id_prefix = API_URL_PREFIX + "/" + ANY + "/"
    queryset = Any.objects.all()
    serializer_class = AnySerializer


#################
# File List API #
#################

def file_list(request):
    # クエリパラメータからパスを取得（デフォルトは特定の安全なディレクトリ）
    path_addr = request.GET.get('path', '')
    if path_addr.startswith('file://'):
        base_directory = settings.SAFE_FILE_DIRECTORY  # settings.pyで設定した安全なディレクトリ

        # 絶対パスの構築
        abs_addr = path_addr.replace('file://', '')
        print(path_addr, abs_addr)
        directory = os.path.join(abs_addr)

        # ディレクトリが安全な範囲内かチェック
        if not directory.startswith(base_directory):
            return JsonResponse({'error': '不正なパスです。'}, status=400)

        try:
            entries = os.listdir(directory)
            response_data = []
            for entry in entries:
                entry_path = os.path.join(directory, entry)
                entry_type = "dir" if os.path.isdir(entry_path) else "file"
                response_data.append({"name": entry, "type": entry_type})

            return JsonResponse(response_data, safe=False)
        except FileNotFoundError:
            return JsonResponse({'error': 'ファイルが見つかりません。'}, status=404)
    else:
        return JsonResponse({'error': '指定したプロトコルは使用できません。'}, status=404)

#################
# Move File API #
#################
@method_decorator(csrf_exempt, name='dispatch')
class RealWorldDataMoveView(View):
    
    def post(self, request, *args, **kwargs):
        dataset_id = kwargs.get('dataset_id')
        data = json.loads(request.body)
        dataset_instance = RealWorldDataset.objects.get(pk=dataset_id)
        fields_data = dataset_instance.fields or {}
        
        # fillter distributions by date
        filtered_distributions = filter_distributions_by_date(
            distributions=fields_data.get("schema:distribution", []),
            start_time=data.get("startTime"),
            end_time=data.get("endTime")
        )

        # transfer data
        total_items = len(filtered_distributions)
        send_progress(0, total_items, group_name="all_progress")
        for idx, item in enumerate(filtered_distributions, start=1):
            send_progress(idx, total_items, group_name="all_progress")
            transfer_data(
                fields_data=fields_data,
                start_time=item.get('dbp:startTime'),
                end_time=item.get('dbp:endTime'),
                start_storage_url=item.get('@id'),
                end_storage_url=data.get("endStorage")
            ) 

        # add move demand
        add_move_demand(
            dataset_instance=dataset_instance,
            filtered_distributions=filtered_distributions,
            end_storage_url=data.get("endStorage"),
        )
        
        # update distribution dataset
        update_dataset_in_db(
            dataset_instance=dataset_instance,
            filtered_distributions=filtered_distributions,
            update_storage_id=data.get("endStorage")
        )
        
        return JsonResponse({"status": "completed", "message": "データが正常に処理されました。"}, status=200)