import * as React from 'react';
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  SvgIconTypeMap,
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  TableView as TableViewIcon,
  Storage as StorageIcon,
  SaveAlt as SaveAltIcon,
  Compress as CompressIcon,
  AccountTree as AccountTreeIcon,
  DriveFileMove as DriveFileMoveIcon,
  AutoDelete as AutoDeleteIcon,
  Delete as DeleteIcon,
  Output as OutputIcon,
  Schedule as ScheduleIcon,
  ScheduleSend as ScheduleSendIcon,
  Send as SendIcon,
  History as HistoryIcon,
  Place as PlaceIcon,
  Person as PersonIcon,
  Info as InfoIcon,
  SensorOccupied as SensorOccupiedIcon,
  Help as HelpIcon,
  Pin as PinIcon,
  ExitToApp as ExitToAppIcon,
  EditNote as EditNoteIcon,
  ReadMore as ReadMoreIcon,
  AppRegistration as AppRegistrationIcon,
  AllInclusive as AllInclusiveIcon,
} from '@mui/icons-material';
// import MapIcon from '@mui/icons-material/Map';
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as C from '../etc/consts';
import { OverridableComponent } from '@mui/material/OverridableComponent';


export const MAIN_PATHS = [
  { path: C.DATASET, icon: TableViewIcon },
  { path: C.STRUCTURE_INFO, icon: AccountTreeIcon },
  { path: C.COLLECTION_INFO, icon: SaveAltIcon },
  { path: C.STORING_INFO, icon: StorageIcon },
];

export function MainListItems() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <ListSubheader component="div" inset>
        {t("app.menu.main")}
      </ListSubheader>
      {MAIN_PATHS.map((p: { path: string, icon: OverridableComponent<SvgIconTypeMap<{}, "svg">> & { muiName: string; } }) => {
        return (
          <ListItemButton key={p.path} sx={{ pointerEvents: 'auto' }} onClick={() => navigate(`/${p.path}`)} selected={location.pathname.startsWith(`/${p.path}`)}>
            <ListItemIcon>
              <p.icon />
            </ListItemIcon>
            <ListItemText primary={t(`path.${p.path}`)} />
          </ListItemButton>
        )
      })}
    </React.Fragment>
  );
};

export const BREWING_PATHS = [
  { path: C.BREWER_INFO, icon: CompressIcon },
  { path: C.PERIODIC_BREWING_CONFIGS, icon: ScheduleIcon },
  { path: C.PERIODIC_MOVE_CONFIGS, icon: ScheduleSendIcon },
  { path: C.PERIODIC_REMOVE_CONFIGS, icon: AutoDeleteIcon },
  { path: C.BREWER_INPUT, icon: ExitToAppIcon },
  { path: C.BREWER_OUTPUT, icon: OutputIcon },
  { path: C.BREWER_ARGUMENT, icon: PinIcon },
];

export function BrewingListItems() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <ListSubheader component="div" inset>
        {t("app.menu.brewing")}
      </ListSubheader>
      {BREWING_PATHS.map((p: { path: string, icon: OverridableComponent<SvgIconTypeMap<{}, "svg">> & { muiName: string; } }) => {
        return (
          <ListItemButton key={p.path} sx={{ pointerEvents: 'auto' }} onClick={() => navigate(`/${p.path}`)} selected={location.pathname === (`/${p.path}`) || location.pathname.startsWith(`/${p.path}/`)}>
            <ListItemIcon>
              <p.icon />
            </ListItemIcon>
            <ListItemText primary={t(`path.${p.path}`)} />
          </ListItemButton>
        )
      })}
    </React.Fragment>
  );
}

export const METADATA_PATHS = [
  { path: C.WHERE, icon: PlaceIcon },
  { path: C.WHO, icon: PersonIcon },
  { path: C.WHAT, icon: InfoIcon },
  { path: C.WHY, icon: HelpIcon },
  { path: C.HOW, icon: SensorOccupiedIcon },
  { path: C.ANY, icon: AllInclusiveIcon },
];

export function MetadataListItems() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <ListSubheader component="div" inset>
        {t("app.menu.metadata")}
      </ListSubheader>
      {METADATA_PATHS.map((p: { path: string, icon: OverridableComponent<SvgIconTypeMap<{}, "svg">> & { muiName: string; } }) => {
        return (
          <ListItemButton key={p.path} sx={{ pointerEvents: 'auto' }} onClick={() => navigate(`/${p.path}`)} selected={location.pathname.startsWith(`/${p.path}`)}>
            <ListItemIcon>
              <p.icon />
            </ListItemIcon>
            <ListItemText primary={t(`path.${p.path}`)} />
          </ListItemButton>
        )
      })}
    </React.Fragment>
  );
}


export const LOGS_PATHS = [
  { path: C.HISTORY, icon: HistoryIcon },
  { path: C.REGISTER_DEMANDS, icon: AppRegistrationIcon },
  { path: C.REGISTER_SUPPLIES, icon: AppRegistrationIcon },
  { path: C.COLLECTION_DEMANDS, icon: SaveAltIcon },
  { path: C.COLLECTION_SUPPLIES, icon: SaveAltIcon },
  { path: C.COLLECTION_STATUS, icon: SaveAltIcon },
  { path: C.BREWING_DEMANDS, icon: CompressIcon },
  { path: C.BREWING_SUPPLIES, icon: CompressIcon },
  { path: C.READ_DEMANDS, icon: ReadMoreIcon },
  { path: C.READ_SUPPLIES, icon: ReadMoreIcon },
  { path: C.WRITE_DEMANDS, icon: EditNoteIcon },
  { path: C.WRITE_SUPPLIES, icon: EditNoteIcon },
  { path: C.MOVE_DEMANDS, icon: SendIcon },
  { path: C.MOVE_SUPPLIES, icon: SendIcon },
  { path: C.REMOVE_DEMANDS, icon: DeleteIcon },
  { path: C.REMOVE_SUPPLIES, icon: DeleteIcon },
];

export function LogsListItems() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <ListSubheader component="div" inset>
        {t("app.menu.log")}
      </ListSubheader>
      {LOGS_PATHS.map((p: { path: string, icon: OverridableComponent<SvgIconTypeMap<{}, "svg">> & { muiName: string; } }) => {
        return (
          <ListItemButton key={p.path} sx={{ pointerEvents: 'auto' }} onClick={() => navigate(`/${p.path}`)} selected={location.pathname.startsWith(`/${p.path}`)}>
            <ListItemIcon>
              <p.icon color={p.path.match(/demands/) ? 'demands' : (p.path.match(/supplies/) ? 'supplies' : 'inherit')} />
            </ListItemIcon>
            <ListItemText primary={t(`path.${p.path}`)} />
          </ListItemButton>
        )
      })}
    </React.Fragment>
  );
}
