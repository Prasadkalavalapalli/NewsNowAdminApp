// components/Loader.jsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Image, Easing } from 'react-native';
import { pallette } from '../helpers/colors';

const Loader = () => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.loaderContainer}>
        {/* Outer rotating ring - ONLY THIS ROTATES */}
        <Animated.View style={[styles.outerRing, { transform: [{ rotate: spin }] }]}>
          {/* <View style={styles.ringSegment} /> */}
          {/* <View style={[styles.ringSegment, styles.segment1]} />
          <View style={[styles.ringSegment, styles.segment2]} />
          <View style={[styles.ringSegment, styles.segment3]} /> */}
        </Animated.View>
        
        {/* Center logo - STATIC, NO ROTATION */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../Asserts/newsfulllogo.png')}
            style={styles.logo}
            resizeMode="cover"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: pallette.white,
  },
  loaderContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: pallette.primary,
    borderRightColor: `${pallette.primary}80`,
    borderBottomColor: `${pallette.primary}40`,
    borderLeftColor: `${pallette.primary}20`,
  },
  ringSegment: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: pallette.primary,
  },
  segment1: {
    top: 0,
    right: 0,
    backgroundColor: `${pallette.primary}80`,
  },
  segment2: {
    bottom: 0,
    right: 0,
    backgroundColor: `${pallette.primary}60`,
  },
  segment3: {
    bottom: 0,
    left: 0,
    backgroundColor: `${pallette.primary}40`,
  },
  logoContainer: {
    width: 80,  // Changed from 70 to 80 for better circle
    height: 80, // Changed from 150 to 80 for perfect circle
    borderRadius: 40, // Half of width/height for perfect circle
    // backgroundColor: pallette.white,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Added to make logo circular
    // shadowColor: pallette.black,
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },
  logo: {
    width: 70,  // Slightly smaller than container
    height: 70, // Slightly smaller than container
    borderRadius: 33, // Half of width/height for perfect circle
  },
});

export default Loader;