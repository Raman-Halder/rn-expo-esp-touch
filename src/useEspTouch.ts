import { useEffect, useState, useCallback } from 'react';
import { EventSubscription } from 'expo-modules-core';
import * as ESPTouch from '../index';

export interface UseESPTouchResult {
  isRunning: boolean;
  devices: ESPTouch.ESPTouchDevice[];
  logs: string[];
  startProvisioning: (config: ESPTouch.ESPTouchConfig) => Promise<ESPTouch.ESPTouchResult>;
  stopProvisioning: () => void;
  clearDevices: () => void;
  clearLogs: () => void;
}

export function useESPTouch(): UseESPTouchResult {
  const [isRunning, setIsRunning] = useState(false);
  const [devices, setDevices] = useState<ESPTouch.ESPTouchDevice[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  }, []);

  useEffect(() => {
    const subscriptions: EventSubscription[] = [];

    // Device found listener
    subscriptions.push(
      ESPTouch.addDeviceFoundListener(({ device }) => {
        addLog(`Device found: ${device.ipAddress} (${device.bssid})`);
        setDevices(prev => {
          // Avoid duplicates
          const exists = prev.some(d => d.bssid === device.bssid);
          return exists ? prev : [...prev, device];
        });
      })
    );

    // Task complete listener
    subscriptions.push(
      ESPTouch.addTaskCompleteListener((result) => {
        addLog(`Task complete: ${result.message}`);
        setIsRunning(false);
      })
    );

    // Error listener
    subscriptions.push(
      ESPTouch.addErrorListener(({ error }) => {
        addLog(`Error: ${error}`);
        setIsRunning(false);
      })
    );

    return () => {
      subscriptions.forEach(sub => sub.remove());
    };
  }, [addLog]);

  const startProvisioning = useCallback(async (config: ESPTouch.ESPTouchConfig) => {
    if (isRunning) {
      throw new Error('ESP Touch task is already running');
    }

    if (!ESPTouch.isSupported()) {
      throw new Error('ESP Touch is not supported on this device');
    }

    setIsRunning(true);
    setDevices([]);
    addLog(`Starting ESP Touch for "${config.ssid}"`);

    try {
      const result = await ESPTouch.startProvisioning(config);
      addLog(`Provisioning result: ${result.success ? 'Success' : 'Failed'}`);
      return result;
    } catch (error: any) {
      addLog(`Exception: ${error.message}`);
      setIsRunning(false);
      throw error;
    }
  }, [isRunning, addLog]);

  const stopProvisioning = useCallback(() => {
    if (isRunning) {
      ESPTouch.stopProvisioning();
      setIsRunning(false);
      addLog('Provisioning stopped by user');
    }
  }, [isRunning, addLog]);

  const clearDevices = useCallback(() => {
    setDevices([]);
    addLog('Devices cleared');
  }, [addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    isRunning,
    devices,
    logs,
    startProvisioning,
    stopProvisioning,
    clearDevices,
    clearLogs,
  };
}