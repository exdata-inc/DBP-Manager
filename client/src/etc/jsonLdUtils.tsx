import axios from 'axios';
import isURL from 'validator/lib/isURL'; // or use an equivalent function

import { decodeIdUrl } from './utils';
import * as C from './consts';

export async function loadJsonLd(url: string, depth: number, loadContext: boolean): Promise<Map<string, any>> {
  try {
    const response = await axios.get(url);
    const body = response.data;

    if (typeof body === 'object' && !Array.isArray(body)) {
      let jsonLd = { ...body };
      await scanJsonLdObject(jsonLd, depth, loadContext);
      return jsonLd;
    } else {
      throw new Error(`Failed to parse JSON-LD from given url.\nurl: ${url}`);
    }
  } catch (error) {
    throw new Error(`Failed to parse JSON from given url (maybe NON-JSON file).\nurl: ${url}\nerror: ${error}`);
  }
}

async function scanJsonLdObject(obj: any, depth: number, loadContext: boolean): Promise<void> {
  if (depth === 0) {
    return;
  }

  const keys = Object.keys(obj);
  if (keys.length < 3) {
    for (const key of keys) {
      if (key === C.AT_ID || key === C.AT_REF) {
        const url = obj[key];
        if (typeof url === 'string') {
          try {
            const jsonLd = await loadJsonLd(url, depth - 1, loadContext);
            Object.assign(obj, jsonLd);
          } catch (error) {
            console.debug(`Error occurred: ${error}`);
          }
        }
      }
    }
  }

  for (const key of keys) {
    if (!loadContext && key === C.AT_CONTEXT) {
      continue;
    }
    if (key !== C.AT_ID && key !== C.AT_REF) {
      const val = obj[key];
      if (Array.isArray(val)) {
        await scanJsonLdArray(val, depth, loadContext);
      } else if (typeof val === 'object' && val !== null) {
        await scanJsonLdObject(val, depth, loadContext);
      } else if (typeof val === 'string') {
        if (isURL(val) && key !== C.AT_TYPE) {
          try {
            const jsonLd = await loadJsonLd(val, depth - 1, loadContext);
            delete obj[key];
            obj[key] = jsonLd;
          } catch (error) {
            console.debug(`Maybe NOT JSON-LD: ${val} ${error}`);
          }
        }
      }
    }
  }
}

async function scanJsonLdArray(arr: any[], depth: number, loadContext: boolean): Promise<void> {
  if (depth === 0) {
    return;
  }

  const originalArray = [...arr];
  arr.length = 0;

  for (const val of originalArray) {
    if (Array.isArray(val)) {
      await scanJsonLdArray(val, depth, loadContext);
      arr.push(val);
    } else if (typeof val === 'object' && val !== null) {
      await scanJsonLdObject(val, depth, loadContext);
      arr.push(val);
    } else if (typeof val === 'string') {
      if (isURL(val)) {
        try {
          const jsonLd = await loadJsonLd(val, depth - 1, loadContext);
          arr.push(jsonLd);
        } catch (error) {
          console.debug(`Maybe NOT JSON-LD: ${val} ${error}`);
        }
      } else {
        arr.push(val);
      }
    } else {
      arr.push(val);
    }
  }
}

export function convertDateFormatToDayJS(formatStr: string): string {
  // Rust/Pythonからdayjsに変換するためのマッピング
  const formatMapping: { [key: string]: string } = {
    // Rust/Pythonのフォーマット指定子をdayjsのフォーマット指定子にマップ
    "%Y": "]YYYY[", // 年（4桁）
    "%m": "]MM[",   // 月（2桁）
    "%d": "]DD[",   // 日（2桁）
    "%H": "]HH[",   // 時（24時間表記、2桁）
    "%M": "]mm[",   // 分（2桁）
    "%S": "]ss[",   // 秒（2桁）
    // 以下、必要に応じて他の指定子も追加
  };

  // フォーマット文字列内の指定子をdayjsのものに置換
  formatStr = `[${formatStr}]`;
  Object.keys(formatMapping).forEach((key: string) => {
    formatStr = formatStr.replace(new RegExp(key, 'g'), formatMapping[key]);
  });

  return formatStr;
}

export async function updateJsonLd(id: string, jsonLD: any) {
  const jsonLdUrl = decodeIdUrl(id);
  const fetch_res = await (await fetch(jsonLdUrl as string, {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json' // JSON形式のデータのヘッダー
    },
    body: JSON.stringify(jsonLD),
  })).json();
  console.info(fetch_res);
  return fetch_res;
}
