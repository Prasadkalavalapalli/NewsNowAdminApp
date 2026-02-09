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
import AlertMessage from "../helpers/alertmessage";  // Import your AlertMessage component
import Toast from "react-native-toast-message";

// =============================================================================
// CONSTANTS
// =============================================================================

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
  address: "RAMAKONDA VILLAGE, PENDEKAL RS POST, TUGGALI MANDAL , KURNOOL DISTRICT, ANDHRA PRADESH "
};

/**
 * Privacy policy content sections
 */
const PRIVACY_SECTIONS = [
  {
    title: "1. Information We Collect",
    content: "News Now collects information to provide you with personalized news services and improve your experience. We collect:",
    bullets: [
      "Personal information (name, email, phone number for reporter accounts)",
      "Device information and app usage data",
      "Location data for local news personalization",
      "News preferences and reading history",
      "Feedback and survey responses"
    ]
  },
  {
    title: "2. How We Use Your Information",
    content: "We use the information we collect to:",
    bullets: [
      "Deliver personalized news content and recommendations",
      "Verify reporter identities and manage submissions",
      "Improve our app features and user experience",
      "Send important updates and notifications about news",
      "Ensure platform security and prevent misuse",
      "Comply with legal obligations and journalistic standards"
    ]
  },
  {
    title: "3. News Content and User Data",
    content: "As a news platform, we handle different types of data:",
    bullets: [
      "Reader data: Anonymous reading patterns for content improvement",
      "Reporter data: Verified information for accountability",
      "News sources: Protected under journalistic privilege",
      "User submissions: Carefully vetted for accuracy and reliability"
    ]
  },
  {
    title: "4. Data Sharing and Disclosure",
    content: "We are committed to protecting your privacy. We only share data when necessary:",
    bullets: [
      "With trusted service providers who help operate our platform",
      "For legal compliance or to protect our rights and users",
      "Aggregated, anonymized data for research and analytics",
      "Never sell personal data to third-party advertisers"
    ]
  },
  {
    title: "5. Data Security and Retention",
    content: "We implement industry-standard security measures:",
    bullets: [
      "Encrypted data transmission and storage",
      "Regular security audits and vulnerability assessments",
      "Limited access to sensitive information",
      "Data retention based on journalistic and legal requirements",
      "Secure deletion procedures for outdated information"
    ]
  },
  {
    title: "6. Your Privacy Rights",
    content: "You have control over your personal information:",
    bullets: [
      "Access and review your personal data",
      "Request correction of inaccurate information",
      "Delete your account and associated data",
      "Opt-out of non-essential communications",
      "Export your data in a portable format"
    ]
  },
  {
    title: "7. News Content and Copyright",
    content: "Our content protection policies:",
    bullets: [
      "All news content is copyrighted material",
      "Reproduction requires express permission",
      "Source attribution must be maintained",
      "User-generated content may be used with credit",
      "Content removal requests for valid legal reasons"
    ]
  }
];


// =============================================================================
// MAIN COMPONENT: PRIVACY POLICY SCREEN
// =============================================================================

/**
 * Privacy Policy Screen - Displays News Now privacy policy with contact options
 */
const PrivacyPolicy: React.FC = () => {
  const navigation = useNavigation();
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [showPhoneAlert, setShowPhoneAlert] = useState<boolean>(false);


//=============================================================================
// UTILITY FUNCTIONS
// =============================================================================

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
 * Opens privacy policy webpage
 */
// const handleWebsitePress = (): void => {
//   Linking.canOpenURL(COMPANY_CONTACT.website)
//     .then((supported) => {
//       if (supported) {
//         Linking.openURL(COMPANY_CONTACT.website);
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
// =============================================================================
// COMPONENT: CONTACT INFO ITEM
// =============================================================================

/**
 * Reusable component for clickable contact information
 */
interface ContactInfoItemProps {
  label: string;
  value: string;
  onPress: () => void;
  showArrow?: boolean;
}

const ContactInfoItem: React.FC<ContactInfoItemProps> = ({ 
  label, 
  value, 
  onPress,
  showArrow = false 
}) => (
  <TouchableOpacity onPress={onPress} style={styles.contactItem}>
    <View style={styles.contactItemContent}>
      <Text style={styles.contactLabel}>{label}</Text>
      <Text style={styles.contactValue}>{value}</Text>
    </View>
    {showArrow && <Text style={styles.contactArrow}>›</Text>}
  </TouchableOpacity>
);

// =============================================================================
// COMPONENT: PRIVACY POLICY SECTION
// =============================================================================

/**
 * Reusable component for privacy policy sections
 */
interface PrivacySectionProps {
  title: string;
  content: string;
  bullets: string[];
}

const PrivacySection: React.FC<PrivacySectionProps> = ({ title, content, bullets }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>
        <Text style={styles.sectionIconText}>•</Text>
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <Text style={styles.paragraph}>{content}</Text>
    {bullets.length > 0 && (
      <View style={styles.bulletsContainer}>
        {bullets.map((bullet, index) => (
          <View key={`bullet-${index}`} style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{bullet}</Text>
          </View>
        ))}
      </View>
    )}
  </View>
);





  /**
   * Handles navigation back to previous screen
   */
  const handleBackPress = (): void => {
    navigation.goBack();
  };


  return (
    <View style={styles.container}>
      <Header
        title="PrivacyPolicy"
        onback={navigation.goBack}
        active={1}
        onSkip={() => {}}
        skippable={false}
        hastitle={true}
      />
      
      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* Logo and Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../Asserts/logo.jpeg')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.pageTitle}>Privacy Policy</Text>
          <Text style={styles.lastUpdated}>Last Updated: December 20, 2024</Text>
        </View>
        
        {/* Introduction */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Our Commitment to Privacy</Text>
          <Text style={styles.introText}>
            At News Now, we are committed to protecting your privacy and being transparent 
            about how we collect, use, and safeguard your information. This Privacy Policy 
            explains our practices regarding your personal data and your rights.
          </Text>
        </View>
        
        {/* Privacy Policy Sections */}
        {PRIVACY_SECTIONS.map((section, index) => (
          <PrivacySection
            key={`section-${index}`}
            title={section.title}
            content={section.content}
            bullets={section.bullets}
          />
        ))}

        {/* Contact Information Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactSectionTitle}>8. Contact Us</Text>
          <Text style={styles.contactIntro}>
            If you have questions about this Privacy Policy or wish to exercise your 
            privacy rights, please contact us:
          </Text>
          
          <ContactInfoItem
            label="General Inquiries"
            value={COMPANY_CONTACT.email}
            onPress={() => handleEmailPress(COMPANY_CONTACT.email)}
            showArrow={true}
          />
          
          <ContactInfoItem
            label="Data Protection Officer"
            value={COMPANY_CONTACT.dpoEmail}
            onPress={() => handleEmailPress(COMPANY_CONTACT.dpoEmail)}
            showArrow={true}
          />
          
          <ContactInfoItem
            label="Phone Support"
            value={COMPANY_CONTACT.formattedPhone}
            onPress={handlePhonePress}
            showArrow={true}
          />
          
          <TouchableOpacity 
            style={styles.fullPolicyButton}
            onPress={handleWebsitePress}
          >
            <Text style={styles.fullPolicyText}>View Full Privacy Policy on Website</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using News Now, you acknowledge that you have read and understood 
            this Privacy Policy.
          </Text>
          <Text style={styles.footerCopyright}>
            © 2024 News Now Media. All rights reserved.
          </Text>
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Alert Messages */}
      <AlertMessage
        message={alertMessage}
        onClose={() => setAlertMessage("")}
      />
     
      
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
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: h * 0.04,
  },
  headerSection: {
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
    height:100,
  },
  pageTitle: {
    fontSize: adjust(18),
    color: pallette.primary,
    fontFamily: semibold,
    marginBottom: h * 0.005,
  },
  lastUpdated: {
    fontSize: adjust(12),
    color: pallette.grey,
    fontFamily: medium,
  },
  introSection: {
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
  introTitle: {
    fontSize: adjust(16),
    color: pallette.primary,
    fontFamily: semibold,
    marginBottom: h * 0.01,
  },
  introText: {
    fontSize: adjust(14),
    color: pallette.darkgrey,
    fontFamily: regular,
    lineHeight: adjust(20),
  },
  section: {
    backgroundColor: pallette.white,
    marginHorizontal: w * 0.04,
    marginBottom: h * 0.018,
    borderRadius: 12,
    padding: w * 0.04,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: h * 0.012,
  },
  sectionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: pallette.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: w * 0.03,
  },
  sectionIconText: {
    fontSize: adjust(14),
    color: pallette.white,
    fontFamily: bold,
  },
  sectionTitle: {
    fontSize: adjust(15),
    color: pallette.black,
    fontFamily: semibold,
    flex: 1,
  },
  paragraph: {
    fontSize: adjust(13),
    color: pallette.darkgrey,
    fontFamily: regular,
    lineHeight: adjust(19),
    marginBottom: h * 0.01,
  },
  bulletsContainer: {
    marginTop: h * 0.01,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: h * 0.008,
  },
  bulletDot: {
    fontSize: adjust(16),
    color: pallette.primary,
    marginRight: w * 0.02,
    lineHeight: adjust(18),
  },
  bulletText: {
    fontSize: adjust(13),
    color: pallette.darkgrey,
    fontFamily: regular,
    lineHeight: adjust(18),
    flex: 1,
  },
  contactSection: {
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
  contactSectionTitle: {
    fontSize: adjust(16),
    color: pallette.primary,
    fontFamily: semibold,
    marginBottom: h * 0.015,
  },
  contactIntro: {
    fontSize: adjust(13),
    color: pallette.darkgrey,
    fontFamily: regular,
    lineHeight: adjust(19),
    marginBottom: h * 0.015,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: pallette.lightgrey,
    padding: w * 0.035,
    borderRadius: 8,
    marginBottom: h * 0.01,
    borderWidth: 1,
    borderColor: `${pallette.primary}20`,
  },
  contactItemContent: {
    flex: 1,
  },
  contactLabel: {
    fontSize: adjust(12),
    color: pallette.grey,
    fontFamily: medium,
    marginBottom: h * 0.002,
  },
  contactValue: {
    fontSize: adjust(13),
    color: pallette.primary,
    fontFamily: semibold,
  },
  contactArrow: {
    fontSize: adjust(18),
    color: pallette.primary,
    marginLeft: w * 0.02,
  },
  fullPolicyButton: {
    backgroundColor: `${pallette.primary}15`,
    paddingVertical: h * 0.015,
    paddingHorizontal: w * 0.04,
    borderRadius: 8,
    alignItems: "center",
    marginTop: h * 0.015,
    borderWidth: 1,
    borderColor: `${pallette.primary}30`,
  },
  fullPolicyText: {
    fontSize: adjust(13),
    color: pallette.primary,
    fontFamily: medium,
  },
  footer: {
    alignItems: "center",
    paddingVertical: h * 0.025,
    backgroundColor: pallette.white,
    marginTop: h * 0.01,
    paddingHorizontal: w * 0.06,
  },
  footerText: {
    fontSize: adjust(12),
    color: pallette.grey,
    fontFamily: regular,
    textAlign: "center",
    lineHeight: adjust(17),
    marginBottom: h * 0.01,
  },
  footerCopyright: {
    fontSize: adjust(11),
    color: pallette.grey,
    fontFamily: medium,
    textAlign: "center",
  },
  bottomSpacer: {
    height: h * 0.03,
  },
});

export default PrivacyPolicy;