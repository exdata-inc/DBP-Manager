import { GridValueGetterParams } from '@mui/x-data-grid';
import { Dictionary } from '@reduxjs/toolkit';
import { useTranslation } from 'react-i18next';

export type PermType = {
  id?: number;
  user_id?: number;
  data_source_id?: number;
  data_source_name?: string;
  data_source_owner_id?: number;
  data_source_owner_username?: string;
  data_source_type?: number;
  data_source_latitude?: number;
  data_source_longitude?: number;
  data_source_altitude?: number;
  data_source_radius?: number;
  data_source_group_id?: number;
  data_source_group_name?: string;
  data_source_opt?: any;
  granularity_time?: number;
  granularity_mesh?: number;
  opt?: string;
};

export type UserType = {
  id?: number;
  sub: string;
  username: string;
  email: string;
  perms: PermType[];
};

export const GetDataSourceTypeName = (params: GridValueGetterParams) => {
  const { t } = useTranslation();
  const type = params.row.data_source_type;
  const types = [t("datasources.data_source_types.unknown"), t("datasources.data_source_types.passing"), t("datasources.data_source_types.staying"), t("datasources.data_source_types.path")];
  return types[type];
};

export type TimelineChartData = { [key: string | number]: any; };
export type TimelineChartDataList = TimelineChartData[];

export type MarkerProp = {
  id: number;
  lat: number;
  lon: number;
  alt: number;
  name: string;
  active: number;
  time?: string;
};
export const isMarkerActive = (v: any) => v !== void 0 && v !== -1;

export interface AppError {
  message: string;
};
export interface Message {
  text: string;
};

export interface UserProfileApiResponse {
  data: UserProfile | null;
  error: AppError | null;
};

export interface Auth0Resource {
  path: string;
  label: string;
};

export interface DjangoUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_superuser: boolean;
  is_staff: boolean;
};

export interface UserProfile {
  user: DjangoUser;
  affi: string;
  position: string;
  zip: string;
  city: string;
  viewlog?: any;
  regist_date: string;
  lastlogin_date: string;
};

export interface GroupType {
  id: number;
};

export interface Demand {
  arg_json?: any;
  demand_name: string;
  id: number;
  mbus_id: number;
  sender_id: number;
  ts: number;
  cdata?: any;
}

export interface Supply {
  arg_json?: any;
  supply_name: string;
  id: number;
  mbus_id: number;
  sender_id: number;
  ts: number;
  cdata?: any;
}

export type WTData = {
  id: number,
  times: Date[],
  sensorIds: number[],
  heights: number[],
};

export interface SearchAccordionType {
  title: string;
  content: any[];
}

export interface SchemaObject {
  "@id": string,
  "@type"?: string,
  "rdfs:comment"?: string,
  "rdfs:label"?: string,
  "rdfs:subClassOf"?: SchemaObject,
  "schema:domainIncludes"?: SchemaObject,
  "schema:rangeIncludes"?: SchemaObject[] | SchemaObject,
}

export interface SchemaJsonLd {
  "@context": Map<string, string>,
  "@graph": SchemaObject[],
}

export type ProgressData = {
  all_progress: { uploaded: number; total: number; progress: number };
  part_progress: { uploaded: number; total: number; progress: number };
  date_progress: { uploaded: number; total: number; progress: number };
};

export type FileMoveContextType = {
  moveLoader: boolean;
  setMoveLoader: (value: boolean) => void;
  progressData: ProgressData;
  setProgressData: (data: ProgressData) => void;
  areAllWsConnected: boolean;
};
