import { EventSubscription } from 'expo-modules-core';
import RnExpoEspTouchModule from './src/RnExpoEspTouchModule';
import type { 
  ESPTouchDevice, 
  ESPTouchResult, 
  DeviceFoundEventPayload, 
  TaskCompleteEventPayload, 
  ErrorEventPayload 
} from './src/RnExpoEspTouch.types';

export interface ESPTouchConfig {
  ssid: string;
  password: string;
  bssid?: string;
  taskCount?: number;
}

export type { ESPTouchDevice, ESPTouchResult };

export type ESPTouchDeviceFoundEvent = DeviceFoundEventPayload;
export type ESPTouchCompleteEvent = TaskCompleteEventPayload;
export type ESPTouchErrorEvent = ErrorEventPayload;

/**
 * Start ESP Touch provisioning process
 */
export async function startProvisioning(config: ESPTouchConfig): Promise<ESPTouchResult> {
  if (!config.ssid || !config.password) {
    throw new Error('SSID and password are required');
  }
  
  return await RnExpoEspTouchModule.startProvisioning(config);
}

/**
 * Stop ongoing ESP Touch provisioning
 */
export function stopProvisioning(): void {
  return RnExpoEspTouchModule.stopProvisioning();
}

/**
 * Check if ESP Touch task is currently running
 */
export function isTaskRunning(): boolean {
  return RnExpoEspTouchModule.isTaskRunning();
}

/**
 * Check if ESP Touch is supported on this device
 */
export function isSupported(): boolean {
  return RnExpoEspTouchModule.isSupported();
}

/**
 * Listen for device found events during provisioning
 */
export function addDeviceFoundListener(
  listener: (event: ESPTouchDeviceFoundEvent) => void
): EventSubscription {
  return RnExpoEspTouchModule.addListener('onDeviceFound', listener);
}

/**
 * Listen for task completion events
 */
export function addTaskCompleteListener(
  listener: (event: ESPTouchCompleteEvent) => void
): EventSubscription {
  return RnExpoEspTouchModule.addListener('onTaskComplete', listener);
}

/**
 * Listen for error events
 */
export function addErrorListener(
  listener: (event: ESPTouchErrorEvent) => void
): EventSubscription {
  return RnExpoEspTouchModule.addListener('onError', listener);
}