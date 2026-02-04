import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { pallette } from "../helpers/colors";
import { adjust } from "../../constants/dimensions";
import { regular, semibold } from "../helpers/fonts";

interface DropdownItem {
  label: string;
  value: string;
}

interface Props {
  items: DropdownItem[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const CustomDropdown: React.FC<Props> = ({
  items,
  selectedValue,
  onValueChange,
  placeholder,
  disabled = false,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<TouchableOpacity>(null);

  const getLabel = (value: string) => {
    return items.find((item) => item.value === value)?.label || value || placeholder || "Select...";
  };

  const measureButton = () => {
    if (buttonRef.current) {
      buttonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setDropdownPosition({
          top: pageY + height + 4,
          left: pageX,
          width: width,
        });
      });
    }
  };

  const handleButtonPress = () => {
    if (disabled) return;
    measureButton();
    setShowDropdown(!showDropdown);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        ref={buttonRef}
        style={[styles.dropdownButton, disabled && styles.dropdownButtonDisabled]}
        onPress={handleButtonPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.dropdownText, disabled && styles.dropdownTextDisabled]}>
          {getLabel(selectedValue)}
        </Text>
        <Icon
          name={showDropdown ? "chevron-up" : "chevron-down"}
          size={20}
          color={disabled ? pallette.mediumgrey : pallette.grey}
        />
      </TouchableOpacity>

      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
          <View style={styles.modalOverlay}>
            <View 
              style={[
                styles.dropdownListContainer,
                {
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  width: dropdownPosition.width,
                }
              ]}
            >
              <ScrollView 
                style={styles.scrollView}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
                bounces={false}
                maximumZoomScale={1}
                minimumZoomScale={1}
              >
                {items.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.dropdownItem,
                      item.value === selectedValue && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      onValueChange(item.value);
                      setShowDropdown(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        item.value === selectedValue && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.value === selectedValue && (
                      <Icon name="checkmark" size={16} color={pallette.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default CustomDropdown;

const styles = StyleSheet.create({
  container: { 
    width: "100%", 
    marginBottom: 16,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: pallette.white,
    borderWidth: 1,
    borderColor: pallette.mediumgrey,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
  },
  dropdownButtonDisabled: {
    backgroundColor: pallette.lightgrey,
    borderColor: pallette.lightgrey,
  },
  dropdownText: {
    fontSize: adjust(14),
    color: pallette.black,
    fontFamily: regular,
    flex: 1,
  },
  dropdownTextDisabled: {
    color: pallette.mediumgrey,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  dropdownListContainer: {
    position: "absolute",
    backgroundColor: pallette.white,
    borderWidth: 1,
    borderColor: pallette.mediumgrey,
    borderRadius: 8,
    elevation: 8,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    maxHeight: Dimensions.get('window').height * 0.4,
    zIndex: 9999,
  },
  scrollView: {
    width: "100%",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  dropdownItemSelected: {
    backgroundColor: `${pallette.primary}10`,
  },
  dropdownItemText: {
    fontSize: adjust(14),
    color: pallette.black,
    fontFamily: regular,
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: pallette.primary,
    fontFamily: semibold,
  },
});