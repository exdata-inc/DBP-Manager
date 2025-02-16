from dataclasses import fields
from pyexpat import model
from rest_framework import serializers
from .models import *

class WhereSerializer(serializers.ModelSerializer):
    class Meta:
        model = Where
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')

class WhoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Who
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')

class WhatSerializer(serializers.ModelSerializer):
    class Meta:
        model = What
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')

class WhySerializer(serializers.ModelSerializer):
    class Meta:
        model = Why
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')

class HowSerializer(serializers.ModelSerializer):
    class Meta:
        model = How
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')

class RW_adminDBSerializer(serializers.ModelSerializer):
    class Meta:
        model = RW_adminDB
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')


# データ使用履歴
class RealWorldDataHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = RealWorldDataHistory
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')


# 実世界データセット本体
class RealWorldDatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealWorldDataset
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')


# データ醸造・入力データ
class RealWorldDataBrewerInputSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealWorldDataBrewerInput
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')


# データ醸造・出力データ
class RealWorldDataBrewerOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealWorldDataBrewerOutput
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')


# データ醸造・パラメータ
class RealWorldDataBrewingArgumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealWorldDataBrewingArgument
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')


# データ醸造・醸造プログラム情報
class RealWorldDataBrewerInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealWorldDataBrewerInfo
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')


# 構造情報
class RealWorldDataStructureInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealWorldDataStructureInfo
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')


# 収集情報
class RealWorldDataCollectionInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealWorldDataCollectionInfo
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')


# 保存先情報
class RealWorldDataStoringInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealWorldDataStoringInfo
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')


# データ登録系需給
class RealWorldDataRegisterDemandsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealWorldDataRegisterDemands
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')

class RealWorldDataRegisterSuppliesSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealWorldDataRegisterSupplies
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')


# データ収集系需給・収集ステータス
class RealWorldDataCollectionDemandsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealWorldDataCollectionDemands
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')

class RealWorldDataCollectionSuppliesSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealWorldDataCollectionSupplies
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')

class RealWorldDataCollectionStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealWorldDataCollectionStatus
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')


# データ醸造系需給・定期醸造設定
class RealWorldDataBrewingDemandsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealWorldDataBrewingDemands
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')

class RealWorldDataBrewingSuppliesSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealWorldDataBrewingSupplies
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')

class RealWorldDataPeriodicBrewingConfigsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealWorldDataPeriodicBrewingConfigs
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')


# データ読み込み需給（ by other programs ）
class RealWorldDataReadDemandsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealWorldDataReadDemands
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')

class RealWorldDataReadSuppliesSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealWorldDataReadSupplies
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')


# データ書き込み需給（ by other programs ）
class RealWorldDataWriteDemandsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealWorldDataWriteDemands
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')

class RealWorldDataWriteSuppliesSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealWorldDataWriteSupplies
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')


# データ移動需給
class RealWorldDataMoveDemandsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealWorldDataMoveDemands
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')

class RealWorldDataMoveSuppliesSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealWorldDataMoveSupplies
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')

class RealWorldDataPeriodicMoveConfigsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealWorldDataPeriodicMoveConfigs
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')


# データ削除需給
class RealWorldDataRemoveDemandsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealWorldDataRemoveDemands
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')

class RealWorldDataRemoveSuppliesSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealWorldDataRemoveSupplies
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')

class RealWorldDataPeriodicRemoveConfigsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealWorldDataPeriodicRemoveConfigs
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')

class AnySerializer(serializers.ModelSerializer):
    class Meta:
        model = Any
        # json で出力するフィールド
        fields = ('id', 'fields', 'created_at', 'updated_at', 'author')