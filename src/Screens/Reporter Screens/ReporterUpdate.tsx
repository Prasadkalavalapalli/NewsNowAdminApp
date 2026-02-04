// screens/ReporterUpdate.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Modal,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation, useRoute } from '@react-navigation/native';
import { pallette } from '../helpers/colors';
import { regular, medium, semibold, bold } from '../helpers/fonts';
import { h, w, adjust } from '../../constants/dimensions';
import ToastMessage from '../helpers/ToastMessage';
import Header from '../helpers/header';
import apiService from '../../Axios/Api';
import Loader from '../helpers/loader';

const ReporterUpdate = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { reporterId } = route.params || {};

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    idProofType: 'aadhar',
    idProofNumber: '',
    experience: '',
    specialization: '',
  });

  // Original data to track changes
  const [originalData, setOriginalData] = useState({});
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // ID Proof options
  const idProofOptions = [
    { value: 'aadhar', label: 'Aadhar Card' },
    { value: 'pan', label: 'PAN Card' },
    { value: 'voter', label: 'Voter ID' },
    { value: 'passport', label: 'Passport' },
    { value: 'driving', label: 'Driving License' },
  ];

  // Specialization options
  const specializationOptions = [
    'Politics',
    'Sports',
    'Business',
    'Entertainment',
    'Technology',
    'Health',
    'Education',
    'Crime',
    'Local News',
    'International',
    'Environment',
    'Lifestyle',
  ];

  // Fetch reporter details
  useEffect(() => {
    if (reporterId) {
      fetchReporterDetails();
    } else {
      setToast({
        message: 'Reporter ID is required',
        type: 'error'
      });
      setTimeout(() => navigation.goBack(), 1500);
    }
  }, [reporterId]);

  const fetchReporterDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getReporterById(reporterId, 2);
      console.log(response.data);
      if (response.error === false) {
        const reporter = response.data;
        
        // Map API response to form data
        const formattedData = {
          fullName: reporter.name || '',
          email: reporter.email || '',
          mobileNumber: reporter.mobileNumber || '',
          address: reporter.address || '',
          city: reporter.city || '',
          state: reporter.state || '',
          pincode: reporter.pincode || reporter.zipCode || '',
          idProofType: reporter.idProofType?.toLowerCase() || 'aadhar',
          idProofNumber: reporter.idProofNumber || '',
          experience: reporter.experience?.toString() || '',
          specialization: reporter.specialization || reporter.specialization || '',
        };

        setFormData(formattedData);
        setOriginalData(formattedData);
      } else {
        throw new Error(response.message || 'Failed to fetch reporter details');
      }
    } catch (error) {
      console.error('Fetch reporter error:', error);
      setToast({
        message: error.message || 'Failed to load reporter details',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle password input change
  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Phone number is required';
    // if (!formData.idProofNumber.trim()) newErrors.idProofNumber = 'ID Proof number is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Phone validation (Indian numbers)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (formData.mobileNumber && !phoneRegex.test(formData.mobileNumber.replace(/\D/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit Indian phone number';
    }

    // // ID Proof validation based on type
    // if (formData.idProofType === 'aadhar' && formData.idProofNumber.length !== 12) {
    //   newErrors.idProofNumber = 'Aadhar number must be 12 digits';
    // }
    // if (formData.idProofType === 'pan' && formData.idProofNumber.length !== 10) {
    //   newErrors.idProofNumber = 'PAN number must be 10 characters';
    // }

    // Pincode validation (optional)
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate password change
  const validatePasswordChange = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  // Check if form has changes
  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  // Handle update
  const handleUpdate = async () => {
    if (!validateForm()) {
      setToast({
        message: 'Please fix the errors in the form',
        type: 'error'
      });
      return;
    }

    if (!hasChanges()) {
      setToast({
        message: 'No changes detected',
        type: 'info'
      });
      return;
    }

    try {
      setUpdating(true);

      // Prepare API data
      const updateData = {
        name: formData.fullName,
        email: formData.email.toLowerCase(),
        mobileNumber: formData.mobileNumber,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipcode,
        idProofType: formData.idProofType,
        idProofNumber: formData.idProofNumber,
        experience: formData.experience ? parseInt(formData.experience) : 0,
        specialization: formData.specialization ? [formData.specialization] : '',
        reporterId: reporterId
      };

      console.log('Updating reporter:', updateData);

      // API call - adjust based on your API
      const response = await apiService.updateReporter(updateData);
      
      if (response.error === false) {
        setToast({
          message: 'Reporter updated successfully!',
          type: 'success'
        });
        
        // Update original data
        setOriginalData(formData);
        
        // Navigate back after delay
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        setToast({
          message: response.message || 'Update failed',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Update error:', error);
      setToast({
        message: error.message || 'Network error. Please try again.',
        type: 'error'
      });
    } finally {
      setUpdating(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async () => {
    const passwordErrors = validatePasswordChange();
    
    if (Object.keys(passwordErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...passwordErrors }));
      return;
    }

    try {
      setUpdating(true);
      
      const passwordUpdateData = {
        reporterId: reporterId,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      };

      const response = await apiService.updateReporterPassword(passwordUpdateData);
      
      if (response.error === false) {
        setToast({
          message: 'Password updated successfully!',
          type: 'success'
        });
        
        // Clear password form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        
        // Close modal
        setShowPasswordModal(false);
      } else {
        setToast({
          message: response.message || 'Password update failed',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Password update error:', error);
      setToast({
        message: error.message || 'Network error. Please try again.',
        type: 'error'
      });
    } finally {
      setUpdating(false);
    }
  };

  // Handle reset form
  const handleResetForm = () => {
    Alert.alert(
      'Reset Changes',
      'Are you sure you want to reset all changes?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setFormData(originalData);
            setErrors({});
            setToast({
              message: 'Form reset to original values',
              type: 'info'
            });
          }
        },
      ]
    );
  };

  // Render input field
  const renderInput = (label, field, placeholder, keyboardType = 'default', secureTextEntry = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}{label.includes('ID Proof') ? ' *' : ''}</Text>
      <View style={[styles.inputWrapper, errors[field] && styles.inputError]}>
        <TextInput
          style={styles.input}
          value={formData[field]}
          onChangeText={(value) => handleInputChange(field, value)}
          placeholder={placeholder}
          placeholderTextColor={pallette.grey}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          editable={!updating}
        />
      </View>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  // Render password input field
  const renderPasswordInput = (label, field, placeholder, secureTextEntry = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label} *</Text>
      <View style={[styles.inputWrapper, errors[field] && styles.inputError]}>
        <TextInput
          style={styles.input}
          value={passwordData[field]}
          onChangeText={(value) => handlePasswordChange(field, value)}
          placeholder={placeholder}
          placeholderTextColor={pallette.grey}
          secureTextEntry={secureTextEntry}
          editable={!updating}
        />
      </View>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={pallette.white} />
      
      <Header 
        title="Edit Reporter"
        onback={navigation.goBack}
        active={1}
        onSkip={() => {}}
        skippable={false}
        hastitle={true}
      />
      
      {/* Toast Message */}
      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Section */}
          {/* <View style={styles.headerSection}>
            <Text style={styles.subtitle}>Update reporter information</Text>
            
            {hasChanges() && (
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={handleResetForm}
                disabled={updating}
              >
                <Icon name="rotate-left" size={14} color={pallette.red} />
                <Text style={styles.resetText}>Reset Changes</Text>
              </TouchableOpacity>
            )}
          </View> */}

          {/* Personal Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="user" size={18} color={pallette.primary} />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>
            
            {renderInput('Full Name', 'fullName', 'Enter full name')}
            {renderInput('Email Address', 'email', 'example@email.com', 'email-address')}
            {renderInput('Phone Number', 'mobileNumber', 'Enter 10-digit number', 'phone-pad')}
            {/* {renderInput('Address', 'address', 'Complete address')} */}
            
            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>City</Text>
                <TextInput
                  style={[styles.input, errors.city && styles.inputError]}
                  value={formData.city}
                  onChangeText={(value) => handleInputChange('city', value)}
                  placeholder="City"
                  placeholderTextColor={pallette.grey}
                  editable={!updating}
                />
              </View>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.inputLabel}>State</Text>
                <TextInput
                  style={[styles.input, errors.state && styles.inputError]}
                  value={formData.state}
                  onChangeText={(value) => handleInputChange('state', value)}
                  placeholder="State"
                  placeholderTextColor={pallette.grey}
                  editable={!updating}
                />
              </View>
            </View>
            
            {renderInput('Pincode', 'pincode', 'Enter 6-digit pincode', 'number-pad')}
          </View>

          {/* ID Proof Verification */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="id-card" size={18} color={pallette.primary} />
              <Text style={styles.sectionTitle}>ID Proof Verification</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>ID Proof Type *</Text>
              <View style={styles.optionsContainer}>
                {idProofOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      formData.idProofType === option.value && styles.optionButtonActive
                    ]}
                    onPress={() => handleInputChange('idProofType', option.value)}
                    disabled={updating}
                  >
                    <Text style={[
                      styles.optionText,
                      formData.idProofType === option.value && styles.optionTextActive
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {renderInput(
              'ID Proof Number', 
              'idProofNumber', 
              `Enter ${formData.idProofType === 'aadhar' ? '12-digit Aadhar' : formData.idProofType === 'pan' ? '10-digit PAN' : 'ID Number'}`,
              formData.idProofType === 'aadhar' ? 'number-pad' : 'default'
            )}
          </View>

          {/* Professional Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="briefcase" size={18} color={pallette.primary} />
              <Text style={styles.sectionTitle}>Professional Details</Text>
            </View>

            {renderInput('Experience (years)', 'experience', 'e.g., 2', 'number-pad')}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Specialization</Text>
              <View style={styles.dropdownContainer}>
                <TextInput
                  style={[styles.input, errors.specialization && styles.inputError]}
                  value={formData.specialization}
                  onChangeText={(value) => handleInputChange('specialization', value)}
                  placeholder="Enter specialization"
                  placeholderTextColor={pallette.grey}
                  editable={!updating}
                />
              </View>
              <Text style={styles.hintText}>
                Enter area of expertise (optional)
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            {/* <TouchableOpacity
              style={styles.changePasswordButton}
              onPress={() => setShowPasswordModal(true)}
              disabled={updating}
            >
              <Icon name="key" size={16} color={pallette.primary} />
              <Text style={styles.changePasswordText}>Change Password</Text>
            </TouchableOpacity> */}

            <TouchableOpacity
              style={[styles.updateButton, (!hasChanges() || updating) && styles.updateButtonDisabled]}
              onPress={handleUpdate}
              disabled={!hasChanges() || updating}
            >
              {updating ? (
                <ActivityIndicator color={pallette.white} size="small" />
              ) : (
                <>
                  <Icon name="floppy-disk" size={18} color={pallette.white} />
                  <Text style={styles.updateButtonText}>Update Reporter</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Password Change Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPasswordModal}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity 
                onPress={() => setShowPasswordModal(false)}
                disabled={updating}
              >
                <Icon name="xmark" size={20} color={pallette.grey} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {renderPasswordInput('Current Password', 'currentPassword', 'Enter current password', true)}
              {renderPasswordInput('New Password', 'newPassword', 'Minimum 6 characters', true)}
              {renderPasswordInput('Confirm Password', 'confirmPassword', 'Re-enter new password', true)}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowPasswordModal(false)}
                  disabled={updating}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.savePasswordButton]}
                  onPress={handlePasswordUpdate}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator color={pallette.white} size="small" />
                  ) : (
                    <Text style={styles.savePasswordButtonText}>Update Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pallette.lightgrey,
    paddingTop: 20,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: h * 0.05,
  },
  headerSection: {
    paddingHorizontal: w * 0.04,
    paddingVertical: h * 0.01,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.grey,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: `${pallette.red}10`,
    borderRadius: 6,
    gap: 6,
  },
  resetText: {
    fontSize: adjust(12),
    fontFamily: medium,
    color: pallette.red,
  },
  section: {
    backgroundColor: pallette.white,
    marginHorizontal: w * 0.04,
    marginTop: h * 0.02,
    borderRadius: 12,
    padding: w * 0.04,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: h * 0.02,
  },
  sectionTitle: {
    fontSize: adjust(16),
    fontFamily: semibold,
    color: pallette.black,
    marginLeft: 10,
  },
  inputContainer: {
    marginBottom: h * 0.018,
  },
  inputLabel: {
    fontSize: adjust(13),
    fontFamily: medium,
    color: pallette.black,
    marginBottom: h * 0.008,
  },
  inputWrapper: {
    backgroundColor: pallette.lightgrey,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: pallette.lightgrey,
    paddingHorizontal: w * 0.03,
  },
  inputError: {
    borderColor: pallette.red,
    backgroundColor: `${pallette.red}10`,
  },
  input: {
    paddingVertical: h * 0.015,
    fontSize: adjust(14),
    fontFamily: regular,
    color: pallette.black,
  },
  errorText: {
    fontSize: adjust(12),
    fontFamily: regular,
    color: pallette.red,
    marginTop: h * 0.005,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: pallette.lightgrey,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: pallette.lightgrey,
  },
  optionButtonActive: {
    backgroundColor: `${pallette.primary}15`,
    borderColor: pallette.primary,
  },
  optionText: {
    fontSize: adjust(12),
    fontFamily: medium,
    color: pallette.grey,
  },
  optionTextActive: {
    color: pallette.primary,
  },
  dropdownContainer: {
    marginBottom: h * 0.005,
  },
  hintText: {
    fontSize: adjust(11),
    fontFamily: regular,
    color: pallette.grey,
    marginTop: h * 0.005,
    marginLeft: 4,
  },
  actionButtonsContainer: {
    marginHorizontal: w * 0.04,
    marginTop: h * 0.03,
  },
  changePasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${pallette.primary}10`,
    paddingVertical: h * 0.015,
    borderRadius: 12,
    gap: 8,
    marginBottom: h * 0.02,
  },
  changePasswordText: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.primary,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pallette.primary,
    paddingVertical: h * 0.02,
    borderRadius: 12,
    gap: 10,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  updateButtonDisabled: {
    backgroundColor: pallette.grey,
    opacity: 0.6,
  },
  updateButtonText: {
    fontSize: adjust(16),
    fontFamily: semibold,
    color: pallette.white,
  },
  bottomSpacer: {
    height: h * 0.05,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: pallette.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: w * 0.04,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  modalTitle: {
    fontSize: adjust(18),
    fontFamily: semibold,
    color: pallette.black,
  },
  modalContent: {
    padding: w * 0.04,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: h * 0.03,
  },
  modalButton: {
    flex: 1,
    paddingVertical: h * 0.015,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: pallette.lightgrey,
  },
  cancelButtonText: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.darkgrey,
  },
  savePasswordButton: {
    backgroundColor: pallette.primary,
  },
  savePasswordButtonText: {
    fontSize: adjust(14),
    fontFamily: semibold,
    color: pallette.white,
  },
});

export default ReporterUpdate;