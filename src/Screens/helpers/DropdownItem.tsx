import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
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
}

const CustomDropdown: React.FC<Props> = ({
  items,
  selectedValue,
  onValueChange,
  placeholder,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const getLabel = (value: string) => {
    return items.find((item) => item.value === value)?.label || value || placeholder;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setShowDropdown(!showDropdown)}
      >
        <Text style={styles.dropdownText}>{getLabel(selectedValue)}</Text>
        <Icon
          name={showDropdown ? "chevron-up" : "chevron-down"}
          size={20}
          color={pallette.grey}
        />
      </TouchableOpacity>

      {showDropdown && (
        <View style={styles.dropdownList}>
          <FlatList
            data={items}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  item.value === selectedValue && styles.dropdownItemSelected,
                ]}
                onPress={() => {
                  onValueChange(item.value);
                  setShowDropdown(false);
                }}
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
            )}
          />
        </View>
      )}
    </View>
  );
};

export default CustomDropdown;

const styles = StyleSheet.create({
  container: { width: "100%", marginBottom: 16, position: "relative" },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: pallette.white,
    borderWidth: 1,
    borderColor: pallette.mediumgrey,
    borderRadius: 8,
    padding: 12,
  },
  dropdownText: {
    fontSize: adjust(14),
    color: pallette.black,
    fontFamily: regular,
  },
  dropdownList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: pallette.white,
    borderWidth: 1,
    borderColor: pallette.mediumgrey,
    borderRadius: 8,
    marginTop: 4,
    elevation: 4,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 250,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  dropdownItemSelected: {
    backgroundColor: pallette.lightprimary,
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