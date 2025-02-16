from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(Where)
admin.site.register(Who)
admin.site.register(What)
admin.site.register(Why)
admin.site.register(How)
admin.site.register(RW_adminDB)
admin.site.register(RealWorldDataHistory)                   # データ使用履歴
admin.site.register(Predicate)
admin.site.register(RW_adminDB_rdf)
admin.site.register(Node)
admin.site.register(Double)
admin.site.register(Triple)
admin.site.register(RealWorldDataset)                       # 実世界データセット本体
admin.site.register(RealWorldDataBrewerInfo)                # データ醸造・醸造プログラム情報
admin.site.register(RealWorldDataBrewerInput)               # データ醸造・入力データ
admin.site.register(RealWorldDataBrewerOutput)              # データ醸造・出力データ
admin.site.register(RealWorldDataBrewingArgument)           # データ醸造・パラメータ
admin.site.register(RealWorldDataCollectionInfo)            # 収集情報
admin.site.register(RealWorldDataStructureInfo)             # 構造情報
admin.site.register(RealWorldDataStoringInfo)               # 保存先情報
admin.site.register(RealWorldDataRegisterDemands)           # データ登録系需給
admin.site.register(RealWorldDataRegisterSupplies)
admin.site.register(RealWorldDataCollectionDemands)         # データ収集系需給・収集ステータス
admin.site.register(RealWorldDataCollectionSupplies)
admin.site.register(RealWorldDataCollectionStatus)
admin.site.register(RealWorldDataBrewingDemands)            # データ醸造系需給・定期醸造設定
admin.site.register(RealWorldDataBrewingSupplies)
admin.site.register(RealWorldDataPeriodicBrewingConfigs)
admin.site.register(RealWorldDataReadDemands)               # データ読み込み需給（ by other programs ）
admin.site.register(RealWorldDataReadSupplies)
admin.site.register(RealWorldDataWriteDemands)              # データ書き込み需給（ by other programs ）
admin.site.register(RealWorldDataWriteSupplies)
admin.site.register(RealWorldDataMoveDemands)               # データ移動需給
admin.site.register(RealWorldDataMoveSupplies)
admin.site.register(RealWorldDataPeriodicMoveConfigs)
admin.site.register(RealWorldDataRemoveDemands)             # データ削除需給
admin.site.register(RealWorldDataRemoveSupplies)
admin.site.register(RealWorldDataPeriodicRemoveConfigs)
admin.site.register(Any)
