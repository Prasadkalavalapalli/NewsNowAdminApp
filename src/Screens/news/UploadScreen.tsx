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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import Video from 'react-native-video';

import Header from '../helpers/header';
import { pallette } from '../helpers/colors';
import { medium, bold } from '../helpers/fonts';

import CustomDropdown from '../helpers/CustomDropdown';
import ToastMessage from '../helpers/ToastMessage';

const newsTypeOptions = [
  { label: 'Local News', value: 'Local News' },
  { label: 'National News', value: 'National News' },
];

const categoryOptions = [
  { label: 'Business News', value: 'Business News' },
  { label: 'Politics', value: 'Politics' },
];

const UploadScreen = () => {
  const navigation = useNavigation();

  const [mediaType, setMediaType] = useState<'VIDEO' | 'IMAGE' | null>(null);
  const [mediaUri, setMediaUri] = useState<string | null>(null);

  const [newsType, setNewsType] = useState('Local News');
  const [categoryType, setCategoryType] = useState('Business News');
  const [headline, setHeadline] = useState('');
  const [content, setContent] = useState('');

  const [showToast, setShowToast] = useState(false);

  /* ---------- Media Picker ---------- */
  const pickMedia = async (type: 'photo' | 'video') => {
    const result = await launchImageLibrary({
      mediaType: type,
      selectionLimit: 1,
    });

    if (!result.didCancel && result.assets?.length) {
      setMediaUri(result.assets[0].uri || null);
      setMediaType(type === 'photo' ? 'IMAGE' : 'VIDEO');
    }
  };

  /* ---------- Dummy API ---------- */
  const fakeSubmitApi = () =>
    new Promise(resolve => setTimeout(() => resolve({ status: 200 }), 1000));

  const submitNews = async () => {
    await fakeSubmitApi();

    setShowToast(true);

    console.log({
      mediaType,
      mediaUri,
      newsType,
      categoryType,
      headline,
      content,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Upload the News" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Media Picker */}
        <Text style={styles.label}>Upload Media</Text>
        <View style={styles.mediaRow}>
          <Pressable
            style={[styles.mediaBox, mediaType === 'VIDEO' && styles.activeBox]}
            onPress={() => pickMedia('video')}
          >
            <Text style={styles.mediaText}>Video</Text>
          </Pressable>

          <Pressable
            style={[styles.mediaBox, mediaType === 'IMAGE' && styles.activeBox]}
            onPress={() => pickMedia('photo')}
          >
            <Text style={styles.mediaText}>Image</Text>
          </Pressable>
        </View>

        {/* Image Preview */}
        {mediaType === 'IMAGE' && mediaUri && (
          <Image source={{ uri: mediaUri }} style={styles.preview} />
        )}

        {/* Video Player */}
        {mediaType === 'VIDEO' && mediaUri && (
          <Video
            source={{ uri: mediaUri }}
            style={styles.video}
            controls
            resizeMode="contain"
          />
        )}

        {/* News Type Dropdown */}
        <Text style={styles.label}>News Type</Text>
        <CustomDropdown
          items={newsTypeOptions}
          selectedValue={newsType}
          onValueChange={setNewsType}
        />

        {/* Category Dropdown */}
        <Text style={styles.label}>Category Type</Text>
        <CustomDropdown
          items={categoryOptions}
          selectedValue={categoryType}
          onValueChange={setCategoryType}
        />

        {/* Headline */}
        <Text style={styles.label}>Headline</Text>
        <TextInput
          style={styles.input}
          value={headline}
          onChangeText={setHeadline}
        />

        {/* Content */}
        <Text style={styles.label}>Content</Text>
        <TextInput
          style={styles.textArea}
          multiline
          value={content}
          onChangeText={setContent}
        />

        <Pressable style={styles.submitBtn} onPress={submitNews}>
          <Text style={styles.submitText}>Submit</Text>
        </Pressable>
      </ScrollView>

      {/* Toast */}
      {showToast && (
        <ToastMessage
          type="success"
          message="your successfully submitted the news"
          onClose={() => setShowToast(false)}
        />
      )}
    </SafeAreaView>
  );
};

export default UploadScreen;

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16 },
  label: { fontFamily: medium, marginVertical: 8 },

  mediaRow: { flexDirection: 'row', marginBottom: 10 },
  mediaBox: {
    flex: 1,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 5,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeBox: {
    borderColor: pallette.primary,
    backgroundColor: '#eef',
  },
  mediaText: { fontFamily: medium },

  preview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  video: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    backgroundColor: '#000',
    marginTop: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: pallette.primary,
    padding: 15,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 20,
  },
  submitText: {
    color: '#fff',
    fontFamily: bold,
  },
});