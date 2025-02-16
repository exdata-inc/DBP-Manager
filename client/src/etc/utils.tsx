import { format, parseISO } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

export function isValidUrl(str: string) {
  const pattern = new RegExp('^https?:\\/\\/(?:[a-zA-Z\\d-]+\\.)+[a-zA-Z]{2,}(?:\\/[-a-zA-Z\\d%_.~+\\\\*]*)*(?:\\?[;&a-zA-Z\\d%_.~+=-\\\\*]*)?(?:\\#[-a-zA-Z\\d_]*)?$', 'i');
  return pattern.test(str);
}

export function formatDateInTimeZone(dateStr: string, timeZone: string): string {
  try {
    // ISO形式の文字列を解析
    const parsedDate = parseISO(dateStr);

    // 指定されたタイムゾーンに変換
    const dateInTargetTimeZone = utcToZonedTime(parsedDate, timeZone);

    // "2023-10-02 01:12:25"の形式で日付を表示
    return format(dateInTargetTimeZone, "yyyy-MM-dd HH:mm:ss");
  } catch {
    return '-';
  }
}

export function encodeIdUrl(id: string): string {
  let escapedUrl = encodeURIComponent(id).replace(/\./g, '>');
  return escapedUrl;
}

export function decodeIdUrl(id: string): string {
  let decodedUrl = decodeURIComponent(id).replace(/>/g, '.');
  console.debug(decodedUrl);
  return decodedUrl;
}
