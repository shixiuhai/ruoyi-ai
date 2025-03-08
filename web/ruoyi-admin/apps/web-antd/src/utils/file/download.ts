import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { dataURLtoBlob, urlToBase64 } from './base64Conver';

/**
 * 下载excel文件
 * @param [func] axios函数
 * @param [fileName] 文件名称 不需要带xlsx后缀
 * @param [requestData] 请求参数
 * @param [withRandomName] 是否带随机文件名
 *
 * @return void
 */
export async function downloadExcel(
  func: (data?: any) => Promise<Blob>,
  fileName: string,
  requestData: any = {},
  withRandomName = true,
) {
  const hideLoading = message.loading($t('pages.common.downloadLoading'), 0);
  try {
    const data = await func(requestData);
    downloadExcelFile(data, fileName, withRandomName);
  } catch (error) {
    console.error(error);
  } finally {
    hideLoading();
  }
}

export function downloadExcelFile(
  data: BlobPart,
  filename: string,
  withRandomName = true,
) {
  let realFileName = filename;
  if (withRandomName) {
    realFileName = `${filename}-${Date.now()}.xlsx`;
  }
  downloadByData(data, realFileName);
}

/**
 * Download online pictures
 * @param url
 * @param filename
 * @param mime
 * @param bom
 */
export function downloadByOnlineUrl(
  url: string,
  filename: string,
  mime?: string,
  bom?: BlobPart,
) {
  urlToBase64(url).then((base64) => {
    downloadByBase64(base64, filename, mime, bom);
  });
}

/**
 * Download pictures based on base64
 * @param buf
 * @param filename
 * @param mime
 * @param bom
 */
export function downloadByBase64(
  buf: string,
  filename: string,
  mime?: string,
  bom?: BlobPart,
) {
  const base64Buf = dataURLtoBlob(buf);
  downloadByData(base64Buf, filename, mime, bom);
}

/**
 * Download according to the background interface file stream
 * @param {*} data
 * @param {*} filename
 * @param {*} mime
 * @param {*} bom
 */
export function downloadByData(
  data: BlobPart,
  filename: string,
  mime?: string,
  bom?: BlobPart,
) {
  const blobData = bom === undefined ? [data] : [bom, data];
  const blob = new Blob(blobData, { type: mime || 'application/octet-stream' });

  const blobURL = window.URL.createObjectURL(blob);
  const tempLink = document.createElement('a');
  tempLink.style.display = 'none';
  tempLink.href = blobURL;
  tempLink.setAttribute('download', filename);
  if (tempLink.download === undefined) {
    tempLink.setAttribute('target', '_blank');
  }
  document.body.append(tempLink);
  tempLink.click();
  tempLink.remove();
  window.URL.revokeObjectURL(blobURL);
}

export function openWindow(
  url: string,
  opt?: {
    noopener?: boolean;
    noreferrer?: boolean;
    target?: '_blank' | '_self' | string;
  },
) {
  const { noopener = true, noreferrer = true, target = '__blank' } = opt || {};
  const feature: string[] = [];

  noopener && feature.push('noopener=yes');
  noreferrer && feature.push('noreferrer=yes');

  window.open(url, target, feature.join(','));
}

/**
 * Download file according to file address
 * @param {*} sUrl
 */
export function downloadByUrl({
  fileName,
  target = '_blank',
  url,
}: {
  fileName?: string;
  target?: '_blank' | '_self';
  url: string;
}): boolean {
  const isChrome = window.navigator.userAgent.toLowerCase().includes('chrome');
  const isSafari = window.navigator.userAgent.toLowerCase().includes('safari');

  if (/iP/.test(window.navigator.userAgent)) {
    console.error('Your browser does not support download!');
    return false;
  }
  if (isChrome || isSafari) {
    const link = document.createElement('a');
    link.href = url;
    link.target = target;

    if (link.download !== undefined) {
      link.download =
        // eslint-disable-next-line unicorn/prefer-string-slice
        fileName || url.substring(url.lastIndexOf('/') + 1, url.length);
    }

    if (document.createEvent) {
      const e = document.createEvent('MouseEvents');
      e.initEvent('click', true, true);
      link.dispatchEvent(e);
      return true;
    }
  }
  if (!url.includes('?')) {
    url += '?download';
  }

  openWindow(url, { target });
  return true;
}
