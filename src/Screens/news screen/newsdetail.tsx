import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  TextInput,
  FlatList,
  Modal,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation, useRoute } from '@react-navigation/native';
import { pallette } from '../helpers/colors';
import { regular, medium, semibold, bold } from '../helpers/fonts';
import { h, w, adjust } from '../../constants/dimensions';
import ToastMessage from '../helpers/ToastMessage';
import AlertMessage from '../helpers/alertmessage';
import apiService from '../../Axios/Api';
import Loader from '../helpers/loader';
import Header from '../helpers/header';
import { useAppContext } from '../../Store/contexts/app-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NewsDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { newsId } = route.params || {};
  const { user } = useAppContext();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [news, setNews] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Fetch news details
  const fetchNewsDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNewsById(newsId);
      
      if (response.error === false) {
        const newsData = response.data;
        console.log('News Data:', newsData);
        
        setNews(newsData);
        setLiked(newsData.isLiked || false);
        setSaved(newsData.isSaved || false);
        setLikesCount(newsData.likesCount || newsData.likeCount || 0);
        setCommentsCount(newsData.commentsCount || newsData.commentCount || 0);
        setSharesCount(newsData.sharesCount || newsData.shareCount || 0);
        setComments(newsData.comments || []);
      } else {
        throw new Error(response.message || 'Failed to fetch news details');
      }
    } catch (error) {
      console.error('Fetch news error:', error);
      setAlertMessage(error.message || 'Failed to load news');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (newsId) {
      fetchNewsDetails();
    }
  }, [newsId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNewsDetails();
  };

  // Load like status
  const loadLikeStatus = async (newsId) => {
    try {
      const response = await apiService.checkLikeStatus(newsId, user.userId);
      if (response.error === false) {
        const likedStatus = response.data?.[0]?.liked || false;
        setLiked(likedStatus);
      }
    } catch (error) {
      console.error('Error loading like status:', error);
    }
  };

  // Handle like action
  const handleLike = async () => {
    try {
      const response = await apiService.toggleLike(newsId,user.userId);
      if (response.error === false) {
        // Update local state optimistically
        const newLikedState = !liked;
        setLiked(newLikedState);
        setLikesCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));
        
        // Refresh like status from server
        loadLikeStatus(newsId);
      }
    } catch (error) {
      console.error('Like error:', error);
      setAlertMessage('Failed to update like');
    }
  };

  // Handle share action
  const handleShare = async () => {
    try {
      // First, call the share API to increment share count
      const response = await apiService.shareNews(newsId, user.userId);
      
      if (response.error === false) {
        // Update share count
        setSharesCount(prev => prev + 1);
        
        // Create formatted news template
        const shareTemplate = `
📰 *${news.headline}* 

${news.content && news.content.length > 300 ? news.content.substring(0, 300) + '...' : news.content || ''}

*Category:* ${news.category || 'General'}
*Type:* ${news.newsType || 'Regular'}
*Priority:* ${news.priority || 'Normal'}
*Published:* ${formatDate(news.createdAt)}

📲 *Shared via NewsApp*
👉 Read full story in the app for more details!

#${news.category || 'News'} #NewsApp
        `.trim();

        // Use React Native Share API
        try {
          await Share.share({
            title: news.headline || 'News Article',
            message: shareTemplate,
            url: news.mediaUrl || news.imageUrl || 'https://your-app-link.com'
          });
        } catch (shareError) {
          console.log('Share dialog cancelled or failed');
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      setAlertMessage('Failed to share news');
    }
  };

  // Handle save action
  const handleSave = async () => {
    try {
      // Update local state
      setSaved(!saved);
      
      // If you have a save API endpoint, you would call it here
      // const response = await apiService.toggleSave?.(newsId, user.userId);
      // if (response?.error === false) {
      //   setSaved(!saved);
      // }
    } catch (error) {
      console.error('Save error:', error);
      setAlertMessage('Failed to save');
    }
  };

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!commentText.trim() || !user?.userId) return;
    
    try {
      setSubmittingComment(true);
      const userId = user.userId;
      const response = await apiService.addComment(newsId, userId, { comment: commentText });
      
      if (response.error === false) {
        setCommentText('');
        setCommentsCount(prev => prev + 1);
        fetchNewsDetails(); // Refresh comments
        setToast({ message: 'Comment added successfully', type: 'success' });
      }
    } catch (error) {
      console.error('Comment error:', error);
      setAlertMessage('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  // Format number (1K, 1M, etc.)
  const formatNumber = (num) => {
    const number = Number(num) || 0;
    if (number >= 1000000) return (number / 1000000).toFixed(1) + 'M';
    if (number >= 1000) return (number / 1000).toFixed(1) + 'K';
    return number.toString();
  };

  // Render comment item
  const CommentItem = ({ item }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <View style={styles.commentAvatar}>
          <Text style={styles.commentAvatarText}>
            {item.user?.name?.charAt(0)?.toUpperCase() || item.userName?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <View>
          <Text style={styles.commentUserName}>{item.user?.name || item.userName || 'Anonymous'}</Text>
          <Text style={styles.commentTime}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
      <Text style={styles.commentText}>{item.comment || item.text}</Text>
    </View>
  );

  // Loading state
  if (loading && !refreshing) {
    return <Loader />;
  }

  // Error state
  if (!news) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          onback={() => navigation.goBack()}
          title={'News Details'}
          hastitle={true}
          active={1}
          onSkip={() => {}}
          skippable={false}
            />
        <View style={styles.errorContainer}>
          <Icon name="newspaper" size={adjust(60)} color={pallette.lightgrey} />
          <Text style={styles.errorText}>News not found</Text>
          <TouchableOpacity 
            style={styles.goBackButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.goBackText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Get the first image (if multiple images exist)
  const firstImage = news.images?.[0] || news.imageUrl || news.mediaUrl || news.thumbnail;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={pallette.white} />
      
      {/* Toast Message */}
      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <Header
       onback={() => navigation.goBack()}
          title={'News Details'}
          hastitle={true}
          active={1}
          onSkip={() => {}}
          skippable={false}
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[pallette.primary]}
            tintColor={pallette.primary}
          />
        }
      >
        {/* News Content */}
        <View style={styles.newsContent}>
          {/* Headline */}
          <Text style={styles.headline}>{news.headline || news.title}</Text>
          
          {/* First Image */}
          {firstImage && (
            <TouchableOpacity 
              onPress={() => setImageModalVisible(true)}
              style={styles.imageContainer}
            >
              <Image 
                source={{ uri: firstImage }} 
                style={styles.image}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
          
          {/* Content/Description */}
          <Text style={styles.content}>{news.content || news.description}</Text>
          
          {/* Category */}
          {news.category && (
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryLabel}>Category:</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{news.category}</Text>
              </View>
            </View>
          )}
          
          {/* News Type */}
          {news.newsType && (
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryLabel}>News Type:</Text>
              <View style={styles.tag}>
                <Text style={styles.categoryText}>{news.newsType}</Text>
              </View>
            </View>
          )}

          {/* Priority */}
          {news.priority && (
            <View style={styles.priorityContainer}>
              <Text style={styles.priorityLabel}>Priority:</Text>
              <View style={[
                styles.priorityBadge,
                news.priority === 'High' && styles.highPriority,
                news.priority === 'Medium' && styles.mediumPriority,
                news.priority === 'Low' && styles.lowPriority,
              ]}>
                <Text style={styles.priorityText}>{news.priority}</Text>
              </View>
            </View>
          )}

          {/* Tags */}
          {news.tags && news.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={styles.tagsLabel}>Tags:</Text>
              <View style={styles.tagsList}>
                {Array.isArray(news.tags) 
                  ? news.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag.trim()}</Text>
                      </View>
                    ))
                  : typeof news.tags === 'string' && news.tags.split(',').map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag.trim()}</Text>
                      </View>
                    ))
                }
              </View>
            </View>
          )}

          {/* Reporter Details */}
          <View style={styles.reporterContainer}>
            <Text style={styles.sectionTitle}>Reporter Details</Text>
            <View style={styles.reporterInfo}>
              <View style={styles.reporterAvatar}>
                <Text style={styles.reporterAvatarText}>
                  {news.reporterName?.charAt(0)?.toUpperCase() || news.reporter?.name?.charAt(0)?.toUpperCase() || 'R'}
                </Text>
              </View>
              <View style={styles.reporterDetails}>
                <Text style={styles.reporterName}>
                  {news.reporterName || news.reporter?.name || 'Staff Reporter'}
                </Text>
                {news.reporterEmail && (
                  <Text style={styles.reporterEmail}>{news.reporterEmail}</Text>
                )}
                {news.reporterPhone && (
                  <Text style={styles.reporterContact}>{news.reporterPhone}</Text>
                )}
              </View>
            </View>
          </View>

          {/* News Metadata */}
          <View style={styles.metadataContainer}>
            <Text style={styles.sectionTitle}>News Information</Text>
            <View style={styles.metadataGrid}>
              {news.city && (
                <View style={styles.metadataItem}>
                  <Icon name="location-dot" size={14} color={pallette.primary} />
                  <Text style={styles.metadataText}>{news.city}</Text>
                </View>
              )}
              {news.state && (
                <View style={styles.metadataItem}>
                  <Icon name="map" size={14} color={pallette.primary} />
                  <Text style={styles.metadataText}>{news.state}</Text>
                </View>
              )}
              {news.district && (
                <View style={styles.metadataItem}>
                  <Icon name="location-crosshairs" size={14} color={pallette.primary} />
                  <Text style={styles.metadataText}>{news.district}</Text>
                </View>
              )}
              {news.createdAt && (
                <View style={styles.metadataItem}>
                  <Icon name="calendar" size={14} color={pallette.primary} />
                  <Text style={styles.metadataText}>{formatDate(news.createdAt)}</Text>
                </View>
              )}
              {news.updatedAt && (
                <View style={styles.metadataItem}>
                  <Icon name="clock-rotate-left" size={14} color={pallette.primary} />
                  <Text style={styles.metadataText}>Updated: {formatDate(news.updatedAt)}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Icon 
              name="heart" 
              size={22} 
              solid={liked}
              color={liked ? pallette.red : pallette.darkgrey} 
            />
            <Text style={[styles.actionCount, liked && styles.likedText]}>
              {formatNumber(likesCount)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Icon name="comment" size={22} color={pallette.darkgrey} />
            <Text style={styles.actionCount}>
              {formatNumber(commentsCount)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Icon name="share" size={22} color={pallette.darkgrey} />
            <Text style={styles.actionCount}>
              {formatNumber(sharesCount)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
            <Icon 
              name="bookmark" 
              size={22} 
              solid={saved}
              color={saved ? pallette.primary : pallette.darkgrey} 
            />
            <Text style={styles.actionText}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments ({commentsCount})</Text>
          
          {/* Add Comment */}
          <View style={styles.addCommentContainer}>
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Add a comment..."
                placeholderTextColor={pallette.grey}
                multiline
                maxLength={500}
              />
              <TouchableOpacity 
                style={[
                  styles.submitCommentButton,
                  (!commentText.trim() || submittingComment) && styles.submitCommentButtonDisabled
                ]}
                onPress={handleSubmitComment}
                disabled={!commentText.trim() || submittingComment}
              >
                {submittingComment ? (
                  <ActivityIndicator size="small" color={pallette.white} />
                ) : (
                  <Icon name="paper-plane" size={16} color={pallette.white} />
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Comments List */}
          <FlatList
            data={comments}
            renderItem={CommentItem}
            keyExtractor={(item, index) => item.id || item._id || index.toString()}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.noCommentsContainer}>
                <Icon name="comment-slash" size={40} color={pallette.lightgrey} />
                <Text style={styles.noCommentsText}>No comments yet</Text>
                <Text style={styles.noCommentsSubtext}>Be the first to comment</Text>
              </View>
            }
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Image Viewer Modal */}
      {firstImage && (
        <Modal
          visible={imageModalVisible}
          transparent={true}
          onRequestClose={() => setImageModalVisible(false)}
        >
          <View style={styles.imageModalOverlay}>
            <TouchableOpacity 
              style={styles.imageModalCloseButton}
              onPress={() => setImageModalVisible(false)}
            >
              <Icon name="xmark" size={24} color={pallette.white} />
            </TouchableOpacity>
            
            <Image 
              source={{ uri: firstImage }} 
              style={styles.imageModalImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}

      {/* Alert Messages */}
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
    backgroundColor: pallette.white,
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: w * 0.1,
  },
  scrollView: {
    flex: 1,
  },
  newsContent: {
    paddingHorizontal: w * 0.04,
    paddingTop: h * 0.02,
  },
  newsTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 6,
    marginBottom: h * 0.02,
  },
  breakingBadge: {
    backgroundColor: pallette.red,
  },
  liveBadge: {
    backgroundColor: pallette.primary,
  },
  newsTypeText: {
    fontSize: adjust(10),
    fontFamily: bold,
    color: pallette.white,
    textTransform: 'uppercase',
  },
  headline: {
    fontSize: adjust(18),
    fontFamily: bold,
    color: pallette.black,
    lineHeight: 32,
    marginBottom: h * 0.02,
  },
  imageContainer: {
    marginBottom: h * 0.03,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
  content: {
    fontSize: adjust(14),
    fontFamily: regular,
    color: pallette.black,
    lineHeight: 24,
    marginBottom: h * 0.03,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: h * 0.02,
  },
  categoryLabel: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.grey,
    marginRight: 8,
  },
  categoryBadge: {
    backgroundColor: pallette.lightprimary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: adjust(12),
    fontFamily: bold,
    color: pallette.primary,
    textTransform: 'uppercase',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: h * 0.02,
  },
  priorityLabel: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.grey,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  highPriority: {
    backgroundColor: '#FFE5E5',
  },
  mediumPriority: {
    backgroundColor: '#FFF4E5',
  },
  lowPriority: {
    backgroundColor: '#E5F4FF',
  },
  priorityText: {
    fontSize: adjust(12),
    fontFamily: bold,
  },
  tagsContainer: {
    marginBottom: h * 0.03,
  },
  tagsLabel: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.grey,
    marginBottom: 8,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: pallette.lightgrey,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: adjust(12),
    fontFamily: medium,
    color: pallette.primary,
  },
  reporterContainer: {
    backgroundColor: pallette.lightgrey,
    borderRadius: 12,
    padding: 16,
    marginBottom: h * 0.03,
  },
  sectionTitle: {
    fontSize: adjust(16),
    fontFamily: semibold,
    color: pallette.black,
    marginBottom: 12,
  },
  reporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reporterAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: pallette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reporterAvatarText: {
    color: pallette.white,
    fontSize: adjust(20),
    fontFamily: bold,
  },
  reporterDetails: {
    flex: 1,
  },
  reporterName: {
    fontSize: adjust(16),
    fontFamily: semibold,
    color: pallette.black,
    marginBottom: 4,
  },
  reporterEmail: {
    fontSize: adjust(12),
    fontFamily: regular,
    color: pallette.darkgrey,
    marginBottom: 2,
  },
  reporterContact: {
    fontSize: adjust(12),
    fontFamily: regular,
    color: pallette.darkgrey,
  },
  metadataContainer: {
    backgroundColor: pallette.lightgrey,
    borderRadius: 12,
    padding: 16,
    marginBottom: h * 0.03,
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: pallette.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  metadataText: {
    fontSize: adjust(12),
    fontFamily: medium,
    color: pallette.darkgrey,
  },
  actionBar: {
    flexDirection: 'row',
    backgroundColor: pallette.white,
    paddingVertical: h * 0.02,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: pallette.lightgrey,
    borderBottomColor: pallette.lightgrey,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionCount: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.darkgrey,
  },
  likedText: {
    color: pallette.red,
  },
  actionText: {
    fontSize: adjust(12),
    fontFamily: medium,
    color: pallette.grey,
    marginTop: 4,
  },
  commentsSection: {
    backgroundColor: pallette.white,
    paddingHorizontal: w * 0.04,
    paddingVertical: h * 0.03,
  },
  commentsTitle: {
    fontSize: adjust(18),
    fontFamily: semibold,
    color: pallette.black,
    marginBottom: h * 0.02,
  },
  addCommentContainer: {
    marginBottom: h * 0.03,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: pallette.lightgrey,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commentInput: {
    flex: 1,
    fontSize: adjust(14),
    fontFamily: regular,
    color: pallette.black,
    maxHeight: 100,
  },
  submitCommentButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: pallette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  submitCommentButtonDisabled: {
    backgroundColor: pallette.lightgrey,
  },
  commentItem: {
    paddingVertical: h * 0.015,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: pallette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  commentAvatarText: {
    color: pallette.white,
    fontSize: adjust(14),
    fontFamily: bold,
  },
  commentUserName: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.black,
  },
  commentTime: {
    fontSize: adjust(12),
    fontFamily: regular,
    color: pallette.grey,
    marginTop: 2,
  },
  commentText: {
    fontSize: adjust(14),
    fontFamily: regular,
    color: pallette.black,
    lineHeight: 20,
  },
  noCommentsContainer: {
    alignItems: 'center',
    paddingVertical: h * 0.04,
  },
  noCommentsText: {
    fontSize: adjust(16),
    fontFamily: medium,
    color: pallette.darkgrey,
    marginTop: 12,
  },
  noCommentsSubtext: {
    fontSize: adjust(14),
    fontFamily: regular,
    color: pallette.grey,
    marginTop: 4,
  },
  bottomSpacer: {
    height: h * 0.03,
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalImage: {
    width: SCREEN_WIDTH,
    height: '80%',
  },
  errorText: {
    fontSize: adjust(16),
    fontFamily: medium,
    color: pallette.darkgrey,
    marginTop: h * 0.02,
    marginBottom: h * 0.03,
    textAlign: 'center',
  },
  goBackButton: {
    backgroundColor: pallette.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  goBackText: {
    color: pallette.white,
    fontSize: adjust(14),
    fontFamily: medium,
  },
});

export default NewsDetails;