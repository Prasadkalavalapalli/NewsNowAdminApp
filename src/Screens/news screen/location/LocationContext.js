// import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
// import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
// import Geolocation from 'react-native-geolocation-service';

// const LocationContext = createContext();

// export const useLocation = () => {
//   const context = useContext(LocationContext);
//   if (!context) {
//     throw new Error('useLocation must be used within a LocationProvider');
//   }
//   return context;
// };

// export const LocationProvider = ({ children }) => {
//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [displayLocation, setDisplayLocation] = useState('Fetching...');
//   const [fullLocation, setFullLocation] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [permissionGranted, setPermissionGranted] = useState(false);
  
//   const isMounted = useRef(true);

//   useEffect(() => {
//     isMounted.current = true;
//     requestLocationPermission();
    
//     return () => {
//       isMounted.current = false;
//     };
//   }, []);

//   const requestLocationPermission = async () => {
//     try {
//       let granted = false;
      
//       if (Platform.OS === 'android') {
//         const result = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//           {
//             title: 'Location Permission',
//             message: 'This app needs access to your location to show nearby charging stations',
//             buttonNeutral: 'Ask Me Later',
//             buttonNegative: 'Cancel',
//             buttonPositive: 'OK',
//           }
//         );
//         granted = result === PermissionsAndroid.RESULTS.GRANTED;
//       } else {
//         // iOS specific permission
//         const auth = await Geolocation.requestAuthorization('whenInUse');
//         granted = auth === 'granted' || auth === 'restricted';
//       }

//       if (isMounted.current) {
//         setPermissionGranted(granted);
        
//         if (granted) {
//           await getCurrentLocation();
//         } else {
//           setError('Location permission denied');
//           setDisplayLocation('Permission denied');
//           setLoading(false);
          
//           // Show guidance on how to enable location
//           if (Platform.OS === 'ios') {
//             Alert.alert(
//               'Location Access Required',
//               'Please enable location services in Settings to use this feature.',
//               [
//                 { text: 'Cancel', style: 'cancel' },
//                 { text: 'Open Settings', onPress: () => Linking.openSettings() }
//               ]
//             );
//           }
//         }
//       }
      
//       return granted;
//     } catch (err) {
//       console.warn('Location permission error:', err);
//       if (isMounted.current) {
//         setError('Permission request failed');
//         setDisplayLocation('Error');
//         setLoading(false);
//       }
//       return false;
//     }
//   };

//   const getCurrentLocation = () => {
//     if (!isMounted.current) return Promise.resolve(null);
    
//     setLoading(true);
//     setError(null);

//     return new Promise((resolve, reject) => {
//       Geolocation.getCurrentPosition(
//         async (position) => {
//           try {
//             if (!isMounted.current) {
//               reject(new Error('Component unmounted'));
//               return;
//             }

//             const { latitude, longitude } = position.coords;
//             const locationData = { 
//               latitude, 
//               longitude, 
//               accuracy: position.coords.accuracy,
//               timestamp: position.timestamp 
//             };
            
//             setCurrentLocation(locationData);
//             await reverseGeocode(latitude, longitude);
//             setLoading(false);
//             resolve(locationData);
//           } catch (error) {
//             console.warn('Geolocation processing error:', error);
//             if (isMounted.current) {
//               setError('Failed to process location');
//               setDisplayLocation('Processing error');
//               setLoading(false);
//             }
//             reject(error);
//           }
//         },
//         (error) => {
//           console.warn('Geolocation error:', error.code, error.message);
          
//           let errorMsg = 'Location service unavailable';
//           switch (error.code) {
//             case 1: // PERMISSION_DENIED
//               errorMsg = 'Location permission denied';
//               break;
//             case 2: // POSITION_UNAVAILABLE
//               errorMsg = 'Location information unavailable';
//               break;
//             case 3: // TIMEOUT
//               errorMsg = 'Location request timeout';
//               break;
//             default:
//               errorMsg = 'Failed to get location';
//           }
          
//           if (isMounted.current) {
//             setError(errorMsg);
//             setDisplayLocation('Unavailable');
//             setLoading(false);
//           }
//           reject(error);
//         },
//         {
//           enableHighAccuracy: true,
//           timeout: 15000,
//           maximumAge: 10000,
//           distanceFilter: 10,
//           forceRequestLocation: true,
//           showLocationDialog: true,
//         }
//       );
//     });
//   };

//   const reverseGeocode = async (latitude, longitude) => {
//     try {
//       const response = await fetch(
//         `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=18`,
//         { 
//           headers: { 
//             'User-Agent': 'EVYA-App/1.0 prasadkalavalaplli70@gmail.com',
//             'Accept': 'application/json'
//           } 
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Geocoding API error: ${response.status}`);
//       }

//       const data = await response.json();
      
//       if (!data || !data.address) {
//         // Fallback to coordinates if no address found
//         setDisplayLocation('Current Location');
//         setFullLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
//         return;
//       }

//       const address = data.address;
//       const area = address.neighbourhood || address.suburb || address.city_district || '';
//       const building = address.building || address.amenity || address.landuse || '';
//       const city = address.city || address.town || address.village || address.county || '';
//       const state = address.state || address.region || '';
//       const country = address.country || '';
//       const road = address.road || address.footway || address.path || '';
//       const houseNumber = address.house_number || '';

//       // Create display location (short version)
//       let displayLoc = '';
//       if (area) displayLoc = area;
//       else if (city) displayLoc = city;
//       else if (state) displayLoc = state;
//       else displayLoc = 'Current Location';

//       // Create full location (detailed version)
//       let fullLocParts = [];
//     //   if (building) fullLocParts.push(building);
//     //   if (houseNumber && road) {
//     //     fullLocParts.push(`${houseNumber} ${road}`);
//     //   } else if (road) {
//     //     fullLocParts.push(road);
//     //   }
//     //   if (area && area !== displayLoc) fullLocParts.push(area);
//       if (city && city !== displayLoc) fullLocParts.push(city);
//     //   if (state) fullLocParts.push(state);
//     //   if (country) fullLocParts.push(country);

//       const fullLocText = fullLocParts.length > 0 
//         ? fullLocParts.join(', ') 
//         : displayLoc;

//       if (isMounted.current) {
//         setDisplayLocation(displayLoc);
//         setFullLocation(fullLocText);
//       }
//     } catch (error) {
//       console.warn('Geocoding error:', error);
//       if (isMounted.current) {
//         // Fallback to coordinates
//         setDisplayLocation('Current Location');
//         setFullLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
//       }
//     }
//   };

//   const refreshLocation = async () => {
//     if (!permissionGranted) {
//       const granted = await requestLocationPermission();
//       if (!granted) return null;
//     }
    
//     try {
//       const location = await getCurrentLocation();
//       return location;
//     } catch (error) {
//       console.warn('Refresh location failed:', error);
//       return null;
//     }
//   };

//   const getLocationForNews = () => {
//     // Return the most relevant location string for news filtering
//     if (fullLocation && fullLocation !== 'Fetching...' && fullLocation !== 'Permission denied') {
//       return fullLocation;
//     }
//     if (displayLocation && displayLocation !== 'Fetching...' && displayLocation !== 'Permission denied') {
//       return displayLocation;
//     }
//     return '';
//   };

//   const value = {
//     currentLocation,
//     displayLocation,
//     fullLocation,
//     loading,
//     error,
//     permissionGranted,
//     refreshLocation,
//     requestLocationPermission,
//     getLocationForNews, // New helper function
//   };

//   return (
//     <LocationContext.Provider value={value}>
//       {children}
//     </LocationContext.Provider>
//   );
// };