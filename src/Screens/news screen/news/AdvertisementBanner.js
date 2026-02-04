import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Linking,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { pallette } from '../../helpers/colors';
import { medium, bold, semibold } from '../../helpers/fonts';
import { useLocation } from '../location/LocationContext';
import apiService from '../../../Axios/Api';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AdvertisementComponent = ({ adNumber = 1, adIndex = 0 }) => {
  const [currentAd, setCurrentAd] = useState(null);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const [loading, setLoading] = useState(true);
  const [advertisements, setAdvertisements] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const { coordinates } = useLocation();

  // Fetch advertisements from API
  const loadAdvertisements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllAdvertisements(coordinates);
      console.log(response.data)
      if (response.error === false && response.data && response.data.length > 0) {
        // Map API response to your ad format
        const mappedAds = response.data.map(ad => ({
          id: ad.advertisementId || ad.id,
          type: ad.adType || 'banner',
          title: ad.title || 'Advertisement',
          description: ad.description || '',
          ctaText: ad.callToAction || 'Learn More',
          linkUrl: ad.link || ad.url || '',
          imageUrl: ad.image || ad.mediaUrl || '',
          backgroundColor: ad.backgroundColor || pallette.l1,
          textColor: ad.textColor || pallette.white,
          promoCode: ad.promoCode || null,
          sponsor: ad.sponsor || null,
        }));
        
        setAdvertisements(mappedAds);
      } else {
        // No ads available from API
        setAdvertisements([]);
      }
    } catch (error) {
      console.error('Load advertisements error:', error);
      setAdvertisements([]);
    } finally {
      setLoading(false);
    }
  }, [coordinates]);

  useEffect(() => {
    loadAdvertisements();
  }, [loadAdvertisements]);

  useEffect(() => {
    if (advertisements.length > 0) {
      // Select ad based on adIndex (rotates through ads)
      const selectedAdIndex = adIndex % advertisements.length;
      const ad = advertisements[selectedAdIndex];
      
      // Create full screen version of the ad
      const fullScreenAd = {
        ...ad,
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
    }
  }, [advertisements, adNumber, adIndex]);

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

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={pallette.primary} />
      </View>
    );
  }

  if (!currentAd || advertisements.length === 0) {
    // Return empty view if no ads
    return null;
  }

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
          
          {currentAd.description && (
            <Text style={[styles.description, { color: currentAd.textColor }]}>
              {currentAd.description}
            </Text>
          )}
          
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
          
          {currentAd.linkUrl && (
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
          )}
        </View>
        
        {/* Swipe Indicator */}
        {advertisements.length > 1 && (
          <View style={styles.swipeIndicator}>
            <Icon name="chevron-left" size={20} color={currentAd.textColor} />
            <Text style={[styles.swipeText, { color: currentAd.textColor }]}>
              Swipe for next content
            </Text>
            <Icon name="chevron-right" size={20} color={currentAd.textColor} />
          </View>
        )}
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
});

export default AdvertisementComponent;