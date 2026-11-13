/** Google Photos Picker wrapper contract (OMX-003a AC6: single, stubbable module). */

export type GoogleErrorCode =
  'notConfigured' | 'denied' | 'network' | 'misconfigured' | 'timeout' | 'popupBlocked';

export class GoogleError extends Error {
  constructor(
    public readonly code: GoogleErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'GoogleError';
  }
}

export interface PickerSession {
  id: string;
  pickerUri: string;
  /** Milliseconds between polls (from pollingConfig.pollInterval). */
  pollIntervalMs: number;
  /** Absolute epoch ms when the session times out (from pollingConfig.timeoutIn). */
  expiresAt: number;
  mediaItemsSet: boolean;
}

export interface PickedItem {
  id: string;
  type: 'PHOTO' | 'VIDEO' | 'TYPE_UNSPECIFIED';
  baseUrl: string;
  mimeType: string;
  filename: string;
}

export interface GooglePhotosApi {
  isConfigured(): boolean;
  /** Load GIS + request an access token. Must be called from a user gesture. */
  authorize(): Promise<void>;
  createSession(): Promise<PickerSession>;
  getSession(id: string): Promise<PickerSession>;
  listItems(sessionId: string): Promise<PickedItem[]>;
  download(item: PickedItem): Promise<Blob>;
  deleteSession(id: string): Promise<void>;
  /** Forget the in-memory token (tokens are never persisted — OMX-031 AC4). */
  signOut(): void;
}
