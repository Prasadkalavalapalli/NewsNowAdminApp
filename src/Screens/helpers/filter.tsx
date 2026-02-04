// components/DateRangeFilter.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { pallette } from '../helpers/colors';
import { medium, bold } from '../helpers/fonts';

interface DateRangeFilterProps {
  onFilterChange: (filter: {
    filter: string;
    startDate?: string | null;
    endDate?: string | null;
  }) => void;
  loading?: boolean;
  showLabel?: boolean;
  buttonStyle?: any;
  buttonText?: string;
  initialFilter?: string;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  onFilterChange,
  loading = false,
  showLabel = true,
  buttonStyle,
  buttonText = 'Filter',
  initialFilter = 'all',
}) => {
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(initialFilter);
  const [showDateInput, setShowDateInput] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filterOptions = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: '7days', label: 'Last 7 Days' },
    { id: '30days', label: 'Last 30 Days' },
    { id: 'custom', label: 'Custom ' },
  ];

  const calculateDate = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
  };

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleFilterSelect = (filterId: string) => {
    if (loading) return;
    
    setSelectedFilter(filterId);
    let start = null;
    const end = new Date().toISOString();
    
    switch (filterId) {
      case 'today':
        start = calculateDate(0);
        break;
      case '7days':
        start = calculateDate(7);
        break;
      case '30days':
        start = calculateDate(30);
        break;
      case 'custom':
        setShowDateInput(true);
        return;
      case 'all':
      default:
        // No date filter for 'all'
        break;
    }
    
    applyFilter(filterId, start, filterId === 'all' ? null : end);
  };

  const applyFilter = (filter: string, start: string | null, end: string | null) => {
    onFilterChange({
      filter,
      startDate: start,
      endDate: end,
    });
    console.log()
    setShowFilter(false);
    setShowDateInput(false);
  };

  const handleCustomDateApply = () => {
    if (startDate && endDate) {
      try {
        const start = new Date(startDate).toISOString();
        const end = new Date(endDate).toISOString();
        applyFilter('custom', start, end);
      } catch (error) {
        console.error('Invalid date format:', error);
      }
    }
  };

  const getActiveFilterLabel = () => {
    const activeFilter = filterOptions.find(opt => opt.id === selectedFilter);
    return activeFilter?.label || 'Filter';
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.filterButton, buttonStyle]}
        onPress={() => setShowFilter(true)}
        disabled={loading}
      >
        {/* <Icon name="filter" size={16} color={pallette.white} /> */}
        <Text style={styles.filterButtonText}>
          {showLabel ? `${buttonText}: ${getActiveFilterLabel()}` : buttonText}
        </Text>
        <Icon name="chevron-down" size={12} color={pallette.white} />
      </TouchableOpacity>

      <Modal
        visible={showFilter}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowFilter(false);
          setShowDateInput(false);
        }}
      >
        <TouchableWithoutFeedback onPress={() => {
          setShowFilter(false);
          setShowDateInput(false);
        }}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <ScrollView 
                style={styles.modalContent}
                contentContainerStyle={styles.modalScrollContent}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Date Filter</Text>
                  <TouchableOpacity 
                    onPress={() => {
                      setShowFilter(false);
                      setShowDateInput(false);
                    }}
                  >
                    <Icon name="xmark" size={20} color={pallette.black} />
                  </TouchableOpacity>
                </View>

                {!showDateInput ? (
                  <>
                    <Text style={styles.sectionTitle}>Select Time Range</Text>
                    {filterOptions.map((option) => (
                      <TouchableOpacity
                        key={option.id}
                        style={[
                          styles.filterOption,
                          selectedFilter === option.id && styles.filterOptionActive,
                        ]}
                        onPress={() => handleFilterSelect(option.id)}
                        disabled={loading}
                      >
                        <Text
                          style={[
                            styles.filterOptionText,
                            selectedFilter === option.id && styles.filterOptionTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                        {selectedFilter === option.id && (
                          <Icon name="check" size={16} color={pallette.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </>
                ) : (
                  <View style={styles.customDateSection}>
                    <Text style={styles.sectionTitle}>Enter Custom Date Range</Text>
                    
                    <View style={styles.dateInputGroup}>
                      <Text style={styles.dateLabel}>Start Date</Text>
                      <View style={styles.dateInputWrapper}>
                        <Icon name="calendar" size={18} color={pallette.primary} />
                        <TextInput
                          style={styles.dateInput}
                          value={startDate}
                          onChangeText={setStartDate}
                          placeholder="YYYY-MM-DD"
                          placeholderTextColor={pallette.grey}
                          editable={!loading}
                          keyboardType="numbers-and-punctuation"
                        />
                      </View>
                      {startDate && (
                        <Text style={styles.dateHint}>
                          Display: {formatDateForDisplay(startDate)}
                        </Text>
                      )}
                    </View>

                    <View style={styles.dateInputGroup}>
                      <Text style={styles.dateLabel}>End Date</Text>
                      <View style={styles.dateInputWrapper}>
                        <Icon name="calendar" size={18} color={pallette.primary} />
                        <TextInput
                          style={styles.dateInput}
                          value={endDate}
                          onChangeText={setEndDate}
                          placeholder="YYYY-MM-DD"
                          placeholderTextColor={pallette.grey}
                          editable={!loading}
                          keyboardType="numbers-and-punctuation"
                        />
                      </View>
                      {endDate && (
                        <Text style={styles.dateHint}>
                          Display: {formatDateForDisplay(endDate)}
                        </Text>
                      )}
                    </View>

                    <View style={styles.customActionButtons}>
                      <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => setShowDateInput(false)}
                        disabled={loading}
                      >
                        <Text style={styles.secondaryButtonText}>← Back</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.primaryButton,
                          (!startDate || !endDate) && styles.disabledButton,
                        ]}
                        onPress={handleCustomDateApply}
                        disabled={loading || !startDate || !endDate}
                      >
                        <Text style={styles.primaryButtonText}>Apply Filter</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </ScrollView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: pallette.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  filterButtonText: {
    color: pallette.white,
    fontSize: 14,
    fontFamily: medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: pallette.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalScrollContent: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: bold,
    color: pallette.black,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: medium,
    color: pallette.grey,
    marginBottom: 16,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: pallette.lightgrey,
    borderRadius: 8,
    marginBottom: 8,
  },
  filterOptionActive: {
    backgroundColor: `${pallette.primary}15`,
    borderWidth: 1,
    borderColor: pallette.primary,
  },
  filterOptionText: {
    fontSize: 15,
    fontFamily: medium,
    color: pallette.black,
  },
  filterOptionTextActive: {
    color: pallette.primary,
    fontFamily: bold,
  },
  customDateSection: {
    paddingTop: 10,
  },
  dateInputGroup: {
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 14,
    fontFamily: medium,
    color: pallette.grey,
    marginBottom: 8,
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: pallette.lightgrey,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 12,
  },
  dateInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: medium,
    color: pallette.black,
    padding: 0,
  },
  dateHint: {
    fontSize: 12,
    fontFamily: medium,
    color: pallette.grey,
    marginTop: 4,
    marginLeft: 4,
  },
  customActionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: pallette.lightgrey,
  },
  secondaryButtonText: {
    color: pallette.grey,
    fontSize: 16,
    fontFamily: medium,
  },
  primaryButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: pallette.primary,
  },
  primaryButtonText: {
    color: pallette.white,
    fontSize: 16,
    fontFamily: medium,
  },
  disabledButton: {
    backgroundColor: `${pallette.primary}50`,
  },
});

export default DateRangeFilter;