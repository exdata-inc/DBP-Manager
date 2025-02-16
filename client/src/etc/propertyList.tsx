import * as C from './consts';

export const DictList: { [key: string]: string[] }[] = [
    { [C.DBP_ENTRY_POINT_KEY]: [C.SC_URL, C.SC_ACTION_APPLICATION] },
    { [C.DBP_INPUT_TYPE]: [C.AT_ID] },
    { [C.DBP_OUTPUT_TYPE]: [C.AT_ID] },
    { [C.DBP_ARGUMENT_TYPE]: [C.AT_ID] },
];
  
export const StringList: string[] = [
    C.SC_URL,
    C.SC_ACTION_APPLICATION,
    C.AT_ID,
];