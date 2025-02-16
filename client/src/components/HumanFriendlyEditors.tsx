import * as React from 'react';
import {
  IconButton,
  Tooltip,
  TextField,
  Typography,
  Grid,
  MenuItem,
  Select,
  FormControl,
  Checkbox,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
} from '@mui/icons-material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTranslation } from "react-i18next";
import { PageLoader } from './PageLoader';
import { updateJsonLd } from '../etc/jsonLdUtils';
import * as C from '../etc/consts';
import * as LIST from '../etc/propertyList';



// String 型のプロパティ用の入力欄

interface HumanFriendlyPropertyStringProps {
  id: string | undefined;
  pkey: string;
  jsonLD: any;
  setJsonLD: React.Dispatch<React.SetStateAction<any>>;
}

export function HumanFriendlyPropertyString({ id, pkey, jsonLD, setJsonLD }: HumanFriendlyPropertyStringProps) {
  const [pValue, setPValue] = React.useState<string>(jsonLD?.[pkey] || ''); // 現在の値
  const { t } = useTranslation();


  const handleInfoChange = () => {
    if (!id) {
      return;
    }

    if (pValue) {
      // JSON-LDデータをコピー
      const updatedJsonLd = { ...jsonLD };

      // プロパティを新しい名前で書き換え
      updatedJsonLd[pkey] = pValue;

      console.debug(JSON.stringify(updatedJsonLd));
      if (updatedJsonLd) updateJsonLd(id, updatedJsonLd); //確認後に使う

      setJsonLD(updatedJsonLd);
    }
  };


  React.useEffect(() => {
    if (jsonLD) {
      setPValue(jsonLD?.[pkey]);
      //console.log(jsonLD);
    }
  }, [jsonLD]);


  if (!jsonLD) {
    return <PageLoader message={t("app.status.initializing")} />;
  }

  return (
    <React.Fragment>
      <Grid item xs={12} md={4} lg={3} xl={2}>
        <Typography>{t(`pkeys.${pkey.split(':').join('.')}`)}</Typography>
      </Grid>
      <Grid item xs={12} md={8} lg={9} xl={10} sx={{ display: 'flex' }}>
        <TextField variant="standard" fullWidth type="text" value={pValue} onChange={(e) => setPValue(e.target.value)} />
        <Tooltip title="変更"><IconButton onClick={handleInfoChange}><SaveIcon /></IconButton></Tooltip>
      </Grid>
    </React.Fragment>
  );
}



export function HumanFriendlyPropertyNumber({ id, pkey, jsonLD, setJsonLD }: HumanFriendlyPropertyStringProps) {
  const [pValue, setPValue] = React.useState<number | string>(jsonLD?.[pkey] || null); // 現在の値
  const { t } = useTranslation();


  const handleInfoChange = () => {
    if (!id) {
      return;
    }

    if (pValue) {
      // JSON-LDデータをコピー
      const updatedJsonLd = { ...jsonLD };

      // プロパティを新しい名前で書き換え
      if (!isNaN(Number(pValue))) {
        updatedJsonLd[pkey] = Number(pValue);
        setJsonLD(updatedJsonLd);
      } else {
        setPValue("！数字を入力してください！");
      }

      console.debug(JSON.stringify(updatedJsonLd));
      if (updatedJsonLd) updateJsonLd(id, updatedJsonLd); //確認後に使う
    }
  };


  React.useEffect(() => {
    if (jsonLD) {
      if (!isNaN(Number(jsonLD?.[pkey]))) {
        setPValue(Number(jsonLD?.[pkey]));
      } else {
        setPValue(jsonLD?.[pkey]);
      }
      //console.log(jsonLD);
    }
  }, [jsonLD]);


  if (!jsonLD) {
    return <PageLoader message={t("app.status.initializing")} />;
  }

  return (
    <React.Fragment>
      <Grid item xs={12} md={4} lg={3} xl={2}>
        <Typography>{t(`pkeys.${pkey.split(':').join('.')}`)}</Typography>
      </Grid>
      <Grid item xs={12} md={8} lg={9} xl={10} sx={{ display: 'flex' }}>
        <TextField variant="standard" fullWidth type="text" value={pValue} onChange={(e) => setPValue(e.target.value)} />
        <Tooltip title="変更"><IconButton onClick={handleInfoChange}><SaveIcon /></IconButton></Tooltip>
      </Grid>
    </React.Fragment>
  );
}



export function HumanFriendlyPropertyNumberOrString({ id, pkey, jsonLD, setJsonLD }: HumanFriendlyPropertyStringProps) {
  const [pValue, setPValue] = React.useState<number | string>(jsonLD?.[pkey] || ''); // 現在の値
  const { t } = useTranslation();


  const handleInfoChange = () => {
    if (!id) {
      return;
    }

    if (pValue) {
      // JSON-LDデータをコピー
      const updatedJsonLd = { ...jsonLD };

      // プロパティを新しい名前で書き換え
      if (!isNaN(Number(pValue))) {
        updatedJsonLd[pkey] = Number(pValue);
      } else {
        updatedJsonLd[pkey] = pValue;
      }

      console.debug(JSON.stringify(updatedJsonLd));
      if (updatedJsonLd) updateJsonLd(id, updatedJsonLd); //確認後に使う

      setJsonLD(updatedJsonLd);
    }
  };


  React.useEffect(() => {
    if (jsonLD) {
      if (!isNaN(Number(jsonLD?.[pkey]))) {
        setPValue(Number(jsonLD?.[pkey]));
      } else {
        setPValue(jsonLD?.[pkey]);
      }
      //console.log(jsonLD);
    }
  }, [jsonLD]);


  if (!jsonLD) {
    return <PageLoader message={t("app.status.initializing")} />;
  }

  return (
    <React.Fragment>
      <Grid item xs={12} md={4} lg={3} xl={2}>
        <Typography>{t(`pkeys.${pkey.split(':').join('.')}`)}</Typography>
      </Grid>
      <Grid item xs={12} md={8} lg={9} xl={10} sx={{ display: 'flex' }}>
        <TextField variant="standard" fullWidth type="text" value={pValue} onChange={(e) => setPValue(e.target.value)} />
        <Tooltip title="変更"><IconButton onClick={handleInfoChange}><SaveIcon /></IconButton></Tooltip>
      </Grid>
    </React.Fragment>
  );
}



export function HumanFriendlyPropertyBool({ id, pkey, jsonLD, setJsonLD }: HumanFriendlyPropertyStringProps) {
  const [pValue, setPValue] = React.useState<boolean>(jsonLD?.[pkey] || false); // 現在の値
  const { t } = useTranslation();


  const handleInfoChange = (selectedInfo: boolean) => {
    if (!id) {
      return;
    }

    if (id) {
      // JSON-LDデータをコピー
      const updatedJsonLd = { ...jsonLD };

      // プロパティを新しい名前で書き換え
      updatedJsonLd[pkey] = selectedInfo;

      console.debug(JSON.stringify(updatedJsonLd));
      if (updatedJsonLd) updateJsonLd(id, updatedJsonLd); //確認後に使う

      setJsonLD(updatedJsonLd);
    }
  };


  React.useEffect(() => {
    if (jsonLD) {
      setPValue(jsonLD?.[pkey] || false);
      //console.log(jsonLD);
    }
  }, [jsonLD]);


  if (!jsonLD) {
    return <PageLoader message={t("app.status.initializing")} />;
  }

  return (
    <React.Fragment>
      <Grid item xs={12} md={4} lg={3} xl={2}>
        <Typography>{t(`pkeys.${pkey.split(':').join('.')}`)}</Typography>
      </Grid>
      <Grid item xs={12} md={8} lg={9} xl={10} sx={{ display: 'flex' }}>
        <Select
          fullWidth
          value={pValue.toString()} // 選択された項目の値
          onChange={(e) => setPValue(e.target.value === 'true')} // 選択が変更されたときの処理
          label="ContentLocations"
          variant="standard"
        >
          <MenuItem value={'true'}>True</MenuItem>
          <MenuItem value={'false'}>False</MenuItem>
        </Select>
        <Tooltip title="変更"><IconButton onClick={() => handleInfoChange(pValue)}><SaveIcon /></IconButton></Tooltip>
      </Grid>
    </React.Fragment>
  );
}



export function HumanFriendlyDictProperty({ id, pkey, path, urlPrefix, jsonLD, setJsonLD }: HumanFriendlyPropertySelectProps) {
  const [isHidden, setIsHidden] = React.useState<boolean>(true); // 隠れているText Fieldを表示
  const { t } = useTranslation();


  const handleTextFieldClick = () => {
    setIsHidden(!isHidden);
  };


  if (!jsonLD) {
    return <PageLoader message={t("app.status.initializing")} />;
  }

  return (
    <React.Fragment>
      <Grid item xs={4} md={3} lg={2} xl={1}>
        <Typography>{t(`pkeys.${pkey.split(':').join('.')}`)}</Typography>
      </Grid>
      <Grid item xs={8} md={9} lg={10} xl={11}>
        <IconButton onClick={handleTextFieldClick}>
          {isHidden ? <KeyboardArrowRightIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </Grid>
      {!isHidden && (
        <Grid container spacing={0} alignItems="center" justifyContent="center" >
          {LIST.DictList.map((obj: any) => (
            Object.entries(obj).map(([key, value]: any) => (
              key === pkey ? (
                value.map((v: string) => (
                  LIST.StringList.includes(v) ? (
                    <HumanFriendlyInPropertyString id={id} pkey={pkey} inpkey={v} jsonLD={jsonLD} setJsonLD={setJsonLD} />
                  ) : null
                ))
              ) : null
            ))
          ))
          }
        </Grid>
      )}
    </React.Fragment>
  );
}



interface HumanFriendlyInPropertyStringProps {
  id: string | undefined;
  pkey: string;
  inpkey: string;
  jsonLD: any;
  setJsonLD: React.Dispatch<React.SetStateAction<any>>;
}

export function HumanFriendlyInPropertyString({ id, pkey, inpkey, jsonLD, setJsonLD }: HumanFriendlyInPropertyStringProps) {
  const [pValue, setPValue] = React.useState<string>(jsonLD[pkey]?.[inpkey] || ''); // 現在の値
  const { t } = useTranslation();


  const handleInfoChange = () => {
    if (!id) {
      return;
    }

    if (pValue) {
      // JSON-LDデータをコピー
      const updatedJsonLd = { ...jsonLD };

      // プロパティを新しい名前で書き換え
      if (!updatedJsonLd[pkey]) {
        updatedJsonLd[pkey] = {};
      }
      updatedJsonLd[pkey][inpkey] = pValue;

      console.debug(JSON.stringify(updatedJsonLd));             // 確認後、この行は .debug へ
      if (updatedJsonLd) updateJsonLd(id, updatedJsonLd);  // 確認後、この行を使う

      setJsonLD(updatedJsonLd);
    }
  };


  React.useEffect(() => {
    if (jsonLD[pkey]) {
      setPValue(jsonLD[pkey]?.[inpkey]);
      //console.log(jsonLD);
    }
  }, [jsonLD[pkey]]);


  if (!jsonLD) {
    return <PageLoader message={t("app.status.initializing")} />;
  }

  return (
    <React.Fragment>
      <Grid item xs={1} md={1} lg={1} xl={1}><Divider orientation="vertical" flexItem /></Grid>
      <Grid item xs={11} md={3} lg={2} xl={1}>
        <Typography>{t(`pkeys.${inpkey.split(':').join('.')}`)}</Typography>
      </Grid>
      <Grid item xs={12} md={8} lg={9} xl={10} sx={{ display: 'flex' }}>
        <TextField variant="standard" fullWidth type="text" value={pValue} onChange={(e) => setPValue(e.target.value)} />
        <Tooltip title="変更"><IconButton onClick={handleInfoChange}><SaveIcon /></IconButton></Tooltip>
      </Grid>
    </React.Fragment>
  );
}



// 単一の別の JSON-LD へのリンクのプロパティ用の入力欄

interface HumanFriendlyPropertySelectProps {
  id: string | undefined;
  pkey: string;
  path: string;
  urlPrefix: string;
  jsonLD: any;
  setJsonLD: React.Dispatch<React.SetStateAction<any>>;
}

const DEFAULT_OBJ = { [C.SC_NAME]: "<なし>", [C.AT_ID]: "", [C.AT_TYPE]: "" };

export function HumanFriendlyPropertySingleSelect({ id, pkey, path, urlPrefix, jsonLD, setJsonLD }: HumanFriendlyPropertySelectProps) {
  const [pCandidates, setPCandidates] = React.useState<any>(null);  // 情報の配列
  const [pValue, setPValue] = React.useState<any>(DEFAULT_OBJ);              // 選ばれた情報
  const { t } = useTranslation();


  const handleSelectedInfoChange = (selectedInfo: any) => {
    setPValue(selectedInfo);
  }

  const handleInfoChange = (selectedInfo: any) => {
    if (!id) {
      return;
    }

    if (selectedInfo) {
      const { [C.AT_ID]: sid, [C.AT_TYPE]: stype } = selectedInfo;
      // JSON-LDデータをコピー
      const updatedJsonLd = { ...jsonLD };

      // プロパティを新しい名前で書き換え
      updatedJsonLd[pkey] = { [C.AT_ID]: sid, [C.AT_TYPE]: stype };

      console.debug(JSON.stringify(updatedJsonLd));
      if (updatedJsonLd) updateJsonLd(id, updatedJsonLd); //確認後に使う

      setJsonLD(updatedJsonLd);
    }
  };


  React.useEffect(() => {
    let isMounted = true;

    const initializeJsonLD = async () => {
      if (!isMounted || !id) {
        return;
      }

      const fetch_res = await (await fetch(`${urlPrefix}${C.API_ROOT_PATH}/${path}/?format=json`)).json();

      if (fetch_res) {
        const now = new Date();
        console.debug('FINISH initializeRWDataset', now, now.getMilliseconds(), fetch_res);
        setPCandidates([DEFAULT_OBJ, ...fetch_res]);
      };
    };

    const now = new Date();
    console.debug('START initializeCourseInfo', now, now.getMilliseconds());
    initializeJsonLD();

    return () => {
      isMounted = false;
    };
  }, [id]);


  React.useEffect(() => {
    if (jsonLD && pCandidates) {
      const pValue = jsonLD?.[pkey] ? pCandidates.find((v: any) => v[C.AT_ID] === jsonLD?.[pkey][C.AT_ID]) : '';
      setPValue(pValue);
      //console.log(pValue);
    }
  }, [jsonLD, pCandidates]);

  if (!jsonLD || !pCandidates) {
    return <PageLoader message={t("app.status.initializing")} />;
  }


  return (
    <React.Fragment>
      <Grid item xs={12} md={4} lg={3} xl={2}>
        <Typography>{t(`pkeys.${pkey.split(':').join('.')}`)}</Typography>
      </Grid>
      <Grid item xs={12} md={8} lg={9} xl={10} sx={{ display: 'flex' }}>
        <Select
          fullWidth
          value={pValue} // 選択された項目の値
          onChange={(event) => handleSelectedInfoChange(event.target.value)} // 選択が変更されたときの処理
          label="ContentLocations"
          variant="standard"
        >
          {pCandidates.map((inf: any) => (
            <MenuItem key={inf[C.AT_ID]} value={inf}>
              {inf[C.SC_NAME]}
            </MenuItem>
          ))}
        </Select>
        <Tooltip title="変更"><IconButton onClick={() => handleInfoChange(pValue)}><SaveIcon /></IconButton></Tooltip>
      </Grid>
    </React.Fragment>
  );
}



// 複数の別の JSON-LD へのリンクのプロパティ用の入力欄

export function HumanFriendlyPropertyMultipleSelect({ id, pkey, path, urlPrefix, jsonLD, setJsonLD }: HumanFriendlyPropertySelectProps) {
  const [pCandidates, setPCandidates] = React.useState<any>(null);  // 情報の配列
  const [pValues, setPValues] = React.useState<any>([]);              // 選ばれた情報
  const { t } = useTranslation();


  const handleSelectedInfoChange = (selectedInfo: any) => {
    setPValues(selectedInfo);
    //console.log(selectedInfo);
  }

  const handleInfoChange = (selectedInfo: any) => {
    if (!id) {
      return;
    }

    if (selectedInfo) {
      // JSON-LDデータをコピー
      const updatedJsonLd = { ...jsonLD };

      // プロパティを新しい名前で書き換え
      updatedJsonLd[pkey] = selectedInfo.map((item: any) => ({ [C.AT_ID]: item[C.AT_ID], [C.AT_TYPE]: item[C.AT_TYPE] }));
      //console.log(updatedJsonLd[pkey]);

      console.debug(JSON.stringify(updatedJsonLd));
      if (updatedJsonLd) updateJsonLd(id, updatedJsonLd); //確認後に使う

      setJsonLD(updatedJsonLd);
    }
  };


  React.useEffect(() => {
    let isMounted = true;

    const initializeJsonLD = async () => {
      if (!isMounted || !id) {
        return;
      }

      const fetch_res = await (await fetch(`${urlPrefix}${C.API_ROOT_PATH}/${path}/?format=json`)).json();

      if (fetch_res) {
        const now = new Date();
        console.debug('FINISH initializeRWDataset', now, now.getMilliseconds(), fetch_res);
        setPCandidates(fetch_res);
        //console.log(fetch_res);
        //console.log(jsonLD["schema:name"]); //こいつがよくわからない挙動をする　↑のconst fetch_res = await (await fetch(decodeIdUrl(id))).json();が完了する前にこっちに来てるかも？
      };
    };

    const now = new Date();
    console.debug('START initializeRWDataset', now, now.getMilliseconds());
    initializeJsonLD();

    return () => {
      isMounted = false;
    };
  }, [id]);


  React.useEffect(() => {
    if (jsonLD && pCandidates) {
      const pValues = jsonLD?.[pkey] ? jsonLD[pkey].map((dst: any) => {
        const foundInfo = pCandidates.find((inf: any) => inf[C.AT_ID] === dst[C.AT_ID]);
        //console.log("dst:", dst);
        //console.log("foundInfo:", foundInfo);
        return foundInfo;
      }).filter((item: any) => item !== undefined) : [];
      //console.log("pValues:", pValues);
      setPValues(pValues);
    }
  }, [jsonLD, pCandidates]);

  if (!jsonLD || !pCandidates) {
    return <PageLoader message={t("app.status.initializing")} />;
  }



  return (
    <React.Fragment>
      <Grid item xs={12} md={4} lg={3} xl={2}>
        <Typography>{t(`pkeys.${pkey.split(':').join('.')}`)}</Typography>
      </Grid>
      <Grid item xs={12} md={8} lg={9} xl={10} sx={{ display: 'flex' }}>
        <FormControl fullWidth>
          <Select
            multiple
            value={pValues}
            onChange={(event) => handleSelectedInfoChange(event.target.value)}
            renderValue={(selected) => selected.map((inf: any) => inf[C.SC_NAME]).join(', ')}
            variant="standard"
          >
            {pCandidates.map((inf: any) => (
              <MenuItem key={inf[C.AT_ID]} value={inf}>
                <Checkbox checked={pValues.includes(inf)} />
                {inf[C.SC_NAME]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Tooltip title="変更"><IconButton onClick={() => handleInfoChange(pValues)}><SaveIcon /></IconButton></Tooltip>
      </Grid>
    </React.Fragment>
  );
}



export function HumanFriendlyPropertyReadOnly({ id, pkey, jsonLD, setJsonLD }: HumanFriendlyPropertyStringProps) {
  const [pValue, setPValue] = React.useState<string>(jsonLD?.[pkey] || ''); // 現在の値
  const { t } = useTranslation();


  React.useEffect(() => {
    if (jsonLD) {
      setPValue(jsonLD?.[pkey]);
      //console.log(jsonLD);
    }
  }, [jsonLD]);


  if (!jsonLD) {
    return <PageLoader message={t("app.status.initializing")} />;
  }

  return (
    <React.Fragment>
      <Grid item xs={12} md={4} lg={3} xl={2}>
        <Typography>{t(`pkeys.${pkey.split(':').join('.')}`)}</Typography>
      </Grid>
      <Grid item xs={12} md={8} lg={9} xl={10} sx={{ display: 'flex' }}>
        <Typography variant="body1"> {pValue} </Typography>
      </Grid>
    </React.Fragment>
  );
}