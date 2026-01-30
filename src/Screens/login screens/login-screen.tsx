import React, { useState } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { pallette } from '../helpers/colors';
import { regular, medium, semibold, bold } from '../helpers/fonts';
import { adjust, h, w } from '../../constants/dimensions';
import ToastMessage from '../helpers/ToastMessage';
import AlertMessage from '../helpers/alertmessage';
import { useAppContext } from '../../Store/contexts/app-context';
import ReporterRegistration from '../Reporter Screens/ReporterRegister';
import { useNavigation } from '@react-navigation/native';
import apiService from '../../Axios/Api';

const LoginScreen = () => {

  const navigation=useNavigation();
  // State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [toast, setToast] = useState(null);
  
  const { login } = useAppContext();

  const handleLogin = async () => {
    // Validation
    if (!username.trim()) {
      setAlertMessage('Please enter your username/email');
      return;
    }

    if (!password.trim()) {
      setAlertMessage('Please enter your password');
      return;
    }

    if (password.length < 6) {
      setAlertMessage('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      
     const response= await apiService.login(username,password)
     console.log(response);
      if (response.error==false) {
        await login(
          response.data
        )
        setToast({
          message: 'Login successful!',
          type: 'success'
        });
        // Navigation would typically happen after successful login
      } else {
        setToast({
          message: response.message,
          type: 'error'
        });
        setAlertMessage('Invalid username or password');
      }
    } catch (error) {
      setAlertMessage('Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    // Navigate to registration screen
     navigation.navigate(ReporterRegistration)
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password screen
    //  setToast({
    //   message: `ForgotPassword login coming soon!`,
    //   type: 'info'
    // });
    navigation.navigate('ForgotPassword');
  };

  const handleQuickLogin = (platform) => {
    setToast({
      message: `${platform} login coming soon!`,
      type: 'info'
    });
  };

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
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            {/* <Image 
              source={require('../../Asserts/newsfulllogo.png')}
              style={styles.logo}
              resizeMode="contain"
            /> */}
          </View>
         <Text style={styles.appName}>News Now</Text>
          <Text style={styles.tagline}>Stay Informed, Stay Ahead</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Sign in to continue to your account</Text>

          {/* Username/Email Input */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputIcon}>
              <Icon name="user" size={20} color={pallette.grey} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Username or Email"
              placeholderTextColor={pallette.grey}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputIcon}>
              <Icon name="lock" size={20} color={pallette.grey} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={pallette.grey}
              value={password}
              onChangeText={setPassword}
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

          {/* Forgot Password */}
          <TouchableOpacity 
            style={styles.forgotPasswordButton}
            onPress={handleForgotPassword}
            disabled={loading}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <>
                <Icon name="spinner" size={20} color={pallette.white} style={styles.spinner} />
                <Text style={styles.loginButtonText}>Logging in...</Text>
              </>
            ) : (
              <>
                <Icon name="right-to-bracket" size={20} color={pallette.white} />
                <Text style={styles.loginButtonText}>Login</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login */}
          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleQuickLogin('Google')}
              disabled={loading}
            >
              <Icon name="google" size={24} color={pallette.red} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleQuickLogin('Facebook')}
              disabled={loading}
            >
              <Icon name="facebook" size={24} color={pallette.primary} />
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity 
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerLink}>Sign up</Text>
            </TouchableOpacity>
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
 logoSection: {
    alignItems: 'center',
    marginTop: h * 0.02,
    marginBottom: h * 0.02,
  },
  logoContainer: {
    width: 100,
    height: 80,
    borderRadius: 50,
    // backgroundColor: `${pallette.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    // marginBottom: h * 0.02,
  },
  logo: {
    width: 90,
    height: 90,
  },
  appName: {
    fontSize: adjust(28),
    fontFamily: bold,
    color: pallette.primary,
    // marginBottom: h * 0.005,
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
  welcomeText: {
    fontSize: adjust(24),
    fontFamily: semibold,
    color: pallette.black,
    marginBottom: h * 0.005,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: adjust(14),
    fontFamily: regular,
    color: pallette.grey,
    marginBottom: h * 0.04,
    textAlign: 'center',
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: h * 0.03,
  },
  forgotPasswordText: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.primary,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pallette.primary,
    borderRadius: 12,
    paddingVertical: h * 0.02,
    marginBottom: h * 0.03,
    gap: 12,
  },
  loginButtonDisabled: {
    backgroundColor: `${pallette.primary}80`,
  },
  spinner: {
    transform: [{ rotate: '0deg' }],
  },
  loginButtonText: {
    fontSize: adjust(18),
    fontFamily: semibold,
    color: pallette.white,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: h * 0.03,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: pallette.lightgrey,
  },
  dividerText: {
    fontSize: adjust(12),
    fontFamily: medium,
    color: pallette.grey,
    marginHorizontal: 12,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: h * 0.04,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: pallette.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: pallette.lightgrey,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: adjust(14),
    fontFamily: regular,
    color: pallette.grey,
  },
  registerLink: {
    fontSize: adjust(14),
    fontFamily: semibold,
    color: pallette.primary,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;