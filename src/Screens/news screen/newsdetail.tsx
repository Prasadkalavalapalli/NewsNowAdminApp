import React, { useState, useEffect, useRef } from 'react';
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
  Share,
  Platform,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation, useRoute } from '@react-navigation/native';
import { pallette } from '../helpers/colors';
import { regular, medium, semibold, bold } from '../helpers/fonts';
import { h, w, adjust } from '../../constants/dimensions';
import ToastMessage from '../helpers/ToastMessage';
import AlertMessage from '../helpers/alertmessage';
import { userAPI } from '../../Axios/Api';
import Loader from '../helpers/loader';
import Header from '../helpers/header';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NewsDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { newsId = 1 } = route.params || {};
  
  // Refs
  const commentInputRef = useRef();
  
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [news, setNews] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [relatedNews, setRelatedNews] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [showDeleteCommentAlert, setShowDeleteCommentAlert] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState(null);

  // Fetch news details
  const fetchNewsDetails = async () => {
    try {
      setLoading(true);
      
      const response = await userAPI.getNewsDetails(newsId);
      
      if (response.success) {
        const newsData = response.data;
        setNews(newsData);
        setLiked(newsData.isLiked || false);
        setBookmarked(newsData.isBookmarked || false);
        setLikesCount(newsData.likes || 0);
        setCommentsCount(newsData.commentsCount || 0);
        setSharesCount(newsData.shares || 0);
        setViewsCount(newsData.views || 0);
        setComments(newsData.comments || []);
        setRelatedNews(newsData.relatedNews || []);
        
        // Track view count
        await userAPI.incrementViewCount(newsId);
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

  // Handlers
  const handleRefresh = () => {
    setRefreshing(true);
    fetchNewsDetails();
  };

  const handleLike = async () => {
    try {
      const newLikedState = !liked;
      setLiked(newLikedState);
      setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
      
      const response = await userAPI.toggleLike(newsId, newLikedState);
      if (!response.success) {
        setLiked(!newLikedState);
        setLikesCount(prev => newLikedState ? prev - 1 : prev + 1);
        throw new Error(response.message || 'Failed to update like');
      }
    } catch (error) {
      setAlertMessage(error.message || 'Failed to update like');
    }
  };

  const handleBookmark = async () => {
    try {
      const newBookmarkedState = !bookmarked;
      setBookmarked(newBookmarkedState);
      
      const response = await userAPI.toggleBookmark(newsId, newBookmarkedState);
      if (!response.success) {
        setBookmarked(!newBookmarkedState);
        throw new Error(response.message || 'Failed to update bookmark');
      }
      
      setToast({
        message: newBookmarkedState ? 'News bookmarked' : 'News removed from bookmarks',
        type: 'success'
      });
    } catch (error) {
      setAlertMessage(error.message || 'Failed to update bookmark');
    }
  };

  const handleShare = async () => {
    try {
      const shareOptions = {
        title: news.headline,
        message: `${news.headline}\n\n${news.description.substring(0, 100)}...`,
      };

      if (news.shareUrl) {
        shareOptions.url = news.shareUrl;
      } else if (Platform.OS === 'ios') {
        shareOptions.message += `\n\nhttps://newsnow.com/news/${newsId}`;
      }

      const result = await Share.share(shareOptions);
      
      if (result.action === Share.sharedAction) {
        setSharesCount(prev => prev + 1);
        await userAPI.incrementShareCount(newsId);
      }
    } catch (error) {
      setAlertMessage('Failed to share news');
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      setAlertMessage('Please enter a comment');
      return;
    }

    try {
      setSubmittingComment(true);
      
      const response = await userAPI.addComment(newsId, commentText);
      
      if (response.success) {
        const newComment = response.data;
        setComments(prev => [newComment, ...prev]);
        setCommentsCount(prev => prev + 1);
        setCommentText('');
        commentInputRef.current?.blur();
        setToast({
          message: 'Comment added successfully',
          type: 'success'
        });
      } else {
        throw new Error(response.message || 'Failed to add comment');
      }
    } catch (error) {
      setAlertMessage(error.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = (commentId) => {
    setSelectedCommentId(commentId);
    setShowDeleteCommentAlert(true);
  };

  const confirmDeleteComment = async (confirmed) => {
    setShowDeleteCommentAlert(false);
    
    if (!confirmed || !selectedCommentId) return;
    
    try {
      const response = await userAPI.deleteComment(selectedCommentId);
      
      if (response.success) {
        setComments(prev => prev.filter(comment => comment._id !== selectedCommentId));
        setCommentsCount(prev => prev - 1);
        setToast({
          message: 'Comment deleted',
          type: 'success'
        });
      } else {
        throw new Error(response.message || 'Failed to delete comment');
      }
    } catch (error) {
      setAlertMessage(error.message || 'Failed to delete comment');
    } finally {
      setSelectedCommentId(null);
    }
  };

  const handleReportNews = async () => {
    if (!reportReason.trim()) {
      setAlertMessage('Please enter a reason for reporting');
      return;
    }

    try {
      const response = await userAPI.reportNews(newsId, reportReason);
      
      if (response.success) {
        setReportModalVisible(false);
        setReportReason('');
        setToast({
          message: 'News reported successfully. Our team will review it.',
          type: 'success'
        });
      } else {
        throw new Error(response.message || 'Failed to report news');
      }
    } catch (error) {
      setAlertMessage(error.message || 'Failed to report news');
    }
  };

  // Helper functions
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

  const formatNumber = (num) => {
    const number = Number(num) || 0;
    if (number >= 1000000) return (number / 1000000).toFixed(1) + 'M';
    if (number >= 1000) return (number / 1000).toFixed(1) + 'K';
    return number.toString();
  };

  // Components
  const NewsImages = () => {
    if (!news?.images || news.images.length === 0) return null;

    if (news.images.length === 1) {
      return (
        <TouchableOpacity 
          onPress={() => {
            setSelectedImageIndex(0);
            setImageModalVisible(true);
          }}
          style={styles.singleImageContainer}
        >
          <Image 
            source={{ uri: news.images[0] }} 
            style={styles.singleImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    }

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.multipleImagesContainer}
      >
        {news.images.slice(0, 3).map((image, index) => (
          <TouchableOpacity 
            key={index}
            onPress={() => {
              setSelectedImageIndex(index);
              setImageModalVisible(true);
            }}
            style={styles.multipleImageWrapper}
          >
            <Image 
              source={{ uri: image }} 
              style={styles.multipleImage}
              resizeMode="cover"
            />
            {index === 2 && news.images.length > 3 && (
              <View style={styles.moreImagesOverlay}>
                <Text style={styles.moreImagesText}>+{news.images.length - 3}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const CommentItem = ({ item }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <View style={styles.commentUserInfo}>
          <View style={styles.commentAvatar}>
            <Text style={styles.commentAvatarText}>
              {item.user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </Text>
          </View>
          <View>
            <Text style={styles.commentUserName}>{item.user?.name || 'Anonymous'}</Text>
            <Text style={styles.commentTime}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
        
        {item.isOwnComment && (
          <TouchableOpacity 
            onPress={() => handleDeleteComment(item._id)}
            style={styles.deleteCommentButton}
          >
            <Icon name="trash" size={14} color={pallette.grey} />
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.commentText}>{item.text}</Text>
    </View>
  );

  const RelatedNewsItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.relatedNewsItem}
      onPress={() => navigation.push('NewsView', { newsId: item._id })}
    >
      {item.thumbnail || item.images?.[0] ? (
        <Image 
          source={{ uri: item.thumbnail || item.images?.[0] }} 
          style={styles.relatedNewsImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.relatedNewsImagePlaceholder}>
          <Icon name="newspaper" size={30} color={pallette.lightgrey} />
        </View>
      )}
      <View style={styles.relatedNewsContent}>
        <Text style={styles.relatedNewsTitleText} numberOfLines={2}>
          {item.headline}
        </Text>
        <Text style={styles.relatedNewsMeta}>
          {formatDate(item.createdAt)} • {item.category}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const ActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
        <Icon 
          name="heart" 
          solid={liked}
          size={22} 
          color={liked ? pallette.red : pallette.grey} 
        />
        <Text style={[styles.actionButtonText, liked && styles.likedText]}>
          {formatNumber(likesCount)}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => commentInputRef.current?.focus()}
      >
        <Icon name="comment" size={22} color={pallette.grey} />
        <Text style={styles.actionButtonText}>{formatNumber(commentsCount)}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
        <Icon name="share" size={22} color={pallette.grey} />
        <Text style={styles.actionButtonText}>{formatNumber(sharesCount)}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionButton} onPress={handleBookmark}>
        <Icon 
          name="bookmark" 
          solid={bookmarked}
          size={22} 
          color={bookmarked ? pallette.primary : pallette.grey} 
        />
        <Text style={styles.actionButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );

  const AddCommentSection = () => (
    <View style={styles.addCommentContainer}>
      <View style={styles.userAvatar}>
        <Text style={styles.userAvatarText}>{'U'}</Text>
      </View>
      <View style={styles.commentInputContainer}>
        <TextInput
          ref={commentInputRef}
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
  );

  const NewsMetadata = () => (
    <View style={styles.metaContainer}>
      <View style={styles.reporterInfo}>
        <View style={styles.reporterAvatar}>
          <Text style={styles.reporterAvatarText}>
            {news.reporter?.name?.charAt(0)?.toUpperCase() || 'R'}
          </Text>
        </View>
        <View>
          <Text style={styles.reporterName}>{news.reporter?.name || 'Staff Reporter'}</Text>
          <Text style={styles.newsMeta}>
            {formatDate(news.createdAt)} • {news.location?.city || 'Unknown Location'}
          </Text>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon name="eye" size={14} color={pallette.grey} />
          <Text style={styles.statText}>{formatNumber(viewsCount)}</Text>
        </View>
      </View>
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
          active={1}
          onSkip={() => {}}
          skippable={false}
          hastitle={true}
          title={'News Details'}
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
        active={1}
        onSkip={() => {}}
        skippable={false}
        hastitle={true}
        title={'Detail News'}
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
         
         {/* News Type Badges */}
          {(news.isBreakingNews || news.isLiveNews) && (
            <View style={styles.newsTypeBadges}>
              {news.isBreakingNews && (
                <View style={styles.breakingBadge}>
                  <Icon name="bolt" size={12} color={pallette.white} />
                  <Text style={styles.breakingText}>BREAKING</Text>
                </View>
              )}
              {news.isLiveNews && (
                <View style={styles.liveBadge}>
                  <Icon name="signal" size={12} color={pallette.white} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              )}
            </View>
          )}
          
          {/* Headline */}
          <Text style={styles.headline}>{news.headline}</Text>
         
          
          {/* Images */}
          <NewsImages />
          
          {/* Description */}
          <Text style={styles.description}>{news.description}</Text>
          
          {/* Tags */}
          {news.tags && (
            <View style={styles.tagsContainer}>
              {news.tags.split(',').map((tag, index) => (
                <View key={index} style={styles.tagButton}>
                  <Text style={styles.tagText}>#{tag.trim()}</Text>
                </View>
              ))}
            </View>
          )}
          
           {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{news.category}</Text>
          </View>
          {/* Source */}
          {news.source && (
            <View style={styles.sourceContainer}>
              <Text style={styles.sourceLabel}>Source:</Text>
              <Text style={styles.sourceText}>{news.source}</Text>
            </View>
          )}


           
          {/* Metadata */}
          <NewsMetadata />
          
          


        </View>

        {/* Action Buttons */}
        <ActionButtons />

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments ({commentsCount})</Text>
          
          <AddCommentSection />
          
          {/* Comments List */}
          <FlatList
            data={comments}
            renderItem={CommentItem}
            keyExtractor={item => item._id}
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
          
          {news?.images && (
            <>
              <Image 
                source={{ uri: news.images[selectedImageIndex] }} 
                style={styles.imageModalImage}
                resizeMode="contain"
              />
              
              <View style={styles.imageModalIndicator}>
                <Text style={styles.imageModalIndicatorText}>
                  {selectedImageIndex + 1} / {news.images.length}
                </Text>
              </View>
              
              {news.images.length > 1 && (
                <>
                  {selectedImageIndex > 0 && (
                    <TouchableOpacity 
                      style={[styles.imageNavButton, styles.prevButton]}
                      onPress={() => setSelectedImageIndex(prev => prev - 1)}
                    >
                      <Icon name="chevron-left" size={24} color={pallette.white} />
                    </TouchableOpacity>
                  )}
                  
                  {selectedImageIndex < news.images.length - 1 && (
                    <TouchableOpacity 
                      style={[styles.imageNavButton, styles.nextButton]}
                      onPress={() => setSelectedImageIndex(prev => prev + 1)}
                    >
                      <Icon name="chevron-right" size={24} color={pallette.white} />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </>
          )}
        </View>
      </Modal>

      {/* Report Modal */}
      <Modal
        visible={reportModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reportModal}>
            <View style={styles.reportModalHeader}>
              <Text style={styles.reportModalTitle}>Report News</Text>
              <TouchableOpacity onPress={() => setReportModalVisible(false)}>
                <Icon name="xmark" size={20} color={pallette.grey} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.reportModalText}>
              Please tell us why you're reporting this news:
            </Text>
            
            <TextInput
              style={styles.reportInput}
              value={reportReason}
              onChangeText={setReportReason}
              placeholder="Enter reason..."
              placeholderTextColor={pallette.grey}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            
            <View style={styles.reportModalActions}>
              <TouchableOpacity 
                style={styles.reportCancelButton}
                onPress={() => setReportModalVisible(false)}
              >
                <Text style={styles.reportCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.reportSubmitButton,
                  !reportReason.trim() && styles.reportSubmitButtonDisabled
                ]}
                onPress={handleReportNews}
                disabled={!reportReason.trim()}
              >
                <Text style={styles.reportSubmitText}>Submit Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Alert Messages */}
      {alertMessage && (
        <AlertMessage
          message={alertMessage}
          onClose={() => setAlertMessage('')}
        />
      )}
      
      {showDeleteCommentAlert && (
        <AlertMessage
          message="Are you sure you want to delete this comment?"
          onClose={confirmDeleteComment}
          showConfirm={true}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: pallette.lightgrey,
    paddingHorizontal: w * 0.1,
  },
  scrollView: {
    flex: 1,
  },
  newsContent: {
    backgroundColor: pallette.white,
    paddingHorizontal: w * 0.04,
    paddingVertical: h * 0.03,
    marginBottom: h * 0.02,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: pallette.lightprimary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: h * 0.02,
  },
  categoryText: {
    fontSize: adjust(12),
    fontFamily: bold,
    color: pallette.primary,
    textTransform: 'uppercase',
  },
  headline: {
    fontSize: adjust(24),
    fontFamily: bold,
    color: pallette.black,
    lineHeight: 32,
    marginBottom: h * 0.02,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: h * 0.02,
    paddingBottom: h * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  reporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reporterAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: pallette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  reporterAvatarText: {
    color: pallette.white,
    fontSize: adjust(14),
    fontFamily: bold,
  },
  reporterName: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.black,
  },
  newsMeta: {
    fontSize: adjust(12),
    fontFamily: regular,
    color: pallette.grey,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  statText: {
    fontSize: adjust(12),
    fontFamily: regular,
    color: pallette.grey,
    marginLeft: 4,
  },
  newsTypeBadges: {
    flexDirection: 'row',
    marginBottom: h * 0.02,
    gap: 8,
  },
  breakingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: pallette.red,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 6,
  },
  breakingText: {
    fontSize: adjust(10),
    fontFamily: bold,
    color: pallette.white,
    textTransform: 'uppercase',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: pallette.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 6,
  },
  liveText: {
    fontSize: adjust(10),
    fontFamily: bold,
    color: pallette.white,
    textTransform: 'uppercase',
  },
  singleImageContainer: {
    marginBottom: h * 0.03,
    borderRadius: 12,
    overflow: 'hidden',
  },
  singleImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
  multipleImagesContainer: {
    marginBottom: h * 0.03,
  },
  multipleImageWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  multipleImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  moreImagesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesText: {
    color: pallette.white,
    fontSize: adjust(20),
    fontFamily: bold,
  },
  description: {
    fontSize: adjust(16),
    fontFamily: regular,
    color: pallette.black,
    lineHeight: 24,
    marginBottom: h * 0.03,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: h * 0.03,
  },
  tagButton: {
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
  sourceContainer: {
    flexDirection: 'row',
    marginBottom: h * 0.02,
  },
  sourceLabel: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.grey,
    marginRight: 6,
  },
  sourceText: {
    fontSize: adjust(14),
    fontFamily: regular,
    color: pallette.black,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    backgroundColor: pallette.white,
    paddingVertical: h * 0.02,
    marginBottom: h * 0.02,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: pallette.lightgrey,
    borderBottomColor: pallette.lightgrey,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  actionButtonText: {
    fontSize: adjust(12),
    fontFamily: medium,
    color: pallette.grey,
    marginTop: 6,
  },
  likedText: {
    color: pallette.red,
  },
  commentsSection: {
    backgroundColor: pallette.white,
    paddingHorizontal: w * 0.04,
    paddingVertical: h * 0.03,
    marginBottom: h * 0.02,
  },
  commentsTitle: {
    fontSize: adjust(18),
    fontFamily: semibold,
    color: pallette.black,
    marginBottom: h * 0.02,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: h * 0.03,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: pallette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: pallette.white,
    fontSize: adjust(16),
    fontFamily: bold,
  },
  commentInputContainer: {
    flex: 1,
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  commentUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  deleteCommentButton: {
    padding: 4,
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
  relatedNewsSection: {
    backgroundColor: pallette.white,
    paddingHorizontal: w * 0.04,
    paddingVertical: h * 0.03,
    marginBottom: h * 0.02,
  },
  relatedNewsTitle: {
    fontSize: adjust(18),
    fontFamily: semibold,
    color: pallette.black,
    marginBottom: h * 0.02,
  },
  relatedNewsItem: {
    width: 200,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: pallette.lightgrey,
  },
  relatedNewsImage: {
    width: '100%',
    height: 120,
  },
  relatedNewsImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: pallette.lightgrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  relatedNewsContent: {
    padding: 12,
  },
  relatedNewsTitleText: {
    fontSize: adjust(14),
    fontFamily: semibold,
    color: pallette.black,
    marginBottom: 4,
  },
  relatedNewsMeta: {
    fontSize: adjust(12),
    fontFamily: regular,
    color: pallette.grey,
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
    height: h,
  },
  imageModalIndicator: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageModalIndicatorText: {
    color: pallette.white,
    fontSize: adjust(14),
    fontFamily: medium,
  },
  imageNavButton: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prevButton: {
    left: 20,
  },
  nextButton: {
    right: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  reportModal: {
    backgroundColor: pallette.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  reportModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reportModalTitle: {
    fontSize: adjust(18),
    fontFamily: semibold,
    color: pallette.black,
  },
  reportModalText: {
    fontSize: adjust(14),
    fontFamily: regular,
    color: pallette.black,
    marginBottom: 16,
  },
  reportInput: {
    borderWidth: 1,
    borderColor: pallette.lightgrey,
    borderRadius: 8,
    padding: 12,
    fontSize: adjust(14),
    fontFamily: regular,
    color: pallette.black,
    minHeight: 100,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  reportModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  reportCancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  reportCancelText: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.grey,
  },
  reportSubmitButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: pallette.red,
  },
  reportSubmitButtonDisabled: {
    backgroundColor: pallette.lightgrey,
  },
  reportSubmitText: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.white,
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