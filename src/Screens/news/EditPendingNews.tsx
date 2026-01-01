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
} from 'react-native';
import Video from 'react-native-video';
import ToastMessage from '../helpers/ToastMessage';
import { pallette } from '../helpers/colors';
import CustomDropdown from '../helpers/DropdownItem';
import Header from '../helpers/header';
import apiService from '../../Axios/Api';
import VerifiedNewsScreen from './verifiednews';
import RejectedNewsScreen from './rejectednews';
import Toast from 'react-native-toast-message';
import NewsList from './newslist';

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

console.log(news)
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
      
      if (mode === 'APPROVE') {
        const approveResponse = await apiService.approveAndPublishNews(news.newsId, {
          headline: headline,
          content: content,
          mediaUrl: mediaUrl,
          newsType: newsType,
          category: category,
        });
        
        if (approveResponse.error === false) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'News approved and published successfully'
          });
          
          setTimeout(() => {
            navigation.goBack();
            // Optional: Refresh the previous screen
            if (route.params?.onSuccess) {
              route.params.onSuccess();
            }
          }, 1200);
        } else {
          throw new Error(approveResponse.message || 'Failed to approve news');
        }
      } else {
        const rejectResponse = await apiService.rejectNews(news.newsId, reason);
        
        if (rejectResponse.error === false) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'News rejected successfully'
          });
          
          setTimeout(() => {
          navigation.goBack();
            // Optional: Refresh the previous screen
            if (route.params?.onSuccess) {
              route.params.onSuccess();
            }
          }, 1200);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: rejectResponse.message || 'Failed to process request'
          });
          throw new Error(rejectResponse.message || 'Failed to reject news');
        }
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
        {/* ================= MEDIA ================= */}
        <Text style={styles.sectionTitle}>Media</Text>

        {news.mediaType === 'IMAGE' && news.mediaUrl && (
          <>
            <Text style={styles.mediaLabel}>Image Preview</Text>
            <Image source={{ uri: news.mediaUrl }} style={styles.media} />
          </>
        )}

        {news.mediaType === 'VIDEO' && news.mediaUrl && (
          <>
            <Text style={styles.mediaLabel}>Video Preview</Text>
            <Video
              source={{ uri: news.mediaUrl }}
              style={styles.media}
              controls
              resizeMode="contain"
              paused={true}
            />
          </>
        )}

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
    marginTop:20
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: pallette.black,
    marginBottom: 6,
    marginTop: 12,
  },
  mediaLabel: {
    fontSize: 12,
    color: pallette.grey,
    marginBottom: 6,
  },
  media: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    backgroundColor: '#000',
    marginBottom: 12,
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