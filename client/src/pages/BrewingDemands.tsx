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
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  MenuItem,
  Grid,
  FormControl,
} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Map as MapIcon,
  Close as CloseIcon,
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
import { updateJsonLd } from '../etc/jsonLdUtils';
import { HumanFriendlyPropertyReadOnly, HumanFriendlyPropertyMultipleSelect, HumanFriendlyPropertySingleSelect, HumanFriendlyPropertyString } from '../components/HumanFriendlyEditors';
import { useFileExplorerContext } from '../providers/FileExplorerContext';


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
    id: 'dbp:brewerInfo',
    numeric: false,
    disablePadding: false,
    label: '醸造酵母情報',
  },
  {
    id: 'dbp:brewerInput',
    numeric: false,
    disablePadding: false,
    label: '醸造入力-1',
  },
  {
    id: 'dbp:brewingArgument',
    numeric: false,
    disablePadding: false,
    label: '醸造引数-1',
  },
  {
    id: 'dbp:brewerOutputStore',
    numeric: false,
    disablePadding: false,
    label: '醸造出力先',
  },
];

const PATH_NAME = C.BREWING_DEMANDS;


export default function BrewingDemand() {
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
        [C.AT_TYPE]: "dbp:RealWorldDataBrewingDemand",
        [C.AT_CONTEXT]: {
          "dbp": "https://exdata.co.jp/dbp/schema/",
          "schema": "https://schema.org/"
        },
        "schema:name": `新規${t(`path.${PATH_NAME}`)}`,
        "schema:dateCreated": createCurrentDateString(),
        "dbp:brewerInfo": {            // 醸造酵母情報
          [C.AT_ID]: tableData.urlPrefix + "/api/v0/brewer/*/?format=json",
          [C.AT_TYPE]: "dbp:RealWorldDataBrewerInfo",
        },
        "dbp:brewerInput": [{            // 醸造入力
          [C.AT_ID]: tableData.urlPrefix + "/api/v0/brewer_input/*/?format=json",
          [C.AT_TYPE]: "RealWorldDataBrewerInput",
        }],
        "dbp:brewingArgument": [{            // 醸造引数
          [C.AT_ID]: tableData.urlPrefix + "/api/v0/brewer_argument/*/?format=json",
          [C.AT_TYPE]: "RealWorldDataBrewingArgument",
        }],
        "dbp:brewerOutputStore": {            // 醸造出力先（保存先情報）
          [C.AT_ID]: tableData.urlPrefix + "/api/v0/storing_info/*/?format=json",
          [C.AT_TYPE]: "RealWorldDataStoringInfo",
        },
        "dbp:timePeriodStart": "2023-09-01T00:00:00.000000000+09:00",  // 醸造する対象となるデータの開始時刻
        "dbp:timePeriodEnd": "2023-09-30T23:59:59.000000000+09:00",    // 醸造する対象となるデータの終了時刻
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
          helpImgSrc={`img/brewer.svg`}
          helpType={'dbp:RealWorldDataBrewingDemand'}
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
                      <NonStyledLink to={`/${PATH_NAME}/`+encodeIdUrl(row[C.AT_ID] as string)}>{row[C.SC_NAME] as string}</NonStyledLink>
                    </TableCell>
                    <TableCell><NonStyledLink to={`/${PATH_NAME}/`+encodeIdUrl(row[C.AT_ID] as string)}>{row[C.AT_ID].replace(tableData.urlPrefix, '').replace(C.API_ROOT_PATH, '')}</NonStyledLink></TableCell>
                    <TableCell>{getLDLink(row['dbp:brewerInfo'], tableData.urlPrefix)}</TableCell>
                    <TableCell>{getLDLink(row['dbp:brewerInput'][0], tableData.urlPrefix)}</TableCell>
                    <TableCell>{getLDLink(row['dbp:brewingArgument'][0], tableData.urlPrefix)}</TableCell>
                    <TableCell>{getLDLink(row['dbp:brewerOutputStore'], tableData.urlPrefix)}</TableCell>
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
      {/* ↓ エディタ表示部 ↓ */}
      {id ? (ifUseHumanFriendly
        ? <HumanFriendlyEditor id={id} refreshList={async () => { await updateTableData(PATH_NAME, setTableData); }} urlPrefix={tableData.urlPrefix} />
        : <JsonLdEditor id={id} refreshList={async () => { await updateTableData(PATH_NAME, setTableData); }} urlPrefix={tableData.urlPrefix} />
      ) : <></>}
      {/* ↑ エディタ表示部 ↑ */}
    </Box>
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
            <HumanFriendlyPropertySingleSelect id={id} pkey={C.DBP_BREWER_INFO} path={C.BREWER_INFO} jsonLD={jsonLD} setJsonLD={setJsonLD} urlPrefix={props.urlPrefix} />
            <HumanFriendlyPropertyMultipleSelect id={id} pkey={C.DBP_BREWER_INPUT} path={C.BREWER_INPUT} jsonLD={jsonLD} setJsonLD={setJsonLD} urlPrefix={props.urlPrefix} />
            <HumanFriendlyPropertyMultipleSelect id={id} pkey={C.DBP_BREWING_ARGUMENT} path={C.BREWER_ARGUMENT} jsonLD={jsonLD} setJsonLD={setJsonLD} urlPrefix={props.urlPrefix} />
            <HumanFriendlyPropertySingleSelect id={id} pkey={C.DBP_BREWER_OUTPUT_STORE} path={C.STORING_INFO} jsonLD={jsonLD} setJsonLD={setJsonLD} urlPrefix={props.urlPrefix} />
            <HumanFriendlyPropertyString id={id} pkey={C.DBP_TIME_PERIOD_START} jsonLD={jsonLD} setJsonLD={setJsonLD} />
            <HumanFriendlyPropertyString id={id} pkey={C.DBP_TIME_PERIOD_END} jsonLD={jsonLD} setJsonLD={setJsonLD} />
            <HumanFriendlyPropertyReadOnly id={id} pkey={C.SC_DATE_CREATED} jsonLD={jsonLD} setJsonLD={setJsonLD} />
          </Grid>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}