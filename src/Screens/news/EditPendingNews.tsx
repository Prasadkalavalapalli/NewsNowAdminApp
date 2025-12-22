import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Video from 'react-native-video';
import ToastMessage from '../helpers/ToastMessage';

import { pallette } from '../helpers/colors';
import { userAPI } from '../../Axios/Api';
import CustomDropdown from '../helpers/DropdownItem';

const newsTypeOptions = [
  { label: 'Local News', value: 'LOCAL' },
  { label: 'National News', value: 'NATIONAL' },
];

const categoryOptions = [
  { label: 'Business', value: 'BUSINESS' },
  { label: 'Politics', value: 'POLITICS' },
];

const EditPendingNews = ({ route, navigation }) => {
  const { mode, news } = route.params;

  const [headline, setHeadline] = useState(news.title);
  const [content, setContent] = useState(news.description);
  const [newsType, setNewsType] = useState(news.newsType);
  const [category, setCategory] = useState(
    news.category || news.categories?.[0] || ''
  );
  const [reason, setReason] = useState('');
  const [toast, setToast] = useState(false);

  const submitAction = async () => {
    try {
      if (mode === 'APPROVE') {
        await userAPI.approveNews(news._id, {
          title: headline,
          description: content,
          newsType,
          categories: [category],
        });
      } else {
        await userAPI.rejectNews(news._id, {
          reason,
          title: headline,
          description: content,
        });
      }

      setToast(true);
      setTimeout(() => navigation.goBack(), 1200);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <ScrollView style={styles.container}>

      {/* Page Title */}
      <Text style={styles.pageTitle}>
        {mode === 'APPROVE' ? 'Edit & Approve News' : 'Edit & Reject News'}
      </Text>

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
      />

      {/* ================= CONTENT ================= */}
      <Text style={styles.sectionTitle}>Content</Text>
      <TextInput
        style={styles.textArea}
        value={content}
        onChangeText={setContent}
        placeholder="Enter news content"
        multiline
      />

      {/* ================= NEWS TYPE ================= */}
      <Text style={styles.sectionTitle}>News Type</Text>
    
      <CustomDropdown
        items={newsTypeOptions}
        selectedValue={newsType}
        onValueChange={setNewsType}
      />

      {/* ================= CATEGORY ================= */}
      <Text style={styles.sectionTitle}>Category</Text>
      <CustomDropdown
        items={categoryOptions}
        selectedValue={category}
        onValueChange={setCategory}
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
            multiline
          />
        </>
      )}

      {/* ================= ACTION BUTTON ================= */}
      <Pressable style={styles.submitBtn} onPress={submitAction}>
        <Text style={styles.submitText}>
          {mode === 'APPROVE' ? 'Approve News' : 'Reject News'}
        </Text>
      </Pressable>

      {/* ================= TOAST ================= */}
      {toast && (
        <ToastMessage
          type="success"
          message={
            mode === 'APPROVE'
              ? 'News approved successfully'
              : 'News rejected successfully'
          }
          onClose={() => setToast(false)}
        />
      )}
    </ScrollView>
  );
};

export default EditPendingNews;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pallette.white,
    padding: 16,
  },

  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: pallette.black,
    marginTop:25,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
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
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },

  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
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

  submitText: {
    color: pallette.white,
    fontWeight: 'bold',
  },
});