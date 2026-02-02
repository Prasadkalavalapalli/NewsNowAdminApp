import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome6';

import { pallette } from '../helpers/colors';
import { regular, medium, semibold, bold } from '../helpers/fonts';
import ToastMessage from '../helpers/ToastMessage';
import MainHeader from '../helpers/mainheader';
import CustomDropdown from '../helpers/DropdownItem';

const AdvertisementUploadScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { advertisementId, isEdit } = route.params || {};

  // Form state
  const [type, setType] = useState('BANNER');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [displayAfterNews, setDisplayAfterNews] = useState('7');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [isActive, setIsActive] = useState(true);

  // Media state
  const [mediaUri, setMediaUri] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState('IMAGE');

  // UI state
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // District selection
  const [selectedDistricts, setSelectedDistricts] = useState(['All Districts']);
  const districtOptions = [
    'All Districts',
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
    'Tirunelveli', 'Vellore', 'Erode', 'Thoothukudi', 'Dindigul',
    'Thanjavur', 'Ranipet', 'Sivaganga', 'Karur', 'Krishnagiri',
    'Namakkal', 'Kanyakumari', 'Theni', 'Tirupur', 'Viluppuram',
    'Kanchipuram', 'Cuddalore', 'Nagapattinam', 'Tiruvannamalai',
    'Ramanathapuram', 'Perambalur', 'Ariyalur', 'Pudukkottai', 'Dharmapuri'
  ];

  // Dropdown options
  const typeOptions = [
    { label: 'Banner', value: 'BANNER' },
    { label: 'Full Screen', value: 'FULL_SCREEN' },
    { label: 'Interstitial', value: 'INTERSTITIAL' },
  ];

  // Fetch advertisement details if editing
  useEffect(() => {
    if (isEdit && advertisementId) {
      fetchAdvertisementDetails();
    }
  }, [advertisementId, isEdit]);

  const fetchAdvertisementDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `https://backend.newsvelugu.com/api/admin/advertisements/${advertisementId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error === false) {
        const ad = data.data;
        setType(ad.type || 'BANNER');
        setTitle(ad.title || '');
        setDescription(ad.description || '');
        setCtaText(ad.ctaText || '');
        setLinkUrl(ad.linkUrl || '');
        setBackgroundColor(ad.backgroundColor || '#000000');
        setTextColor(ad.textColor || '#FFFFFF');
        setDisplayAfterNews(ad.displayAfterNews?.toString() || '7');
        setStartDate(ad.startDate?.split('T')[0] || new Date().toISOString().split('T')[0]);
        setEndDate(ad.endDate?.split('T')[0] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        setIsActive(ad.isActive !== undefined ? ad.isActive : true);
        setSelectedDistricts(ad.districts || ['All Districts']);
        
        if (ad.imageUrl) {
          setMediaUri(ad.imageUrl);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch advertisement');
      }
    } catch (error) {
      console.error('Fetch advertisement error:', error);
      showAlert(error.message || 'Failed to load advertisement details');
    } finally {
      setLoading(false);
    }
  };

  // Media picker function
  const pickMedia = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        includeBase64: false,
        quality: 0.8,
      });

      if (!result.didCancel && result.assets?.length) {
        const asset = result.assets[0];
        setMediaUri(asset.uri);
        setMediaType('IMAGE');
        
        const file = {
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `advertisement_${Date.now()}.jpg`,
        };
        setMediaFile(file);
      }
    } catch (error) {
      console.error('Media picker error:', error);
      showAlert('Failed to pick image');
    }
  };

  // Form validation
  const validateForm = () => {
    if (!title.trim()) {
      showAlert('Please enter advertisement title');
      return false;
    }

    if (!description.trim()) {
      showAlert('Please enter advertisement description');
      return false;
    }

    if (!ctaText.trim()) {
      showAlert('Please enter call to action text');
      return false;
    }

    if (!linkUrl.trim()) {
      showAlert('Please enter link URL');
      return false;
    }

    if (!isEdit && !mediaUri) {
      showAlert('Please select an image');
      return false;
    }

    const displayCount = parseInt(displayAfterNews);
    if (isNaN(displayCount) || displayCount < 1 || displayCount > 20) {
      showAlert('Display after news should be between 1 and 20');
      return false;
    }

    if (!startDate) {
      showAlert('Please select start date');
      return false;
    }

    if (!endDate) {
      showAlert('Please select end date');
      return false;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      showAlert('End date must be after start date');
      return false;
    }

    return true;
  };

  // Show alert
  const showAlert = (message) => {
    setToastMessage(message);
    setToastType('error');
    setShowToast(true);
  };

  // Handle district selection
  const handleDistrictSelect = (district) => {
    if (district === 'All Districts') {
      setSelectedDistricts(['All Districts']);
    } else {
      let newDistricts = [...selectedDistricts];
      
      // Remove 'All Districts' if other districts are selected
      if (newDistricts.includes('All Districts')) {
        newDistricts = newDistricts.filter(d => d !== 'All Districts');
      }
      
      if (newDistricts.includes(district)) {
        newDistricts = newDistricts.filter(d => d !== district);
      } else {
        newDistricts.push(district);
      }
      
      setSelectedDistricts(newDistricts);
    }
  };

  // Direct API function for uploading advertisement
  const uploadAdvertisementDirect = async (advertisementData, mediaFile) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Create FormData
      const formData = new FormData();
      
      // Add advertisement data as JSON string
      const adJSON = JSON.stringify(advertisementData);
      formData.append('data', adJSON);
      
      // Add media file if exists
      if (mediaFile) {
        formData.append('media', {
          uri: mediaFile.uri,
          type: mediaFile.type,
          name: mediaFile.name
        });
      }

      const url = isEdit 
        ? `https://backend.newsvelugu.com/api/admin/advertisements/${advertisementId}`
        : 'https://backend.newsvelugu.com/api/admin/ads';

      const method = isEdit ? 'PUT' : 'POST';

      // Make fetch request
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type manually for FormData
        },
        body: formData,
      });

      // Check response status
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      // Parse response
      const responseData = await response.json();
      return responseData;
      
    } catch (error) {
      console.error('Upload advertisement error:', error);
      throw error;
    }
  };

  // Submit advertisement function
  const submitAdvertisement = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Prepare advertisement data
      const advertisementData = {
        type: type,
        title: title.trim(),
        description: description.trim(),
        ctaText: ctaText.trim(),
        linkUrl: linkUrl.trim(),
        backgroundColor: backgroundColor,
        textColor: textColor,
        districts: selectedDistricts.length === 0 ? ['All Districts'] : selectedDistricts,
        isActive: isActive,
        displayAfterNews: parseInt(displayAfterNews),
        startDate: startDate,
        endDate: endDate,
      };

      console.log('Submitting advertisement:', advertisementData);

      // Call direct upload function
      const response = await uploadAdvertisementDirect(advertisementData, mediaFile);
      
      if (response.error === false) {
        setToastMessage(response.message || (isEdit ? 'Advertisement updated successfully!' : 'Advertisement created successfully!'));
        setToastType('success');
        setShowToast(true);
        
        // Navigate back after success
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } else {
        showAlert(response.message || 'Failed to submit advertisement');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showAlert(error.message || 'Failed to upload advertisement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = () => {
    Alert.alert(
      'Delete Advertisement',
      'Are you sure you want to delete this advertisement? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: deleteAdvertisement
        },
      ]
    );
  };

  const deleteAdvertisement = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `https://backend.newsvelugu.com/api/admin/advertisements/${advertisementId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error === false) {
        setToastMessage('Advertisement deleted successfully!');
        setToastType('success');
        setShowToast(true);
        
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } else {
        throw new Error(data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showAlert(error.message || 'Failed to delete advertisement');
    } finally {
      setLoading(false);
    }
  };

  // Handle toast close
  const handleToastClose = () => {
    setShowToast(false);
    setToastMessage('');
  };

  if (loading && !showToast) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={pallette.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <MainHeader title={isEdit ? 'Edit Advertisement' : 'Upload Advertisement'} />
      
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Preview Section */}
        <Text style={styles.sectionTitle}>Preview</Text>
        <View style={[styles.previewCard, { backgroundColor: backgroundColor }]}>
          {mediaUri ? (
            <Image source={{ uri: mediaUri }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon name="image" size={40} color={textColor} />
              <Text style={[styles.placeholderText, { color: textColor }]}>
                Advertisement Image
              </Text>
            </View>
          )}
          
          <View style={styles.previewContent}>
            <Text style={[styles.previewTitle, { color: textColor }]}>
              {title || 'Advertisement Title'}
            </Text>
            <Text style={[styles.previewDescription, { color: textColor }]}>
              {description || 'Advertisement description will appear here'}
            </Text>
            <View style={[styles.previewButton, { backgroundColor: textColor }]}>
              <Text style={[styles.previewButtonText, { color: backgroundColor }]}>
                {ctaText || 'Call to Action'}
              </Text>
            </View>
          </View>
        </View>

        {/* Basic Information */}
        <Text style={styles.label}>Advertisement Type *</Text>
        <CustomDropdown
          items={typeOptions}
          selectedValue={type}
          onValueChange={setType}
          placeholder="Select advertisement type"
          disabled={loading}
        />

        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter advertisement title"
          placeholderTextColor={pallette.grey}
          editable={!loading}
          maxLength={100}
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter advertisement description"
          placeholderTextColor={pallette.grey}
          editable={!loading}
          maxLength={500}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Call to Action Text *</Text>
        <TextInput
          style={styles.input}
          value={ctaText}
          onChangeText={setCtaText}
          placeholder="e.g., Subscribe Now, Learn More"
          placeholderTextColor={pallette.grey}
          editable={!loading}
          maxLength={50}
        />

        <Text style={styles.label}>Link URL *</Text>
        <TextInput
          style={styles.input}
          value={linkUrl}
          onChangeText={setLinkUrl}
          placeholder="https://yourapp.com/action"
          placeholderTextColor={pallette.grey}
          keyboardType="url"
          autoCapitalize="none"
          editable={!loading}
        />

        {/* Image Upload */}
        <Text style={styles.label}>Advertisement Image {!isEdit && '*'}</Text>
        <Text style={styles.subLabel}>Recommended: 1200x800 pixels</Text>
        <Pressable
          style={styles.imageUploadContainer}
          onPress={pickMedia}
          disabled={loading}
        >
          {mediaUri ? (
            <Image source={{ uri: mediaUri }} style={styles.uploadedImage} resizeMode="cover" />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Icon name="camera" size={30} color={pallette.primary} />
              <Text style={styles.uploadText}>Tap to select image</Text>
            </View>
          )}
        </Pressable>

        {/* Display Settings */}
        <Text style={styles.label}>Display After News Count *</Text>
        <Text style={styles.subLabel}>Show advertisement after every X news items (1-20)</Text>
        <TextInput
          style={styles.input}
          value={displayAfterNews}
          onChangeText={(text) => {
            const num = parseInt(text);
            if (!isNaN(num) && num >= 1 && num <= 20) {
              setDisplayAfterNews(text);
            } else if (text === '') {
              setDisplayAfterNews('');
            }
          }}
          placeholder="7"
          placeholderTextColor={pallette.grey}
          keyboardType="number-pad"
          editable={!loading}
        />

        <Text style={styles.label}>Start Date *</Text>
        <TextInput
          style={styles.input}
          value={startDate}
          onChangeText={setStartDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={pallette.grey}
          editable={!loading}
        />

        <Text style={styles.label}>End Date *</Text>
        <TextInput
          style={styles.input}
          value={endDate}
          onChangeText={setEndDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={pallette.grey}
          editable={!loading}
        />

        {/* Color Selection */}
        <Text style={styles.label}>Color Scheme</Text>
        <View style={styles.colorRow}>
          <View style={styles.colorInput}>
            <Text style={styles.subLabel}>Background Color</Text>
            <View style={styles.colorPreviewContainer}>
              <View style={[styles.colorPreview, { backgroundColor }]} />
              <TextInput
                style={styles.colorInputField}
                value={backgroundColor}
                onChangeText={setBackgroundColor}
                placeholder="#000000"
                placeholderTextColor={pallette.grey}
                maxLength={7}
                editable={!loading}
              />
            </View>
          </View>
          
          <View style={styles.colorInput}>
            <Text style={styles.subLabel}>Text Color</Text>
            <View style={styles.colorPreviewContainer}>
              <View style={[styles.colorPreview, { backgroundColor: textColor }]} />
              <TextInput
                style={styles.colorInputField}
                value={textColor}
                onChangeText={setTextColor}
                placeholder="#FFFFFF"
                placeholderTextColor={pallette.grey}
                maxLength={7}
                editable={!loading}
              />
            </View>
          </View>
        </View>

        {/* District Selection */}
        <Text style={styles.label}>Target Districts</Text>
        <Text style={styles.subLabel}>Select districts where this advertisement should be shown</Text>
        
        <View style={styles.districtsGrid}>
          {districtOptions.map((district) => (
            <Pressable
              key={district}
              style={[
                styles.districtChip,
                selectedDistricts.includes(district) && styles.districtChipSelected
              ]}
              onPress={() => handleDistrictSelect(district)}
              disabled={loading}
            >
              <Text style={[
                styles.districtChipText,
                selectedDistricts.includes(district) && styles.districtChipTextSelected
              ]}>
                {district}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.selectedDistrictsText}>
          Selected: {selectedDistricts.length === 0 ? 'All Districts' : selectedDistricts.join(', ')}
        </Text>

        {/* Active Status */}
        <View style={styles.activeContainer}>
          <Text style={styles.label}>Advertisement Status</Text>
          <Pressable
            style={[styles.activeButton, isActive && styles.activeButtonSelected]}
            onPress={() => setIsActive(!isActive)}
            disabled={loading}
          >
            <Text style={[styles.activeButtonText, isActive && styles.activeButtonTextSelected]}>
              {isActive ? 'Active' : 'Inactive'}
            </Text>
          </Pressable>
        </View>

        {/* Action Buttons */}
        {isEdit && (
          <Pressable
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
            disabled={loading}
          >
            <Icon name="trash" size={18} color={pallette.white} />
            <Text style={styles.deleteButtonText}>Delete Advertisement</Text>
          </Pressable>
        )}
        
        <Pressable 
          style={[styles.actionButton, styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={submitAdvertisement}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={pallette.white} />
          ) : (
            <>
              <Icon name={isEdit ? "save" : "cloud-upload-alt"} size={18} color={pallette.white} />
              <Text style={styles.submitButtonText}>
                {isEdit ? 'Update Advertisement' : 'Upload Advertisement'}
              </Text>
            </>
          )}
        </Pressable>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: pallette.white,
  },
  container: { 
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: { 
    fontFamily: bold, 
    fontSize: 18,
    color: pallette.black,
    marginTop: 10,
    marginBottom: 15,
  },
  label: { 
    fontFamily: medium, 
    fontSize: 16,
    color: pallette.black,
    marginTop: 20,
    marginBottom: 5,
  },
  subLabel: {
    fontFamily: regular,
    fontSize: 12,
    color: pallette.grey,
    marginBottom: 8,
  },
  previewCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: 150,
  },
  imagePlaceholder: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  placeholderText: {
    fontSize: 12,
    fontFamily: medium,
    marginTop: 8,
  },
  previewContent: {
    padding: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontFamily: bold,
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: 14,
    fontFamily: regular,
    marginBottom: 16,
    lineHeight: 20,
  },
  previewButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  previewButtonText: {
    fontSize: 14,
    fontFamily: semibold,
  },
  input: {
    borderWidth: 1,
    borderColor: pallette.lightgrey,
    borderRadius: 8,
    padding: 12,
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
    minHeight: 100,
    textAlignVertical: 'top',
    fontFamily: regular,
    fontSize: 14,
    color: pallette.black,
    backgroundColor: pallette.white,
  },
  imageUploadContainer: {
    borderWidth: 2,
    borderColor: pallette.lightgrey,
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${pallette.lightgrey}50`,
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  uploadPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 14,
    fontFamily: medium,
    color: pallette.primary,
    marginTop: 10,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 10,
  },
  colorInput: {
    flex: 1,
  },
  colorPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: pallette.lightgrey,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: pallette.white,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: pallette.grey,
  },
  colorInputField: {
    flex: 1,
    fontSize: 14,
    fontFamily: regular,
    color: pallette.black,
  },
  districtsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  districtChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: pallette.lightgrey,
    borderWidth: 1,
    borderColor: pallette.lightgrey,
  },
  districtChipSelected: {
    backgroundColor: `${pallette.primary}15`,
    borderColor: pallette.primary,
  },
  districtChipText: {
    fontSize: 12,
    fontFamily: medium,
    color: pallette.darkgrey,
  },
  districtChipTextSelected: {
    color: pallette.primary,
    fontFamily: semibold,
  },
  selectedDistrictsText: {
    fontSize: 12,
    fontFamily: regular,
    color: pallette.grey,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  activeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  activeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: pallette.lightgrey,
    borderWidth: 1,
    borderColor: pallette.lightgrey,
  },
  activeButtonSelected: {
    backgroundColor: pallette.primary,
    borderColor: pallette.primary,
  },
  activeButtonText: {
    fontSize: 14,
    fontFamily: medium,
    color: pallette.darkgrey,
  },
  activeButtonTextSelected: {
    color: pallette.white,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 10,
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: pallette.red,
  },
  deleteButtonText: {
    fontSize: 16,
    fontFamily: semibold,
    color: pallette.white,
  },
  submitButton: {
    backgroundColor: pallette.primary,
  },
  submitButtonDisabled: {
    backgroundColor: `${pallette.primary}80`,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: semibold,
    color: pallette.white,
  },
});

export default AdvertisementUploadScreen;