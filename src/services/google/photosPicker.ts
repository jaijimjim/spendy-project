/**
 * Google Photos Picker API + Google Identity Services token client (OMX-003a/b, OMX-004).
 *
 * Flow: authorize() (GIS popup, scope photospicker.mediaitems.readonly) → createSession()
 * → open session.pickerUri in a new tab → poll getSession() until mediaItemsSet → listItems()
 * → download(baseUrl + "=d" with Bearer token) → deleteSession().
 *
 * The access token lives in this closure only (memory) — never in Web Storage.
 */
import { GoogleError, type GooglePhotosApi, type PickedItem, type PickerSession } from './types';

export const PICKER_SCOPE = 'https://www.googleapis.com/auth/photospicker.mediaitems.readonly';
const GIS_SRC = 'https://accounts.google.com/gsi/client';
const API = 'https://photospicker.googleapis.com/v1';

interface TokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}
interface TokenClient {
  requestAccessToken(overrides?: { prompt?: string }): void;
}
interface GoogleAccounts {
  oauth2: {
    initTokenClient(cfg: {
      client_id: string;
      scope: string;
      callback: (r: TokenResponse) => void;
      error_callback?: (e: { type: string; message?: string }) => void;
    }): TokenClient;
  };
}
declare global {
  interface Window {
    google?: { accounts: GoogleAccounts };
  }
}

/** "5s" / "1.5s" (protobuf Duration JSON) → ms */
export function parseDuration(d: string | undefined, fallbackMs: number): number {
  const m = d ? /^([\d.]+)s$/.exec(d) : null;
  return m ? Math.round(parseFloat(m[1]!) * 1000) : fallbackMs;
}

let gisPromise: Promise<GoogleAccounts> | null = null;

function loadGis(): Promise<GoogleAccounts> {
  if (window.google?.accounts) return Promise.resolve(window.google.accounts);
  if (!gisPromise) {
    gisPromise = new Promise<GoogleAccounts>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = GIS_SRC;
      s.async = true;
      const timer = window.setTimeout(
        () => reject(new GoogleError('network', 'GIS load timeout')),
        15000,
      );
      s.onload = () => {
        window.clearTimeout(timer);
        if (window.google?.accounts) resolve(window.google.accounts);
        else reject(new GoogleError('network', 'GIS missing after load'));
      };
      s.onerror = () => {
        window.clearTimeout(timer);
        reject(new GoogleError('network', 'GIS failed to load'));
      };
      document.head.appendChild(s);
    }).catch((e) => {
      gisPromise = null;
      throw e;
    });
  }
  return gisPromise;
}

function mapTokenError(code: string | undefined): GoogleError {
  if (!code) return new GoogleError('denied');
  if (/access_denied|popup_closed|user_cancel/i.test(code)) return new GoogleError('denied', code);
  if (/popup_failed_to_open/i.test(code)) return new GoogleError('popupBlocked', code);
  if (/origin|invalid_client|unauthorized_client|idpiframe|redirect_uri/i.test(code))
    return new GoogleError('misconfigured', code);
  return new GoogleError('denied', code);
}

function toSession(json: {
  id: string;
  pickerUri: string;
  mediaItemsSet?: boolean;
  pollingConfig?: { pollInterval?: string; timeoutIn?: string };
}): PickerSession {
  return {
    id: json.id,
    pickerUri: json.pickerUri,
    mediaItemsSet: !!json.mediaItemsSet,
    pollIntervalMs: Math.max(1000, parseDuration(json.pollingConfig?.pollInterval, 5000)),
    expiresAt: Date.now() + parseDuration(json.pollingConfig?.timeoutIn, 30 * 60 * 1000),
  };
}

export function createGooglePhotos(clientId: string | undefined): GooglePhotosApi {
  let token: { value: string; expiresAt: number } | null = null;

  async function authorizedFetch(url: string, init: RequestInit = {}): Promise<Response> {
    if (!token || token.expiresAt < Date.now() + 30_000)
      throw new GoogleError('denied', 'token expired');
    let res: Response;
    try {
      res = await fetch(url, {
        ...init,
        headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token.value}` },
        referrerPolicy: 'no-referrer',
      });
    } catch (e) {
      throw new GoogleError('network', String(e));
    }
    if (res.status === 401) {
      token = null;
      throw new GoogleError('denied', '401');
    }
    if (res.status === 403)
      throw new GoogleError('misconfigured', '403 — is the Photos Picker API enabled?');
    if (!res.ok) throw new GoogleError('network', `HTTP ${res.status}`);
    return res;
  }

  return {
    isConfigured: () => !!clientId,

    async authorize() {
      if (!clientId) throw new GoogleError('notConfigured');
      if (token && token.expiresAt > Date.now() + 60_000) return;
      const accounts = await loadGis();
      await new Promise<void>((resolve, reject) => {
        const client = accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: PICKER_SCOPE,
          callback: (r) => {
            if (r.error || !r.access_token) return reject(mapTokenError(r.error));
            token = {
              value: r.access_token,
              expiresAt: Date.now() + (r.expires_in ?? 3600) * 1000,
            };
            resolve();
          },
          error_callback: (e) => reject(mapTokenError(e.type)),
        });
        client.requestAccessToken({ prompt: token ? '' : undefined });
      });
    },

    async createSession() {
      const res = await authorizedFetch(`${API}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      return toSession(await res.json());
    },

    async getSession(id) {
      const res = await authorizedFetch(`${API}/sessions/${encodeURIComponent(id)}`);
      return toSession(await res.json());
    },

    async listItems(sessionId) {
      const items: PickedItem[] = [];
      let pageToken = '';
      do {
        const q = new URLSearchParams({ sessionId, pageSize: '100' });
        if (pageToken) q.set('pageToken', pageToken);
        const res = await authorizedFetch(`${API}/mediaItems?${q}`);
        const json = (await res.json()) as {
          mediaItems?: {
            id: string;
            type?: PickedItem['type'];
            mediaFile?: { baseUrl: string; mimeType: string; filename: string };
          }[];
          nextPageToken?: string;
        };
        for (const m of json.mediaItems ?? []) {
          if (!m.mediaFile) continue;
          items.push({
            id: m.id,
            type: m.type ?? 'TYPE_UNSPECIFIED',
            baseUrl: m.mediaFile.baseUrl,
            mimeType: m.mediaFile.mimeType,
            filename: m.mediaFile.filename,
          });
        }
        pageToken = json.nextPageToken ?? '';
      } while (pageToken);
      return items;
    },

    async download(item) {
      // "=d" downloads the original bytes (with metadata stripped of location by Google).
      const res = await authorizedFetch(`${item.baseUrl}=d`);
      return res.blob();
    },

    async deleteSession(id) {
      try {
        await authorizedFetch(`${API}/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' });
      } catch {
        /* best effort */
      }
    },

    signOut() {
      token = null;
    },
  };
}
