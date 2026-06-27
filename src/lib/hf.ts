import axios from 'axios';

/**
 * A robust fetcher for Hugging Face APIs that bypasses Next.js 14 / Node 18
 * fetch() IPv6 DNS resolution bugs on Vercel by using Axios (which uses standard http/https).
 */
export async function hfFetch(url: string, options: { method?: string, headers?: Record<string, string>, body?: any }) {
  try {
    const response = await axios({
      method: options.method || 'GET',
      url,
      headers: options.headers,
      data: options.body,
      responseType: 'arraybuffer',
      // Disable timeout to let Vercel handle it
      timeout: 0,
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
        text: async () => Buffer.from(error.response.data).toString('utf-8')
      };
    }
    // Network errors (ENOTFOUND, ECONNRESET, etc)
    throw error;
  }
}
