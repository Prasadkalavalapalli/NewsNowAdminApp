import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { pallette } from "../helpers/colors";
import { regular, medium, semibold, bold } from "../helpers/fonts";
import { adjust, h, w } from "../../constants/dimensions";
import Header from "../helpers/header";
import AlertMessage from "../helpers/alertmessage";
import Toast from "react-native-toast-message";

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Company contact information constants
 */
const COMPANY_CONTACT = {
  email: "newsnowhelpdesk@gmail.com",
  phone: "+91 9494750137",
  formattedPhone: "+91 9494750137",
  website: "https://newsvelugu.com",
  dpoEmail: "newsnowhelpdesk@gmail.com",
  address: "PENDEKAL RS POST,TUGGALI MANDAL , KURNOOL DISTRICT, ANDHRA PRADESH"
};


/**
 * App version information
 */
const APP_INFO = {
  version: "2.1.0",
  copyright: "© 2024 News Now. All rights reserved."
};

/**
 * Feature cards configuration
 */
const FEATURES = [
  {
    title: "Real-Time Updates",
    description: "Get instant breaking news alerts and live updates from around the world"
  },
  {
    title: "Verified Sources",
    description: "All news verified by our editorial team for accuracy and reliability"
  },
  {
    title: "Local Coverage",
    description: "Comprehensive local news from your city and neighborhood"
  },
  {
    title: "Multi-Category",
    description: "News across politics, sports, business, entertainment, and more"
  }
];

// =============================================================================
// COMPONENT: FEATURE CARD
// =============================================================================

/**
 * Reusable component for displaying feature cards
 */
interface FeatureCardProps {
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description }) => (
  <View style={styles.featureCard}>
    <View style={styles.featureIcon}>
      <Text style={styles.featureIconText}>N</Text>
    </View>
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

// =============================================================================
// COMPONENT: CONTACT BUTTON
// =============================================================================

/**
 * Reusable component for contact action buttons
 */
interface ContactButtonProps {
  text: string;
  onPress: () => void;
}

const ContactButton: React.FC<ContactButtonProps> = ({ text, onPress }) => (
  <TouchableOpacity 
    style={styles.contactButton} 
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={styles.contactButtonText}>{text}</Text>
  </TouchableOpacity>
);

// =============================================================================
// COMPONENT: CONTACT INFO ITEM
// =============================================================================

/**
 * Reusable component for displaying contact information
 */
interface ContactInfoItemProps {
  label: string;
  value: string;
  isClickable?: boolean;
  onPress?: () => void;
}

const ContactInfoItem: React.FC<ContactInfoItemProps> = ({ 
  label, 
  value, 
  isClickable = false, 
  onPress 
}) => (
  <View style={styles.contactItem}>
    <Text style={styles.contactLabel}>{label}</Text>
    {isClickable ? (
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.contactValueClickable}>{value}</Text>
      </TouchableOpacity>
    ) : (
      <Text style={styles.contactValue}>{value}</Text>
    )}
  </View>
);

// =============================================================================
// MAIN COMPONENT: ABOUT NEWS NOW SCREEN
// =============================================================================

/**
 * About News Now Screen - Displays news channel information, mission, features and contact details
 */
const AboutNewsNow: React.FC = () => {
  const navigation = useNavigation();
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [showCallAlert, setShowCallAlert] = useState<boolean>(false);
  const [showWebsiteAlert, setShowWebsiteAlert] = useState<boolean>(false);

  /**
   * Handles navigation back to previous screen
   */
  const handleBackPress = (): void => {
    navigation.goBack();
  };

  /**
   * Opens email client with pre-filled recipient
   */
 const handleEmailPress = (): void => {
  const emailUrl = `mailto:${COMPANY_CONTACT.email}`;
  
  try {
    Linking.openURL(emailUrl).catch(() => {
      setAlertMessage("Failed to open email app");
    });
  } catch (error) {
    console.error("Error opening email URL:", error);
    setAlertMessage("Failed to open email app");
  }
};
  /**
   * Initiates phone call to company contact number
   */
 const handlePhonePress = async (): Promise<void> => {
  const phoneUrl = `tel:${COMPANY_CONTACT.phone}`;
  
  Linking.openURL(phoneUrl).catch((error) => {
    console.error("Phone call failed:", error);
    setAlertMessage("Failed to make phone call");
  });
};

  /**
   * Confirms phone call
   */
  const confirmPhoneCall = (confirmed: boolean): void => {
    setShowCallAlert(false);
    if (confirmed) {
      const phoneUrl = `tel:${COMPANY_CONTACT.phone}`;
      Linking.openURL(phoneUrl);
    }
  };

  /**
   * Opens company website in browser
   */
  // const handleWebsitePress = (): void => {
  //   Linking.canOpenURL(COMPANY_CONTACT.website)
  //     .then((supported) => {
  //       if (supported) {
  //         setShowWebsiteAlert(true);
  //       } else {
  //         setAlertMessage("Browser is not available on this device");
  //       }
  //     })
  //     .catch(() => {
  //       setAlertMessage("Failed to open website");
  //     });
  // };

   const handleWebsitePress = (): void => {
    Toast.show({
      type:'success',
      text1:'Website Coming soon...!',
      text2:'Thank You....'

    })
  };

  /**
   * Confirms website opening
   */
  const confirmWebsiteOpen = (confirmed: boolean): void => {
    setShowWebsiteAlert(false);
    if (confirmed) {
      Linking.openURL(COMPANY_CONTACT.website);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Component */}
      <Header
        title="About NewsNow"
        onback={navigation.goBack}
        active={1}
        onSkip={() => {}}
        skippable={false}
        hastitle={true}
      />
      
      {/* Main Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* Channel Logo and Brand Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../Asserts/logo.jpeg')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.tagline}>Your Trusted Source for Latest News</Text>
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.paragraph}>
            At News Now, we're committed to delivering accurate, timely, and unbiased 
            news from around the world. Our mission is to keep you informed with 
            verified news that matters to you.
          </Text>
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We Offer</Text>
          <Text style={styles.paragraph}>
            News Now provides comprehensive news coverage including:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Breaking News & Live Updates</Text>
            <Text style={styles.bulletPoint}>• Local & Regional News Coverage</Text>
            <Text style={styles.bulletPoint}>• Politics & Government Updates</Text>
            <Text style={styles.bulletPoint}>• Business & Financial News</Text>
            <Text style={styles.bulletPoint}>• Sports Highlights & Analysis</Text>
            <Text style={styles.bulletPoint}>• Entertainment & Lifestyle News</Text>
          </View>
        </View>

        {/* Vision Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Vision</Text>
          <Text style={styles.paragraph}>
            To become the most trusted and comprehensive digital news platform, 
            delivering factual, unbiased news while empowering citizens with 
            information that enables informed decisions.
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose News Now?</Text>
          {FEATURES.map((feature, index) => (
            <FeatureCard
              key={`feature-${index}`}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </View>

        {/* Editorial Values */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Editorial Values</Text>
          <View style={styles.valuesContainer}>
            <View style={styles.valueItem}>
              <Text style={styles.valueTitle}>Accuracy</Text>
              <Text style={styles.valueDescription}>Fact-checked news from verified sources</Text>
            </View>
            <View style={styles.valueItem}>
              <Text style={styles.valueTitle}>Impartiality</Text>
              <Text style={styles.valueDescription}>Unbiased reporting without agenda</Text>
            </View>
            <View style={styles.valueItem}>
              <Text style={styles.valueTitle}>Transparency</Text>
              <Text style={styles.valueDescription}>Clear sourcing and methodology</Text>
            </View>
            <View style={styles.valueItem}>
              <Text style={styles.valueTitle}>Integrity</Text>
              <Text style={styles.valueDescription}>Ethical journalism standards</Text>
            </View>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact News Now</Text>
          
          <Text style={styles.contactSubtitle}>
            Have a news tip, feedback, or want to advertise with us?
          </Text>
          
          <ContactButton
            text="Email Us"
            onPress={handleEmailPress}
          />

          <ContactButton
            text="Visit Our Website"
            onPress={handleWebsitePress}
          />

          <View style={styles.contactInfo}>
            <ContactInfoItem
              label="Email Address"
              value={COMPANY_CONTACT.email}
              isClickable={true}
              onPress={handleEmailPress}
            />
            
            <ContactInfoItem
              label="Contact Number"
              value={COMPANY_CONTACT.formattedPhone}
              isClickable={true}
              onPress={handlePhonePress}
            />
            
            <ContactInfoItem
              label="Office Address"
              value={COMPANY_CONTACT.address}
            />
          </View>
        </View>

        {/* Footer Section */}
        <View style={styles.footer}>
          <Text style={styles.version}>News Now App v{APP_INFO.version}</Text>
          <Text style={styles.copyright}>{APP_INFO.copyright}</Text>
          <Text style={styles.disclaimer}>
            All content is protected by copyright laws. Unauthorized reproduction is prohibited.
          </Text>
        </View>
      </ScrollView>

      {/* Alert Messages */}
      {alertMessage ? (
        <AlertMessage
          message={alertMessage}
          onClose={() => setAlertMessage("")}
        />
      ) : null}
      
      {showCallAlert ? (
        <AlertMessage
          message={`Do you want to call ${COMPANY_CONTACT.formattedPhone}?`}
          onClose={confirmPhoneCall}
          showConfirm={true}
        />
      ) : null}
      
      {showWebsiteAlert ? (
        <AlertMessage
          message="Do you want to visit our website?"
          onClose={confirmWebsiteOpen}
          showConfirm={true}
        />
      ) : null}
    </View>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pallette.lightgrey,
    paddingTop: 20,
  },
  content: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: h * 0.04,
  },
  logoSection: {
    alignItems: "center",
    paddingVertical: h * 0.03,
    backgroundColor: pallette.white,
    marginBottom: h * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  logoContainer: {
    width: 70,  // Make it circular (same width and height)
    height:70, // Make it circular (same width and height)
    borderRadius: 30, // Half to make perfect circle
    backgroundColor: pallette.white, // Optional: add background if needed
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Important: makes logo stay within circle
    borderWidth: 3, // Optional: border for visual effect
    borderColor: '#990000'
  },
  logo: {
    width: 100,
    height: 100,
  },
  channelName: {
    fontSize: adjust(24),
    color: pallette.black,
    fontFamily: bold,
    marginBottom: h * 0.005,
  },
  tagline: {
    fontSize: adjust(14),
    color: pallette.grey,
    fontFamily: medium,
  },
  section: {
    backgroundColor: pallette.white,
    marginHorizontal: w * 0.04,
    marginBottom: h * 0.02,
    borderRadius: 12,
    padding: w * 0.04,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: adjust(18),
    color: pallette.black,
    fontFamily: semibold,
    marginBottom: h * 0.015,
  },
  paragraph: {
    fontSize: adjust(14),
    color: pallette.grey,
    fontFamily: regular,
    lineHeight: adjust(20),
    marginBottom: h * 0.01,
  },
  bulletPoints: {
    marginTop: h * 0.01,
    marginLeft: w * 0.02,
  },
  bulletPoint: {
    fontSize: adjust(13),
    color: pallette.grey,
    fontFamily: regular,
    lineHeight: adjust(20),
    marginBottom: h * 0.005,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: `${pallette.primary}10`,
    padding: w * 0.03,
    borderRadius: 10,
    marginBottom: h * 0.012,
    borderWidth: 1,
    borderColor: `${pallette.primary}20`,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: pallette.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: w * 0.03,
  },
  featureIconText: {
    fontSize: adjust(16),
    color: pallette.white,
    fontFamily: bold,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: adjust(14),
    color: pallette.black,
    fontFamily: semibold,
    marginBottom: h * 0.005,
  },
  featureDescription: {
    fontSize: adjust(12),
    color: pallette.grey,
    fontFamily: regular,
    lineHeight: adjust(16),
  },
  valuesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  valueItem: {
    width: "48%",
    backgroundColor: pallette.lightgrey,
    padding: w * 0.03,
    borderRadius: 8,
    marginBottom: h * 0.01,
    alignItems: "center",
  },
  valueTitle: {
    fontSize: adjust(12),
    color: pallette.primary,
    fontFamily: bold,
    marginBottom: h * 0.005,
    textAlign: "center",
  },
  valueDescription: {
    fontSize: adjust(10),
    color: pallette.grey,
    fontFamily: regular,
    textAlign: "center",
    lineHeight: adjust(14),
  },
  contactSubtitle: {
    fontSize: adjust(13),
    color: pallette.grey,
    fontFamily: regular,
    marginBottom: h * 0.015,
    textAlign: "center",
  },
  contactButton: {
    backgroundColor: pallette.primary,
    paddingVertical: h * 0.015,
    paddingHorizontal: w * 0.04,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: h * 0.015,
  },
  contactButtonText: {
    fontSize: adjust(14),
    color: pallette.white,
    fontFamily: medium,
  },
  contactInfo: {
    marginTop: h * 0.01,
  },
  contactItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: h * 0.01,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  contactLabel: {
    fontSize: adjust(13),
    color: pallette.grey,
    fontFamily: medium,
    flex: 1,
  },
  contactValue: {
    fontSize: adjust(13),
    color: pallette.darkgrey,
    fontFamily: regular,
    flex: 2,
    textAlign: "right",
  },
  contactValueClickable: {
    fontSize: adjust(13),
    color: pallette.primary,
    fontFamily: regular,
    flex: 2,
    textAlign: "right",
    textDecorationLine: "underline",
  },
  footer: {
    alignItems: "center",
    paddingVertical: h * 0.03,
    backgroundColor: pallette.white,
    marginTop: h * 0.01,
  },
  version: {
    fontSize: adjust(12),
    color: pallette.grey,
    fontFamily: medium,
    marginBottom: h * 0.005,
  },
  copyright: {
    fontSize: adjust(12),
    color: pallette.grey,
    fontFamily: regular,
    marginBottom: h * 0.005,
  },
  disclaimer: {
    fontSize: adjust(10),
    color: pallette.grey,
    fontFamily: regular,
    textAlign: "center",
    marginTop: h * 0.01,
    paddingHorizontal: w * 0.1,
    fontStyle: "italic",
  },
});

export default AboutNewsNow;