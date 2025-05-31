import { NativeModule, requireNativeModule } from 'expo';

import { RnExpoEspTouchModuleEvents } from './RnExpoEspTouch.types';

export interface ESPTouchConfig {
  ssid: string;
  password: string;
  bssid?: string;
  taskCount?: number;
}

export interface ESPTouchResult {
  success: boolean;
  devices: Array<{
    bssid: string;
    ipAddress: string;
  }>;
  deviceCount: number;
  message: string;
}

declare class RnExpoEspTouchModule extends NativeModule<RnExpoEspTouchModuleEvents> {
  startProvisioning(config: ESPTouchConfig): Promise<ESPTouchResult>;
  stopProvisioning(): void;
  isTaskRunning(): boolean;
  isSupported(): boolean;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<RnExpoEspTouchModule>('RnExpoEspTouch');