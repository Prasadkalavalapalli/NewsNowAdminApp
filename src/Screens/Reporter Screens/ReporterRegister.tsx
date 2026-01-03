// screens/ReporterRegistration.jsx
import React, { useState } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import { pallette } from '../helpers/colors';
import { regular, medium, semibold, bold } from '../helpers/fonts';
import { h, w, adjust } from '../../constants/dimensions';
import MainHeader from '../helpers/mainheader';
import ToastMessage from '../helpers/ToastMessage';
import Header from '../helpers/header';
import apiService, { authAPI } from '../../Axios/Api';


const ReporterRegistration = () => {
  const navigation = useNavigation();
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    idProofType: 'aadhar',
    idProofNumber: '',
    experience: '',
    specialization: '',
    roleId:2,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
    if (!formData.idProofNumber.trim()) newErrors.idProofNumber = 'ID Proof number is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Phone validation (Indian numbers)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (formData.mobileNumber&& !phoneRegex.test(formData.mobileNumber.replace(/\D/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit Indian phone number';
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // ID Proof validation based on type
    if (formData.idProofType === 'aadhar' && formData.idProofNumber.length !== 12) {
      newErrors.idProofNumber = 'Aadhar number must be 12 digits';
    }
    if (formData.idProofType === 'pan' && formData.idProofNumber.length !== 10) {
      newErrors.idProofNumber = 'PAN number must be 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle registration
  const handleRegister = async () => {
    if (!validateForm()) {
      setToast({
        message: 'Please fix the errors in the form',
        type: 'error'
      });
      return;
    }

    try {
      setLoading(true);

      // Prepare API data
      const registrationData = {
        name: formData.fullName,
        email: formData.email.toLowerCase(),
        mobileNumber: formData.mobileNumber,
        password: formData.password,
        // address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.pincode,
        idProofType: formData.idProofType,
        idProofNumber: formData.idProofNumber,
        experience: formData.experience ? parseInt(formData.experience) : 0,
        specialization: formData.specialization ? [formData.specialization] :'',
        
        roleId:2
      };

      console.log('Registering reporter:', registrationData);

      // API call - replace with your actual API
      const response = await apiService.register (registrationData);
      console.log(response);
      if (response.error===false) {
        setToast({
          message: 'Registration successful! Your account is pending approval.',
          type: 'success'
        });
        
        // Clear form
        setFormData({
          fullName: '',
          email: '',
          mobileNumber: '',
          password: '',
          confirmPassword: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          idProofType: 'aadhar',
          idProofNumber: '',
          experience: '',
          specialization: '',
          roleId:2
        });

        // Navigate after delay
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } else {
        setToast({
          message: response.message || 'Registration failed',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setToast({
        message: error.message || 'Network error. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle back press
  const handleBackPress = () => {
    navigation.goBack();
  };

  // Render input field
  const renderInput = (label, field, placeholder, keyboardType = 'default', secureTextEntry = false, showToggle = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label} *</Text>
      <View style={[styles.inputWrapper, errors[field] && styles.inputError]}>
        <TextInput
          style={styles.input}
          value={formData[field]}
          onChangeText={(value) => handleInputChange(field, value)}
          placeholder={placeholder}
          placeholderTextColor={pallette.grey}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && !(field === 'password' ? showPassword : showConfirmPassword)}
          editable={!loading}
        />
        {showToggle && (
          <TouchableOpacity
            onPress={() => field === 'password' ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            <Icon 
              name={field === 'password' ? (showPassword ? 'eye-slash' : 'eye') : (showConfirmPassword ? 'eye-slash' : 'eye')} 
              size={18} 
              color={pallette.grey} 
            />
          </TouchableOpacity>
        )}
      </View>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={pallette.white} />
       <Header 
          title="Reporter Registration"
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
          <View style={styles.headerSection}>
            {/* <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <Icon name="arrow-left" size={adjust(20)} color={pallette.black} />
            </TouchableOpacity>
            <Text style={styles.title}>Register as Reporter</Text> */}
            <Text style={styles.subtitle}>Fill in your details to join News Now</Text>
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="user" size={18} color={pallette.primary} />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>
            
            {renderInput('Full Name', 'fullName', 'Enter your full name')}
            {renderInput('Email Address', 'email', 'example@email.com', 'email-address')}
            {renderInput('Phone Number', 'mobileNumber', 'Enter 10-digit number', 'phone-pad')}
            {renderInput('Address', 'address', 'Your complete address')}
            
            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>City</Text>
                <TextInput
                  style={[styles.input, errors.city && styles.inputError]}
                  value={formData.city}
                  onChangeText={(value) => handleInputChange('city', value)}
                  placeholder="City"
                  placeholderTextColor={pallette.grey}
                  editable={!loading}
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
                  editable={!loading}
                />
              </View>
            </View>
            
            {renderInput('Pincode', 'pincode', 'Enter pincode', 'number-pad')}
          </View>

          {/* Account Security */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="lock" size={18} color={pallette.primary} />
              <Text style={styles.sectionTitle}>Account Security</Text>
            </View>
            
            {renderInput('Password', 'password', 'Minimum 6 characters', 'default', true, true)}
            {renderInput('Confirm Password', 'confirmPassword', 'Re-enter password', 'default', true, true)}
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
                    disabled={loading}
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

            {/* <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Specialization</Text>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={[styles.dropdown, errors.specialization && styles.inputError]}
                  onPress={() => {
                    // You can implement a modal picker here
                    // For now, using simple input
                  }}
                  disabled={loading}
                >
                  <Text style={[
                    styles.dropdownText,
                    !formData.specialization && { color: pallette.grey }
                  ]}>
                    {formData.specialization || 'Select your specialization'}
                  </Text>
                  <Icon name="chevron-down" size={16} color={pallette.grey} />
                </TouchableOpacity>
              </View>
              <Text style={styles.hintText}>
                Select your area of expertise (optional)
              </Text>
            </View> */}
          </View>

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <View style={styles.checkboxContainer}>
              <TouchableOpacity style={styles.checkbox}>
                <Icon name="check" size={14} color={pallette.white} />
              </TouchableOpacity>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.linkText}>Terms & Conditions</Text>
                {' '}and{' '}
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={pallette.white} size="small" />
            ) : (
              <>
                <Icon name="user-plus" size={18} color={pallette.white} />
                <Text style={styles.submitButtonText}>Register as Reporter</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          {/* <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login here</Text>
            </TouchableOpacity>
          </View> */}

          {/* Bottom Spacer */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pallette.lightgrey,
    paddingTop:20,
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
    // backgroundColor: pallette.white,
    paddingHorizontal: w * 0.04,
    paddingVertical: h * 0.01,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  backButton: {
    padding: 4,
    marginBottom: h * 0.01,
  },
  title: {
    fontSize: adjust(24),
    fontFamily: bold,
    color: pallette.black,
    marginBottom: h * 0.005,
  },
  subtitle: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.grey,
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
    flexDirection: 'row',
    alignItems: 'center',
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
    flex: 1,
    paddingVertical: h * 0.015,
    fontSize: adjust(14),
    fontFamily: regular,
    color: pallette.black,
  },
  eyeIcon: {
    padding: 8,
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
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: pallette.lightgrey,
    borderRadius: 8,
    paddingHorizontal: w * 0.03,
    paddingVertical: h * 0.015,
    borderWidth: 1,
    borderColor: pallette.lightgrey,
  },
  dropdownText: {
    fontSize: adjust(14),
    fontFamily: regular,
    color: pallette.black,
  },
  hintText: {
    fontSize: adjust(11),
    fontFamily: regular,
    color: pallette.grey,
    marginTop: h * 0.005,
    marginLeft: 4,
  },
  termsContainer: {
    marginHorizontal: w * 0.04,
    marginTop: h * 0.03,
    marginBottom: h * 0.02,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: pallette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  termsText: {
    flex: 1,
    fontSize: adjust(13),
    fontFamily: regular,
    color: pallette.darkgrey,
    lineHeight: adjust(18),
  },
  linkText: {
    color: pallette.primary,
    fontFamily: medium,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pallette.primary,
    marginHorizontal: w * 0.04,
    paddingVertical: h * 0.02,
    borderRadius: 12,
    gap: 10,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: adjust(16),
    fontFamily: semibold,
    color: pallette.white,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: h * 0.03,
    marginHorizontal: w * 0.04,
  },
  loginText: {
    fontSize: adjust(14),
    fontFamily: regular,
    color: pallette.grey,
  },
  loginLink: {
    fontSize: adjust(14),
    fontFamily: semibold,
    color: pallette.primary,
  },
  bottomSpacer: {
    height: h * 0.05,
  },
});

export default ReporterRegistration;