import * as React from 'react';
import {
  Box,
  Toolbar,
  IconButton,
  Typography,
  Tooltip,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Checkbox,
  FormControlLabel,
  Switch,
  Stack,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Help as HelpIcon,
  MenuBook as MenuBookIcon,
} from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';
import { alpha } from '@mui/material/styles';
import NonStyledLink from '../components/NonStyledLink';
import { encodeIdUrl, isValidUrl } from './utils';
import { useTranslation } from "react-i18next";

import * as C from './consts';
import { JsonLdDocument } from '../components/JsonLdDocument';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

export type Order = 'asc' | 'desc';

export function getComparator(
  order: Order,
  orderBy: string,
): (
  a: any,
  b: any,
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export interface HeadCell {
  disablePadding: boolean;
  id: string;
  label: string;
  numeric: boolean;
}

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
  headCells: readonly HeadCell[];
}

export function EnhancedTableHead(props: EnhancedTableProps) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, headCells } =
    props;
  const createSortHandler =
    (property: string) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all desserts',
            }}
          />
        </TableCell>
        {headCells.map((headCell: HeadCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

interface EnhancedTableToolbarProps {
  numSelected: number;
  add_new: any;
  remove_selected: any;
  modal_open?: any | undefined;
  path_name: string;
  dense: boolean;
  setDense: Function;
  ifUseHumanFriendly?: boolean;
  setIfUseHumanFriendly?: Function;
  helpImgSrc?: string;
  helpLink?: string;
  helpType?: string;
}

export function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { numSelected, add_new, remove_selected, modal_open, path_name, dense, setDense, ifUseHumanFriendly, setIfUseHumanFriendly, helpImgSrc, helpLink } = props;
  const { t } = useTranslation();
  const [helpOpen, setHelpOpen] = React.useState<boolean>(false);
  const [docOpen, setDocOpen] = React.useState<boolean>(false);

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} 個選択中
        </Typography>
      ) : (
        <Stack direction={"row"}
          sx={{ flex: '1 1 100%' }}
          id="tableTitle"
          component="div"
          alignItems="center"
        >
          <Typography variant="h6">{t(`path.${path_name}`)}</Typography>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <Button onClick={() => { add_new() }}>+ {t(`path.${path_name}`)}を追加</Button>
          {modal_open && <Button onClick={() => { modal_open() }}>+ {t(`path.${path_name}`)}を生成</Button>}
          <Box width={32} />
          <FormControlLabel
            control={<Switch checked={dense} onChange={(_, c) => { localStorage.setItem(C.IF_USE_DENSE_TABLE, String(c)); setDense(c); }} />}
            label="圧縮ビュー"
          />
          {setIfUseHumanFriendly ? <>
            <Box width={32} />
            <Typography>エディタ選択&nbsp;&nbsp;JSON&nbsp;&nbsp;</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={ifUseHumanFriendly}
                  onChange={() => { setIfUseHumanFriendly(!ifUseHumanFriendly) }}
                  inputProps={{ 'aria-label': 'controlled' }}
                  color="default"
                />
              }
              label="ビジュアル"
            />
          </> : <></>}
        </Stack>
      )}
      <Tooltip title="Document">
        <IconButton onClick={() => {
          if (helpLink) window.open(helpLink);
          else setDocOpen(true);
        }}>
          <MenuBookIcon />
        </IconButton>
      </Tooltip>
      {helpImgSrc ? 
        <Tooltip title="Help">
          <IconButton onClick={() => { if (helpImgSrc) setHelpOpen(true); }}>
            <HelpIcon />
          </IconButton>
        </Tooltip>
      : <></>}
      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton onClick={() => { remove_selected() }}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
      <Dialog
        maxWidth={"xl"}
        open={helpOpen}
        fullWidth={true}
        onClose={() => setHelpOpen(false)}
      >
        <DialogTitle sx={{ display: 'flex' }}>
          <span style={{ display: 'flex', alignItems: 'center', fontWeight: 'inherit', flexGrow: 1 }}>
            {t(`path.${path_name}`)}
          </span>
          <IconButton
            aria-label="close"
            onClick={() => setHelpOpen(false)}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <img src={helpImgSrc} style={{ width: '100%' }} />
        </DialogContent>
      </Dialog>
      <Dialog
        maxWidth={"xl"}
        open={docOpen}
        fullWidth={true}
        onClose={() => setDocOpen(false)}
      >
        <DialogTitle sx={{ display: 'flex' }}>
          <span style={{ display: 'flex', alignItems: 'center', fontWeight: 'inherit', flexGrow: 1 }}>
            Documentation - {t(`path.${path_name}`)} (<span style={{ fontFamily: 'Consolas', }}>{props.helpType}</span>)
          </span>
          <IconButton
            aria-label="close"
            onClick={() => setDocOpen(false)}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <JsonLdDocument id={props.helpType || 'dbp:RealWorldDataset'} />
        </DialogContent>
      </Dialog>
    </Toolbar>
  );
}



export function getLDLink(obj: any, prefix?: string) {
  if (typeof obj == "object") {
    if (C.AT_ID in obj) {
      if (isValidUrl(obj[C.AT_ID])) {
        return <NonStyledLink to={"/editor/" + encodeIdUrl(obj[C.AT_ID] as string)}>{(obj[C.AT_ID] as string).replace(prefix || '', '').replace(C.API_ROOT_PATH, '')}</NonStyledLink>;
      } else {
        return obj[C.AT_ID];
      }
    } else if (C.AT_REF in obj) {
      if (isValidUrl(obj[C.AT_REF])) {
        return <NonStyledLink to={"/editor/" + encodeIdUrl(obj[C.AT_REF] as string)}>{(obj[C.AT_REF] as string).replace(prefix || '', '').replace(C.API_ROOT_PATH, '')}</NonStyledLink>;
      } else {
        return obj[C.AT_REF];
      }
    } else if (C.SC_NAME in obj) {
      if (isValidUrl(obj[C.SC_NAME])) {
        return <NonStyledLink to={"/editor/" + encodeIdUrl(obj[C.SC_NAME] as string)}>{(obj[C.SC_NAME] as string).replace(prefix || '', '').replace(C.API_ROOT_PATH, '')}</NonStyledLink>;
      } else {
        return obj[C.SC_NAME];
      }
    }
  } else {
    return obj;
  }
}

export interface TableLoaderData {
  list: any,
  urlPrefix: string,
}

export async function tableLoader(path_name: string): Promise<TableLoaderData> {
  const API_URL_PREFIX = import.meta.env.VITE_RWDB_URL_PREFIX || C.defaultLocalHost;
  const fetch_res = await (await fetch(`${API_URL_PREFIX}${C.API_ROOT_PATH}/${path_name}/?format=json`)).json();
  console.debug(API_URL_PREFIX);
  return { list: fetch_res, urlPrefix: API_URL_PREFIX };
}

export async function updateTableData(path_name: string, setTableData: Function) {
  const fetch_res = await tableLoader(path_name);
  if (fetch_res) {
    const now = new Date();
    console.debug('FINISH initializeRWDataset', now, now.getMilliseconds(), fetch_res);
    setTableData(fetch_res);
  }
}

export const tableMeta = (path_name: string) => {
  const { t } = useTranslation();
  return [
    { title: `${t('app.title')} - ${t(`path.${path_name}`)}` },
    { description: `${t('app.title')} - ${t(`path.${path_name}`)}` },
  ];
};

export const createCurrentDateString = () => {
  const date = new Date();
  const Y = date.getFullYear();
  const M = ("00" + (date.getMonth() + 1)).slice(-2);
  const D = ("00" + date.getDate()).slice(-2);
  const h = ("00" + date.getHours()).slice(-2);
  const m = ("00" + date.getMinutes()).slice(-2);
  const s = ("00" + date.getSeconds()).slice(-2);
  const ms = (date.getMilliseconds() + "00000000").slice(0, 9);
  const tz = '+09:00';
  return Y + '-' + M + '-' + D + 'T' + h + ':' + m + ':' + s + '.' + ms + tz;
}

export const tableHandleClick = (name: string, selected: readonly string[], setSelected: (value: React.SetStateAction<readonly string[]>) => void) => {
  const selectedIndex = selected.indexOf(name);
  let newSelected: readonly string[] = [];

  if (selectedIndex === -1) {
    newSelected = newSelected.concat(selected, name);
  } else if (selectedIndex === 0) {
    newSelected = newSelected.concat(selected.slice(1));
  } else if (selectedIndex === selected.length - 1) {
    newSelected = newSelected.concat(selected.slice(0, -1));
  } else if (selectedIndex > 0) {
    newSelected = newSelected.concat(
      selected.slice(0, selectedIndex),
      selected.slice(selectedIndex + 1),
    );
  }

  setSelected(newSelected);
};

export const handleSelectAllClick = (setSelected: Function, tableData: TableLoaderData) => (event: React.ChangeEvent<HTMLInputElement>) => {
  if (event.target.checked) {
    const newSelected = tableData.list.map((n: any) => n[C.AT_ID] as string);
    setSelected(newSelected);
    return;
  }
  setSelected([]);
};

export const handleRequestSort = (setOrder: Function, setOrderBy: Function, order: Order, orderBy: string) => (
  event: React.MouseEvent<unknown>,
  property: string,
) => {
  const isAsc = orderBy === property && order === 'asc';
  setOrder(isAsc ? 'desc' : 'asc');
  setOrderBy(property);
};

export const handleChangeRowsPerPage = (setRowsPerPage: Function, setPage: Function) => (event: React.ChangeEvent<HTMLInputElement>) => {
  setRowsPerPage(parseInt(event.target.value, 20));
  setPage(0);
};

