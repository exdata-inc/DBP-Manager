export const WHERE = 'where'
export const WHO = 'who'
export const WHAT = 'what'
export const WHY = 'why'
export const HOW = 'how'
export const ANY = 'any'
export const HISTORY = 'history'                         // データ使用履歴
export const DATASET = 'dataset'                         // 実世界データセット本体
export const BREWER_INFO = 'brewer'                      // データ醸造・醸造プログラム情報
export const BREWER_INPUT = 'brewer_input'               // データ醸造・入力データ
export const BREWER_OUTPUT = 'brewer_output'             // データ醸造・出力データ
export const BREWER_ARGUMENT = 'brewer_argument'         // データ醸造・パラメータ
export const COLLECTION_INFO = 'collection_info'         // 収集情報
export const STORING_INFO = 'storing_info'               // 保存先情報
export const STRUCTURE_INFO = 'structure_info'           // 構造情報
export const REGISTER_DEMANDS  = 'register_demands'      // データ登録系需給
export const REGISTER_SUPPLIES = 'register_supplies'
export const COLLECTION_DEMANDS  = 'collection_demands'  // データ収集系需給・収集ステータス
export const COLLECTION_SUPPLIES = 'collection_supplies'
export const COLLECTION_STATUS = 'collection_status'
export const BREWING_DEMANDS  = 'brewing_demands'        // データ醸造系需給・定期醸造設定
export const BREWING_SUPPLIES = 'brewing_supplies'
export const PERIODIC_BREWING_CONFIGS = 'periodic_brewing_configs'
export const READ_DEMANDS  = 'read_demands'              // データ読み込み需給（ by other programs ）
export const READ_SUPPLIES = 'read_supplies'
export const WRITE_DEMANDS  = 'write_demands'            // データ書き込み需給（ by other programs ）
export const WRITE_SUPPLIES = 'write_supplies'
export const MOVE_DEMANDS  = 'move_demands'              // データ移動需給
export const MOVE_SUPPLIES = 'move_supplies'
export const PERIODIC_MOVE_CONFIGS = 'periodic_move_configs'
export const REMOVE_DEMANDS  = 'remove_demands'          // データ削除需給
export const REMOVE_SUPPLIES = 'remove_supplies'
export const PERIODIC_REMOVE_CONFIGS = 'periodic_remove_configs'

export const ALL_PATHS = [
    WHERE,
    WHO,
    WHAT,
    WHY,
    HOW,
    HISTORY,
    DATASET,
    BREWER_INFO,
    BREWER_INPUT,
    BREWER_OUTPUT,
    BREWER_ARGUMENT,
    COLLECTION_INFO,
    STORING_INFO,
    STRUCTURE_INFO,
    REGISTER_DEMANDS,
    REGISTER_SUPPLIES,
    COLLECTION_DEMANDS,
    COLLECTION_SUPPLIES,
    COLLECTION_STATUS,
    BREWING_DEMANDS,
    BREWING_SUPPLIES,
    PERIODIC_BREWING_CONFIGS,
    READ_DEMANDS,
    READ_SUPPLIES,
    WRITE_DEMANDS,
    WRITE_SUPPLIES,
    MOVE_DEMANDS,
    MOVE_SUPPLIES,
    PERIODIC_MOVE_CONFIGS,
    REMOVE_DEMANDS,
    REMOVE_SUPPLIES,
    PERIODIC_REMOVE_CONFIGS,
];

// JSON-LD @ Keys
export const AT_CONTEXT: string = `@context`;
export const AT_ID:      string = `@id`;
export const AT_REF:     string = `@ref`;
export const AT_TYPE:    string = `@type`;
export const AT_GRAPH:   string = `@graph`;

// Frequently used schema.org Keys
export const SC_NAME:                    string = "schema:name";
export const SC_URL:                     string = "schema:url";
export const SC_DISTRIBUTION:            string = "schema:distribution";
export const SC_AUTHOR:                  string = "schema:author";
export const SC_CONTENT_LOCATION:        string = "schema:contentLocation";
export const SC_DATE_CREATED:            string = "schema:dateCreated";
export const SC_DATE_MODIFIED:           string = "schema:dateModified";
export const SC_DATE_PUBLISHED:          string = "schema:datePublished";
export const SC_LICENSE:                 string = "schema:license";
export const SC_LOCATION_CREATED:        string = "schema:locationCreated";
export const SC_DESCRIPTION:             string = "schema:description";
export const SC_VALUE:                   string = "schema:value";
export const SC_ACTION_APPLICATION:      string = "schema:actionApplication";
export const SC_ADDRESS:                 string = "schema:address";
export const SC_IATA_CODE:               string = "schema:iataCode";
export const SC_ICAO_CODE:               string = "schema:icaoCode";
export const SC_LATITUDE:                string = "schema:latitude";
export const SC_LONGITUDE:               string = "schema:longitude";
export const SC_LOCATION:                string = "schema:location";
export const SC_DEPARTMENT:              string = "schema:department";
export const SC_DATASET:                 string = "schema:dataset";

// Frequently used schema.org Types
export const SC_ENTRY_POINT:  string = "schema:EntryPoint";
export const SC_THING:        string = "schema:Thing";

// DBP Keys
export const DBP_STRUCTURE_INFO:             string = "dbp:structureInfo";
export const DBP_GENERATED_FROM:             string = "dbp:generatedFrom";
export const DBP_GENERATED_USING:            string = "dbp:generatedUsing";
export const DBP_GENERATED_ARGS:             string = "dbp:generatedArgs";
export const DBP_COLLECTION_INFO:            string = "dbp:collectionInfo";
export const DBP_KEY:                        string = "dbp:key";
export const DBP_INPUT_TYPE:                 string = "dbp:inputType";
export const DBP_INPUT_CHARACTERISTIC:       string = "dbp:inputCharacteristic";
export const DBP_DATASET:                    string = "dbp:dataset";
export const DBP_OUTPUT_TYPE:                string = "dbp:outputType";
export const DBP_OUTPUT_CHARACTERISTIC:      string = "dbp:outputCharacteristic";
export const DBP_ARGUMENT_TYPE:              string = "dbp:argumentType";
export const DBP_INPUT_SPECS:                string = "dbp:inputSpecs";
export const DBP_OUTPUT_SPECS:               string = "dbp:outputSpecs";
export const DBP_ARG_SPECS:                  string = "dbp:argSpecs";
export const DBP_CONVERSION_CHARACTERISTIC:  string = "dbp:conversionCharacteristic";
export const DBP_COLLECTION_STYLE:           string = "dbp:collectionStyle";
export const DBP_COLLECTION_PROTOCOL:        string = "dbp:collectionProtocol";
export const DBP_LISTEN_ADDRESS:             string = "dbp:listenAddress";
export const DBP_SERVER_ADDRESS:             string = "dbp:serverAddress";
export const DBP_ENTRY_POINT_KEY:            string = "dbp:entryPoint";
export const DBP_STRUCTURE:                  string = "dbp:structure";
export const DBP_GRAPHQL_SCHEMA:             string = "dbp:graphqlSchema";
export const DBP_BASE_URL:                   string = "dbp:baseUrl";
export const DBP_PATTERN:                    string = "dbp:pattern";
export const DBP_ACTIVE_CONNECTIONS:         string = "dbp:activeConnections";
export const DBP_TRAFFIC_STATISTICS:         string = "dbp:trafficStatistics";
export const DBP_BREWER_INFO:                string = "dbp:brewerInfo";
export const DBP_BREWER_INPUT:               string = "dbp:brewerInput";
export const DBP_BREWER_OUTPUT:              string = "dbp:brewerOutput";
export const DBP_BREWING_ARGUMENT:           string = "dbp:brewingArgument";
export const DBP_BREWER_OUTPUT_STORE:        string = "dbp:brewerOutputStore";
export const DBP_TIME_PERIOD_START:          string = "dbp:timePeriodStart";
export const DBP_TIME_PERIOD_END:            string = "dbp:timePeriodEnd";
export const DBP_BREWING_CONFIG:             string = "dbp:brewingConfig";
export const DBP_CRON_CONFIG:                string = "dbp:cronConfig";
export const DBP_SPARQL_QUERY:               string = "dbp:sparqlQuery";
export const DBP_GRAPHQL_QUERY:              string = "dbp:graphqlQuery";
export const DBP_MOVE_FROM:                  string = "dbp:moveFrom";
export const DBP_MOVE_TO:                    string = "dbp:moveTo";
export const DBP_MOVED_DATASET:              string = "dbp:movedDataset";
export const DBP_MOVE_CONFIG:                string = "dbp:moveConfig";
export const DBP_REMOVE_CONFIG:              string = "dbp:removeConfig";
export const DBP_DATASET_STORE:              string = "dbp:datasetStore";
export const DBP_START_TIME:                 string = "dbp:startTime";
export const DBP_END_TIME:                   string = "dbp:endTime";
export const DBP_ENABLED:                    string = "dbp:enabled";
export const DBP_TRANSMISSION_SPEED:         string = "dbp:transmissionSpeed";
export const DBP_STORAGE_TYPE:               string = "dbp:storageType";
export const DBP_DATA:                       string = "dbp:data";

// DBP Types
export const DBP_RW_DATASET:                   string = "dbp:RealWorldDataset";
export const DBP_RWD_BREWER_INPUT:             string = "dbp:RealWorldDataBrewerInput";
export const DBP_RWD_BREWER_OUTPUT:            string = "dbp:RealWorldDataBrewerOutput";
export const DBP_RWD_BREWING_ARGUMENT:         string = "dbp:RealWorldDataBrewingArgument";
export const DBP_RWD_BREWER_INFO:              string = "dbp:RealWorldDataBrewerInfo";
export const DBP_RWD_COLLECTION_INFO:          string = "dbp:RealWorldDataCollectionInfo";
export const DBP_RWD_STRUCTURE_INFO:           string = "dbp:RealWorldDataStructureInfo";
export const DBP_RWD_STORING_INFO:             string = "dbp:RealWorldDataStoringInfo";
export const DBP_RWD_REGISTER_DEMAND:          string = "dbp:RealWorldDataRegisterDemand";
export const DBP_RWD_REGISTER_SUPPLY:          string = "dbp:RealWorldDataRegisterSupply";
export const DBP_RWD_COLLECTION_DEMAND:        string = "dbp:RealWorldDataCollectionDemand";
export const DBP_RWD_COLLECTION_SUPPLY:        string = "dbp:RealWorldDataCollectionSupply";
export const DBP_RWD_COLLECTION_STATUS:        string = "dbp:RealWorldDatCollectionStatus";
export const DBP_RWD_BREWING_DEMAND:           string = "dbp:RealWorldDataBrewingDemand";
export const DBP_RWD_BREWING_SUPPLY:           string = "dbp:RealWorldDataBrewingSupply";
export const DBP_RWD_PERIODIC_BREWING_CONFIG:  string = "dbp:RealWorldDataPeriodicBrewingConfig";
export const DBP_RWD_READ_DEMAND:              string = "dbp:RealWorldDataReadDemand";
export const DBP_RWD_READ_SUPPLY:              string = "dbp:RealWorldDataReadSupply";
export const DBP_RWD_WRITE_DEMAND:             string = "dbp:RealWorldDataWriteDemand";
export const DBP_RWD_WRITE_SUPPLY:             string = "dbp:RealWorldDataWriteSupply";
export const DBP_RWD_MOVE_DEMAND:              string = "dbp:RealWorldDataMoveDemand";
export const DBP_RWD_MOVE_SUPPLY:              string = "dbp:RealWorldDataMoveSupply";
export const DBP_RWD_PERIODIC_MOVE_CONFIG:     string = "dbp:RealWorldDataPeriodicMoveConfig";
export const DBP_RWD_REMOVE_DEMAND:            string = "dbp:RealWorldDataRemoveDemand";
export const DBP_RWD_REMOVE_SUPPLY:            string = "dbp:RealWorldDataRemoveSupply";
export const DBP_RWD_PERIODIC_REMOVE_CONFIG:   string = "dbp:RealWorldDataPeriodicRemoveConfig";


export const defaultLocalHost = "http://localhost:8001";
export const API_ROOT_PATH = import.meta.env.VITE_API_ROOT_PATH;
export const TIME_ZONE = "Asia/Tokyo";
export const LANGUAGE_JA = 'ja';
export const LANGUAGE_EN = 'en';
export const DEFAULT_LANGUAGE = LANGUAGE_JA;

// localStorage
export const APP_LANGUAGE = 'AppLanguage';
export const APP_NAVIGATION_OPEN = 'AppNavigationOpen';
export const IF_USE_DENSE_TABLE = 'IfUseDenseTable';
export const IF_USE_HUMAN_FRIENDLY = 'IfUseHumanFriendly';

// Highlighter
export const HIGHLIGHTER_SPLITTER = "Ch1nChA";
export const HIGHLIGHTER_REPLACER = `cH!NcHa`;
export const HIGHLIGHTER_SAND = `${HIGHLIGHTER_SPLITTER}${HIGHLIGHTER_REPLACER}${HIGHLIGHTER_SPLITTER}`;
