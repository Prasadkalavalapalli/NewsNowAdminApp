// components/filter/FilterSection.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { pallette } from '../../helpers/colors';
import { semibold } from '../../helpers/fonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FilterSection = ({ label, items, selectedItem, onSelect }) => {
  return (
    <View style={styles.filterSection}>
      <Text style={styles.filterLabel}>{label}</Text>
      <View style={styles.filterButtons}>
        {items.map(item => (
          <TouchableOpacity
            key={item}
            style={[
              styles.filterButton,
              selectedItem === item && styles.filterButtonActive
            ]}
            onPress={() => onSelect(selectedItem === item ? '' : item)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.filterButtonText,
              selectedItem === item && styles.filterButtonTextActive
            ]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontFamily: 'medium',
    color: pallette.black,
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  filterButton: {
    width: (SCREEN_WIDTH - 60) / 3,
    paddingVertical: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: pallette.lightgrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: pallette.primary,
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: semibold,
    color: pallette.darkgrey,
  },
  filterButtonTextActive: {
    color: pallette.white,
  },
});

export default FilterSection;