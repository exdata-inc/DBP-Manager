import os
import socket

JSON_FIELDS = 'fields'
ip = "127.0.0.1" #socket.gethostbyname(socket.gethostname())
API_URL_PREFIX = os.environ.get('RWDB_URL_PREFIX', 'http://' + ip + ':8000') + "/api/v0"
ALL = 'all'
WHERE = 'where'
WHO = 'who'
WHAT = 'what'
WHY = 'why'
HOW = 'how'
HISTORY = 'history'                         # データ使用履歴
DATASET = 'dataset'                         # 実世界データセット本体
BREWER_INFO = 'brewer'                      # データ醸造・醸造プログラム情報
BREWER_INPUT = 'brewer_input'               # データ醸造・入力データ
BREWER_OUTPUT = 'brewer_output'             # データ醸造・出力データ
BREWER_ARGUMENT = 'brewer_argument'         # データ醸造・パラメータ
COLLECTION_INFO = 'collection_info'         # 収集情報
STORING_INFO = 'storing_info'               # 保存先情報
STRUCTURE_INFO = 'structure_info'           # 構造情報
REGISTER_DEMANDS  = 'register_demands'      # データ登録系需給
REGISTER_SUPPLIES = 'register_supplies'
COLLECTION_DEMANDS  = 'collection_demands'  # データ収集系需給・収集ステータス
COLLECTION_SUPPLIES = 'collection_supplies'
COLLECTION_STATUS = 'collection_status'
BREWING_DEMANDS  = 'brewing_demands'        # データ醸造系需給・定期醸造設定
BREWING_SUPPLIES = 'brewing_supplies'
PERIODIC_BREWING_CONFIGS = 'periodic_brewing_configs'
READ_DEMANDS  = 'read_demands'              # データ読み込み需給（ by other programs ）
READ_SUPPLIES = 'read_supplies'
WRITE_DEMANDS  = 'write_demands'            # データ書き込み需給（ by other programs ）
WRITE_SUPPLIES = 'write_supplies'
MOVE_DEMANDS  = 'move_demands'              # データ移動需給
MOVE_SUPPLIES = 'move_supplies'
MOVE = 'move'
PERIODIC_MOVE_CONFIGS = 'periodic_move_configs'
REMOVE_DEMANDS  = 'remove_demands'          # データ削除需給
REMOVE_SUPPLIES = 'remove_supplies'
PERIODIC_REMOVE_CONFIGS = 'periodic_remove_configs'
ANY = 'any'                   # なんでもモデル

