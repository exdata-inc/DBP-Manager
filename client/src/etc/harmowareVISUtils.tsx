import { Feature, FeatureCollection } from "geojson";
import { MarkerProp, PermType, WTData } from "../types";
// import { supportingPoints, routeSupportingPoints } from './centrair_consts';

const ARROW_DEG = 150;
const ARROW_COS = Math.cos(ARROW_DEG * Math.PI / 180); // 矢印の角度 (from→to のベクトルから何度回転するか)
const ARROW_SIN = Math.sin(ARROW_DEG * Math.PI / 180);
const ARROW_HEAD_RATIO = 0.00005;

const SHIFT_DEG = 90;
const SHIFT_COS = Math.cos(SHIFT_DEG * Math.PI / 180); // shift
const SHIFT_SIN = Math.sin(SHIFT_DEG * Math.PI / 180);
const SHIFT_RATIO = 0.04;
const LAT_LON_RATIO = 4;

export const createMapLineData = (wtData: WTData[], mapLineData: FeatureCollection, gates: PermType[], gateLocDic: {[name: number]: MarkerProp;}) => {
    const gateIds = gates.map(gate => Number(gate.data_source_id));
    const spPointsIds = Object.keys(supportingPoints).map(v => Number(v));
    const pfVolumes = gateIds.concat(spPointsIds).reduce((accumulator: any, currentValue) => {
        accumulator[currentValue] = gateIds.concat(spPointsIds).reduce((accumulator: any, currentValue) => {
            accumulator[currentValue] = 0;
            return accumulator;
        }, {});
        return accumulator;
    }, {});
    console.debug(routeSupportingPoints, pfVolumes);

    wtData.forEach((pf: WTData) => {
        for (let i = 0; i < pf.sensorIds.length - 1; i++) {
            // @ts-ignore
            if (routeSupportingPoints[pf.sensorIds[i]] !== void 0 && routeSupportingPoints[pf.sensorIds[i]][pf.sensorIds[i + 1]] !== void 0) {
                const viaPoints = [
                    pf.sensorIds[i],
                    // @ts-ignore
                    ...routeSupportingPoints[pf.sensorIds[i]][pf.sensorIds[i + 1]],
                    pf.sensorIds[i + 1],
                ];
                //console.log(viaPoints)
                for (let j = 0; j < viaPoints.length - 1; j++) {
                    pfVolumes[viaPoints[j]][viaPoints[j + 1]]++;
                }
            } else {
                pfVolumes[pf.sensorIds[i]][pf.sensorIds[i + 1]]++;
            }
        }
    });

    function findMaxInObject(obj: any) {
        let max = -Infinity;

        for (let key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                // もしキーの値がオブジェクトなら、再帰的に関数を呼び出す
                let maxInNestedObject = findMaxInObject(obj[key]);
                if (maxInNestedObject > max) {
                    max = maxInNestedObject;
                }
            } else if (typeof obj[key] === 'number') {
                // もしキーの値が数値なら、最大値と比較する
                if (obj[key] > max) {
                    max = obj[key];
                }
            }
        }

        return max;
    }

    const maxVolume = findMaxInObject(pfVolumes);

    console.debug(gateIds, pfVolumes, maxVolume);

    Object.entries(pfVolumes).forEach(([fromGate, toObj]) => {
        Object.entries(toObj as any).forEach(([toGate, volume]) => {
            if (fromGate != toGate) {
                const fromNode = gateLocDic[Number(fromGate)];
                const toNode = gateLocDic[Number(toGate)];
                const proportion = Number(volume) / maxVolume;
                const geta = 0.25 + 0.75 * proportion;
                const x = toNode.lon - fromNode.lon;
                const y = toNode.lat - fromNode.lat;
                const abs = Math.sqrt(x ** 2 + y ** 2);
                const srotX = SHIFT_COS * x - SHIFT_SIN * y;
                const srotY = SHIFT_SIN * x + SHIFT_COS * y;
                const rotX = ARROW_COS * x - ARROW_SIN * y;
                const rotY = ARROW_SIN * x + ARROW_COS * y;
                if (proportion > 0.05) {
                    const feature = {
                        type: 'Feature',
                        properties: {
                            color: (fromGate < toGate ? [255, 0, 127, geta*255] : [0, 255, 127, geta*255]),
                            width: 3 * proportion,
                        },
                        geometry: {
                            type: 'LineString',
                            coordinates: [
                                [srotX * SHIFT_RATIO * LAT_LON_RATIO * proportion + fromNode.lon, srotY * SHIFT_RATIO * proportion + fromNode.lat, fromNode.alt * 2 - 40],
                                [srotX * SHIFT_RATIO * LAT_LON_RATIO * proportion + toNode.lon, srotY * SHIFT_RATIO * proportion + toNode.lat, toNode.alt * 2 - 40],
                                [srotX * SHIFT_RATIO * LAT_LON_RATIO * proportion + rotX / abs * geta * ARROW_HEAD_RATIO + toNode.lon, srotY * SHIFT_RATIO * proportion + rotY / abs * geta * ARROW_HEAD_RATIO + toNode.lat, toNode.alt * 2 - 40],
                            ]
                        }
                    } as Feature;
                    mapLineData.features.push(feature);
                }
            }
        });
    });
}
