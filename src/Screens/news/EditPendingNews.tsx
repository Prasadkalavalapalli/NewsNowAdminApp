import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Video from 'react-native-video';
import ImagePicker from 'react-native-image-crop-picker';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { pallette } from '../helpers/colors';
import CustomDropdown from '../helpers/DropdownItem';
import Header from '../helpers/header';
import apiService from '../../Axios/Api';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useAppContext } from '../../Store/contexts/app-context';

const newsTypeOptions = [
  { label: 'Local News', value: 'LOCAL' },
  { label: 'National News', value: 'NATIONAL' },
];
const PriorityTypeOptions = [
  { label: 'Breaking News', value: 'BREAKING NEWS' },
  { label: 'Flash News', value: 'FLASH NEWS' },
  { label: 'Ordinary News', value: 'ORDINARY NEWS' },
];

const categoryOptions = [
  { label: 'Business', value: 'BUSINESS' },
  { label: 'Politics', value: 'POLITICS' },
  { label: 'Technology', value: 'TECHNOLOGY' },
  { label: 'Sports', value: 'SPORTS' },
  { label: 'Entertainment', value: 'ENTERTAINMENT' },
  { label: 'Health', value: 'HEALTH' },
  { label: 'Science', value: 'SCIENCE' },
  { label: 'Environment', value: 'ENVIRONMENT' },
  { label: 'Education', value: 'EDUCATION' },
];

const EditPendingNews = ({ route, navigation }) => {
  const { mode, news } = route.params;
  
  const [newsData, setNewsData] = useState(null);
  const [headline, setHeadline] = useState('');
  const [content, setContent] = useState('');
  const [newsType, setNewsType] = useState('LOCAL');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('BREAKING NEWS');
  const [district, setDistrict] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [localImage, setLocalImage] = useState(null);
  const [token, setToken] = useState(null);
  const { user } = useAppContext();
console.log(user)
  const fetchNewsDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNewsById(news.newsId);
      console.log('News details response:', response);
      if (response.error === false) {
        setNewsData(response.data);
        // Initialize form fields with fetched data
        setHeadline(response.data.headline || '');
        setContent(response.data.content || '');
        setNewsType(response.data.newsType || 'LOCAL');
        setCategory(response.data.category || '');
        setDistrict(response.data.district || '');
        setPriority(response.data.priority || 'BREAKING NEWS');
      } else {
        throw new Error(response.message || 'Failed to fetch news details');
      }
    } catch (error) {
      console.error('Fetch news error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to load news details',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get token and fetch news details
  useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token') || user?.token;
        setToken(storedToken);

        if (!storedToken) {
          Toast.show({
            type: 'error',
            text1: 'Authentication Error',
            text2: 'Please login again',
          });
          setTimeout(() => {
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          }, 1500);
          return;
        }
        
        // Fetch news details after getting token
        fetchNewsDetails();
      } catch (error) {
        console.error('Error getting token:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to authenticate',
        });
      }
    };
    getToken();
  }, []);

  // ================= MEDIA PICKER =================
  const handleMediaPick = async (source) => {
    try {
      const options = { cropping: true, compressImageQuality: 0.8, mediaType: 'photo' };
      const selectedMedia =
        source === 'camera'
          ? await ImagePicker.openCamera(options)
          : await ImagePicker.openPicker(options);

      const imageUri = Platform.OS === 'android' ? selectedMedia.path : selectedMedia.path;

      setLocalImage({
        uri: imageUri,
        type: selectedMedia.mime || 'image/jpeg',
        name: `news_${Date.now()}.jpg`,
      });

      Toast.show({ type: 'success', text1: 'Success', text2: 'Image selected successfully' });
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.error('Image picker error:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to select image: ' + error.message,
        });
      }
    }
  };

  const showMediaActionSheet = () => {
    Alert.alert('Change Image', 'Select image source', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Camera', onPress: () => handleMediaPick('camera') },
      { text: 'Gallery', onPress: () => handleMediaPick('gallery') },
      {
        text: 'Remove Image',
        style: 'destructive',
        onPress: () => {
          setLocalImage(null);
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Image removed',
          });
        },
      },
    ]);
  };

  // ================= VALIDATION =================
  const validateForm = () => {
    if (!headline.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Headline is required',
      });
      return false;
    }

    if (!content.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Content is required',
      });
      return false;
    }

    if (!newsType) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'News type is required',
      });
      return false;
    }

    if (!category) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Category is required',
      });
      return false;
    }

    if ((mode === 'REJECT' || mode === 'REJECTED') && !reason.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Rejection reason is required',
      });
      return false;
    }

    return true;
  };

  // Direct fetch API function for uploading news
  const uploadNewsDirect = async (userId, adminEditRequest, mediaFile) => {
    try {
      // Get token
      const token = await AsyncStorage.getItem('token') || user?.token;
      console.log('Upload token:', token);
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Create FormData
      const formData = new FormData();
      
      // Add news data as JSON string (FIXED: include priority)
      const newsJSON = JSON.stringify({
        headline: adminEditRequest.headline,
        content: adminEditRequest.content,
        newsType: adminEditRequest.newsType,
        category: adminEditRequest.category,
        district: adminEditRequest.district || null,
        // priority: newsData.priority || 'ORDINARY NEWS' // Added priority
      });
      
      console.log('News JSON:', newsJSON);
      formData.append('news', newsJSON);
      
      // Add media file if exists
      if (mediaFile) {
        console.log('Adding media file:', mediaFile);
        formData.append('media', {
          uri: mediaFile.uri,
          type: mediaFile.type || 'image/jpeg',
          name: mediaFile.name || `news_${Date.now()}.jpg`
        });
      }
  
      // Make fetch request
      const response = await fetch(
        `https://backend.newsvelugu.com/api/admin/news/upload?userId=${userId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );
       
      console.log('Upload response status:', response.status);
      
      // Check response status
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: `HTTP ${response.status}` };
        }
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      // Parse response
      const responseData = await response.json();
      
      console.log('Upload response data:', responseData);
      return responseData;
      
    } catch (error) {
      console.error('Upload news error:', error);
      throw error;
    }
  };

  // ================= EDIT NEWS FUNCTION =================
  const handleEditNews = async () => {
    if (!token) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Authentication required',
      });
      return;
    }

    if (!validateForm()) return;

    try {
      setLoading(true);

      // Prepare news data for upload
      const adminEditRequest = {
        headline: headline.trim(),
        content: content.trim(),
        newsType,
        category,
        district: district?.trim() || null,
        priority,
      };

      console.log('Uploading new news with data:', adminEditRequest);
       console.log(user?.userId)
      // Upload as new news first
      const uploadResponse = await uploadNewsDirect(user?.userId, adminEditRequest, localImage || imageSource);
     
      if (uploadResponse.error === false) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'News uploaded successfully. Now deleting old news...'
        });
        
        // Delete old news after successful upload
        const deleteResponse = await apiService.deleteNews(news.newsId, user?.userId);
      
        if (deleteResponse.error === false) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'News updated successfully'
          });
          
          setTimeout(() => {
            navigation.goBack(-1);
            if (route.params?.onSuccess) {
              route.params.onSuccess();
            }
          }, 2000);
          
        } else {
          throw new Error(deleteResponse.message || 'Failed to delete old news');
        }
        
      } else {
        throw new Error(uploadResponse.message || 'Failed to upload new news');
      }

    } catch (error) {
      console.error('Edit news error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to update news'
      });
    } finally {
      setLoading(false);
    }
  };

  // ================= REJECT NEWS FUNCTION =================
  const handleRejectNews = async () => {
    if (!token) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Authentication required',
      });
      return;
    }

    if (!validateForm()) return;

    try {
      setLoading(true);

      const rejectResponse = await apiService.rejectNews(news.newsId, reason);

      if (rejectResponse.error === false) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'News rejected successfully'
        });

        setTimeout(() => {
          navigation.goBack();
          if (route.params?.onSuccess) {
            route.params.onSuccess();
          }
        }, 1200);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: rejectResponse.message || 'Failed to reject news'
        });
      }
    } catch (error) {
      console.error('Reject news error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to reject news'
      });
    } finally {
      setLoading(false);
    }
  };

  // ================= APPROVE & PUBLISH FUNCTION =================
  const handleApprovePublishNews = async () => {
    if (!token) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Authentication required',
      });
      return;
    }

    if (!validateForm()) return;

    try {
      setLoading(true);

      // Prepare news data for upload
      const newsDataToUpload = {
        headline: headline.trim(),
        content: content.trim(),
        newsType,
        category,
        district: district?.trim() || null,
        priority,
      };

      console.log('Approving/Publishing news with data:', newsDataToUpload);
      
      // Upload as new news first
      const uploadResponse = await uploadNewsDirect(user.userId, newsDataToUpload, localImage || imageSource);
      
      if (uploadResponse.error === false) {
        // Delete old news after successful upload
        const deleteResponse = await apiService.deleteNews(news.newsId, user?.userId);
      
        if (deleteResponse.error === false) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'News approved & published successfully'
          });

          setTimeout(() => {
            navigation.goBack();
            if (route.params?.onSuccess) {
              route.params.onSuccess();
            }
          }, 1200);
          
        } else {
          throw new Error(deleteResponse.message || 'Failed to delete old news');
        }
        
      } else {
        throw new Error(uploadResponse.message || 'Failed to upload new news');
      }

    } catch (error) {
      console.error('Approve/Publish error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to approve and publish news'
      });
    } finally {
      setLoading(false);
    }
  };

  // ================= SUBMIT ACTION =================
  const submitAction = async () => {
    switch (mode) {
      case 'Edit':
        await handleEditNews();
        break;
      case 'REJECT':
      case 'REJECTED':
        await handleRejectNews();
        break;
      case 'APPROVE':
        await handleApprovePublishNews();
        break;
      default:
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Invalid mode specified'
        });
        break;
    }
  };

  // Helper function to get full media URL
  const getMediaUrl = (mediaPath) => {
    if (!mediaPath) return null;
    if (mediaPath.startsWith('http')) {
      return mediaPath;
    }
    return `https://backend.newsvelugu.com${mediaPath}`;
  };

  // ================= IMAGE SOURCE =================
  const getImageSource = () => {
    if (localImage?.uri) return { uri: localImage.uri };
    
    // Try image first, then mediaUrl
    if (newsData?.image) {
      return { uri: getMediaUrl(newsData.image) };
    }
    
    if (newsData?.mediaUrl) {
      return { uri: getMediaUrl(newsData.mediaUrl) };
    }
    
    return null;
  };

  const imageSource = getImageSource();

  // ================= GET TITLE =================
  const getTitle = () => {
    switch (mode) {
      case 'Edit':
        return 'Edit News';
      case 'REJECT':
      case 'REJECTED':
        return 'Edit & Reject News';
      case 'APPROVE':
        return 'Edit & Approve News';
      default:
        return 'Edit News';
    }
  };

  // ================= GET BUTTON TEXT =================
  const getButtonText = () => {
    switch (mode) {
      case 'Edit':
        return 'Update News';
      case 'REJECT':
      case 'REJECTED':
        return 'Reject News';
      case 'APPROVE':
        return 'Approve & Publish News';
      default:
        return 'Submit';
    }
  };

  if (!token || !newsData) {
    return (
      <View style={styles.container}>
        <Header
          onback={() => navigation.goBack()}
          hastitle
          title={getTitle()}
          active={1}
          skippable={false}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={pallette.primary} />
          <Text style={styles.loadingText}>Loading news details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        onback={() => navigation.goBack()}
        hastitle
        title={getTitle()}
        active={1}
        skippable={false}
      />
      <ScrollView style={styles.scrollView}>
        {/* MEDIA SECTION */}
        <View style={styles.mediaSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Media</Text>
            {(mode === 'APPROVE' || mode === 'Edit') && (
              <TouchableOpacity style={styles.editMediaButton} onPress={showMediaActionSheet} disabled={loading}>
                <Icon name="pen-to-square" size={16} color={pallette.primary} />
                <Text style={styles.editMediaText}>{imageSource ? 'Change Image' : 'Add Image'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {imageSource ? (
            <>
              <Text style={styles.mediaLabel}>{localImage ? 'New Image Preview' : 'Image Preview'}</Text>
              <View style={styles.mediaContainer}>
                <Image
                  source={imageSource}
                  style={styles.media}
                  resizeMode="cover"
                  onError={(e) => {
                    console.error('Image loading error:', e.nativeEvent.error);
                    Toast.show({
                      type: 'error',
                      text1: 'Error',
                      text2: 'Failed to load image'
                    });
                  }}
                />
                {(mode === 'APPROVE' || mode === 'Edit') && (
                  <TouchableOpacity style={styles.changeImageButton} onPress={showMediaActionSheet} disabled={loading}>
                    <Icon name="camera" size={16} color={pallette.white} />
                    <Text style={styles.changeImageText}>Change</Text>
                  </TouchableOpacity>
                )}
              </View>
              {localImage && (
                <View style={styles.mediaChangedBadge}>
                  <Icon name="circle-exclamation" size={12} color={pallette.primary} />
                  <Text style={styles.mediaChangedText}>New image selected</Text>
                </View>
              )}
            </>
          ) : newsData.mediaType === 'VIDEO' && newsData.mediaUrl ? (
            <>
              <Text style={styles.mediaLabel}>Video Preview</Text>
              <Video source={{ uri: newsData.mediaUrl }} style={styles.media} controls paused />
              <Text style={styles.videoNote}>Note: Video cannot be edited. Only images can be changed.</Text>
            </>
          ) : (
            <View style={styles.noMediaContainer}>
              <Icon name="image" size={40} color={pallette.lightgrey} />
              <Text style={styles.noMediaText}>No media available</Text>
              {(mode === 'APPROVE' || mode === 'Edit') && (
                <TouchableOpacity style={styles.addMediaButton} onPress={showMediaActionSheet} disabled={loading}>
                  <Icon name="plus" size={16} color={pallette.white} />
                  <Text style={styles.addMediaText}>Add Image</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* HEADLINE */}
        <Text style={styles.sectionTitle}>Headline *</Text>
        <TextInput
          style={styles.input}
          value={headline}
          onChangeText={setHeadline}
          placeholder="Enter headline"
          placeholderTextColor={pallette.grey}
          editable={!loading}
        />

        {/* CONTENT */}
        <Text style={styles.sectionTitle}>Content *</Text>
        <TextInput
          style={styles.textArea}
          value={content}
          onChangeText={setContent}
          placeholder="Enter news content"
          placeholderTextColor={pallette.grey}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          editable={!loading}
        />

        {/* DISTRICT */}
        <Text style={styles.sectionTitle}>District </Text>
        <TextInput
          style={styles.input}
          value={district}
          onChangeText={setDistrict}
          placeholder="Enter district"
          placeholderTextColor={pallette.grey}
          editable={!loading}
        />

        {/* REJECTION REASON */}
        {(mode === 'REJECT' || mode === 'REJECTED') && (
          <>
            <Text style={styles.sectionTitle}>Rejection Reason *</Text>
            <TextInput
              style={styles.textArea}
              value={reason}
              onChangeText={setReason}
              placeholder="Reason for rejection"
              placeholderTextColor={pallette.grey}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!loading}
            />
          </>
        )}

        {/* NEWS TYPE */}
        <Text style={styles.sectionTitle}>News Type *</Text>
        <CustomDropdown
          items={newsTypeOptions}
          selectedValue={newsType}
          onValueChange={setNewsType}
          disabled={loading}
          placeholder="Select news type"
        />

        {/* CATEGORY */}
        <Text style={styles.sectionTitle}>Category *</Text>
        <CustomDropdown
          items={categoryOptions}
          selectedValue={category}
          onValueChange={setCategory}
          disabled={loading}
          placeholder="Select category"
        />

        {/* PRIORITY */}
        <Text style={styles.sectionTitle}>Priority *</Text>
        <CustomDropdown
          items={PriorityTypeOptions}
          selectedValue={priority}
          onValueChange={setPriority}
          disabled={loading}
          placeholder="Select priority"
        />

        {/* ACTION BUTTON */}
        <Pressable
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={submitAction}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={pallette.white} />
          ) : (
            <Text style={styles.submitText}>
              {getButtonText()}
            </Text>
          )}
        </Pressable>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

export default EditPendingNews;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pallette.white,
    marginTop: 20
  },
  scrollView: {
    flex: 1,
    padding: 16
  },
  mediaSection: {
    marginBottom: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: pallette.black,
    marginBottom: 6,
    marginTop: 12
  },
  editMediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    backgroundColor: `${pallette.primary}15`,
    borderRadius: 6,
    gap: 4
  },
  editMediaText: {
    fontSize: 12,
    color: pallette.primary,
    fontWeight: '500'
  },
  mediaLabel: {
    fontSize: 12,
    color: pallette.grey,
    marginBottom: 6
  },
  mediaContainer: {
    position: 'relative',
    marginBottom: 8
  },
  media: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    backgroundColor: pallette.black
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6
  },
  changeImageText: {
    color: pallette.white,
    fontSize: 12,
    fontWeight: '500'
  },
  mediaChangedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${pallette.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    alignSelf: 'flex-start',
  },
  mediaChangedText: {
    fontSize: 11,
    color: pallette.primary,
    fontWeight: '500',
  },
  videoNote: {
    fontSize: 11,
    color: pallette.grey,
    fontStyle: 'italic',
    marginTop: 4
  },
  noMediaContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: pallette.lightgrey,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: pallette.lightgrey,
    borderStyle: 'dashed'
  },
  noMediaText: {
    fontSize: 14,
    color: pallette.grey,
    marginTop: 12,
    marginBottom: 16
  },
  addMediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: pallette.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8
  },
  addMediaText: {
    color: pallette.white,
    fontSize: 14,
    fontWeight: '500'
  },
  input: {
    borderWidth: 1,
    borderColor: pallette.lightgrey,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: pallette.black,
    marginBottom: 12,
    backgroundColor: pallette.white
  },
  textArea: {
    borderWidth: 1,
    borderColor: pallette.lightgrey,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: pallette.black,
    minHeight: 120,
    marginBottom: 12,
    textAlignVertical: 'top',
    backgroundColor: pallette.white
  },
  submitBtn: {
    backgroundColor: pallette.primary,
    padding: 15,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 24
  },
  submitBtnDisabled: {
    backgroundColor: pallette.grey
  },
  submitText: {
    color: pallette.white,
    fontWeight: 'bold',
    fontSize: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: pallette.white
  },
  loadingText: {
    marginTop: 12,
    color: pallette.grey,
    fontSize: 14
  },
});