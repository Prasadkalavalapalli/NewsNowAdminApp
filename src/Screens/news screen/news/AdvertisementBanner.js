// FullScreenAd.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { pallette } from '../../helpers/colors';
import { medium, bold, semibold } from '../../helpers/fonts';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AdvertisementComponent= ({ adNumber = 1, adIndex = 0 }) => {
  const [currentAd, setCurrentAd] = useState(null);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Advertisement data - using your existing ADVERTISEMENTS
  const ADVERTISEMENTS = [
    {
      id: 1,
      type: 'banner',
      title: 'Breaking News Premium',
      description: 'Get ad-free experience with premium subscription. No interruptions, exclusive content and priority support.',
      ctaText: 'Subscribe Now',
      linkUrl: 'https://yourapp.com/premium',
      imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800',
      backgroundColor: pallette.l1,
      textColor: pallette.white,
    },
    {
      id: 2,
      type: 'promo',
      title: 'Limited Time Offer!',
      description: '50% off on yearly subscription. Exclusive deal for our readers. Limited spots available.',
      ctaText: 'Claim Offer',
      linkUrl: 'https://yourapp.com/offer',
      imageUrl: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=800',
      backgroundColor: pallette.red,
      textColor: pallette.white,
      promoCode: 'NEWS50',
    },
    {
      id: 3,
      type: 'sponsored',
      title: 'Sponsored: Election Coverage',
      description: 'Live updates from polling stations. Real-time results and expert analysis.',
      ctaText: 'Watch Live',
      linkUrl: 'https://yourapp.com/election',
      imageUrl: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800',
      backgroundColor: pallette.l4,
      textColor: pallette.white,
      sponsor: 'Election Commission',
    },
  ];

  useEffect(() => {
    // Select ad based on adIndex (rotates through ads)
    const selectedAdIndex = adIndex % ADVERTISEMENTS.length;
    const ad = ADVERTISEMENTS[selectedAdIndex];
    
    // Create full screen version of the ad
    const fullScreenAd = {
      ...ad,
      // Override styles for full screen
      backgroundColor: ad.backgroundColor || pallette.l1,
      textColor: ad.textColor || pallette.white,
    };
    
    setCurrentAd(fullScreenAd);
    
    // Animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Show close button after 3 seconds
    setTimeout(() => {
      setShowCloseButton(true);
    }, 3000);
  }, [adNumber, adIndex]);

  const handleAdPress = async () => {
    if (currentAd?.linkUrl) {
      try {
        const canOpen = await Linking.canOpenURL(currentAd.linkUrl);
        if (canOpen) {
          await Linking.openURL(currentAd.linkUrl);
        }
      } catch (error) {
        console.error('Failed to open URL:', error);
      }
    }
  };

  const handleClose = () => {
    // Optional: You can add close animation
    console.log('Ad closed');
  };

  if (!currentAd) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          backgroundColor: currentAd.backgroundColor,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}>
      
      {/* Ad Label
      <View style={styles.adLabel}>
        <Icon name="bullhorn" size={14} color={currentAd.textColor} />
        <Text style={[styles.adLabelText, { color: currentAd.textColor }]}>
          ADVERTISEMENT
        </Text>
      </View>
      
      {/* Close Button (appears after 3 seconds)
      {showCloseButton && (
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Icon name="xmark" size={18} color={currentAd.textColor} />
        </TouchableOpacity>
      )} */}
      
      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Image */}
        {currentAd.imageUrl && (
          <Image
            source={{ uri: currentAd.imageUrl }}
            style={styles.adImage}
            resizeMode="cover"
          />
        )}
        
        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: currentAd.textColor }]}>
            {currentAd.title}
          </Text>
          
          <Text style={[styles.description, { color: currentAd.textColor }]}>
            {currentAd.description}
          </Text>
          
          {currentAd.promoCode && (
            <View style={styles.promoContainer}>
              <Text style={[styles.promoLabel, { color: currentAd.textColor }]}>
                Use code:
              </Text>
              <Text style={styles.promoCode}>{currentAd.promoCode}</Text>
            </View>
          )}
          
          {currentAd.sponsor && (
            <Text style={[styles.sponsorText, { color: currentAd.textColor }]}>
              Sponsored by: {currentAd.sponsor}
            </Text>
          )}
          
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: currentAd.textColor === pallette.white ? pallette.primary : pallette.white }]}
            onPress={handleAdPress}
            activeOpacity={0.8}
          >
            <Text style={[styles.ctaButtonText, { 
              color: currentAd.textColor === pallette.white ? pallette.white : pallette.black 
            }]}>
              {currentAd.ctaText}
            </Text>
            <Icon 
              name="arrow-right" 
              size={16} 
              color={currentAd.textColor === pallette.white ? pallette.white : pallette.black} 
              style={styles.ctaIcon} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Swipe Indicator */}
        <View style={styles.swipeIndicator}>
          <Icon name="chevron-left" size={20} color={currentAd.textColor} />
          <Text style={[styles.swipeText, { color: currentAd.textColor }]}>
            Swipe for next content
          </Text>
          <Icon name="chevron-right" size={20} color={currentAd.textColor} />
        </View>
        
        {/* Ad Counter */}
        {/* <Text style={[styles.adCounter, { color: currentAd.textColor }]}>
          Advertisement {adNumber}
        </Text> */}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adLabel: {
    position: 'absolute',
    top: 40,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  adLabelText: {
    fontSize: 12,
    fontFamily: bold,
    marginLeft: 6,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  adImage: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_HEIGHT * 0.4,
    borderRadius: 16,
    marginBottom: 30,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    maxWidth: SCREEN_WIDTH * 0.9,
  },
  title: {
    fontSize: 28,
    fontFamily: bold,
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 34,
  },
  description: {
    fontSize: 18,
    fontFamily: medium,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
    opacity: 0.9,
  },
  promoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  promoLabel: {
    fontSize: 16,
    fontFamily: medium,
    marginRight: 8,
  },
  promoCode: {
    fontSize: 20,
    fontFamily: bold,
    backgroundColor: pallette.white,
    color: pallette.black,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  sponsorText: {
    fontSize: 16,
    fontFamily: medium,
    fontStyle: 'italic',
    marginBottom: 25,
    opacity: 0.8,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 40,
  },
  ctaButtonText: {
    fontSize: 18,
    fontFamily: semibold,
    marginRight: 10,
  },
  ctaIcon: {
    marginLeft: 5,
  },
  swipeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 60,
  },
  swipeText: {
    fontSize: 14,
    fontFamily: medium,
    marginHorizontal: 10,
    opacity: 0.8,
  },
  adCounter: {
    position: 'absolute',
    bottom: 20,
    fontSize: 12,
    fontFamily: medium,
    opacity: 0.6,
  },
});

export default AdvertisementComponent;