export interface ESPTouchDevice {
  bssid: string;
  ipAddress: string;
}

export interface ESPTouchResult {
  success: boolean;
  devices: ESPTouchDevice[];
  deviceCount: number;
  message: string;
}

export type DeviceFoundEventPayload = {
  device: ESPTouchDevice;
};

export type TaskCompleteEventPayload = ESPTouchResult;

export type ErrorEventPayload = {
  error: string;
};

export type RnExpoEspTouchModuleEvents = {
  onDeviceFound: (params: DeviceFoundEventPayload) => void;
  onTaskComplete: (params: TaskCompleteEventPayload) => void;
  onError: (params: ErrorEventPayload) => void;
};