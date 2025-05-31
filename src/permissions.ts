import { Platform } from 'react-native';
import * as Location from 'expo-location';

export async function requestESPTouchPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      // Request location permission (required for WiFi info on Android)
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('Location permission denied. ESP Touch may not work properly.');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to request permissions:', error);
      return false;
    }
  }

  // iOS doesn't require runtime permission requests for ESP Touch
  return true;
}

export async function checkESPTouchPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to check permissions:', error);
      return false;
    }
  }

  // iOS permissions are handled via Info.plist
  return true;
}