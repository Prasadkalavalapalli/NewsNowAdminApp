import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { pallette } from '../helpers/colors';
import { regular, medium, semibold, bold } from '../helpers/fonts';
import { adjust, h, w } from '../../constants/dimensions';
import ToastMessage from '../helpers/ToastMessage';
import AlertMessage from '../helpers/alertmessage';
import { useNavigation } from '@react-navigation/native';
import apiService from '../../Axios/Api';
import OTPTextInput from 'react-native-otp-textinput';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const otpInputRef = useRef();

  // State
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [toast, setToast] = useState(null);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [resendEnabled, setResendEnabled] = useState(false);

  // Start countdown timer for OTP resend
  const startTimer = (seconds = 60) => {
    setTimer(seconds);
    setTimerActive(true);
    setResendEnabled(false);
    
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          setResendEnabled(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Validate email format
  const validateEmailFormat = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Step 1: Request OTP
  const handleRequestOTP = async () => {
    if (!email.trim()) {
      setAlertMessage('Please enter your email address');
      return;
    }

    // Commenting out email format validation since API accepts username too
    // if (!validateEmailFormat(email)) {
    //   setAlertMessage('Please enter a valid email address');
    //   return;
    // }

    setLoading(true);
    
    try {
      // Call forgot password API with email/username
      const response = await apiService.forgotPassword(email);
      
      if (response.error === false) {
        setToast({
          message: response.message || 'OTP sent to your email/phone',
          type: 'success'
        });
        setStep(2);
        startTimer(60); // Start 60-second timer
      } else {
        setAlertMessage(response.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Request OTP error:', error);
      setAlertMessage(error.message || 'Failed to send OTP. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) { // Assuming 4-digit OTP
      setAlertMessage('Please enter the complete OTP');
      return;
    }

    setLoading(true);
    
    try {
      const response = await apiService.verifyOTP({ 
        email, 
        otp 
      });
      
      if (response.error === false) {
        setToast({
          message: response.message || 'OTP verified successfully',
          type: 'success'
        });
        setStep(3);
      } else {
        setAlertMessage(response.message || 'Invalid OTP. Please try again.');
        setOtp(''); // Clear OTP on failure
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      setAlertMessage(error.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    // Validation
    if (!newPassword.trim()) {
      setAlertMessage('Please enter new password');
      return;
    }

    if (newPassword.length < 6) {
      setAlertMessage('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlertMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      const response = await apiService.resetPassword({
        email,
        newPassword
      });
      
      if (response.error === false) {
        setToast({
          message: response.message || 'Password reset successful!',
          type: 'success'
        });
        
        // Show success message and navigate to login
        setTimeout(() => {
          navigation.goBack(); // Go back to login screen
        }, 2000);
      } else {
        setAlertMessage(response.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setAlertMessage(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP (same as initial request)
  const handleResendOTP = async () => {
    if (!resendEnabled) return;
    
    setLoading(true);
    
    try {
      const response = await apiService.forgotPassword(email);
      
      if (response.error === false) {
        setToast({
          message: response.message || 'New OTP sent',
          type: 'success'
        });
        startTimer(60); // Restart timer
        setOtp(''); // Clear previous OTP
      } else {
        setAlertMessage(response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setAlertMessage(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render step 1: Email input
  const renderEmailStep = () => (
    <>
      <Text style={styles.stepTitle}>Forgot Password</Text>
      <Text style={styles.stepDescription}>
        Enter your email or username and we'll send you an OTP to reset your password.
      </Text>

      <View style={styles.inputWrapper}>
        <View style={styles.inputIcon}>
          <Icon name="envelope" size={20} color={pallette.grey} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Enter your email or username"
          placeholderTextColor={pallette.grey}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />
      </View>

      <TouchableOpacity
        style={[styles.actionButton, loading && styles.actionButtonDisabled]}
        onPress={handleRequestOTP}
        disabled={loading}
      >
        {loading ? (
          <>
            <ActivityIndicator size="small" color={pallette.white} />
            <Text style={styles.actionButtonText}>Sending OTP...</Text>
          </>
        ) : (
          <>
            <Icon name="paper-plane" size={20} color={pallette.white} />
            <Text style={styles.actionButtonText}>Send OTP</Text>
          </>
        )}
      </TouchableOpacity>
    </>
  );

  // Render step 2: OTP verification
  const renderOTPStep = () => (
    <>
      <Text style={styles.stepTitle}>Verify OTP</Text>
      <Text style={styles.stepDescription}>
        We've sent a 4-digit OTP to {email}
      </Text>

      <View style={styles.otpContainer}>
        <OTPTextInput
          ref={otpInputRef}
          inputCount={4}
          keyboardType="numeric"
          autoFocus={true}
          tintColor={pallette.primary}
          offTintColor={pallette.lightgrey}
          textInputStyle={styles.otpInput}
          handleTextChange={setOtp}
          editable={!loading}
        />
      </View>

      <View style={styles.resendContainer}>
        <Text style={styles.timerText}>
          {timerActive ? `Resend OTP in ${timer}s` : ''}
        </Text>
        <TouchableOpacity 
          onPress={handleResendOTP}
          disabled={!resendEnabled || loading}
        >
          <Text style={[styles.resendText, !resendEnabled && styles.resendDisabled]}>
            Resend OTP
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.secondaryButton, loading && styles.secondaryButtonDisabled]}
          onPress={() => setStep(1)}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, loading && styles.actionButtonDisabled]}
          onPress={handleVerifyOTP}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color={pallette.white} />
              <Text style={styles.actionButtonText}>Verifying...</Text>
            </>
          ) : (
            <>
              <Icon name="check-circle" size={20} color={pallette.white} />
              <Text style={styles.actionButtonText}>Verify OTP</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  // Render step 3: New password
  const renderPasswordStep = () => (
    <>
      <Text style={styles.stepTitle}>Set New Password</Text>
      <Text style={styles.stepDescription}>
        Create a new password for your account.
      </Text>

      <View style={styles.inputWrapper}>
        <View style={styles.inputIcon}>
          <Icon name="lock" size={20} color={pallette.grey} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="New password (min 6 characters)"
          placeholderTextColor={pallette.grey}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showPassword}
          editable={!loading}
        />
        <TouchableOpacity 
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
          disabled={loading}
        >
          <Icon 
            name={showPassword ? 'eye' : 'eye-slash'} 
            size={20} 
            color={pallette.grey} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputWrapper}>
        <View style={styles.inputIcon}>
          <Icon name="lock" size={20} color={pallette.grey} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          placeholderTextColor={pallette.grey}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          editable={!loading}
        />
        <TouchableOpacity 
          style={styles.eyeIcon}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          disabled={loading}
        >
          <Icon 
            name={showConfirmPassword ? 'eye' : 'eye-slash'} 
            size={20} 
            color={pallette.grey} 
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.passwordHint}>
        Password must be at least 6 characters long
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.secondaryButton, loading && styles.secondaryButtonDisabled]}
          onPress={() => setStep(2)}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, loading && styles.actionButtonDisabled]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color={pallette.white} />
              <Text style={styles.actionButtonText}>Resetting...</Text>
            </>
          ) : (
            <>
              <Icon name="key" size={20} color={pallette.white} />
              <Text style={styles.actionButtonText}>Reset Password</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Icon name="arrow-left" size={24} color={pallette.primary} />
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../Asserts/logo.jpeg')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>News Now</Text>
          <Text style={styles.tagline}>Reset Your Password</Text>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressStep, step >= 1 && styles.progressStepActive]}>
              <Text style={[styles.progressText, step >= 1 && styles.progressTextActive]}>1</Text>
            </View>
            <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
            <View style={[styles.progressStep, step >= 2 && styles.progressStepActive]}>
              <Text style={[styles.progressText, step >= 2 && styles.progressTextActive]}>2</Text>
            </View>
            <View style={[styles.progressLine, step >= 3 && styles.progressLineActive]} />
            <View style={[styles.progressStep, step >= 3 && styles.progressStepActive]}>
              <Text style={[styles.progressText, step >= 3 && styles.progressTextActive]}>3</Text>
            </View>
          </View>

          {/* Step Content */}
          <View style={styles.stepContent}>
            {step === 1 && renderEmailStep()}
            {step === 2 && renderOTPStep()}
            {step === 3 && renderPasswordStep()}
          </View>
        </View>
      </ScrollView>

      {/* Alert Messages */}
      {alertMessage && (
        <AlertMessage
          message={alertMessage}
          onClose={() => setAlertMessage('')}
        />
      )}

      {/* Toast Message */}
      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pallette.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: w * 0.06,
    paddingVertical: h * 0.02,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 10,
    marginBottom: h * 0.02,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: h * 0.03,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: h * 0.01,
  },
  logo: {
    width: 70,
    height: 70,
  },
  appName: {
    fontSize: adjust(24),
    fontFamily: bold,
    color: pallette.primary,
    marginBottom: h * 0.005,
  },
  tagline: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.grey,
  },
  formContainer: {
    backgroundColor: pallette.white,
    borderRadius: 20,
    padding: w * 0.05,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: h * 0.04,
  },
  progressStep: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: pallette.lightgrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepActive: {
    backgroundColor: pallette.primary,
  },
  progressText: {
    fontSize: adjust(16),
    fontFamily: semibold,
    color: pallette.grey,
  },
  progressTextActive: {
    color: pallette.white,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: pallette.lightgrey,
    marginHorizontal: 10,
  },
  progressLineActive: {
    backgroundColor: pallette.primary,
  },
  stepContent: {
    minHeight: h * 0.3,
  },
  stepTitle: {
    fontSize: adjust(22),
    fontFamily: semibold,
    color: pallette.black,
    marginBottom: h * 0.01,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: adjust(14),
    fontFamily: regular,
    color: pallette.grey,
    marginBottom: h * 0.04,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: pallette.lightgrey,
    borderRadius: 12,
    marginBottom: h * 0.02,
    borderWidth: 1,
    borderColor: pallette.lightgrey,
  },
  inputIcon: {
    paddingLeft: 16,
    paddingRight: 12,
  },
  input: {
    flex: 1,
    fontSize: adjust(16),
    fontFamily: regular,
    color: pallette.black,
    paddingVertical: h * 0.018,
  },
  eyeIcon: {
    paddingRight: 16,
    paddingLeft: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pallette.primary,
    borderRadius: 12,
    paddingVertical:20,
    marginTop: h * 0.02,
    gap: 10,
  },
  actionButtonDisabled: {
    backgroundColor: `${pallette.primary}80`,
  },
  actionButtonText: {
    fontSize: adjust(16),
    fontFamily: semibold,
    color: pallette.white,
  },
  secondaryButton: {
    flex: 2 ,
    justifyContent: 'center',
    backgroundColor: pallette.lightgrey,
    borderRadius: 12,
    paddingVertical:20,
    // marginRight: 10,
  },
  secondaryButtonDisabled: {
    backgroundColor: `${pallette.lightgrey}80`,
  },
  secondaryButtonText: {
    fontSize: adjust(16),
    fontFamily: semibold,
    color: pallette.darkgrey,
    textAlign: 'center',
  },
//   buttonContainer: {
//     flexDirection: 'row',
//     marginTop: h * 0.03,
//   },
  otpContainer: {
    alignItems: 'center',
    marginBottom: h * 0.03,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: pallette.lightgrey,
    borderRadius: 8,
    backgroundColor: pallette.white,
    fontSize: adjust(20),
    fontFamily: bold,
    color: pallette.black,
    width: 50,
    height: 80,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: h * 0.03,
  },
  timerText: {
    fontSize: adjust(14),
    fontFamily: regular,
    color: pallette.red,
  },
  resendText: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.primary,
  },
  resendDisabled: {
    color: pallette.grey,
  },
  passwordHint: {
    fontSize: adjust(12),
    fontFamily: regular,
    color: pallette.grey,
    marginBottom: h * 0.02,
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen;