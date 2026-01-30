// components/filter/FilterModal.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { pallette } from '../../helpers/colors';
import { regular, medium, semibold, bold } from '../../helpers/fonts';
import LocationDropdown from './LocationDropdown';
import FilterSection from './FilterSection';


const CATEGORIES = ['BUSINESS', 'POLITICS', 'TECHNOLOGY', 'SPORTS', 'ENTERTAINMENT', 'HEALTH', 'SCIENCE', 'ENVIRONMENT', 'EDUCATION'];
const NEWS_TYPES = ['LOCAL', 'NATIONAL', 'INTERNATIONAL'];
const PRIORITIES = ['BREAKING', 'FLASH', 'NORMAL'];

const FilterModal = React.memo(({ 
  showFilterModal, 
  setShowFilterModal, 
  selectedCategory, 
  setSelectedCategory, 
  selectedNewsType, 
  setSelectedNewsType, 
  selectedPriority, 
  setSelectedPriority, 
  selectedLocation,
  setSelectedLocation,
  locations,
  clearFilters, 
  applyFilters 
}) => {
  const modalContentRef = useRef(null);

 const handleOverlayPress = (event) => {
  if (!modalContentRef.current || !modalContentRef.current.measure) {
    return;
  }
  
  modalContentRef.current.measure((fx, fy, width, height, px, py) => {
    if (event.nativeEvent.pageY < py) {
      setShowFilterModal(false);
    }
  });
};
  return (
    <Modal
      visible={showFilterModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={handleOverlayPress}
      >
        <View 
          ref={modalContentRef}
          style={styles.modalContent}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter News</Text>
            <TouchableOpacity 
              onPress={() => setShowFilterModal(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="xmark" size={20} color={pallette.black} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterOptions}>
            {/* Location Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Location</Text>
              <LocationDropdown
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                locations={locations}
              />
            </View>

            {/* Category Filter */}
            <FilterSection
              label="Category"
              items={CATEGORIES}
              selectedItem={selectedCategory}
              onSelect={setSelectedCategory}
            />

            {/* News Type Filter */}
            <FilterSection
              label="News Type"
              items={NEWS_TYPES}
              selectedItem={selectedNewsType}
              onSelect={setSelectedNewsType}
            />

            {/* Priority Filter */}
            <FilterSection
              label="Priority"
              items={PRIORITIES}
              selectedItem={selectedPriority}
              onSelect={setSelectedPriority}
            />
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.clearButton]}
              onPress={clearFilters}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.applyButton]}
              onPress={applyFilters}
              activeOpacity={0.7}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(66, 60, 60, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: pallette.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: bold,
    color: pallette.black,
  },
  filterOptions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontFamily: medium,
    color: pallette.black,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: pallette.lightgrey,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: pallette.lightgrey,
  },
  applyButton: {
    backgroundColor: pallette.primary,
  },
  clearButtonText: {
    color: pallette.darkgrey,
    fontSize: 16,
    fontFamily: medium,
  },
  applyButtonText: {
    color: pallette.white,
    fontSize: 16,
    fontFamily: medium,
  },
});

export default FilterModal;