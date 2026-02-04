import { Image, StyleSheet, Text, View, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { h, w } from '../../constants/dimensions';
import { pallette } from '../helpers/colors';
import { medium } from '../helpers/fonts';

const Splash = ({ navigation }: any) => {
  // Single animation value for logo
  const logoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simple slow motion animation for logo
    Animated.timing(logoAnim, {
      toValue: 1,
      duration: 1500, // 1.5 seconds for slow motion
      useNativeDriver: true,
    }).start();

    // Navigation timeout
    // const timer = setTimeout(() => {
    //    navigation.navigate(LoginScreen);
    // }, 2500);

    // return () => clearTimeout(timer);
  }, []);

  // Logo transform styles
  const logoTransform = {
    transform: [
      {
        scale: logoAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.5, 1.1, 1], // Small overshoot then settle
        }),
      },
      {
        translateY: logoAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0], // Slide up from bottom
        }),
      },
    ],
    opacity: logoAnim.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0, 0.8, 1], // Fade in gradually
    }),
  };

  // Tagline styles
  const taglineTransform = {
    opacity: logoAnim.interpolate({
      inputRange: [0.7, 1],
      outputRange: [0, 1], // Appear after logo animation
    }),
    transform: [
      {
        translateY: logoAnim.interpolate({
          inputRange: [0.7, 1],
          outputRange: [10, 0], // Fade in from bottom
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Animated Logo in Circular Container */}
      <Animated.View style={[styles.logoContainer, logoTransform]}>
        <View style={styles.circleContainer}>
          <Image
            source={require('./../../Asserts/newsfulllogo.png')}
            style={styles.logo}
            resizeMode="cover"
          />
        </View>
      </Animated.View>

      {/* Tagline - appears after logo animation */}
      <Animated.View style={[styles.taglineContainer, taglineTransform]}>
        <Text style={styles.tagline}>
          Your Daily News Companion
        </Text>
      </Animated.View>
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pallette.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  circleContainer: {
    width: h * 0.25,  // Make it circular (same width and height)
    height: h * 0.25, // Make it circular (same width and height)
    borderRadius: (h * 0.25) / 2, // Half to make perfect circle
    backgroundColor: pallette.white, // Optional: add background if needed
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Important: makes logo stay within circle
    borderWidth: 3, // Optional: border for visual effect
    borderColor: '#990000' // Optional: border color
  },
  logo: {
    width: '100%',   // Fill the circle container
    height: '100%',  // Fill the circle container
  },
  taglineContainer: {
    position: 'absolute',
    bottom: h * 0.15,
    alignItems: 'center',
  },
  tagline: {
    fontSize: 16,
    fontFamily: medium,
    color: pallette.grey || '#333',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});