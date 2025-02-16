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
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Delete as DeleteIcon,
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

const PATH_NAME = C.BREWING_SUPPLIES;


export default function BrewingSupply() {
  const [tableData, setTableData] = React.useState<TableLoaderData>();
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<string>(C.AT_ID);
  const [selected, setSelected] = React.useState<readonly string[]>([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(localStorage.getItem(C.IF_USE_DENSE_TABLE) !== 'false');
  const [rowsPerPage, setRowsPerPage] = React.useState(20);
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
        [C.AT_TYPE]: "dbp:RealWorldDataReadSupply",
        [C.AT_CONTEXT]: {
          "dbp": "https://exdata.co.jp/dbp/schema/",
          "schema": "https://schema.org/",
        },
        "schema:name": `新規${t(`path.${PATH_NAME}`)}`,
        "schema:dateCreated": createCurrentDateString(),
        "dbp:brewerInfo": {            // 醸造酵母情報
          [C.AT_ID]: tableData.urlPrefix + "/api/v0/brewer/*/?format=json",
          [C.AT_TYPE]: "dbp:RealWorldDataBrewerInfo",
        },
        "dbp:brewerOutput": {            // 醸造出力
          [C.AT_ID]: tableData.urlPrefix + "/api/v0/brewer_output/*/?format=json",
          [C.AT_TYPE]: "RealWorldDataBrewerOutput",
        },
        "dbp:brewingArgument": {            // 醸造引数
          [C.AT_ID]: tableData.urlPrefix + "/api/v0/brewer_argument/*/?format=json",
          [C.AT_TYPE]: "RealWorldDataBrewingArgument",
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
          helpImgSrc={`img/brewer.svg`}
          helpType={'dbp:RealWorldDataBrewingSupplies'}
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
                    <TableCell>{getLDLink(row['dbp:collectionInfo'], tableData.urlPrefix)}</TableCell>
                    <TableCell>{getLDLink(row['dbp:structureInfo'], tableData.urlPrefix)}</TableCell>
                    <TableCell>{getLDLink(row['dbp:generatedUsing'], tableData.urlPrefix)}</TableCell>
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
      { id ? <JsonLdEditor id={id} refreshList={async () => { await updateTableData(PATH_NAME, setTableData); }} urlPrefix={tableData.urlPrefix} /> : <></> }
    </Box>
  );
}