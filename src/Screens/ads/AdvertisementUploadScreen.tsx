// screens/AdvertisementUploadScreen.jsx
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
  KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation, useRoute } from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';
import { pallette } from '../helpers/colors';
import { regular, medium, semibold, bold } from '../helpers/fonts';
import { h, w, adjust } from '../../constants/dimensions';
import ToastMessage from '../helpers/ToastMessage';
import AlertMessage from '../helpers/alertmessage';
import apiService from '../../Axios/Api';
import Loader from '../helpers/loader';
import Header from '../helpers/header';
import ErrorMessage from '../helpers/errormessage';


const AdvertisementUploadScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { advertisementId, isEdit } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    type: 'banner',
    title: '',
    description: '',
    ctaText: '',
    linkUrl: '',
    imageUrl: '',
    backgroundColor: pallette.l1,
    textColor: pallette.white,
    districts: [],
    isActive: true,
    displayAfterNews: 7,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const [localImage, setLocalImage] = useState(null);
  const [districtsList, setDistrictsList] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);

  // District options (You should fetch this from your API)
  const districtOptions = [
    'All Districts',
    'Chennai',
    'Coimbatore',
    'Madurai',
    'Tiruchirappalli',
    'Salem',
    'Tirunelveli',
    'Vellore',
    'Erode',
    'Thoothukudi',
    'Dindigul',
    'Thanjavur',
    'Ranipet',
    'Sivaganga',
    'Karur',
    'Krishnagiri',
    'Namakkal',
    'Kanyakumari',
    'Theni',
    'Tirupur',
    'Viluppuram',
    'Kanchipuram',
    'Cuddalore',
    'Nagapattinam',
    'Tiruvannamalai',
    'Ramanathapuram',
    'Perambalur',
    'Ariyalur',
    'Pudukkottai',
    'Dharmapuri',
  ];

  // Fetch advertisement details if editing
  useEffect(() => {
    if (isEdit && advertisementId) {
      fetchAdvertisementDetails();
    }
    loadDistricts();
  }, [advertisementId, isEdit]);

  const loadDistricts = async () => {
    try {
      // Fetch districts from your API
      // const response = await apiService.getDistricts();
      // setDistrictsList(response.data);
      
      // For now, use static list
      setDistrictsList(districtOptions);
    } catch (error) {
      console.error('Error loading districts:', error);
    }
  };

  const fetchAdvertisementDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdvertisementById(advertisementId);
      
      if (response.error === false) {
        const ad = response.data;
        setFormData({
          type: ad.type || 'banner',
          title: ad.title || '',
          description: ad.description || '',
          ctaText: ad.ctaText || '',
          linkUrl: ad.linkUrl || '',
          imageUrl: ad.imageUrl || '',
          backgroundColor: ad.backgroundColor || pallette.l1,
          textColor: ad.textColor || pallette.white,
          districts: ad.districts || [],
          isActive: ad.isActive !== undefined ? ad.isActive : true,
          displayAfterNews: ad.displayAfterNews || 7,
          startDate: ad.startDate ? ad.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
          endDate: ad.endDate ? ad.endDate.split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
        
        if (ad.districts) {
          setSelectedDistricts(ad.districts);
        }
        
        if (ad.imageUrl) {
          setLocalImage({ uri: ad.imageUrl });
        }
      } else {
        throw new Error(response.message || 'Failed to fetch advertisement');
      }
    } catch (error) {
      console.error('Fetch advertisement error:', error);
      setErrorMsg(error.message || 'Failed to load advertisement details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDistrictSelect = (district) => {
    if (district === 'All Districts') {
      setSelectedDistricts(['All Districts']);
      setFormData(prev => ({ ...prev, districts: ['All Districts'] }));
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
      setFormData(prev => ({ ...prev, districts: newDistricts }));
    }
  };

  const handleImagePick = () => {
    Alert.alert(
      'Select Image',
      'Choose image source',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Camera', 
          onPress: () => pickImage('camera')
        },
        { 
          text: 'Gallery', 
          onPress: () => pickImage('gallery')
        },
      ]
    );
  };

  const pickImage = async (source) => {
    try {
      let image;
      if (source === 'camera') {
        image = await ImagePicker.openCamera({
          // width: 1200,
          // height: 800,
          cropping: true,
          compressImageQuality: 0.8,
        });
      } else {
        image = await ImagePicker.openPicker({
          // width: 1200,
          // height: 800,
          cropping: true,
          compressImageQuality: 0.8,
        });
      }

      setLocalImage({
        uri: image.path,
        width: image.width,
        height: image.height,
        mime: image.mime,
      });
      setFormData(prev => ({ ...prev, imageUrl: image.path }));
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        setAlertMessage('Failed to pick image');
      }
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setErrorMsg('Title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setErrorMsg('Description is required');
      return false;
    }
    if (!formData.ctaText.trim()) {
      setErrorMsg('Call to Action text is required');
      return false;
    }
    if (!formData.linkUrl.trim()) {
      setErrorMsg('Link URL is required');
      return false;
    }
    if (!localImage && !formData.imageUrl) {
      setErrorMsg('Image is required');
      return false;
    }
    if (formData.displayAfterNews < 1 || formData.displayAfterNews > 20) {
      setErrorMsg('Display after news should be between 1 and 20');
      return false;
    }
    if (!formData.startDate) {
      setErrorMsg('Start date is required');
      return false;
    }
    if (!formData.endDate) {
      setErrorMsg('End date is required');
      return false;
    }
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setErrorMsg('End date must be after start date');
      return false;
    }

    setErrorMsg('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setUploading(true);

      let imageUrl = formData.imageUrl;
      
      // If local image is selected, upload it first
      if (localImage && localImage.uri && !localImage.uri.startsWith('http')) {
        const formDataImg = new FormData();
        formDataImg.append('image', {
          uri: localImage.uri,
          type: localImage.mime || 'image/jpeg',
          name: `advertisement_${Date.now()}.jpg`,
        });

        const uploadResponse = await apiService.uploadImage(formDataImg);
        if (uploadResponse.error === false) {
          imageUrl = uploadResponse.data.url;
        } else {
          throw new Error('Failed to upload image');
        }
      }

      // Prepare final data
      const advertisementData = {
        ...formData,
        imageUrl: imageUrl,
        districts: selectedDistricts.length === 0 ? ['All Districts'] : selectedDistricts,
      };

      let response;
      if (isEdit) {
        response = await apiService.updateAdvertisement(advertisementId, advertisementData);
      } else {
        response = await apiService.createAdvertisement(advertisementData);
      }

      if (response.error === false) {
        setToast({
          message: isEdit ? 'Advertisement updated successfully!' : 'Advertisement created successfully!',
          type: 'success'
        });

        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        throw new Error(response.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setErrorMsg(error.message || 'Failed to save advertisement');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Advertisement',
      'Are you sure you want to delete this advertisement? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await apiService.deleteAdvertisement(advertisementId);
              
              if (response.error === false) {
                setToast({
                  message: 'Advertisement deleted successfully!',
                  type: 'success'
                });
                
                setTimeout(() => {
                  navigation.goBack();
                }, 1500);
              } else {
                throw new Error(response.message || 'Delete failed');
              }
            } catch (error) {
              setErrorMsg(error.message || 'Failed to delete advertisement');
            } finally {
              setLoading(false);
            }
          }
        },
      ]
    );
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={pallette.white} />
      
      <Header 
        title={isEdit ? 'Edit Advertisement' : 'Upload Advertisement'}
        onback={navigation.goBack}
        active={1}
        onSkip={() => {}}
        skippable={false}
        hastitle={true}
      />
      
      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {errorMsg && (
        <ErrorMessage
          message={errorMsg}
          onClose={() => setErrorMsg('')}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Preview Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <View style={[styles.previewCard, { backgroundColor: formData.backgroundColor }]}>
              {localImage ? (
                <Image source={{ uri: localImage.uri }} style={styles.previewImage} resizeMode="cover" />
              ) : formData.imageUrl ? (
                <Image source={{ uri: formData.imageUrl }} style={styles.previewImage} resizeMode="cover" />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icon name="image" size={40} color={formData.textColor} />
                  <Text style={[styles.placeholderText, { color: formData.textColor }]}>
                    Advertisement Image
                  </Text>
                </View>
              )}
              
              <View style={styles.previewContent}>
                <Text style={[styles.previewTitle, { color: formData.textColor }]}>
                  {formData.title || 'Advertisement Title'}
                </Text>
                <Text style={[styles.previewDescription, { color: formData.textColor }]}>
                  {formData.description || 'Advertisement description will appear here'}
                </Text>
                <TouchableOpacity style={styles.previewButton}>
                  <Text style={[styles.previewButtonText, { color: formData.backgroundColor }]}>
                    {formData.ctaText || 'Call to Action'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(value) => handleInputChange('title', value)}
                placeholder="Enter advertisement title"
                placeholderTextColor={pallette.grey}
                maxLength={100}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholder="Enter advertisement description"
                placeholderTextColor={pallette.grey}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Call to Action Text *</Text>
              <TextInput
                style={styles.input}
                value={formData.ctaText}
                onChangeText={(value) => handleInputChange('ctaText', value)}
                placeholder="e.g., Subscribe Now, Learn More"
                placeholderTextColor={pallette.grey}
                maxLength={50}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Link URL *</Text>
              <TextInput
                style={styles.input}
                value={formData.linkUrl}
                onChangeText={(value) => handleInputChange('linkUrl', value)}
                placeholder="https://yourapp.com/action"
                placeholderTextColor={pallette.grey}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Image Upload */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Advertisement Image *</Text>
            
            <TouchableOpacity 
              style={styles.imageUploadContainer}
              onPress={handleImagePick}
            >
              {localImage || formData.imageUrl ? (
                <Image 
                  source={{ uri: localImage?.uri || formData.imageUrl }} 
                  style={styles.uploadedImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Icon name="camera" size={30} color={pallette.primary} />
                  <Text style={styles.uploadText}>Tap to select image</Text>
                  <Text style={styles.uploadHint}>Recommended: 1200x800 pixels</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Display Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Display Settings</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Display After News Count *</Text>
              <TextInput
                style={styles.input}
                value={formData.displayAfterNews.toString()}
                onChangeText={(value) => {
                  const num = parseInt(value) || 7;
                  handleInputChange('displayAfterNews', Math.min(Math.max(num, 1), 20));
                }}
                placeholder="7"
                placeholderTextColor={pallette.grey}
                keyboardType="number-pad"
              />
              <Text style={styles.hintText}>Show advertisement after every X news items (1-20)</Text>
            </View>
            
            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Start Date *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.startDate}
                  onChangeText={(value) => handleInputChange('startDate', value)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={pallette.grey}
                />
              </View>
              
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.inputLabel}>End Date *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.endDate}
                  onChangeText={(value) => handleInputChange('endDate', value)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={pallette.grey}
                />
              </View>
            </View>
          </View>

          {/* District Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Target Districts</Text>
            <Text style={styles.sectionSubtitle}>
              Select districts where this advertisement should be shown. Leave empty to show to all users.
            </Text>
            
            <View style={styles.districtsGrid}>
              <TouchableOpacity
                style={[
                  styles.districtChip,
                  selectedDistricts.includes('All Districts') && styles.districtChipSelected
                ]}
                onPress={() => handleDistrictSelect('All Districts')}
              >
                <Text style={[
                  styles.districtChipText,
                  selectedDistricts.includes('All Districts') && styles.districtChipTextSelected
                ]}>
                  All Districts
                </Text>
              </TouchableOpacity>
              
              {districtOptions.slice(1).map((district) => (
                <TouchableOpacity
                  key={district}
                  style={[
                    styles.districtChip,
                    selectedDistricts.includes(district) && styles.districtChipSelected
                  ]}
                  onPress={() => handleDistrictSelect(district)}
                >
                  <Text style={[
                    styles.districtChipText,
                    selectedDistricts.includes(district) && styles.districtChipTextSelected
                  ]}>
                    {district}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.selectedDistrictsText}>
              Selected: {selectedDistricts.length === 0 ? 'All Districts' : selectedDistricts.join(', ')}
            </Text>
          </View>

          {/* Color Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Color Scheme</Text>
            
            <View style={styles.colorRow}>
              <View style={styles.colorInput}>
                <Text style={styles.inputLabel}>Background Color</Text>
                <View style={styles.colorPreviewContainer}>
                  <View style={[styles.colorPreview, { backgroundColor: formData.backgroundColor }]} />
                  <TextInput
                    style={styles.colorInputField}
                    value={formData.backgroundColor}
                    onChangeText={(value) => handleInputChange('backgroundColor', value)}
                    placeholder="#000000"
                    placeholderTextColor={pallette.grey}
                    maxLength={7}
                  />
                </View>
              </View>
              
              <View style={styles.colorInput}>
                <Text style={styles.inputLabel}>Text Color</Text>
                <View style={styles.colorPreviewContainer}>
                  <View style={[styles.colorPreview, { backgroundColor: formData.textColor }]} />
                  <TextInput
                    style={styles.colorInputField}
                    value={formData.textColor}
                    onChangeText={(value) => handleInputChange('textColor', value)}
                    placeholder="#FFFFFF"
                    placeholderTextColor={pallette.grey}
                    maxLength={7}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {isEdit && (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
                disabled={uploading}
              >
                <Icon name="trash" size={18} color={pallette.white} />
                <Text style={styles.deleteButtonText}>Delete Advertisement</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.actionButton, styles.submitButton]}
              onPress={handleSubmit}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color={pallette.white} size="small" />
              ) : (
                <>
                  <Icon name={isEdit ? "save" : "cloud-upload-alt"} size={18} color={pallette.white} />
                  <Text style={styles.submitButtonText}>
                    {isEdit ? 'Update Advertisement' : 'Upload Advertisement'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {alertMessage && (
        <AlertMessage
          message={alertMessage}
          onClose={() => setAlertMessage('')}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pallette.lightgrey,
    paddingTop: 20,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: h * 0.05,
  },
  section: {
    backgroundColor: pallette.white,
    marginHorizontal: w * 0.04,
    marginTop: h * 0.02,
    borderRadius: 12,
    padding: w * 0.04,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: adjust(16),
    fontFamily: semibold,
    color: pallette.black,
    marginBottom: h * 0.015,
  },
  sectionSubtitle: {
    fontSize: adjust(12),
    fontFamily: regular,
    color: pallette.grey,
    marginBottom: h * 0.015,
    lineHeight: adjust(16),
  },
  previewCard: {
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 200,
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
    fontSize: adjust(12),
    fontFamily: medium,
    marginTop: 8,
  },
  previewContent: {
    padding: w * 0.04,
  },
  previewTitle: {
    fontSize: adjust(18),
    fontFamily: bold,
    marginBottom: h * 0.01,
  },
  previewDescription: {
    fontSize: adjust(14),
    fontFamily: regular,
    marginBottom: h * 0.02,
    lineHeight: adjust(18),
  },
  previewButton: {
    backgroundColor: pallette.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  previewButtonText: {
    fontSize: adjust(14),
    fontFamily: semibold,
  },
  inputContainer: {
    marginBottom: h * 0.02,
  },
  inputLabel: {
    fontSize: adjust(13),
    fontFamily: medium,
    color: pallette.black,
    marginBottom: h * 0.008,
  },
  input: {
    backgroundColor: pallette.lightgrey,
    borderRadius: 8,
    paddingHorizontal: w * 0.03,
    paddingVertical: h * 0.015,
    fontSize: adjust(14),
    fontFamily: regular,
    color: pallette.black,
    borderWidth: 1,
    borderColor: pallette.lightgrey,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  hintText: {
    fontSize: adjust(11),
    fontFamily: regular,
    color: pallette.grey,
    marginTop: h * 0.005,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
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
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  uploadPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.primary,
    marginTop: h * 0.01,
  },
  uploadHint: {
    fontSize: adjust(11),
    fontFamily: regular,
    color: pallette.grey,
    marginTop: h * 0.005,
  },
  districtsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: h * 0.02,
  },
  districtChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    fontSize: adjust(12),
    fontFamily: medium,
    color: pallette.darkgrey,
  },
  districtChipTextSelected: {
    color: pallette.primary,
  },
  selectedDistrictsText: {
    fontSize: adjust(12),
    fontFamily: regular,
    color: pallette.grey,
    fontStyle: 'italic',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 20,
  },
  colorInput: {
    flex: 1,
  },
  colorPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: pallette.lightgrey,
    borderRadius: 8,
    paddingHorizontal: w * 0.03,
    paddingVertical: h * 0.015,
    borderWidth: 1,
    borderColor: pallette.lightgrey,
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
    fontSize: adjust(14),
    fontFamily: regular,
    color: pallette.black,
  },
  actionButtons: {
    marginHorizontal: w * 0.04,
    marginTop: h * 0.03,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: h * 0.02,
    borderRadius: 12,
    gap: 10,
    marginBottom: h * 0.015,
  },
  deleteButton: {
    backgroundColor: pallette.red,
  },
  deleteButtonText: {
    fontSize: adjust(16),
    fontFamily: semibold,
    color: pallette.white,
  },
  submitButton: {
    backgroundColor: pallette.primary,
  },
  submitButtonText: {
    fontSize: adjust(16),
    fontFamily: semibold,
    color: pallette.white,
  },
  bottomSpacer: {
    height: h * 0.05,
  },
});

export default AdvertisementUploadScreen;