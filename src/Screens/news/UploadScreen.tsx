import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import Video from 'react-native-video';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { pallette } from '../helpers/colors';
import { medium, bold, regular } from '../helpers/fonts';
import ToastMessage from '../helpers/ToastMessage';
import CustomDropdown from '../helpers/DropdownItem';
import MainHeader from '../helpers/mainheader';
import { useAppContext } from '../../Store/contexts/app-context';

// Your API base URL
const API_BASE_URL = 'https://e2a7b1160093.ngrok-free.app/api/';

const UploadScreen = () => {
  const navigation = useNavigation();
  const { user } = useAppContext();

  // State
  const [mediaType, setMediaType] = useState<'VIDEO' | 'IMAGE' | null>(null);
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<any>(null);
  
  const [newsType, setNewsType] = useState('');
  const [categoryType, setCategoryType] = useState('');
  const [headline, setHeadline] = useState('');
  const [content, setContent] = useState('');
  const [district, setDistrict] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Dropdown options
  const newsTypeOptions = [
    { label: 'Local', value: 'LOCAL' },
    { label: 'National', value: 'NATIONAL' },
    { label: 'International', value: 'INTERNATIONAL' },
    { label: 'Breaking', value: 'BREAKING' },
  ];

  const categoryOptions = [
    { label: 'Business', value: 'BUSINESS' },
    { label: 'Politics', value: 'POLITICS' },
    { label: 'Sports', value: 'SPORTS' },
    { label: 'Entertainment', value: 'ENTERTAINMENT' },
    { label: 'Technology', value: 'TECHNOLOGY' },
    { label: 'Health', value: 'HEALTH' },
    { label: 'Education', value: 'EDUCATION' },
    { label: 'Crime', value: 'CRIME' },
  ];

  // Media picker function
  const pickMedia = async (type: 'photo' | 'video') => {
    try {
      const result = await launchImageLibrary({
        mediaType: type,
        selectionLimit: 1,
        includeBase64: false,
        quality: 0.8,
      });

      if (!result.didCancel && result.assets?.length) {
        const asset = result.assets[0];
        setMediaUri(asset.uri || null);
        setMediaType(type === 'photo' ? 'IMAGE' : 'VIDEO');
        
        // Create file object for FormData
        const file = {
          uri: asset.uri,
          type: asset.type || (type === 'photo' ? 'image/jpeg' : 'video/mp4'),
          name: asset.fileName || `news_${Date.now()}.${type === 'photo' ? 'jpg' : 'mp4'}`,
        };
        setMediaFile(file);
      }
    } catch (error) {
      console.error('Media picker error:', error);
      showAlert('Failed to pick media');
    }
  };

  // Form validation
  const validateForm = () => {
    if (!headline.trim()) {
      showAlert('Please enter headline');
      return false;
    }

    if (!content.trim()) {
      showAlert('Please enter content');
      return false;
    }

    if (!newsType) {
      showAlert('Please select news type');
      return false;
    }

    if (!categoryType) {
      showAlert('Please select category');
      return false;
    }

    if (headline.length < 5) {
      showAlert('Headline should be at least 5 characters');
      return false;
    }

    if (content.length < 50) {
      showAlert('Content should be at least 50 characters');
      return false;
    }

    return true;
  };

  // Show alert
  const showAlert = (message: string) => {
    setToastMessage(message);
    setToastType('error');
    setShowToast(true);
  };

  // Direct fetch API function for uploading news
  const uploadNewsDirect = async (userId, newsData, mediaFile) => {
    try {
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Create FormData
      const formData = new FormData();
      
      // Add news data as JSON string
      const newsJSON = JSON.stringify({
        headline: newsData.headline,
        content: newsData.content,
        newsType: newsData.newsType,
        category: newsData.category,
        district: newsData.district || null
      });
      
      formData.append('news', newsJSON);
      
      // Add media file if exists
      if (mediaFile) {
        formData.append('media', {
          uri: mediaFile.uri,
          type: mediaFile.type,
          name: mediaFile.name
        });
      }
      // Make fetch request
      const response = await fetch(
        `https://backend.newsvelugu.com/api/admin/news/upload?userId=${userId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type manually for FormData
            // Let the browser set it with boundary
          },
          body: formData,
        }
      );
       console.log(mediaFile);
        console.log(formData);

      // Check response status
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      // Parse response
      const responseData = await response.json();
      
      console.log('Upload response:', responseData);
      return responseData;
      
    } catch (error) {
      console.error('Upload news error:', error);
      throw error;
    }
  };

  // Submit news function
  const submitNews = async () => {
    if (!validateForm()) return;

    if (!user?.userId) {
      showAlert('Please login to upload news');
      navigation.navigate('Login');
      return;
    }

    setLoading(true);

    try {
      // Prepare news data
      const newsData = {
        headline: headline.trim(),
        content: content.trim(),
        newsType: newsType,
        category: categoryType,
        district: district.trim() || null,
      };

      console.log('Submitting news:', newsData);

      // Call direct upload function
      const response = await uploadNewsDirect(user.userId, newsData, mediaFile);
      
      if (response.error === false) {
        setToastMessage(response.message || 'News submitted successfully');
        setToastType('success');
        setShowToast(true);
        
        // Reset form
        resetForm();
        
        // Navigate back after success
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } else {
        showAlert(response.message || 'Failed to submit news');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showAlert(error.message || 'Failed to upload news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setMediaType(null);
    setMediaUri(null);
    setMediaFile(null);
    setNewsType('');
    setCategoryType('');
    setHeadline('');
    setContent('');
    setDistrict('');
  };

  // Handle toast close
  const handleToastClose = () => {
    setShowToast(false);
    setToastMessage('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <MainHeader />
      
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Media Picker */}
        <Text style={styles.label}>Upload Media (Optional)</Text>
        <Text style={styles.subLabel}>Image or Video</Text>
        <View style={styles.mediaRow}>
          <Pressable
            style={[styles.mediaBox, mediaType === 'VIDEO' && styles.activeBox]}
            onPress={() => pickMedia('video')}
            disabled={loading}
          >
            <Text style={[styles.mediaText, mediaType === 'VIDEO' && styles.activeText]}>
              Video
            </Text>
          </Pressable>

          <Pressable
            style={[styles.mediaBox, mediaType === 'IMAGE' && styles.activeBox]}
            onPress={() => pickMedia('photo')}
            disabled={loading}
          >
            <Text style={[styles.mediaText, mediaType === 'IMAGE' && styles.activeText]}>
              Image
            </Text>
          </Pressable>
        </View>

        {/* Image Preview */}
        {mediaType === 'IMAGE' && mediaUri && (
          <Image source={{ uri: mediaUri }} style={styles.preview} />
        )}

        {/* Video Preview */}
        {mediaType === 'VIDEO' && mediaUri && (
          <Video
            source={{ uri: mediaUri }}
            style={styles.video}
            controls
            resizeMode="contain"
            paused={true}
          />
        )}

        {/* Headline */}
        <Text style={styles.label}>Headline *</Text>
        <Text style={styles.subLabel}>Minimum 5 characters</Text>
        <TextInput
          style={styles.input}
          value={headline}
          onChangeText={setHeadline}
          placeholder="Enter news headline"
          placeholderTextColor={pallette.grey}
          editable={!loading}
          maxLength={200}
        />

        {/* Content */}
        <Text style={styles.label}>Content *</Text>
        <Text style={styles.subLabel}>Minimum 50 characters</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={6}
          value={content}
          onChangeText={setContent}
          placeholder="Enter news content"
          placeholderTextColor={pallette.grey}
          editable={!loading}
          maxLength={5000}
          textAlignVertical="top"
        />

        {/* District (Optional) */}
        <Text style={styles.label}>District (Optional)</Text>
        <Text style={styles.subLabel}>e.g., Hyderabad, Warangal</Text>
        <TextInput
          style={styles.input}
          value={district}
          onChangeText={setDistrict}
          placeholder="Enter district name"
          placeholderTextColor={pallette.grey}
          editable={!loading}
        />

        {/* News Type Dropdown */}
        <Text style={styles.label}>News Type *</Text>
        <CustomDropdown
          items={newsTypeOptions}
          selectedValue={newsType}
          onValueChange={setNewsType}
          placeholder="Select news type"
          disabled={loading}
        />

        {/* Category Dropdown */}
        <Text style={styles.label}>Category *</Text>
        <CustomDropdown
          items={categoryOptions}
          selectedValue={categoryType}
          onValueChange={setCategoryType}
          placeholder="Select category"
          disabled={loading}
        />

        {/* Submit Button */}
        <Pressable 
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]} 
          onPress={submitNews}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={pallette.white} />
          ) : (
            <Text style={styles.submitText}>Submit News</Text>
          )}
        </Pressable>

        {/* User Info */}
        {user && (
          <Text style={styles.userInfo}>
            Uploading as: {user.name || user.email} ({user.role})
          </Text>
        )}
      </ScrollView>

      {/* Toast Message */}
      {showToast && (
        <ToastMessage
          type={toastType}
          message={toastMessage}
          onClose={handleToastClose}
        />
      )}
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: pallette.white 
  },
  container: { 
    padding: 20,
    paddingBottom: 40,
  },
  label: { 
    fontFamily: medium, 
    fontSize: 16,
    color: pallette.black,
    marginTop: 15,
    marginBottom: 5,
  },
  subLabel: {
    fontFamily: regular,
    fontSize: 12,
    color: pallette.grey,
    marginBottom: 8,
  },
  mediaRow: { 
    flexDirection: 'row', 
    marginBottom: 10,
    gap: 10,
  },
  mediaBox: {
    flex: 1,
    padding: 20,
    borderWidth: 1,
    borderColor: pallette.lightgrey,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: pallette.white,
  },
  activeBox: {
    borderColor: pallette.primary,
    backgroundColor: pallette.lightprimary,
  },
  mediaText: { 
    fontFamily: medium,
    fontSize: 14,
    color: pallette.darkgrey,
  },
  activeText: {
    color: pallette.primary,
    fontFamily: bold,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: pallette.lightgrey,
  },
  video: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    backgroundColor: pallette.black,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: pallette.lightgrey,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontFamily: regular,
    fontSize: 14,
    color: pallette.black,
    backgroundColor: pallette.white,
  },
  textArea: {
    borderWidth: 1,
    borderColor: pallette.lightgrey,
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
    fontFamily: regular,
    fontSize: 14,
    color: pallette.black,
    backgroundColor: pallette.white,
    marginBottom: 10,
  },
  submitBtn: {
    backgroundColor: pallette.primary,
    padding: 16,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 25,
    marginBottom: 10,
  },
  submitBtnDisabled: {
    backgroundColor: `${pallette.primary}80`,
  },
  submitText: {
    color: pallette.white,
    fontFamily: bold,
    fontSize: 16,
  },
  userInfo: {
    textAlign: 'center',
    fontFamily: regular,
    fontSize: 12,
    color: pallette.grey,
    marginTop: 10,
  },
});

export default UploadScreen;