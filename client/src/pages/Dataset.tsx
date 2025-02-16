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
  Typography,
  Paper,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Map as MapIcon,
  Close as CloseIcon,
  SwapHoriz as SwapHorizIcon
} from '@mui/icons-material';
import {
  EnhancedTableHead,
  EnhancedTableToolbar,
  HeadCell,
  Order,
  getComparator,
  getLDLink,
  updateTableData,
  TableLoaderData,
  createCurrentDateString,
  tableHandleClick,
  handleSelectAllClick,
  handleRequestSort,
  handleChangeRowsPerPage,
} from '../etc/tableUtils';
import { useTranslation } from "react-i18next";
import * as C from '../etc/consts';
import NonStyledLink from '../components/NonStyledLink';
import { PageLoader } from '../components/PageLoader';
import CopyToClipboard from '../components/CopyToClipboard';
import JsonLdEditor, { JsonLdEditorProps } from './Editor';
import { decodeIdUrl, encodeIdUrl } from '../etc/utils';
import { HumanFriendlyPropertyMultipleSelect, HumanFriendlyPropertyReadOnly, HumanFriendlyPropertySingleSelect, HumanFriendlyPropertyString } from '../components/HumanFriendlyEditors';
import { useFileMoveContext } from "../providers/FileMoveContext";
import { ProgressData } from '../types';

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
  {
    id: 'dbp:collectionInfo',
    numeric: false,
    disablePadding: false,
    label: '収集情報',
  },
  {
    id: 'dbp:structureInfo',
    numeric: false,
    disablePadding: false,
    label: '構造情報',
  },
  {
    id: 'dbp:generatedUsing',
    numeric: false,
    disablePadding: false,
    label: '醸造酵母',
  },
];

const PATH_NAME = C.DATASET;

export default function Dataset() {
  const [tableData, setTableData] = React.useState<TableLoaderData>();
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<string>(C.AT_ID);
  const [selected, setSelected] = React.useState<readonly string[]>([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(localStorage.getItem(C.IF_USE_DENSE_TABLE) !== 'false');
  const [rowsPerPage, setRowsPerPage] = React.useState(20);
  const [ifUseHumanFriendly, setIfUseHumanFriendly] = React.useState(localStorage.getItem(C.IF_USE_HUMAN_FRIENDLY) === 'true'); // Human Friendly スイッチ用
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const [openDialog, setOpenDialog] = React.useState(false);
  const [currentId, setCurrentId] = React.useState<string | null>(null);

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
  }, []);

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
        [C.AT_TYPE]: "dbp:RealWorldDataset",
        [C.AT_CONTEXT]: {
          "dbp": "https://exdata.co.jp/dbp/schema/",
          "schema": "https://schema.org/"
        },
        "schema:name": `新規${t(`path.${PATH_NAME}`)}`,
        "dbp:collectionInfo": {
          [C.AT_ID]: tableData.urlPrefix + "/api/v0/collection_info/*/?format=json",
          [C.AT_TYPE]: "dbp:RealWorldDataCollectionInfo",
        },
        "dbp:structureInfo": {
          [C.AT_ID]: tableData.urlPrefix + "/api/v0/structure_info/*/?format=json",
          [C.AT_TYPE]: "dbp:RealWorldDataStructureInfo",
        },
        "schema:distribution": [
          {
            [C.AT_ID]: tableData.urlPrefix + "/api/v0/storing_info/*/?format=json",
            [C.AT_TYPE]: "dbp:RealWorldDataStoringInfo",
          }
        ],
        "schema:author": {
          [C.AT_ID]: tableData.urlPrefix + "/api/v0/who/*/?format=json",
          [C.AT_TYPE]: "schema:Organization",
        },
        "schema:contentLocation": {
          [C.AT_ID]: tableData.urlPrefix + "/api/v0/where/*/?format=json",
          [C.AT_TYPE]: "schema:Place",
        },
        "schema:description": `${createCurrentDateString()}に作成された新しい${t(`path.${PATH_NAME}`)}`,
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

  const visualize = (key: string) => {
    navigate(`/vis/hvis/` + encodeIdUrl(key));
  }

  const handleOpenMoveDialog = (id: string) => {
    setCurrentId(id);
    setOpenDialog(true);
  };

  const handleCloseMoveDialog = () => {
    setOpenDialog(false);
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
          ifUseHumanFriendly={ifUseHumanFriendly}     // Human Friendly スイッチ用
          setIfUseHumanFriendly={(v: boolean) => {    // Human Friendly スイッチ用
            setIfUseHumanFriendly(v);
            localStorage.setItem(C.IF_USE_HUMAN_FRIENDLY, String(v));
          }}
          helpImgSrc={`img/${PATH_NAME}.svg`}
          helpType={'dbp:RealWorldDataset'}
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
                      onClick={() => tableHandleClick(row[C.AT_ID] as string, selected, setSelected)}
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
                    <TableCell>{getLDLink(row['dbp:collectionInfo'], tableData.urlPrefix)}</TableCell>
                    <TableCell>{getLDLink(row['dbp:structureInfo'], tableData.urlPrefix)}</TableCell>
                    <TableCell>{getLDLink(row['dbp:generatedUsing'], tableData.urlPrefix)}</TableCell>
                    <TableCell><CopyToClipboard textToCopy={import.meta.env.VITE_RWDB_URL_PREFIX + row[C.AT_ID].replace(tableData.urlPrefix, '')} /></TableCell>
                    <TableCell><Tooltip title="移動"><IconButton onClick={() => handleOpenMoveDialog(row[C.AT_ID])}><SwapHorizIcon /></IconButton></Tooltip></TableCell>
                    <TableCell><Tooltip title="削除" sx={{ p: 0 }} onClick={() => remove(row[C.AT_ID] as string)}><IconButton><DeleteIcon /></IconButton></Tooltip></TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows, }}>
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
      {/* ↓ エディタ表示部 ↓ */}
      {id ? (ifUseHumanFriendly
        ? <HumanFriendlyEditor id={id} refreshList={async () => { await updateTableData(PATH_NAME, setTableData); }} urlPrefix={tableData.urlPrefix} />
        : <JsonLdEditor id={id} refreshList={async () => { await updateTableData(PATH_NAME, setTableData);}} urlPrefix={tableData.urlPrefix} />
      ) : <></>}
      {/* ↑ エディタ表示部 ↑ */}
      <MoveDatasetDialog open={openDialog} handleClose={handleCloseMoveDialog} currentId={currentId} urlPrefix={tableData.urlPrefix} />
    </Box>
  );
}

function MoveDatasetDialog({
  open,
  handleClose,
  currentId,
  urlPrefix,
}: {
  open: boolean;
  handleClose: () => void;
  currentId: string | null;
  urlPrefix: string;
}) {
  const [startTime, setStartTime] = React.useState<string>("");
  const [endTime, setEndTime] = React.useState<string>("");
  const [storingOptions, setStoringOptions] = React.useState<any[]>([]);
  const [startStorage, setStartStorage] = React.useState<string>("");
  const [startStorageName, setStartStorageName] = React.useState<string>("");
  const [endStorage, setEndStorage] = React.useState<string>("");
  const [jsonLdData, setJsonLdData] = React.useState<any>(null);
  const [selectedDistribution, setSelectedDistribution] = React.useState<any>(null);
  const [isEditable, setIsEditable] = React.useState<boolean>(false);

  const {moveLoader, setMoveLoader, progressData, setProgressData, areAllWsConnected} = useFileMoveContext();

  // データ取得
  React.useEffect(() => {
    const fetchStoringInfo = async () => {
      try {
        const response = await fetch(`${urlPrefix}/api/v0/storing_info/?format=json`);
        const data = await response.json();
        console.log(`${urlPrefix}/api/v0/storing_info/?format=json`, data);
        setStoringOptions(data || []);
      } catch (error) {
        console.error("Error fetching storing info:", error);
      }
    };

    const fetchJsonLdData = async () => {
      if (currentId) {
        try {
          const response = await fetch(currentId);
          const data = await response.json();
          setJsonLdData(data);
        } catch (error) {
          console.error("Error fetching JSON-LD data:", error);
        }
      }
    };

    if (open) {
      fetchStoringInfo();
      fetchJsonLdData();
    }
  }, [open, urlPrefix, currentId]);

  // distribution選択時の処理
  const handleDistributionChange = async (index: number) => {
    const distribution = jsonLdData?.["schema:distribution"]?.[index];
    if (distribution) {
      setSelectedDistribution(distribution);
      setStartTime(distribution["dbp:startTime"] || "");
      setEndTime(distribution["dbp:endTime"] || "");
      setStartStorage(distribution["@id"] || "");

      // storage情報を取得して名前を表示
      try {
        const response = await fetch(distribution["@id"]);
        const data = await response.json();
        setStartStorageName(data["schema:name"] || "不明なストレージ");
      } catch (error) {
        console.error("Error fetching storage name:", error);
      }
    }
  };

  const extractDatasetId = (datasetUrl: string): string | undefined => {
    try {
      const urlObj = new URL(datasetUrl);
      const segments = urlObj.pathname.split("/").filter(Boolean);
      return segments[segments.length - 1];
    } catch (error) {
      console.error(error);
      return undefined;
    }
  };

  // データ送信
  const handleSubmit = async () => {
    if (!startTime || !endTime || !endStorage) {
      alert("すべての項目を入力してください。");
      return;
    }

    const payload = { currentId, startTime, endTime, endStorage };

    try {
      setMoveLoader(true);
      const datasetId = extractDatasetId(currentId || "");
      const response = await fetch(`${urlPrefix}/move/${datasetId}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("データ送信に失敗しました");

      const result = await response.json();

      const resetProgressData: ProgressData = {
        all_progress: { uploaded: 0, total: 0, progress: 0 },
        part_progress: { uploaded: 0, total: 0, progress: 0 },
        date_progress: { uploaded: 0, total: 0, progress: 0 },
      };

      setProgressData(resetProgressData);
      handleClose();
    } catch (error) {
      console.error("データ送信中にエラーが発生しました:", error);
    } finally {
      setMoveLoader(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth={"lg"} fullWidth={true}>
        <DialogTitle>
          データセットの移動
          <IconButton aria-label="close" onClick={handleClose} sx={{ position: "absolute", right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ padding: 3, overflowY: "auto" }}>
          {moveLoader ? (
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                進捗状況
              </Typography>
              <Grid container spacing={4}>
                {Object.entries(progressData)
                  .sort(([keyA], [keyB]) => {
                    const order = ["all_progress", "date_progress", "part_progress"];
                    return order.indexOf(keyA) - order.indexOf(keyB);
                  })
                  .map(([key, data]) => (
                    <Grid item xs={12} key={key} sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold", minWidth: 150 }}>
                        {key.replace("_", " ").toUpperCase()}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(data as { progress: number }).progress}
                        sx={{ flexGrow: 1 }}
                      />
                      <Typography variant="body1" sx={{ fontWeight: "bold", minWidth: 120, textAlign: "right" }}>
                        {(data as { uploaded: number; total: number; progress: number }).uploaded} /{" "}
                        {(data as { uploaded: number; total: number; progress: number }).total} 項目
                        ({(data as { uploaded: number; total: number; progress: number }).progress.toFixed(1)}%)
                      </Typography>
                    </Grid>
                  ))}
              </Grid>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body1">
                  Current ID:
                </Typography>
                <Typography variant="body1" sx={{ color: "text.secondary" }}>
                  {currentId || "IDがありません"}
                </Typography>
              </Box>
              <FormControl fullWidth>
                <InputLabel id="distribution-label">移動したいデータ</InputLabel>
                <Select
                  labelId="distribution-label"
                  value={selectedDistribution ? jsonLdData["schema:distribution"].indexOf(selectedDistribution) : ""}
                  onChange={(e) => handleDistributionChange(Number(e.target.value))}
                  label="移動したいデータ"
                >
                  {jsonLdData?.["schema:distribution"]?.map((dist: any, index: number) => (
                    <MenuItem key={index} value={index}>
                      {`開始: ${dist["dbp:startTime"]} | 終了: ${dist["dbp:endTime"]}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="outlined" color="secondary" onClick={() => setIsEditable(!isEditable)}>
                {isEditable ? "編集を無効にする" : "編集を有効にする"}
              </Button>
              <TextField
                label="開始日時 (startTime)" type="date" fullWidth value={startTime || ""} disabled={!isEditable}
                onChange={(e) => setStartTime(e.target.value)} InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="終了日時 (endTime)" type="date" fullWidth value={endTime || ""} disabled={!isEditable}
                onChange={(e) => setEndTime(e.target.value)} InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="移動前ストレージ" fullWidth value={startStorageName || ""} disabled InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth>
                <InputLabel id="end-storage-label">移動後ストレージ</InputLabel>
                <Select
                  label="移動後ストレージ" labelId="end-storage-label" value={endStorage} onChange={(e) => setEndStorage(e.target.value)}
                >
                  {storingOptions.map(option => (
                    <MenuItem key={option["@id"]} value={option["@id"]}>
                      {option["schema:name"]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" color="primary" onClick={handleSubmit} disabled={moveLoader || !areAllWsConnected} sx={{ alignSelf: "center", mt: 2 }}>
                データ送信
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function HumanFriendlyEditor(props: JsonLdEditorProps) {  // export しない
  const [jsonLD, setJsonLD] = React.useState<any>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  let { id } = useParams();
  if (!id) id = props.id;


  React.useEffect(() => {
    let isMounted = true;

    const initializeJsonLD = async () => {
      if (!isMounted || !id) {
        return;
      }

      const fetch_res = await (await fetch(decodeIdUrl(id))).json(); // jsonLDをとってくる

      if (fetch_res) {
        const now = new Date();
        console.debug('FINISH initializeRWDataset', now, now.getMilliseconds(), fetch_res);
        setJsonLD(fetch_res);
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
          <Grid container spacing={2} alignItems="center" justifyContent="center" >
            <HumanFriendlyPropertyString id={id} pkey={C.SC_NAME} jsonLD={jsonLD} setJsonLD={setJsonLD} />
            <HumanFriendlyPropertyString id={id} pkey={C.SC_URL} jsonLD={jsonLD} setJsonLD={setJsonLD} />
            <HumanFriendlyPropertySingleSelect id={id} pkey={C.SC_AUTHOR} path={C.WHO} jsonLD={jsonLD} setJsonLD={setJsonLD} urlPrefix={props.urlPrefix} />
            <HumanFriendlyPropertyString id={id} pkey={C.DBP_KEY} jsonLD={jsonLD} setJsonLD={setJsonLD} />
            <HumanFriendlyPropertySingleSelect id={id} pkey={C.DBP_COLLECTION_INFO} path={C.COLLECTION_INFO} jsonLD={jsonLD} setJsonLD={setJsonLD} urlPrefix={props.urlPrefix} />
            <HumanFriendlyPropertySingleSelect id={id} pkey={C.DBP_STRUCTURE_INFO} path={C.STRUCTURE_INFO} jsonLD={jsonLD} setJsonLD={setJsonLD} urlPrefix={props.urlPrefix} />
            <HumanFriendlyPropertySingleSelect id={id} pkey={C.DBP_GENERATED_USING} path={C.BREWER_INFO} jsonLD={jsonLD} setJsonLD={setJsonLD} urlPrefix={props.urlPrefix} />
            <HumanFriendlyPropertyMultipleSelect id={id} pkey={C.DBP_GENERATED_ARGS} path={C.BREWER_ARGUMENT} jsonLD={jsonLD} setJsonLD={setJsonLD} urlPrefix={props.urlPrefix} />
            <HumanFriendlyPropertyString id={id} pkey={C.SC_DESCRIPTION} jsonLD={jsonLD} setJsonLD={setJsonLD} />
            <HumanFriendlyPropertyMultipleSelect id={id} pkey={C.SC_DISTRIBUTION} path={C.STORING_INFO} jsonLD={jsonLD} setJsonLD={setJsonLD} urlPrefix={props.urlPrefix} />
            <HumanFriendlyPropertySingleSelect id={id} pkey={C.SC_CONTENT_LOCATION} path={C.WHERE} jsonLD={jsonLD} setJsonLD={setJsonLD} urlPrefix={props.urlPrefix} />
            <HumanFriendlyPropertySingleSelect id={id} pkey={C.SC_LOCATION_CREATED} path={C.WHERE} jsonLD={jsonLD} setJsonLD={setJsonLD} urlPrefix={props.urlPrefix} />
            <HumanFriendlyPropertyString id={id} pkey={C.SC_LICENSE} jsonLD={jsonLD} setJsonLD={setJsonLD} />
            <HumanFriendlyPropertyString id={id} pkey={C.SC_DATE_MODIFIED} jsonLD={jsonLD} setJsonLD={setJsonLD} />
            <HumanFriendlyPropertyString id={id} pkey={C.SC_DATE_PUBLISHED} jsonLD={jsonLD} setJsonLD={setJsonLD} />
            <HumanFriendlyPropertyReadOnly id={id} pkey={C.SC_DATE_CREATED} jsonLD={jsonLD} setJsonLD={setJsonLD} />
          </Grid>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
