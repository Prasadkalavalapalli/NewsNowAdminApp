// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   Image,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   ActivityIndicator,
// } from 'react-native';
// import Video from 'react-native-video';
// import ToastMessage from '../helpers/ToastMessage';
// import { pallette } from '../helpers/colors';
// import CustomDropdown from '../helpers/DropdownItem';
// import Header from '../helpers/header';
// import apiService from '../../Axios/Api';
// import VerifiedNewsScreen from './verifiednews';
// import RejectedNewsScreen from './rejectednews';
// import Toast from 'react-native-toast-message';
// import NewsList from './newslist';

// const newsTypeOptions = [
//   { label: 'Local News', value: 'LOCAL' },
//   { label: 'National News', value: 'NATIONAL' },
// ];

// const categoryOptions = [
//   { label: 'Business', value: 'BUSINESS' },
//   { label: 'Politics', value: 'POLITICS' },
//   { label: 'Technology', value: 'TECHNOLOGY' },
//   { label: 'Sports', value: 'SPORTS' },
//   { label: 'Entertainment', value: 'ENTERTAINMENT' },
//   { label: 'Health', value: 'HEALTH' },
//   { label: 'Science', value: 'SCIENCE' },
//   { label: 'Environment', value: 'ENVIRONMENT' },
//   { label: 'Education', value: 'EDUCATION' },
// ];

// const EditPendingNews = ({ route, navigation }) => {
//   const { mode, news } = route.params;

//   const [headline, setHeadline] = useState(news.headline);
//   const [mediaUrl, setMediaUrl] = useState(news.mediaUrl);
//   const [content, setContent] = useState(news.content);
//   const [newsType, setNewsType] = useState(news.newsType);
//   const [category, setCategory] = useState(
//     news.category || news.categories?.[0] || ''
//   );
//   const [reason, setReason] = useState('');
//   const [toast, setToast] = useState({ visible: false, message: '', type: '' });
//   const [loading, setLoading] = useState(false);

// console.log(news)
// const submitAction = async () => {
//     // Validate inputs
//     if (!headline.trim()) {
//       Toast.show({
//         type: 'error',
//         text1: 'Validation Error',
//         text2: 'Headline is required'
//       });
//       return;
//     }

//     if (!content.trim()) {
//       Toast.show({
//         type: 'error',
//         text1: 'Validation Error',
//         text2: 'Content is required'
//       });
//       return;
//     }

//     if (!newsType) {
//       Toast.show({
//         type: 'error',
//         text1: 'Validation Error',
//         text2: 'Please select news type'
//       });
//       return;
//     }

//     if (!category) {
//       Toast.show({
//         type: 'error',
//         text1: 'Validation Error',
//         text2: 'Please select category'
//       });
//       return;
//     }

//     if (mode === 'REJECT' && !reason.trim()) {
//       Toast.show({
//         type: 'error',
//         text1: 'Validation Error',
//         text2: 'Rejection reason is required'
//       });
//       return;
//     }

//     try {
//       setLoading(true);
      
//       if (mode === 'APPROVE') {
//         const approveResponse = await apiService.approveAndPublishNews(news.newsId, {
//           headline: headline,
//           content: content,
//           mediaUrl: mediaUrl,
//           newsType: newsType,
//           category: category,
//         });
        
//         if (approveResponse.error === false) {
//           Toast.show({
//             type: 'success',
//             text1: 'Success',
//             text2: 'News approved and published successfully'
//           });
          
//           setTimeout(() => {
//             navigation.goBack();
//             // Optional: Refresh the previous screen
//             if (route.params?.onSuccess) {
//               route.params.onSuccess();
//             }
//           }, 1200);
//         } else {
//           throw new Error(approveResponse.message || 'Failed to approve news');
//         }
//       } else {
//         const rejectResponse = await apiService.rejectNews(news.newsId, reason);
        
//         if (rejectResponse.error === false) {
//           Toast.show({
//             type: 'success',
//             text1: 'Success',
//             text2: 'News rejected successfully'
//           });
          
//           setTimeout(() => {
//           navigation.goBack();
//             // Optional: Refresh the previous screen
//             if (route.params?.onSuccess) {
//               route.params.onSuccess();
//             }
//           }, 1200);
//         } else {
//           Toast.show({
//             type: 'error',
//             text1: 'Error',
//             text2: rejectResponse.message || 'Failed to process request'
//           });
//           throw new Error(rejectResponse.message || 'Failed to reject news');
//         }
//       }
//     } catch (error) {
//       console.error('Confirm action error:', error);
//       Toast.show({
//         type: 'error',
//         text1: 'Error',
//         text2: error.message || 'Failed to process request'
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCloseToast = () => {
//     setToast({ visible: false, message: '', type: '' });
//   };

//   return (
//     <View style={styles.container}>
//       <Header
//         onback={() => navigation.goBack()}
//         hastitle={true}
//         title={mode === 'APPROVE' ? 'Edit & Approve News' : 'Edit & Reject News'}
//         active={1}
//         onSkip={() => {}}
//         skippable={false}
//       />
      
//       <ScrollView style={styles.scrollView}>
//         {/* ================= MEDIA ================= */}
//         <Text style={styles.sectionTitle}>Media</Text>

//         {news.mediaType === 'IMAGE' && news.mediaUrl && (
//           <>
//             <Text style={styles.mediaLabel}>Image Preview</Text>
//             <Image source={{ uri: news.mediaUrl }} style={styles.media} />
//           </>
//         )}

//         {news.mediaType === 'VIDEO' && news.mediaUrl && (
//           <>
//             <Text style={styles.mediaLabel}>Video Preview</Text>
//             <Video
//               source={{ uri: news.mediaUrl }}
//               style={styles.media}
//               controls
//               resizeMode="contain"
//               paused={true}
//             />
//           </>
//         )}

//         {/* ================= HEADLINE ================= */}
//         <Text style={styles.sectionTitle}>Headline</Text>
//         <TextInput
//           style={styles.input}
//           value={headline}
//           onChangeText={setHeadline}
//           placeholder="Enter headline"
//           placeholderTextColor={pallette.grey}
//           editable={!loading}
//         />

//         {/* ================= CONTENT ================= */}
//         <Text style={styles.sectionTitle}>Content</Text>
//         <TextInput
//           style={styles.textArea}
//           value={content}
//           onChangeText={setContent}
//           placeholder="Enter news content"
//           placeholderTextColor={pallette.grey}
//           multiline
//           numberOfLines={6}
//           textAlignVertical="top"
//           editable={!loading}
//         />

//         {/* ================= NEWS TYPE ================= */}
//         <Text style={styles.sectionTitle}>News Type</Text>
//         <CustomDropdown
//           items={newsTypeOptions}
//           selectedValue={newsType}
//           onValueChange={setNewsType}
//           disabled={loading}
//         />

//         {/* ================= CATEGORY ================= */}
//         <Text style={styles.sectionTitle}>Category</Text>
//         <CustomDropdown
//           items={categoryOptions}
//           selectedValue={category}
//           onValueChange={setCategory}
//           disabled={loading}
//         />

//         {/* ================= REJECT REASON ================= */}
//         {mode === 'REJECT' && (
//           <>
//             <Text style={styles.sectionTitle}>Rejection Reason</Text>
//             <TextInput
//               style={styles.textArea}
//               value={reason}
//               onChangeText={setReason}
//               placeholder="Reason for rejection"
//               placeholderTextColor={pallette.grey}
//               multiline
//               numberOfLines={4}
//               textAlignVertical="top"
//               editable={!loading}
//             />
//           </>
//         )}

//         {/* ================= ACTION BUTTON ================= */}
//         <Pressable 
//           style={[styles.submitBtn, loading && styles.submitBtnDisabled]} 
//           onPress={submitAction}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator color={pallette.white} />
//           ) : (
//             <Text style={styles.submitText}>
//               {mode === 'APPROVE' ? 'Approve News' : 'Reject News'}
//             </Text>
//           )}
//         </Pressable>

//         <View style={{ height: 20 }} />
//       </ScrollView>

//       {/* ================= TOAST ================= */}
//       <ToastMessage
//         type={toast.type}
//         message={toast.message}
//         visible={toast.visible}
//         onClose={handleCloseToast}
//       />
//     </View>
//   );
// };

// export default EditPendingNews;

// /* ================= STYLES ================= */

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: pallette.white,
//     marginTop:20
//   },
//   scrollView: {
//     flex: 1,
//     padding: 16,
//   },
//   sectionTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: pallette.black,
//     marginBottom: 6,
//     marginTop: 12,
//   },
//   mediaLabel: {
//     fontSize: 12,
//     color: pallette.grey,
//     marginBottom: 6,
//   },
//   media: {
//     width: '100%',
//     height: 220,
//     borderRadius: 8,
//     backgroundColor: '#000',
//     marginBottom: 12,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: pallette.lightgrey,
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 14,
//     color: pallette.black,
//     marginBottom: 12,
//   },
//   textArea: {
//     borderWidth: 1,
//     borderColor: pallette.lightgrey,
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 14,
//     color: pallette.black,
//     minHeight: 120,
//     marginBottom: 12,
//     textAlignVertical: 'top',
//   },
//   submitBtn: {
//     backgroundColor: pallette.primary,
//     padding: 15,
//     alignItems: 'center',
//     borderRadius: 8,
//     marginTop: 24,
//   },
//   submitBtnDisabled: {
//     backgroundColor: pallette.grey,
//   },
//   submitText: {
//     color: pallette.white,
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });

















// screens/EditPendingNews.jsx
import React, { useState } from 'react';
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
} from 'react-native';
import Video from 'react-native-video';
import ImagePicker from 'react-native-image-crop-picker';
import Icon from 'react-native-vector-icons/FontAwesome6';
import ToastMessage from '../helpers/ToastMessage';
import { pallette } from '../helpers/colors';
import CustomDropdown from '../helpers/DropdownItem';
import Header from '../helpers/header';
import apiService from '../../Axios/Api';
import Toast from 'react-native-toast-message';

const newsTypeOptions = [
  { label: 'Local News', value: 'LOCAL' },
  { label: 'National News', value: 'NATIONAL' },
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

  const [headline, setHeadline] = useState(news.headline);
  const [mediaUrl, setMediaUrl] = useState(news.mediaUrl);
  const [content, setContent] = useState(news.content);
  const [newsType, setNewsType] = useState(news.newsType);
  const [category, setCategory] = useState(
    news.category || news.categories?.[0] || ''
  );
  const [reason, setReason] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [localImage, setLocalImage] = useState(null);

  console.log(news);

  // Handle media selection
  const handleMediaPick = async (source) => {
    try {
      let selectedMedia;
      if (source === 'camera') {
        selectedMedia = await ImagePicker.openCamera({
          cropping: true,
          compressImageQuality: 0.8,
          mediaType: 'photo',
        });
      } else {
        selectedMedia = await ImagePicker.openPicker({
          cropping: true,
          compressImageQuality: 0.8,
          mediaType: 'photo',
        });
      }

      setLocalImage({
        uri: selectedMedia.path,
        type: selectedMedia.mime,
      });
      setMediaUrl(selectedMedia.path); // Update the mediaUrl state with local path
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to select image'
        });
      }
    }
  };

  const showMediaActionSheet = () => {
    Alert.alert(
      'Change Image',
      'Select image source',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Camera', 
          onPress: () => handleMediaPick('camera')
        },
        { 
          text: 'Gallery', 
          onPress: () => handleMediaPick('gallery')
        },
        {
          text: 'Remove Image',
          style: 'destructive',
          onPress: () => {
            setLocalImage(null);
            setMediaUrl('');
          }
        }
      ]
    );
  };

  const submitAction = async () => {
    // Validate inputs
    if (!headline.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Headline is required'
      });
      return;
    }

    if (!content.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Content is required'
      });
      return;
    }

    if (!newsType) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please select news type'
      });
      return;
    }

    if (!category) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please select category'
      });
      return;
    }

    if (mode === 'REJECT' && !reason.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Rejection reason is required'
      });
      return;
    }

    try {
      setLoading(true);

      // Prepare form data with image
      const formData = new FormData();
      
      // Add all fields
      formData.append('headline', headline);
      formData.append('content', content);
      formData.append('newsType', newsType);
      formData.append('category', category);
      
      // If we have a new local image, append it
      if (localImage && localImage.uri && !localImage.uri.startsWith('http')) {
        formData.append('image', {
          uri: localImage.uri,
          type: localImage.type || 'image/jpeg',
          name: `news_${Date.now()}.jpg`,
        });
      } else if (mediaUrl && mediaUrl.startsWith('http')) {
        // If it's already a URL (not a local path), just send the URL
        formData.append('mediaUrl', mediaUrl);
      }

      console.log('Submitting form data...');

      let response;
      if (mode === 'APPROVE') {
        response = await apiService.approveAndPublishNews(news.newsId, formData, true); // true = isFormData
      } else {
        // For reject, we might not need image
        const rejectData = {
          newsId: news.newsId,
          reason: reason
        };
        response = await apiService.rejectNews(news.newsId, rejectData);
      }
      
      if (response.error === false) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: mode === 'APPROVE' ? 'News approved and published successfully' : 'News rejected successfully'
        });
        
        setTimeout(() => {
          navigation.goBack();
          if (route.params?.onSuccess) {
            route.params.onSuccess();
          }
        }, 1200);
      } else {
        throw new Error(response.message || 'Failed to process request');
      }
    } catch (error) {
      console.error('Confirm action error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to process request'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseToast = () => {
    setToast({ visible: false, message: '', type: '' });
  };

  return (
    <View style={styles.container}>
      <Header
        onback={() => navigation.goBack()}
        hastitle={true}
        title={mode === 'APPROVE' ? 'Edit & Approve News' : 'Edit & Reject News'}
        active={1}
        onSkip={() => {}}
        skippable={false}
      />
      
      <ScrollView style={styles.scrollView}>
        {/* ================= MEDIA SECTION ================= */}
        <View style={styles.mediaSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Media</Text>
            {mode === 'APPROVE' && news.mediaType === 'IMAGE' && (
              <TouchableOpacity
                style={styles.editMediaButton}
                onPress={showMediaActionSheet}
                disabled={loading}
              >
                <Icon name="pen-to-square" size={16} color={pallette.primary} />
                <Text style={styles.editMediaText}>Change Image</Text>
              </TouchableOpacity>
            )}
          </View>

          {(news.mediaType === 'IMAGE' && mediaUrl) ? (
            <>
              <Text style={styles.mediaLabel}>Image Preview</Text>
              <View style={styles.mediaContainer}>
                <Image 
                  source={{ uri: mediaUrl }} 
                  style={styles.media}
                  resizeMode="cover"
                />
                {mode === 'APPROVE' && (
                  <TouchableOpacity
                    style={styles.changeImageButton}
                    onPress={showMediaActionSheet}
                    disabled={loading}
                  >
                    <Icon name="camera" size={20} color={pallette.white} />
                    <Text style={styles.changeImageText}>Change</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {localImage && localImage.uri !== news.mediaUrl && (
                <View style={styles.mediaChangedBadge}>
                  <Icon name="circle-exclamation" size={12} color={pallette.primary} />
                  <Text style={styles.mediaChangedText}>Image has been changed</Text>
                </View>
              )}
            </>
          ) : (news.mediaType === 'VIDEO' && news.mediaUrl) ? (
            <>
              <Text style={styles.mediaLabel}>Video Preview</Text>
              <Video
                source={{ uri: news.mediaUrl }}
                style={styles.media}
                controls
                resizeMode="contain"
                paused={true}
              />
              <Text style={styles.videoNote}>
                Note: Video cannot be edited. Only images can be changed.
              </Text>
            </>
          ) : (
            <View style={styles.noMediaContainer}>
              <Icon name="image" size={40} color={pallette.lightgrey} />
              <Text style={styles.noMediaText}>No media available</Text>
              {mode === 'APPROVE' && (
                <TouchableOpacity
                  style={styles.addMediaButton}
                  onPress={showMediaActionSheet}
                  disabled={loading}
                >
                  <Icon name="plus" size={16} color={pallette.white} />
                  <Text style={styles.addMediaText}>Add Image</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* ================= HEADLINE ================= */}
        <Text style={styles.sectionTitle}>Headline</Text>
        <TextInput
          style={styles.input}
          value={headline}
          onChangeText={setHeadline}
          placeholder="Enter headline"
          placeholderTextColor={pallette.grey}
          editable={!loading}
        />

        {/* ================= CONTENT ================= */}
        <Text style={styles.sectionTitle}>Content</Text>
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

        {/* ================= NEWS TYPE ================= */}
        <Text style={styles.sectionTitle}>News Type</Text>
        <CustomDropdown
          items={newsTypeOptions}
          selectedValue={newsType}
          onValueChange={setNewsType}
          disabled={loading}
        />

        {/* ================= CATEGORY ================= */}
        <Text style={styles.sectionTitle}>Category</Text>
        <CustomDropdown
          items={categoryOptions}
          selectedValue={category}
          onValueChange={setCategory}
          disabled={loading}
        />

        {/* ================= REJECT REASON ================= */}
        {mode === 'REJECT' && (
          <>
            <Text style={styles.sectionTitle}>Rejection Reason</Text>
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

        {/* ================= ACTION BUTTON ================= */}
        <Pressable 
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]} 
          onPress={submitAction}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={pallette.white} />
          ) : (
            <Text style={styles.submitText}>
              {mode === 'APPROVE' ? 'Approve News' : 'Reject News'}
            </Text>
          )}
        </Pressable>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ================= TOAST ================= */}
      <ToastMessage
        type={toast.type}
        message={toast.message}
        visible={toast.visible}
        onClose={handleCloseToast}
      />
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
    padding: 16,
  },
  mediaSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: pallette.black,
    marginBottom: 6,
    marginTop: 12,
  },
  editMediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    backgroundColor: `${pallette.primary}15`,
    borderRadius: 6,
    gap: 4,
  },
  editMediaText: {
    fontSize: 12,
    color: pallette.primary,
    fontWeight: '500',
  },
  mediaLabel: {
    fontSize: 12,
    color: pallette.grey,
    marginBottom: 6,
  },
  mediaContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  media: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    backgroundColor: pallette.black,
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
    gap: 6,
  },
  changeImageText: {
    color: pallette.white,
    fontSize: 12,
    fontWeight: '500',
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
    marginTop: 4,
  },
  noMediaContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: pallette.lightgrey,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: pallette.lightgrey,
    borderStyle: 'dashed',
  },
  noMediaText: {
    fontSize: 14,
    color: pallette.grey,
    marginTop: 12,
    marginBottom: 16,
  },
  addMediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: pallette.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  addMediaText: {
    color: pallette.white,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: pallette.lightgrey,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: pallette.black,
    marginBottom: 12,
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
  },
  submitBtn: {
    backgroundColor: pallette.primary,
    padding: 15,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 24,
  },
  submitBtnDisabled: {
    backgroundColor: pallette.grey,
  },
  submitText: {
    color: pallette.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});