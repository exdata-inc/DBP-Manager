import * as React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Paper,
  Checkbox,
  Typography,
  Button,
  TextField,
  Snackbar,
  Alert,
  AlertColor,
  SnackbarCloseReason,
  Grid,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Close as CloseIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import Editor, { Monaco } from '@monaco-editor/react';
// @ts-ignore
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { useTranslation } from "react-i18next";

import {
  EnhancedTableHead,
  EnhancedTableToolbar,
  HeadCell,
  Order,
  getComparator,
  updateTableData,
  TableLoaderData,
  createCurrentDateString,
  tableHandleClick,
  handleSelectAllClick,
  handleRequestSort,
  handleChangeRowsPerPage,
} from '../etc/tableUtils';
import * as C from '../etc/consts';
import NonStyledLink from '../components/NonStyledLink';
import { PageLoader } from '../components/PageLoader';
import CopyToClipboard from '../components/CopyToClipboard';
import JsonLdEditor from './Editor';
import { encodeIdUrl } from '../etc/utils';


const headCells: readonly HeadCell[] = [
  {
    id: C.SC_NAME,
    numeric: false,
    disablePadding: true,
    label: 'Name',
  },
  {
    id: C.AT_ID,
    numeric: false,
    disablePadding: false,
    label: 'ID (JSON-LD URL)',
  },
];

const PATH_NAME = C.STRUCTURE_INFO;


export default function StructureInfo() {
  const [tableData, setTableData] = React.useState<TableLoaderData>();
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<string>(C.AT_ID);
  const [selected, setSelected] = React.useState<readonly string[]>([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(localStorage.getItem(C.IF_USE_DENSE_TABLE) !== 'false');
  const [rowsPerPage, setRowsPerPage] = React.useState(20);
  const [generatorModalOpen, setGeneratorModalOpen] = React.useState(false);
  const [generatorInputFile, setGeneratorInputFile] = React.useState<File | undefined>(void 0);
  const [generatorInputFileContent, setGeneratorInputFileContent] = React.useState<string>('');
  const [generatorOutputContent, setGeneratorOutputContent] = React.useState<string>('');
  const [generatorJsonldName, setGeneratorJsonldName] = React.useState('');
  const [barOpen, setBarOpen] = React.useState(false);
  const [barSeverity, setBarSeverity] = React.useState<AlertColor | undefined>('success');
  const [barMessage, setBarMessage] = React.useState('');
  const [fetchTableData, setFetchTableData] = React.useState(0);
  const [generatorStatusText, setGeneratorStatusText] = React.useState("生成には数十秒程度かかります。生成は画面を閉じても継続されます。");
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();

  const inputPreviewEditorRef = React.useRef<monaco.editor.IStandaloneCodeEditor>(void 0);
  const handleInputPreviewEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    // @ts-ignore
    inputPreviewEditorRef.current = editor;
  }

  const outputPreviewEditorRef = React.useRef<monaco.editor.IStandaloneCodeEditor>(void 0);
  const handleOutputPreviewEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    // @ts-ignore
    outputPreviewEditorRef.current = editor;
  }

  React.useEffect(() => {
    let isMounted = true;

    const initializeTableData = async () => {
      if (!isMounted) return;
      await updateTableData(PATH_NAME, setTableData);
    };
    initializeTableData();

    return () => {
      isMounted = false;
    };
  }, [fetchTableData]);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    (page > 0 && tableData) ? Math.max(0, (1 + page) * rowsPerPage - tableData.list.length) : 0;

  const visibleRows = React.useMemo(
    () =>
      // @ts-ignore
      tableData ? tableData.list.slice().sort(getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      ) : [],
    [order, orderBy, page, rowsPerPage, tableData],
  );

  if (!tableData) {
    return <PageLoader message={t("app.status.initializing")} />;
  }

  const add_new = async () => {
    console.log(tableData);
    const fetch_res = await (await fetch(`${tableData.urlPrefix}${C.API_ROOT_PATH}/${PATH_NAME}/?format=json`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json' // JSON形式のデータのヘッダー
      },
      body: JSON.stringify({
        [C.AT_ID]: "",
        [C.AT_TYPE]: "dbp:RealWorldDataFieldProfile",
        [C.AT_CONTEXT]: {
          "dbp": "https://exdata.co.jp/dbp/schema/",
          "schema": "https://schema.org/"
        },
        "schema:name": `新規${t(`path.${PATH_NAME}`)}`,
        "schema:encodingFormat": "application/json",
        "dbp:structure": {},
        "schema:dateCreated": createCurrentDateString(),
      }),
    })).json();
    console.info(fetch_res);
    navigate(`/${PATH_NAME}/` + encodeIdUrl(fetch_res[C.AT_ID] as string));
    await updateTableData(PATH_NAME, setTableData);
    return true;
  };

  const remove_selected = async () => {
    if (window.confirm(selected.length + "件削除しますか？")) {
      for (let i = 0; i < selected.length; i++) {
        const fetch_res = await fetch(selected[i], {
          method: "DELETE",
        });
        console.info(fetch_res);
      }
      await updateTableData(PATH_NAME, setTableData);
      setSelected([]);
    }
    return true;
  };

  const remove = async (key: string) => {
    if (window.confirm(key + " を削除しますか？")) {
      const fetch_res = await fetch(key, {
        method: "DELETE",
      });
      console.info(fetch_res);
      await updateTableData(PATH_NAME, setTableData);
      setSelected(selected.filter((v) => v !== key));
    }
    return true;
  };

  const onChangeGeneratorInputFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGeneratorInputFile(file);
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const lines = text.split(/\r?\n/).slice(0, 20).join('\n');
          setGeneratorInputFileContent(lines);
        }
      };
      reader.readAsText(file);
    }
  };

  const onChangeGeneratorJsonldName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setGeneratorJsonldName(name);
  };

  const handleGeneratorSuccess = (tmpFileName: string | undefined, tmpJsonldName: string) => {
    setFetchTableData(fetchTableData + 1);
    setBarSeverity('success');
    setBarMessage(`ファイル名：${tmpFileName} 構造情報名：${tmpJsonldName} の生成に成功`);
    setGeneratorStatusText(`ファイル名：${tmpFileName} 構造情報名：${tmpJsonldName} の生成に成功しました。`);
    setBarOpen(true);
  };

  const handleGeneratorFailed = (tmpFileName: string | undefined, tmpJsonldName: string) => {
    setBarSeverity('error');
    setBarMessage(`ファイル名：${tmpFileName} 構造情報名：${tmpJsonldName} の生成に失敗`);
    setGeneratorStatusText(`ファイル名：${tmpFileName} 構造情報名：${tmpJsonldName} の生成に失敗しました。`);
    setBarOpen(true);
  };

  const handleBarClose = (event?: Event | React.SyntheticEvent<any, Event>, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }
    setBarOpen(false);
  };

  const handleApiClick = async () => {
    const tmpFileName = generatorInputFile?.name;
    const tmpJsonldName = generatorJsonldName.slice();
    const formData = new FormData();
    if (!generatorInputFile) return;
    formData.append('file', generatorInputFile);
    const MDA_URL = import.meta.env.VITE_MDA_URL;
    fetch(`${MDA_URL}/api/v1/file2jsonld?add_rwdb=true&structure_name=${generatorJsonldName}`, {
      method: "POST",
      body: formData,
    }).then((res) => {
      console.log('res', res);
      if (res.status == 200) {
        const json = res.json();
        return json;
      }
      return -1
    }).then((data) => {
      console.log('data', data);
      if (typeof data === 'object' && 'rwdb_status' in data) {
        setGeneratorOutputContent(JSON.stringify(data.jsonld, void 0, 2));
        if (data.rwdb_status == "succeeded in regist structure info") {
          handleGeneratorSuccess(tmpFileName, tmpJsonldName);
        } else {
          handleGeneratorFailed(tmpFileName, tmpJsonldName);
        }
      }
      else {
        handleGeneratorFailed(tmpFileName, tmpJsonldName);
      }

    }).catch(() => {
      handleGeneratorFailed(tmpFileName, tmpJsonldName);
    });

    setGeneratorStatusText(`ファイル名：${tmpFileName} 構造情報名：${tmpJsonldName} の構造を生成中...`);
    setGeneratorInputFile(void 0);
    setGeneratorJsonldName('');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar
          numSelected={selected.length}
          add_new={add_new}
          remove_selected={remove_selected}
          path_name={PATH_NAME}
          dense={dense}
          setDense={setDense}
          modal_open={() => setGeneratorModalOpen(true)}
          helpImgSrc={`img/${PATH_NAME}.svg`}
          helpType={'dbp:RealWorldDataFieldProfile'}
        />
        <TableContainer>
          <Table
            sx={{ minWidth: 640 }}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
          >
            <EnhancedTableHead
              headCells={headCells}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick(setSelected, tableData)}
              onRequestSort={handleRequestSort(setOrder, setOrderBy, order, orderBy)}
              rowCount={tableData.list.length}
            />
            <TableBody>
              {visibleRows.map((row: any, idx: number) => {
                const isItemSelected = selected.indexOf(row[C.AT_ID] as string) !== -1;
                const labelId = `enhanced-table-checkbox-${idx}`;

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row[C.AT_ID]}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell
                      padding="checkbox"
                      onClick={(event) => tableHandleClick(row[C.AT_ID] as string, selected, setSelected)}
                    >
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                          'aria-labelledby': labelId,
                        }}
                      />
                    </TableCell>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                    >
                      <NonStyledLink to={`/${PATH_NAME}/` + encodeIdUrl(row[C.AT_ID] as string)}>{row[C.SC_NAME] as string}</NonStyledLink>
                    </TableCell>
                    <TableCell><NonStyledLink to={`/${PATH_NAME}/` + encodeIdUrl(row[C.AT_ID] as string)}>{row[C.AT_ID].replace(tableData.urlPrefix, '').replace(C.API_ROOT_PATH, '')}</NonStyledLink></TableCell>
                    <TableCell><CopyToClipboard textToCopy={import.meta.env.VITE_RWDB_URL_PREFIX + row[C.AT_ID].replace(tableData.urlPrefix, '')} /></TableCell>
                    <TableCell><Tooltip title="削除" sx={{ p: 0 }} onClick={() => remove(row[C.AT_ID] as string)}><IconButton><DeleteIcon /></IconButton></Tooltip></TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (dense ? 33 : 53) * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={tableData.list.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPageOptions={[10, 16, 20, 32, 50, 100]}
          onRowsPerPageChange={handleChangeRowsPerPage(setRowsPerPage, setPage)}
        />
      </Paper>
      {id ? <JsonLdEditor id={id} refreshList={async () => { await updateTableData(PATH_NAME, setTableData); }} urlPrefix={tableData.urlPrefix} /> : <></>}
      <Dialog
        maxWidth={"xl"}
        open={generatorModalOpen}
        fullWidth={true}
        onClose={() => { setGeneratorModalOpen(false); }}
      >
        <DialogTitle sx={{ display: 'flex' }}>
          <span style={{ display: 'flex', alignItems: 'center', fontWeight: 'inherit', flexGrow: 1 }}>
            構造情報を生成
          </span>
          <IconButton
            aria-label="close"
            onClick={() => { setGeneratorModalOpen(false); }}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4} lg={3} xl={2}>
              対象の実世界データ
            </Grid>
            <Grid item xs={12} md={8} lg={9} xl={10}>
              <Button variant="contained" component="label">
                データを選択
                <input
                  type="file"
                  style={{ display: "none" }}
                  onChange={onChangeGeneratorInputFile}
                  accept=".csv,.json"
                />
              </Button>
              <Typography pl={2} component="span">{generatorInputFile?.name}</Typography>
            </Grid>
            <Grid item xs={12} md={4} lg={3} xl={2}>
              <Typography pr={2} variant='subtitle1' component="span">構造情報の名前</Typography>
            </Grid>
            <Grid item xs={12} md={8} lg={9} xl={10}>
              <TextField fullWidth onChange={onChangeGeneratorJsonldName} variant="standard" value={generatorJsonldName} defaultValue={generatorJsonldName} />
            </Grid>
            <Grid item xs={12} md={4} lg={3} xl={2}>
              <Button disabled={generatorJsonldName.length === 0 || (!generatorInputFile)} variant='contained' component="label" onClick={handleApiClick} startIcon={<PlayArrowIcon />}>
                生成開始
              </Button>
            </Grid>
            <Grid item xs={12} md={8} lg={9} xl={10}>
              {generatorStatusText}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography pr={2} variant='subtitle1' component="span">対象の実世界データのプレビュー</Typography>
              <Editor height="30vh" defaultLanguage="json" value={generatorInputFileContent} onMount={handleInputPreviewEditorDidMount} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography pr={2} variant='subtitle1' component="span">構造情報生成結果</Typography>
              <Editor height="30vh" defaultLanguage="json" value={generatorOutputContent} onMount={handleOutputPreviewEditorDidMount} />
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        open={barOpen}
        autoHideDuration={6000}
        onClose={handleBarClose}>
        <Alert onClose={handleBarClose} severity={barSeverity}>
          {barMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}