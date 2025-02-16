from django.db import models
from django.conf import settings
from django.utils import timezone
from django.db.models.fields.json import JSONField


class Where(models.Model):
    # data registered person
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # 本番環境なら、on_delete=models.PROTECT かな
    # data registered date
    created_at = models.DateTimeField("データが登録された日時", auto_now_add=True)
    updated_at = models.DateTimeField("データが更新された日時", auto_now=True)

    # data recorded place data
    place = models.CharField("データの取得場所", max_length=300, default="", help_text="(例：セントレア、東山、日進市、藤沢市)")
    lat = models.FloatField("緯度", default=1000)   # ユーザの入力から推測する？
    lon = models.FloatField("経度", default=1000)   # ユーザの入力から推測する？
    local = models.CharField("ローカル座標", max_length=300, default="")
    local_x = models.FloatField("ローカル座標のx", default=0)
    local_y = models.FloatField("ローカル座標のy", default=0)

    fields = JSONField(blank=True, null=True)

    def __str__(self):
        return self.place

class Who(models.Model):
    # data registered person
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # 本番環境なら、on_delete=models.PROTECT かな
    # data registered date
    created_at = models.DateTimeField("データが登録された日時", auto_now_add=True)
    updated_at = models.DateTimeField("データが更新された日時", auto_now=True)

    # data recording person data
    organization = models.CharField("データを取得した組織", max_length=300, default="", help_text="(例：セントレア、名大、名城大、藤沢市)")
    person = models.CharField("データを取得した人", max_length=300, default="", help_text="(例：名大太郎、コップ・セントレア)")

    fields = JSONField(blank=True, null=True)

    def __str__(self):
        return self.organization+" | "+self.person

class What(models.Model):
    # data registered person
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # 本番環境なら、on_delete=models.PROTECT かな
    # data registered date
    created_at = models.DateTimeField("データが登録された日時", auto_now_add=True)
    updated_at = models.DateTimeField("データが更新された日時", auto_now=True)

    # data recorded kind data
    what = models.CharField("データの形", max_length=300, default="", help_text="(例：通過数、滞留数)")

    fields = JSONField(blank=True, null=True)

    def __str__(self):
        return self.what

class Why(models.Model):
    # data registered person
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # 本番環境なら、on_delete=models.PROTECT かな
    # data registered date
    created_at = models.DateTimeField("データが登録された日時", auto_now_add=True)
    updated_at = models.DateTimeField("データが更新された日時", auto_now=True)

    # data recorded reason data
    reason = models.CharField("データが取得された理由", max_length=300, default="", help_text="（例：空港利用者の電車利用実態を調査するため）")

    fields = JSONField(blank=True, null=True)

    def __str__(self):
        return self.reason

class How(models.Model):
    # data registered person
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # 本番環境なら、on_delete=models.PROTECT かな
    # data registered date
    created_at = models.DateTimeField("データが登録された日時", auto_now_add=True)
    updated_at = models.DateTimeField("データが更新された日時", auto_now=True)

    # data recorded method data
    device_type = models.CharField("データを取得したデバイスのタイプ", max_length=300, default="", help_text="(例：赤外センサ、カメラ)")
    device_model = models.CharField("データを取得したデバイスのモデル", max_length=300, default="", help_text="(例：RICOH THETA Z1, iPhone 13 Pro)")
    device_id = models.CharField("デバイスの固有ID", max_length=300, default="")

    fields = JSONField(blank=True, null=True)
    
    def __str__(self):
        return self.device_type+" | "+self.device_model+" | "+self.device_id

class RW_adminDB(models.Model):
    # data registered person
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # 本番環境なら、on_delete=models.PROTECT かな
    # data registered date
    created_at = models.DateTimeField("データが登録された日時", auto_now_add=True)
    updated_at = models.DateTimeField("データが更新された日時", auto_now=True)

    # 5W1H (green)
    when = models.DateTimeField("データが取得された日時", default=timezone.now)
    where = models.ForeignKey(to=Where, on_delete=models.CASCADE, verbose_name="データの取得場所")
    who = models.ForeignKey(to=Who, on_delete=models.CASCADE, verbose_name="データの収集者")
    what = models.ForeignKey(to=What, on_delete=models.CASCADE, verbose_name="データの形")
    why = models.ForeignKey(to=Why, on_delete=models.CASCADE, verbose_name="データが取得された理由") # 醸造の過程で有用なのでは
    how = models.ForeignKey(to=How, on_delete=models.CASCADE, verbose_name="データを取得した方法")

    # data path (gray)
    file = models.FileField("データファイル", max_length=300, default=None, null=True)

    # data download count
    data_used_count = models.IntegerField("データがダウンロードされた回数", default=0)

    fields = JSONField(blank=True, null=True)
    
    def __str__(self):
        return str(self.id)+"|"+self.file.name


class JsonModel(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # 本番環境なら、on_delete=models.PROTECT かな
    created_at = models.DateTimeField("データが登録された日時", auto_now_add=True)
    updated_at = models.DateTimeField("データが更新された日時", auto_now=True)
    fields = JSONField(blank=True, null=True)

# 実世界データセット本体
class RealWorldDataset(JsonModel):
    pass

# データ醸造・入力データ
class RealWorldDataBrewerInput(JsonModel):
    pass

# データ醸造・出力データ
class RealWorldDataBrewerOutput(JsonModel):
    pass

# データ醸造・パラメータ
class RealWorldDataBrewingArgument(JsonModel):
    pass

# データ醸造・醸造プログラム情報
class RealWorldDataBrewerInfo(JsonModel):
    pass

# 収集情報
class RealWorldDataCollectionInfo(JsonModel):
    pass

# 保存先情報
class RealWorldDataStoringInfo(JsonModel):
    pass
    
# 構造情報
class RealWorldDataStructureInfo(JsonModel):
    pass

# データ使用履歴
class RealWorldDataHistory(JsonModel):
    pass

# データ登録系需給
class RealWorldDataRegisterDemands(JsonModel):  # for debug / logging, includes RealWorldData.*?Demand
    pass

class RealWorldDataRegisterSupplies(JsonModel):  # for debug / logging, includes RealWorldData.*?Supply
    pass

# データ収集系需給・収集ステータス
class RealWorldDataCollectionDemands(JsonModel):  # for debug / logging, includes RealWorldData.*?Demand
    pass

class RealWorldDataCollectionSupplies(JsonModel):  # for debug / logging, includes RealWorldData.*?Supply
    pass

class RealWorldDataCollectionStatus(JsonModel):  # for debug / logging
    pass

# データ醸造系需給・定期醸造設定
class RealWorldDataBrewingDemands(JsonModel):  # for debug / logging, includes RealWorldData.*?Demand
    pass

class RealWorldDataBrewingSupplies(JsonModel):  # for debug / logging, includes RealWorldData.*?Supply
    pass

class RealWorldDataPeriodicBrewingConfigs(JsonModel):  # for debug / logging, includes RealWorldData.*?Supply
    pass

# データ読み込み需給（ by other programs ）
class RealWorldDataReadDemands(JsonModel):  # for debug / logging, includes RealWorldData.*?Demand
    pass

class RealWorldDataReadSupplies(JsonModel):  # for debug / logging, includes RealWorldData.*?Supply
    pass

# データ書き込み需給（ by other programs ）
class RealWorldDataWriteDemands(JsonModel):  # for debug / logging, includes RealWorldData.*?Demand
    pass

class RealWorldDataWriteSupplies(JsonModel):  # for debug / logging, includes RealWorldData.*?Supply
    pass

# データ移動需給
class RealWorldDataMoveDemands(JsonModel):  # for debug / logging, includes RealWorldData.*?Demand
    pass

class RealWorldDataMoveSupplies(JsonModel):  # for debug / logging, includes RealWorldData.*?Supply
    pass

class RealWorldDataPeriodicMoveConfigs(JsonModel):  # for debug / logging, includes RealWorldData.*?Supply
    pass

# データ削除需給
class RealWorldDataRemoveDemands(JsonModel):  # for debug / logging, includes RealWorldData.*?Demand
    pass

class RealWorldDataRemoveSupplies(JsonModel):  # for debug / logging, includes RealWorldData.*?Supply
    pass

class RealWorldDataPeriodicRemoveConfigs(JsonModel):  # for debug / logging, includes RealWorldData.*?Supply
    pass

# なんでもモデル
class Any(JsonModel):
    pass


####################################################################################################################################
class Predicate(models.Model):
    # data downloading person
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # 本番環境なら、on_delete=models.PROTECT かな
    # data downloaded date
    created_at = models.DateTimeField("データが登録された日時", auto_now_add=True)
    updated_at = models.DateTimeField("データが更新された日時", auto_now=True)

    # predicate
    predicate = models.CharField("述語", max_length=300, default="", help_text="(例：データ取得場所、５分間の平均値)")
    # detail description
    description = models.TextField("説明", max_length=1000, default="", help_text="(例：県単位での取得場所を表す)")
    # micro program
    microprogram = models.FileField("マイクロプログラム", max_length=300, default=None, null=True)

    def __str__(self):
        return self.predicate
    fields = JSONField(blank=True, null=True)
    

class RW_adminDB_rdf(models.Model):
    # data downloading person
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # 本番環境なら、on_delete=models.PROTECT かな
    # data downloaded date
    created_at = models.DateTimeField("データが登録された日時", auto_now_add=True)
    updated_at = models.DateTimeField("データが更新された日時", auto_now=True)

    # data path (gray)
    file = models.FileField("データファイル", max_length=300, default=None, null=True)

    # data download count
    data_used_count = models.IntegerField("データがダウンロードされた回数", default=0)

    fields = JSONField(blank=True, null=True)
    
    def __str__(self):
        return str(self.id)+"|"+self.file.name

# TripleのS又はOになるIRIで、RW_adminDB以外のもの。
class Node(models.Model):
    # data downloading person
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # 本番環境なら、on_delete=models.PROTECT かな
    # data downloaded date
    created_at = models.DateTimeField("データが登録された日時", auto_now_add=True)
    updated_at = models.DateTimeField("データが更新された日時", auto_now=True)

    # node name
    node = models.CharField("ノードの名前", max_length=300, default="", help_text="(例：セントレア、通過数)")
    # detail description
    description = models.TextField("説明", max_length=1000, default="", help_text="(例：愛知県常滑市にある、ゲートAでの)")

    def __str__(self):
        return self.node

# 4W1H追加時に使用。これを元に4W1HのTripleを作る
class Double(models.Model):
    # data downloading person
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # 本番環境なら、on_delete=models.PROTECT かな
    # data downloaded date
    created_at = models.DateTimeField("データが登録された日時", auto_now_add=True)
    updated_at = models.DateTimeField("データが更新された日時", auto_now=True)

    # predicate
    predicate = models.ForeignKey(to=Predicate, on_delete=models.CASCADE, related_name="double_predicate")
    # object
    object_node = models.ForeignKey(to=Node, on_delete=models.CASCADE, related_name="double_object_node")

    def __str__(self):
        return str(self.predicate) + " -> " + str(self.object_node)

class Triple(models.Model):
    # data downloading person
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # 本番環境なら、on_delete=models.PROTECT かな
    # data downloaded date
    created_at = models.DateTimeField("データが登録された日時", auto_now_add=True)
    updated_at = models.DateTimeField("データが更新された日時", auto_now=True)

    # S <- triple(SPO)
    subject_RW = models.ForeignKey(to=RW_adminDB_rdf, on_delete=models.CASCADE, related_name="triple_subject_RW", blank=True, null=True)
    # S <- triple(SPO)
    subject_node = models.ForeignKey(to=Node, on_delete=models.CASCADE, related_name="triple_subject_node", blank=True, null=True)
    # P <- triple(SPO)
    predicate = models.ForeignKey(to=Predicate, on_delete=models.CASCADE, related_name="triple_predicate")
    # O <- triple(SPO)
    object_RW = models.ForeignKey(to=RW_adminDB_rdf, on_delete=models.CASCADE, related_name="triple_object_RW", blank=True, null=True)
    # O <- triple(SPO)
    object_node = models.ForeignKey(to=Node, on_delete=models.CASCADE, related_name="triple_object_node", blank=True, null=True)

    def __str__(self):
        string = ""
        if self.subject_RW is not None:
            string = string + str(self.subject_RW)
        elif self.subject_node is not None:
            string = string + str(self.subject_node)
        string += " -> " + str(self.predicate) + " -> "
        if self.object_RW is not None:
            string += str(self.object_RW)
        elif self.object_node is not None:
            string += str(self.object_node)
        return string