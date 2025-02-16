import * as React from 'react';
import {
  Box,
  TextField,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Tooltip,
  IconButton,
  FormControl,
  Button,
  Select,
  MenuItem,
  Checkbox
} from '@mui/material';
import {
  TreeView,
  TreeItem,
  TreeItemProps,
  treeItemClasses,
} from '@mui/x-tree-view';
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Title as TitleIcon,
  Numbers as NumbersIcon,
  Contrast as ContrastIcon,
  SubdirectoryArrowRight as SubdirectoryArrowRightIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTranslation } from "react-i18next";

import { useNavigate, useParams } from 'react-router-dom';
import { PageLoader } from '../components/PageLoader';
import NonStyledLink from '../components/NonStyledLink';
import CopyToClipboard from '../components/CopyToClipboard';
import { isValidUrl, encodeIdUrl, decodeIdUrl } from '../etc/utils';
import * as C from '../etc/consts';

// import { RealWorldDataset } from '~/src/dbp-schema';

declare module 'react' {
  interface CSSProperties {
    '--tree-view-color'?: string;
    '--tree-view-bg-color'?: string;
  }
}

type StyledTreeItemProps = TreeItemProps & {
  bgColor?: string;
  color?: string;
  value?: string | number | boolean;
  path: string;
  save: any;
  remove: any;
};

const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.content}`]: {
    color: theme.palette.text.secondary,
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    [`& .${treeItemClasses.label}`]: {
      fontWeight: 'inherit',
      color: 'inherit',
    },
  },
  [`& .${treeItemClasses.group}`]: {
    [`& .${treeItemClasses.content}`]: {
      paddingLeft: theme.spacing(3),
    },
  },
}));

function StyledTreeItem(props: StyledTreeItemProps) {
  const {
    bgColor,
    color,
    value,
    path,
    save,
    remove,
    ...other
  } = props;
  const [currentValue, setCurrentValue] = React.useState<string | number | boolean | undefined>(value);
  const [currentType, setCurrentType] = React.useState<string | number | boolean | undefined>(typeof value);

  const [editing, setEditing] = React.useState<boolean>(false);
  const keyInputRef = React.useRef<HTMLInputElement>(null);
  const valInputRef = React.useRef<HTMLInputElement>(null);
  const typeSelectRef = React.useRef<HTMLSelectElement>(null);
  const isArrayIndex = /\[\d+\]$/.test(path);

  // const save

  return (
    <StyledTreeItemRoot
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0, height: '40px' }}>
          <Typography variant="body1" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
            {path.startsWith('@') || !editing ? path.split('.').slice(-1)[0] :
              <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                <TextField fullWidth inputRef={keyInputRef} variant="standard" defaultValue={path.split('.').slice(-1)[0]} />
              </FormControl>
            }
          </Typography>
          {value !== void 0 ? <>
            {editing ?
              <>
                <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
                {currentType === "boolean" ?
                <>
                  <Checkbox checked={currentValue as boolean} onChange={(e) => { setCurrentValue(e.target.checked); }} ></Checkbox>
                </> :
                <>
                  <TextField fullWidth inputRef={valInputRef} variant="standard" value={currentValue} onChange={(e) => { setCurrentValue(e.target.value); }} />
                </>
                }
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                  <Select
                    labelId="demo-select-small-label"
                    id="demo-select-small"
                    value={currentType}
                    inputRef={typeSelectRef}
                    onChange={(e) => {
                      switch (currentType) {
                        case "string":
                          switch (e.target.value) {
                            case "number":
                              setCurrentValue(Number(currentValue));
                              break;
                            case "boolean":
                              setCurrentValue(false);
                              break;
                          }
                          break;
                        case "number":
                          switch (e.target.value) {
                            case "string":
                              setCurrentValue(String(currentValue));
                              break;
                            case "boolean":
                              setCurrentValue(false);
                              break;
                          }
                          break;
                        case "boolean":
                          switch (e.target.value) {
                            case "string":
                              setCurrentValue(String(currentValue));
                              break;
                            case "number":
                              setCurrentValue(Number(currentValue));
                              break;
                          }
                          break;
                      }
                      setCurrentType(e.target.value);
                    }}
                  >
                    <MenuItem value={"string"}>文字列</MenuItem>
                    <MenuItem value={"number"}>数値</MenuItem>
                    <MenuItem value={"boolean"}>真偽値</MenuItem>
                  </Select>
                </FormControl>
                <Tooltip title="Save" onClick={async () => {
                  if (await save(path, keyInputRef.current?.value || path, currentValue)) {
                    setEditing(false);
                  } else {
                    window.alert("failed to save");
                  }
                }}>
                  <IconButton><SaveIcon /></IconButton>
                </Tooltip>
                <Tooltip title="Cancel" onClick={() => {
                  setEditing(false);
                  // inputRef.current?.value = labelInfo;
                }}>
                  <IconButton><CancelIcon /></IconButton>
                </Tooltip>
              </> :
              <>
                <Typography variant="body1" color="inherit">
                  {currentType === "string" && isValidUrl(currentValue as string) ? <NonStyledLink to={"/editor/"+encodeIdUrl(currentValue as string)}>{currentValue}</NonStyledLink> : String(currentValue)}
                </Typography>
                <Tooltip title="編集" onClick={() => setEditing(true)}><IconButton><EditIcon /></IconButton></Tooltip>
                <CopyToClipboard textToCopy={value} />
                <Tooltip title="削除" onClick={() => remove(path)}><IconButton><DeleteIcon /></IconButton></Tooltip>
              </>
            }
          </> : <>
            {editing ?
              <>
                <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
                <Tooltip title="Save" onClick={async () => {
                  if (await save(path, keyInputRef.current?.value, void 0)) {
                    setEditing(false);
                  } else {
                    window.alert("failed to save");
                  }
                }}>
                  <IconButton><SaveIcon /></IconButton>
                </Tooltip>
                <Tooltip title="Cancel" onClick={() => {
                  setEditing(false);
                  // inputRef.current?.value = labelInfo;
                }}>
                  <IconButton><CancelIcon /></IconButton>
                </Tooltip>
              </> :
              <>
                {path.startsWith('@') ?
                  <>
                    <Tooltip disableHoverListener title="編集"><span><IconButton disabled><EditIcon /></IconButton></span></Tooltip>
                    <Tooltip disableHoverListener title="削除"><span><IconButton disabled><DeleteIcon /></IconButton></span></Tooltip>
                  </> :
                  <>
                    {!isArrayIndex && (
                    <Tooltip title="編集" onClick={(e) => { setEditing(true); e.stopPropagation(); }}><IconButton><EditIcon /></IconButton></Tooltip>
                    )}
                    <Tooltip title="削除" onClick={(e) => { remove(path); e.stopPropagation(); }}><IconButton><DeleteIcon /></IconButton></Tooltip>
                  </>
                }
              </>
            }
          </>}
        </Box>
      }
      style={{
        '--tree-view-color': color,
        '--tree-view-bg-color': bgColor,
      }}
      {...other}
    />
  );
}


export function create_tree(key: string, val: any, depth: number, save: any, remove: any, add_text: any, add_object: any, add_array: any) {
  // console.log(key, val);
  if (!key.startsWith('@i')) {
    if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
      // console.log("is string");
      return <StyledTreeItem endIcon={typeof val === "string" ? <TitleIcon /> : typeof val === "number" ? <NumbersIcon /> : typeof val === "boolean" ? <ContrastIcon /> : <></>} key={key} save={save} remove={remove} nodeId={key} path={key} value={val} />;
    } else if (Array.isArray(val)) {
      // console.log("is array");
      return <StyledTreeItem key={key} save={save} remove={remove} nodeId={key} path={key}>
        {val.map((v, i) => create_tree(key + ".[" + String(i) + "]", v, depth + 1, save, remove, add_text, add_object, add_array))}
        <TreeItem endIcon={<SubdirectoryArrowRightIcon />} key={key + ".__add_text"} nodeId={key + ".__add_text"} label={<Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0, height: '40px' }}>
          <Button onClick={() => { add_text(key) }}>+ 値を追加</Button>
          <Button onClick={() => { add_object(key) }}>+ 辞書を追加</Button>
          <Button onClick={() => { add_array(key) }}>+ 配列を追加</Button>
        </Box>} />
      </StyledTreeItem>;
    } else if (typeof val === "object" && val !== null) {
      // console.log("is object");
      return <StyledTreeItem key={key} save={save} remove={remove} nodeId={key} path={key}>
        {Object.entries(val).map(k => create_tree(key + "." + k[0], k[1], depth + 1, save, remove, add_text, add_object, add_array))}
        <TreeItem endIcon={<SubdirectoryArrowRightIcon />} key={key + ".__add_text"} nodeId={key + ".__add_text"} label={<Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0, height: '40px' }}>
          <Button onClick={() => { add_text(key) }}>+ 値を追加</Button>
          <Button onClick={() => { add_object(key) }}>+ 辞書を追加</Button>
          <Button onClick={() => { add_array(key) }}>+ 配列を追加</Button>
        </Box>} />
      </StyledTreeItem>;
    } else if (typeof val === "object" && val === null) {
      return <StyledTreeItem key={key} save={save} remove={remove} nodeId={key} path={key} value={val} />;
    } else {
      console.log(typeof val, val);
      return <div key={key}></div>;
    }
  }
}

export interface JsonLdEditorProps {
  id: string,
  refreshList: Function,
  urlPrefix: string,
  setState?: React.Dispatch<React.SetStateAction<string>> | undefined;
}


export function JsonLdEditor(props: JsonLdEditorProps) {
  const [jsonLD, setJsonLD] = React.useState<any>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  let { id } = useParams();
  if (!id) id = props.id;

  const save = async (key: string, newKey: string, newVal: string | number) => {
    console.log(key, newKey);
    const path = key.split(".");
    const newPath = newKey.split(".");
    console.log(jsonLD, key, newKey, newVal, path);
    let tgt: any = jsonLD;
    for (let i = 0; i < path.length - 1; i++) {
      if (path[i].startsWith('[')) {
        tgt = tgt[Number(path[i].replace('[', '').replace(']', ''))];
      } else {
        tgt = tgt[path[i]];
      }
      // console.log(tgt);
    }
    console.log(path.slice(-1)[0]);
    if (path.slice(-1)[0].startsWith('[')) {
      tgt[Number(path.slice(-1)[0].replace('[', '').replace(']', ''))] = newVal;
    } else {
      if (newVal === void 0 && newPath.length > 0) {  // rename
        tgt[newPath.slice(-1)[0]] = tgt[path.slice(-1)[0]];
        delete tgt[path.slice(-1)[0]];
      } else {
        if (key !== newKey && key !== void 0) {
          delete tgt[path.slice(-1)[0]];
        }
        if (newPath.length > 0) {
          tgt[newPath.slice(-1)[0]] = newVal;
        }
      }
    }
    console.log(jsonLD);
    console.log(tgt);
    const fetch_res = await (await fetch(jsonLD[C.AT_ID] as string, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json' // JSON形式のデータのヘッダー
      },
      body: JSON.stringify(jsonLD),
    })).json();
    console.info(fetch_res);
    setJsonLD(fetch_res);
    if (props.refreshList) await props.refreshList();
    return true;
  };

  const add_text = async (tgtKey: string | undefined) => {
    let tgt: any = jsonLD;
    if (tgtKey !== void 0) {
      const tgtPath = tgtKey.split(".");
      console.log(jsonLD, tgtKey, tgtPath);
      for (let i = 0; i < tgtPath.length; i++) {
        if (tgtPath[i].startsWith('[')) {
          tgt = tgt[Number(tgtPath[i].replace('[', '').replace(']', ''))];
        } else {
          tgt = tgt[tgtPath[i]];
        }
        console.log(tgt);
      }
    }
    if (Array.isArray(tgt)) {
      tgt.push('new_text_val');
    } else {
      tgt['new_text'] = 'new_val';
    }
    console.log(jsonLD);
    console.log(tgt);
    const fetch_res = await (await fetch(jsonLD[C.AT_ID] as string, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json' // JSON形式のデータのヘッダー
      },
      body: JSON.stringify(jsonLD),
    })).json();
    console.info(fetch_res);
    setJsonLD(fetch_res);
    return true;
  };

  const add_object = async (tgtKey: string | undefined) => {
    let tgt: any = jsonLD;
    if (tgtKey !== void 0) {
      const tgtPath = tgtKey.split(".");
      console.log(jsonLD, tgtKey, tgtPath);
      for (let i = 0; i < tgtPath.length; i++) {
        if (tgtPath[i].startsWith('[')) {
          tgt = tgt[Number(tgtPath[i].replace('[', '').replace(']', ''))];
        } else {
          tgt = tgt[tgtPath[i]];
        }
        console.log(tgt);
      }
    }
    if (Array.isArray(tgt)) {
      tgt.push({[C.AT_TYPE]: "new_type"});
    } else {
      tgt['new_object'] = {[C.AT_TYPE]: "new_type"};
    }
    console.log(jsonLD);
    console.log(tgt);
    const fetch_res = await (await fetch(jsonLD[C.AT_ID] as string, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json' // JSON形式のデータのヘッダー
      },
      body: JSON.stringify(jsonLD),
    })).json();
    console.info(fetch_res);
    setJsonLD(fetch_res);
    return true;
  };

  const add_array = async (tgtKey: string | undefined) => {
    let tgt: any = jsonLD;
    if (tgtKey !== void 0) {
      const tgtPath = tgtKey.split(".");
      console.log(jsonLD, tgtKey, tgtPath);
      for (let i = 0; i < tgtPath.length; i++) {
        if (tgtPath[i].startsWith('[')) {
          tgt = tgt[Number(tgtPath[i].replace('[', '').replace(']', ''))];
        } else {
          tgt = tgt[tgtPath[i]];
        }
        console.log(tgt);
      }
    }
    if (Array.isArray(tgt)) {
      tgt.push([]);
    } else {
      tgt['new_array'] = [];
    }
    console.log(jsonLD);
    console.log(tgt);
    const fetch_res = await (await fetch(jsonLD[C.AT_ID] as string, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json' // JSON形式のデータのヘッダー
      },
      body: JSON.stringify(jsonLD),
    })).json();
    console.info(fetch_res);
    setJsonLD(fetch_res);
    return true;
  };

  const remove = async (key: string) => {
    const path = key.split(".");
    console.log(jsonLD, key, path);
    let tgt: any = jsonLD;
    for (let i = 0; i < path.length - 1; i++) {
      if (path[i].startsWith('[')) {
        tgt = tgt[Number(path[i].replace('[', '').replace(']', ''))];
      } else {
        tgt = tgt[path[i]];
      }
      // console.log(tgt);
    }
    console.log(tgt, path.slice(-1)[0]);
    if (window.confirm(path + " を削除しますか？")) {
      if (path.slice(-1)[0].startsWith('[')) {
        tgt = tgt.splice([Number(path.slice(-1)[0].replace('[', '').replace(']', ''))], 1);
      } else {
        delete tgt[path.slice(-1)[0]];
      }
      console.log(jsonLD);
      console.log(tgt);
      const fetch_res = await fetch(jsonLD[C.AT_ID] as string, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json' // JSON形式のデータのヘッダー
        },
        body: JSON.stringify(jsonLD),
      });
      const fetch_res_json = await fetch_res.json();
      if (fetch_res.ok) {
        console.info(fetch_res.status);
        console.info(fetch_res.statusText);
        console.info(fetch_res_json);
        setJsonLD(fetch_res_json);
      } else {
        console.error(fetch_res.status);
        console.error(fetch_res.statusText);
        console.error(fetch_res_json);
        window.alert(t(`errorText.${fetch_res_json.message}`));
        setJsonLD(fetch_res_json.fields);
      }
    }
    return true;
  };

  React.useEffect(() => {
    if (props.setState) {
      props.setState("");
    }
  }, [props.setState]);

  React.useEffect(() => {
    let isMounted = true;

    const initializeJsonLD = async () => {
      if (!isMounted || !id) {
        return;
      }

      const fetch_res = await (await fetch(decodeIdUrl(id))).json();

      if (fetch_res) {
        const now = new Date();
        console.debug('FINISH initializeRWDataset', now, now.getMilliseconds(), fetch_res);
        setJsonLD(fetch_res);
      }
    };

    const now = new Date();
    console.debug('START initializeCourseInfo', now, now.getMilliseconds());
    initializeJsonLD();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (!jsonLD) {
    return <PageLoader message={t("app.status.initializing")} />;
  }

  return (
    <React.Fragment>
      <Dialog
        maxWidth={"xl"}
        open={true}
        fullWidth={true}
        onClose={() => {
          navigate(-1);
        }}
      >
        <DialogTitle sx={{ display: 'flex' }}>
          <span style={{ display: 'flex', alignItems: 'center', fontWeight: 'inherit', flexGrow: 1 }}>
            {jsonLD[C.SC_NAME] as string}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', fontWeight: 'inherit', fontSize: 'smaller', paddingRight: '8px' }}>
            <NonStyledLink to={jsonLD[C.AT_ID] as string} target='_blank'>{jsonLD[C.AT_ID] as string}</NonStyledLink>
          </span>
          <IconButton
            aria-label="close"
            onClick={() => {
              navigate(-1);
            }}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TreeView
            aria-label="file system navigator"
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            defaultExpanded={Object.keys(jsonLD)}
            sx={{ flexGrow: 1, maxWidth: '100%', overflowY: 'auto' }}
          >
            {Object.entries(jsonLD).map(k => create_tree(k[0], k[1], 0, save, remove, add_text, add_object, add_array))}
            <TreeItem endIcon={<SubdirectoryArrowRightIcon />} key={"__add_text"} nodeId={"__add_text"} label={<Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0, height: '40px' }}>
              <Button onClick={() => { add_text(void 0) }}>+ 値を追加</Button>
              <Button onClick={() => { add_object(void 0) }}>+ 辞書を追加</Button>
              <Button onClick={() => { add_array(void 0) }}>+ 配列を追加</Button>
            </Box>} />
          </TreeView>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}

export default JsonLdEditor;

