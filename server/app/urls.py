from django.urls import path
from app import views

from django.contrib import admin
from django.urls import path, include
from rest_framework import routers

from .views import *
from consts import *
# DefaultRouter クラスのインスタンスを代入
defaultRouter = routers.DefaultRouter()
# userInfo/ にUserInfoViewSetをルーティングする
defaultRouter.register(ALL, AllViewSet, ALL)
defaultRouter.register(WHERE, WhereViewSet)
defaultRouter.register(WHO, WhoViewSet)
defaultRouter.register(WHAT, WhatViewSet)
defaultRouter.register(WHY, WhyViewSet)
defaultRouter.register(HOW, HowViewSet)
defaultRouter.register(HISTORY, RealWorldDataHistoryViewSet)                        # データ使用履歴
defaultRouter.register(DATASET, RealWorldDatasetViewSet)                            # 実世界データセット本体
defaultRouter.register(BREWER_INFO, RealWorldDataBrewerInfoViewSet)                 # データ醸造・醸造プログラム情報
defaultRouter.register(BREWER_INPUT, RealWorldDataBrewerInputViewSet)               # データ醸造・入力データ
defaultRouter.register(BREWER_OUTPUT, RealWorldDataBrewerOutputViewSet)             # データ醸造・出力データ
defaultRouter.register(BREWER_ARGUMENT, RealWorldDataBrewingArgumentViewSet)        # データ醸造・パラメータ
defaultRouter.register(COLLECTION_INFO, RealWorldDataCollectionInfoViewSet)         # 収集情報
defaultRouter.register(STORING_INFO, RealWorldDataStoringInfoViewSet)               # 保存先情報
defaultRouter.register(STRUCTURE_INFO, RealWorldDataStructureInfoViewSet)           # 構造情報
defaultRouter.register(REGISTER_DEMANDS, RealWorldDataRegisterDemandsViewSet)       # データ登録系需給
defaultRouter.register(REGISTER_SUPPLIES, RealWorldDataRegisterSuppliesViewSet)
defaultRouter.register(COLLECTION_DEMANDS, RealWorldDataCollectionDemandsViewSet)   # データ収集系需給・収集ステータス
defaultRouter.register(COLLECTION_SUPPLIES, RealWorldDataCollectionSuppliesViewSet)
defaultRouter.register(COLLECTION_STATUS, RealWorldDataCollectionStatusViewSet)
defaultRouter.register(BREWING_DEMANDS, RealWorldDataBrewingDemandsViewSet)
defaultRouter.register(BREWING_SUPPLIES, RealWorldDataBrewingSuppliesViewSet)       # データ醸造系需給・定期醸造設定
defaultRouter.register(PERIODIC_BREWING_CONFIGS, RealWorldDataPeriodicBrewingConfigsViewSet)
defaultRouter.register(READ_DEMANDS, RealWorldDataReadDemandsViewSet)               # データ読み込み需給（ by other programs ）
defaultRouter.register(READ_SUPPLIES, RealWorldDataReadSuppliesViewSet)
defaultRouter.register(WRITE_DEMANDS, RealWorldDataWriteDemandsViewSet)             # データ書き込み需給（ by other programs ）
defaultRouter.register(WRITE_SUPPLIES, RealWorldDataWriteSuppliesViewSet)
defaultRouter.register(MOVE_DEMANDS, RealWorldDataMoveDemandsViewSet)               # データ移動需給
defaultRouter.register(MOVE_SUPPLIES, RealWorldDataMoveSuppliesViewSet)
defaultRouter.register(PERIODIC_MOVE_CONFIGS, RealWorldDataPeriodicMoveConfigsViewSet)
defaultRouter.register(REMOVE_DEMANDS, RealWorldDataRemoveDemandsViewSet)           # データ削除需給
defaultRouter.register(REMOVE_SUPPLIES, RealWorldDataRemoveSuppliesViewSet)
defaultRouter.register(PERIODIC_REMOVE_CONFIGS, RealWorldDataPeriodicRemoveConfigsViewSet)
defaultRouter.register(ANY, AnyViewSet)                                # なんでもモデル

urlpatterns = [
    path("", views.InitView.as_view(), name="init"),
    path("RW_adminDB/download/<int:RW_data_id>/", views.RW_adminDB_download, name="RW_adminDB_download"),
    path("RW_adminDB/new/", views.RW_adminDB_new.as_view(), name="RW_adminDB_new"),
    path("RW_adminDB/W4H1/new/", views.W4H1_new.as_view(), name="W4H1_new"),
    path("W4H1/adding/select/", views.W4H1_add_select.as_view(), name="W4H1_add_select"),
    path("W4H1/adding/add/", views.W4H1_add.as_view(), name="W4H1_add"),
    path("RW_adminDB/detail/<int:RW_data_id>/", views.DB_detail, name="DB_detail"),
    path("api/triple/", views.api_triple, name="api_triple"),
    path("api/v0/", include(defaultRouter.urls)),
    path("api/v0/files/", file_list, name='file_list'),
    path("move/<int:dataset_id>/", RealWorldDataMoveView.as_view(), name="realworld_move"),
]
