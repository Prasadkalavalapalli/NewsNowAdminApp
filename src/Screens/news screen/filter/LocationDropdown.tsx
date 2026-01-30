// components/filter/LocationDropdown.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { pallette } from '../../helpers/colors';
import { regular, medium } from '../../helpers/fonts';

const LocationDropdown = ({
  selectedLocation,
  setSelectedLocation,
  locations
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [filteredLocations, setFilteredLocations] = useState([]);

  useEffect(() => {
    if (locations) {
      setFilteredLocations(locations);
    }
  }, [locations]);

  const handleLocationSearch = (text) => {
    setLocationSearch(text);
    if (text.trim() === '') {
      setFilteredLocations(locations);
    } else {
      const filtered = locations.filter(location =>
        location.name.toLowerCase().includes(text.toLowerCase()) ||
        location.code.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  };

  const handleSelectLocation = (location) => {
    setSelectedLocation(location.name);
    setShowDropdown(false);
    setLocationSearch('');
    setFilteredLocations(locations);
  };

  const handleClearLocation = () => {
    setSelectedLocation('');
    setLocationSearch('');
    setFilteredLocations(locations);
  };

  const getSelectedLocationName = () => {
    if (!selectedLocation) return '';
    const location = locations.find(loc => loc.name === selectedLocation);
    return location ? `${location.name} (${location.code})` : '';
  };

  return (
    <>
      <TouchableOpacity
        style={styles.locationDropdownButton}
        onPress={() => setShowDropdown(!showDropdown)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.locationDropdownText,
          selectedLocation && styles.locationSelectedText
        ]}>
          {selectedLocation ? getSelectedLocationName() : 'Select Location'}
        </Text>
        <Icon 
          name={showDropdown ? "chevron-up" : "chevron-down"} 
          size={16} 
          color={pallette.darkgrey} 
        />
      </TouchableOpacity>
      
      {showDropdown && (
        <View style={styles.locationDropdown}>
          {/* Search Input */}
          <View style={styles.locationSearchContainer}>
            <Icon name="magnifying-glass" size={16} color={pallette.grey} />
            <TextInput
              style={styles.locationSearchInput}
              placeholder="Search locations..."
              value={locationSearch}
              onChangeText={handleLocationSearch}
              placeholderTextColor={pallette.grey}
            />
            {locationSearch.length > 0 && (
              <TouchableOpacity onPress={() => setLocationSearch('')}>
                <Icon name="xmark" size={14} color={pallette.grey} />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Location List */}
          <ScrollView style={styles.locationList} nestedScrollEnabled>
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location) => (
                <TouchableOpacity
                  key={location.id}
                  style={[
                    styles.locationItem,
                    selectedLocation === location.name && styles.locationItemSelected
                  ]}
                  onPress={() => handleSelectLocation(location)}
                  activeOpacity={0.6}
                >
                  <View style={styles.locationItemContent}>
                    <Text style={[
                      styles.locationItemName,
                      selectedLocation === location.name && styles.locationItemNameSelected
                    ]}>
                      {location.name}
                    </Text>
                    <Text style={[
                      styles.locationItemCode,
                      selectedLocation === location.name&& styles.locationItemCodeSelected
                    ]}>
                      {location.code}
                    </Text>
                  </View>
                  {selectedLocation === location.name && (
                    <Icon name="check" size={16} color={pallette.primary} />
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noLocationContainer}>
                <Icon name="location-crosshairs" size={24} color={pallette.grey} />
                <Text style={styles.noLocationText}>No locations found</Text>
              </View>
            )}
          </ScrollView>
          
          {/* Clear Selection Button */}
          {selectedLocation && (
            <TouchableOpacity
              style={styles.clearLocationButton}
              onPress={handleClearLocation}
              activeOpacity={0.7}
            >
              <Icon name="xmark" size={14} color={pallette.white} />
              <Text style={styles.clearLocationText}>Clear Selection</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  locationDropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: pallette.lightgrey,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: pallette.lightgrey,
  },
  locationDropdownText: {
    fontSize: 14,
    fontFamily: regular,
    color: pallette.grey,
  },
  locationSelectedText: {
    color: pallette.black,
    fontFamily: medium,
  },
  locationDropdown: {
    marginTop: 8,
    backgroundColor: pallette.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: pallette.lightgrey,
    maxHeight: 300,
  },
  locationSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  locationSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontFamily: regular,
    color: pallette.black,
  },
  locationList: {
    maxHeight: 200,
  },
  locationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  locationItemSelected: {
    backgroundColor: 'rgba(75, 85, 99, 0.1)',
  },
  locationItemContent: {
    flex: 1,
  },
  locationItemName: {
    fontSize: 14,
    fontFamily: medium,
    color: pallette.black,
  },
  locationItemNameSelected: {
    color: pallette.primary,
  },
  locationItemCode: {
    fontSize: 12,
    fontFamily: regular,
    color: pallette.grey,
    marginTop: 2,
  },
  locationItemCodeSelected: {
    color: pallette.primary,
  },
  noLocationContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noLocationText: {
    fontSize: 14,
    fontFamily: medium,
    color: pallette.grey,
    marginTop: 8,
  },
  clearLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pallette.red,
    paddingVertical: 10,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    gap: 6,
  },
  clearLocationText: {
    color: pallette.white,
    fontSize: 14,
    fontFamily: medium,
  },
});

export default LocationDropdown;