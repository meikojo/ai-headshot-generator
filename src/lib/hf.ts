import axios from 'axios';
import http from 'http';
import https from 'https';
import dns from 'dns';

export interface HfSuccessResponse {
  ok: true;
  status: number;
  headers: Headers;
  arrayBuffer: () => Promise<ArrayBuffer>;
  text: () => Promise<string>;
}

export interface HfErrorResponse {
  ok: false;
  status: number;
  headers?: undefined;
  arrayBuffer?: undefined;
  text: () => Promise<string>;
}

export type HfResponse = HfSuccessResponse | HfErrorResponse;

// Force IPv4 DNS resolution to bypass Vercel/AWS IPv6 ENOTFOUND bugs
const lookup = (hostname: string, options: dns.LookupOptions, callback: (err: NodeJS.ErrnoException | null, address: string, family: number) => void) => {
  dns.lookup(hostname, { family: 4 }, (err, address, family) => {
    callback(err, address as any, family);
  });
};

const httpAgent = new http.Agent({ lookup });
const httpsAgent = new https.Agent({ lookup });

/**
 * A robust fetcher for Hugging Face APIs that bypasses Next.js 14 / Node 18
 * fetch() IPv6 DNS resolution bugs on Vercel by using Axios (which uses standard http/https).
 */
export async function hfFetch(url: string, options: { method?: string, headers?: Record<string, string>, body?: any }): Promise<HfResponse> {
  try {
    const response = await axios({
      method: options.method || 'GET',
      url,
      headers: options.headers,
      data: options.body,
      responseType: 'arraybuffer',
      // Disable timeout to let Vercel handle it
      timeout: 0,
      httpAgent,
      httpsAgent,
    });
    
    return {
      ok: true,
      status: response.status,
      headers: new Headers(response.headers as any),
      arrayBuffer: async () => response.data,
      text: async () => Buffer.from(response.data).toString('utf-8')
    };
  } catch (error: any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return {
        ok: false,
        status: error.response.status,
        headers: undefined,
        arrayBuffer: undefined,
        text: async () => Buffer.from(error.response.data).toString('utf-8')
      };
    }
    // Network errors (ENOTFOUND, ECONNRESET, etc)
    throw error;
  }
}

