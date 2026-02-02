import React, { createContext, useContext, useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

const LocationContext = createContext(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used inside LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    requestPermissionAndFetchLocation();
  }, []);

  const requestPermissionAndFetchLocation = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setError('Location permission denied');
          setLoading(false);
          return;
        }
      }

      fetchLocation();
    } catch (e) {
      setError('Permission error');
      setLoading(false);
    }
  };

  const fetchLocation = () => {
    setLoading(true);

    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ latitude, longitude });
        setLoading(false);
      },
      err => {
        setError(err.message || 'Location error');
        setLoading(false);
      },
      {
        enableHighAccuracy: false, // IMPORTANT: crash-safe
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  return (
    <LocationContext.Provider
      value={{
        coordinates,
        loading,
        error,
        refreshLocation: fetchLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
