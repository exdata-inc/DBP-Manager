import * as React from 'react';
import {
  Container as HVISContainer,
  HarmoVisLayers,
  LoadingIcon,
  FpsDisplay,
  LineMapLayer,
} from 'harmoware-vis';
import { BasedProps, LineMapData } from 'harmoware-vis/lib/src/types';
import { connectToHarmowareVISContext } from '../providers/HarmowareVISContext';
import axios from 'axios';
import { MarkerProp, WTData } from '../types';
import { createMapLineData } from '../etc/harmowareVISUtils';
import { FeatureCollection } from 'geojson';
// import { copUser, supportingPoints } from '../etc/centrair_consts';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ja';
import 'dayjs/locale/en';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import i18n from "i18next";
import { useParams } from 'react-router-dom';
import { decodeIdUrl } from '../etc/utils';
import { convertDateFormatToDayJS, loadJsonLd } from '../etc/jsonLdUtils';
import { PageLoader } from '../components';
// import {registerLoaders} from '@loaders.gl/core';
// import {OBJLoader} from '@loaders.gl/obj';

// registerLoaders([OBJLoader]);

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const mapLineData = {
  type: 'FeatureCollection',
  features: [],
} as FeatureCollection;

function HarmowareVISWrapper(props: BasedProps) {
  const parentRef = React.useRef<HTMLDivElement>(null); // 親要素への参照を作成
  const [parentSize, setParentSize] = React.useState([0, 0]); // 親要素のwidthを保持するstate
  const [linemapData, setLinemapData] = React.useState<LineMapData[]>([]);
  const [pickedDate, setPickedDate] = React.useState<Dayjs | null>(null);
  const [jsonLD, setJsonLD] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const { t } = useTranslation();
  const { id } = useParams();

  React.useEffect(() => {
    const { actions } = props;
    actions.setSecPerHour(720);
    actions.setLeading(10);
    actions.setTrailing(10);
    actions.setViewport({ longitude: 136.816929, latitude: 34.859429, zoom: 17, maxZoom: 20 });
    actions.setDefaultViewport({ defaultZoom: 17 });
    if (parentRef.current) {
      setParentSize([parentRef.current.offsetWidth, parentRef.current.offsetHeight]);
    }
    if (jsonLD) setPickedDate(dayjs(jsonLD['schema:distribution'][0]['dbp:startTime']));
  }, [jsonLD]);

  React.useEffect(() => {
    let isMounted = true;

    const loadLinemapData = async () => {
      const urlTemlate = convertDateFormatToDayJS(jsonLD['schema:distribution'][0]['dbp:entryPoint']['schema:urlTemplate']);
      const formattedUrl = (pickedDate || dayjs(jsonLD['schema:distribution'][0]['dbp:startTime'])).format(urlTemlate);
      console.log(urlTemlate, formattedUrl);
      const response = await axios.get(formattedUrl);
      const { data } = response;
      console.log(response.status, data.length);
      const wtData: WTData[] = response.data.split('\n').map((d: string) => {
        const dataArray = d.split(',');
        if (dataArray.length > 3) {
          const pf: WTData = {
            id: Number(dataArray[0]),
            times: [] as Date[],
            sensorIds: [] as number[],
            heights: [] as number[],
          };
          for (let i = 1; i < dataArray.length; i += 3) {
            pf.times.push(new Date(dataArray[i]));
            pf.sensorIds.push(Number(dataArray[i + 1]));
            pf.heights.push(Number(dataArray[i + 2]));
          }
          return pf;
        } else {
          return null;
        }
      }).filter((d: any) => d);
      console.debug("PF", wtData);
      const gates = copUser?.perms?.filter(row => row.data_source_type === 1)!!;
      const gateLocDic: { [name: number]: MarkerProp } = {};
      gates.forEach((gate, _) => {
        const marker: MarkerProp = {
          id: gate.id!!,
          lat: gate.data_source_latitude!!,
          lon: gate.data_source_longitude!!,
          alt: gate.data_source_altitude!!,
          name: gate.data_source_name!!,
          active: -1,
        };
        gateLocDic[gate.data_source_id!!] = marker;
      });
      Object.entries(supportingPoints).forEach(([k, v]) => {
        const marker: MarkerProp = {
          id: Number(k),
          lat: v[1],
          lon: v[0],
          alt: v[2],
          name: k,
          active: -1,
        };
        gateLocDic[Number(k)] = marker;
      });
      mapLineData.features = [];
      createMapLineData(wtData, mapLineData, gates, gateLocDic);
      const linemapData = mapLineData.features.map(v => {
        return {
          // @ts-ignore
          path: v.geometry.coordinates,
          color: v.properties?.color,
          strokeWidth: v.properties?.width,
        } as LineMapData;
      });
      console.debug("linemapData", linemapData);
      setLinemapData(linemapData);
      setLoading(false);
    };

    const now = new Date();
    if (jsonLD) {
      console.debug('START loadLinemapData', now, now.getMilliseconds());
      setLoading(true);
      loadLinemapData();
    }

    return () => {
      isMounted = false;
    };
  }, [pickedDate]);


  React.useEffect(() => {
    let isMounted = true;

    const initializeJsonLD = async () => {
      if (!isMounted || !id)  return;
      const fetch_res = await loadJsonLd(decodeIdUrl(id), 1, false);
      if (fetch_res) {
        const now = new Date();
        console.log('FINISH initializeJsonLD', now, now.getMilliseconds(), fetch_res);
        setJsonLD(fetch_res);
      }
    };

    const now = new Date();
    console.debug('START initializeJsonLD', now, now.getMilliseconds());
    initializeJsonLD();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // console.debug(viewport, parentSize);

  const { actions } = props;
  const viewport = { ...props.viewport };
  viewport.width = parentSize[0];
  viewport.height = parentSize[1];

  return (
    id ? (jsonLD ?
      <React.Fragment>
        <Box width={'100%'} height={'15%'} p={2}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={i18n.language}>
            <DatePicker
              label={t("hvis.datepick")}
              value={pickedDate}
              onChange={(newValue: React.SetStateAction<dayjs.Dayjs | null>) => setPickedDate(newValue)}
              minDate={dayjs(jsonLD['schema:distribution'][0]['dbp:startTime'])} maxDate={dayjs(jsonLD['schema:distribution'][0]['dbp:endTime'])} // TODO: use storingInfo data
            />
          </LocalizationProvider>
        </Box>
        <Box width={'100%'} height={'85%'}>
          <HVISContainer {...props}>
            <div style={{ width: '100%', height: '100%' }} ref={parentRef}>
              {parentSize[0] ?
                <HarmoVisLayers
                  actions={actions}
                  viewport={viewport}
                  mapboxApiAccessToken={MAPBOX_TOKEN}
                  layers={[
                    linemapData.length > 0 ?
                      new LineMapLayer({
                        data: linemapData,
                      }) : null,
                  ]}
                />
                :
                <PageLoader message={t("app.status.initializing")} />
              }
            </div>
            <LoadingIcon loading={props.loading || loading} />
            <FpsDisplay />
          </HVISContainer>
        </Box>
      </React.Fragment>
    : <PageLoader message={t("app.status.initializing")} />) : <>{t("app.status.initializing")}</>
  );
};

export default connectToHarmowareVISContext(HarmowareVISWrapper);

