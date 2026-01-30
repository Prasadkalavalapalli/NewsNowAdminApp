// components/news/NewsItem.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Dimensions,
  ActivityIndicator,
  Share
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Video from 'react-native-video';
import { pallette } from '../../helpers/colors';
import { regular, medium, bold, semibold } from '../../helpers/fonts';
import apiService from '../../../Axios/Api';
import { useAppContext } from '../../../Store/contexts/app-context';
import ErrorMessage from '../../helpers/errormessage';
import ShareNews from './ShareNews';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NewsItem = React.memo(({ 
  item, 
  formatTime,
  onFilterPress,
  onCommentPress,
  onVideoPlayback,
  isVideoPlaying,
  currentNewsId,
  showComments,
  refreshActionBar
}) => {
  const { user } = useAppContext();
  const userId = user?.userId || 2;
  console.log(item)
    const shareRef = useRef(null);
  // Local state for actions
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingShare, setLoadingShare] = useState(false);

  // Video states
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const videoRef = useRef(null);
  const controlTimeoutRef = useRef(null);
  
  const isVideo = item.mediaUrl?.includes('.mp4') || 
                  item.mediaUrl?.includes('.mov') ||
                  item.mediaType === 'video';

  // Load action data when component mounts
  useEffect(() => {
    loadActionData();
  }, [item.id]);

   useEffect(() => {
    if (refreshActionBar > 0) {
      loadActionData(); // This reloads likes, comments, shares
    }
  }, [refreshActionBar, item.id]);
  // Load all action-related data
  const loadActionData = async () => {
    try {
      await Promise.all([
        loadLikeStatus(),
        loadCommentCount(),
        loadShareCount(),
        loadSaveStatus()
      ]);
    } catch (error) {
      console.error('Error loading action data:', error);
    }
  };

  // Load like status and count
  const loadLikeStatus = async () => {
    try {
      const response = await apiService.checkLikeStatus(item.id, userId);
      if (response.error === false) {
        setLiked(response.data?.[0]?.liked || false);
        // If API returns like count, update it
        if (response.data?.[0]?.likeCount !== undefined) {
          setLikeCount(response.data[0].likeCount);
        }
      }
    } catch (error) {
      console.error('Error loading like status:', error);
    }
  };

  const loadCommentCount = async () => {
    try {
      const response = await apiService.getComments(item.id);
      if (Array.isArray(response.data)) {
        setCommentCount(response.data.length);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const loadShareCount = async () => {
    try {
      const response = await apiService.getCounts(item.id);
      if (response.data) {
        setShareCount(response.data.shares || 0);
        setLikeCount(response.data.likes || 0);
      }
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  };

  const loadSaveStatus = async () => {
    try {
      // Replace with your actual API call to check save status
      // const response = await apiService.checkSaveStatus(item.id, userId);
      // setSaved(response.data?.saved || false);
    } catch (error) {
      console.error('Error loading save status:', error);
    }
  };

  // Toggle like
  const handleLikePress = async () => {
    if (loadingLike) return;
    
    try {
      setLoadingLike(true);
      const newLiked = !liked;
      
      // Optimistic update
      setLiked(newLiked);
      setLikeCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));
      
      // API call
      await apiService.toggleLike(item.id, userId);
      
    } catch (error) {
      // Revert on error
      setLiked(!liked);
      setLikeCount(prev => liked ? prev + 1 : Math.max(0, prev - 1));
      ErrorMessage.show('Failed to update like');
    } finally {
      setLoadingLike(false);
    }
  };

  // Toggle save
  const handleSavePress = async () => {
    if (loadingSave) return;
    
    try {
      setLoadingSave(true);
      const newSaved = !saved;
      
      // Optimistic update
      setSaved(newSaved);
      
      // API call - replace with your actual save API
      // await apiService.toggleSave(item.id, userId);
      
      ErrorMessage.show(newSaved ? 'Saved to bookmarks' : 'Removed from bookmarks');
    } catch (error) {
      // Revert on error
      setSaved(!saved);
      ErrorMessage.show('Failed to update save');
    } finally {
      setLoadingSave(false);
    }
  };

  // Handle share
   const handleSharePress = async () => {
    if (loadingShare) return;
    
    try {
      setLoadingShare(true);
      
      // Optimistic update
      setShareCount(prev => prev + 1);
      
      // Trigger share
      if (shareRef.current) {
        await shareRef.current.share();
      }
    } catch (e) {
      console.error('Share failed:', e);
      // Revert on error
      setShareCount(prev => Math.max(0, prev - 1));
      ErrorMessage.show('Failed to share');
    } finally {
      setLoadingShare(false);
    }
  };
  
  // Video control functions
  const togglePlayPause = () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    setShowControls(true);
    
    if (newPlayingState && onVideoPlayback) {
      onVideoPlayback(item.id);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setShowThumbnail(false);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleProgress = (data) => {
    setCurrentTime(data.currentTime);
  };

  const handleLoad = (data) => {
    setDuration(data.duration);
    setIsLoadingVideo(false);
    setHasError(false);
  };

  const handleBuffer = ({ isBuffering: buffering }) => {
    setIsBuffering(buffering);
  };

  const handleEnd = () => {
    setIsPlaying(false);
    setShowControls(true);
    if (videoRef.current) {
      videoRef.current.seek(0);
    }
  };

  const handleError = () => {
    setHasError(true);
    setIsLoadingVideo(false);
    setIsPlaying(false);
    setShowControls(true);
  };

  const seekToTime = (time) => {
    if (videoRef.current) {
      videoRef.current.seek(time);
      setCurrentTime(time);
    }
  };

  const formatTimeSeconds = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleVideoPress = () => {
    if (showThumbnail) {
      setShowThumbnail(false);
      setIsPlaying(true);
      if (onVideoPlayback) {
        onVideoPlayback(item.id);
      }
    } else {
      setShowControls(true);
    }
  };

  const handleProgressBarPress = (e) => {
    const x = e.nativeEvent.locationX;
    const containerWidth = e.nativeEvent.layoutMeasurement?.width || SCREEN_WIDTH;
    const newTime = (x / containerWidth) * duration;
    seekToTime(newTime);
    setShowControls(true);
  };

  // Sync with parent video control
  useEffect(() => {
    if (isVideoPlaying !== undefined) {
      if (isVideoPlaying && item.id === currentNewsId) {
        setShowThumbnail(false);
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
        if (!isVideoPlaying) {
          setShowControls(true);
        }
      }
    }
  }, [isVideoPlaying, currentNewsId]);

  // Auto-hide controls
  useEffect(() => {
    if (showControls && isPlaying) {
      if (controlTimeoutRef.current) {
        clearTimeout(controlTimeoutRef.current);
      }
      controlTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    
    return () => {
      if (controlTimeoutRef.current) {
        clearTimeout(controlTimeoutRef.current);
      }
    };
  }, [showControls, isPlaying]);

  // ActionBar component
  const ActionBar = () => (
    <View style={styles.actionBar}>
      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={handleLikePress}
        disabled={loadingLike}
      >
        {loadingLike ? (
          <ActivityIndicator size="small" color={pallette.darkgrey} />
        ) : (
          <Icon 
            name="heart" 
            size={22} 
            solid={liked}
            color={liked ? pallette.red : pallette.darkgrey} 
          />
        )}
        <Text style={[
          styles.actionCount,
          liked && styles.likedText
        ]}>
          {likeCount}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={() => onCommentPress(item.id)}
      >
        <Icon 
          name="comment" 
          size={22} 
          color={showComments && currentNewsId === item.id ? pallette.primary : pallette.darkgrey} 
        />
        <Text style={styles.actionCount}>
          {commentCount}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={handleSharePress}
        disabled={loadingShare}
      >
        {loadingShare ? (
          <ActivityIndicator size="small" color={pallette.darkgrey} />
        ) : (
          <Icon name="share" size={22} color={pallette.darkgrey} />
        )}
        <Text style={styles.actionCount}>
          {shareCount}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={handleSavePress}
        disabled={loadingSave}
      >
        {loadingSave ? (
          <ActivityIndicator size="small" color={pallette.darkgrey} />
        ) : (
          <Icon 
            name="bookmark" 
            size={22} 
            solid={saved}
            color={saved ? pallette.primary : pallette.darkgrey} 
          />
        )}
        <Text style={styles.actionText}>Save</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.newsContainer}>
      <View style={styles.imageContainer}>
        {isVideo ? (
          <>
            {showThumbnail && (item.thumbnailUrl || item.mediaUrl) && !hasError ? (
              // Show thumbnail initially
              <>
                <Image 
                  source={{ uri: item.thumbnailUrl || item.mediaUrl }}
                  style={styles.newsImage}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay} />
                
                <TouchableOpacity 
                  style={styles.videoPlayButton}
                  onPress={handleVideoPress}
                >
                   <Icon 
                          name={isPlaying ? "pause" : "play"} 
                          size={24} 
                          color={pallette.white} 
                        />
                </TouchableOpacity>
              </>
            ) : (
              // Show video player
              <>
                <Video
                  ref={videoRef}
                  source={{ uri: item.mediaUrl }}
                  style={styles.videoPlayer}
                  resizeMode="cover"
                  paused={!isPlaying}
                  onLoad={handleLoad}
                  onBuffer={handleBuffer}
                  onProgress={handleProgress}
                  onEnd={handleEnd}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onError={handleError}
                  repeat={false}
                  playInBackground={false}
                  playWhenInactive={false}
                  ignoreSilentSwitch="ignore"
                  progressUpdateInterval={1000}
                  volume={1.0}
                  rate={1.0}
                />
                
                {/* Video Overlay for Controls */}
                <TouchableOpacity
                  style={styles.videoOverlay}
                  onPress={handleVideoPress}
                  activeOpacity={1}
                />
                
                {/* Loading Indicator */}
                {(isLoadingVideo || isBuffering) && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={pallette.white} />
                    <Text style={styles.loadingText}>
                      {isBuffering ? 'Buffering...' : 'Loading...'}
                    </Text>
                  </View>
                )}
                
                {/* Error State */}
                {hasError && (
                  <View style={styles.errorContainer}>
                    <Icon name="triangle-exclamation" size={40} color={pallette.white} />
                    <Text style={styles.errorText}>Failed to load video</Text>
                    <TouchableOpacity 
                      style={styles.retryButton}
                      onPress={() => {
                        setHasError(false);
                        setIsLoadingVideo(true);
                        if (videoRef.current) {
                          videoRef.current.seek(0);
                        }
                      }}
                    >
                      <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {/* Video Controls */}
                {(showControls || !isPlaying || hasError) && (
                  <View style={styles.videoControlsContainer}>
                    {/* Top Controls */}
                    <View style={styles.videoTopControls}>
                      {/* <TouchableOpacity 
                        style={styles.controlButton}
                        onPress={togglePlayPause}
                      >
                        <Icon 
                          name={isPlaying ? "pause" : "play"} 
                          size={24} 
                          color={pallette.white} 
                        />
                      </TouchableOpacity> */}
                    </View>
                    
                    {/* Bottom Controls */}
                    <View style={styles.videoBottomControls}>
                      <Text style={styles.timeText}>
                        {formatTimeSeconds(currentTime)}
                      </Text>
                      
                      {/* Progress Bar */}
                      <TouchableOpacity
                        style={styles.progressBarContainer}
                        onPress={handleProgressBarPress}
                        activeOpacity={1}
                      >
                        <View style={styles.progressBarBackground}>
                          <View 
                            style={[
                              styles.progressBarFill,
                              { width: `${(currentTime / Math.max(duration, 1)) * 100}%` }
                            ]} 
                          />
                        </View>
                        <View 
                          style={[
                            styles.progressThumb,
                            { left: `${Math.min(95, (currentTime / Math.max(duration, 1)) * 95)}%` }
                          ]}
                        />
                      </TouchableOpacity>
                      
                      <Text style={styles.timeText}>
                        {formatTimeSeconds(duration)}
                      </Text>
                      
                     <TouchableOpacity 
                        style={styles.controlButton}
                        onPress={togglePlayPause}
                      >
                        <Icon 
                          name={isPlaying ? "pause" : "play"} 
                          size={24} 
                          color={pallette.white} 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            )}
            
            {/* Video Indicator */}
            <View style={styles.videoIndicator}>
              <Icon name="video" size={14} color={pallette.white} />
              <Text style={styles.videoIndicatorText}>VIDEO</Text>
            </View>
          </>
        ) : (
          // Image content
          <>
            <Image 
              source={{ uri: item.mediaUrl }} 
              style={styles.newsImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay} />
          </>
        )}
        
        {/* Filter Button - Top Left */}
        <TouchableOpacity 
          style={styles.filterButtonTop}
          onPress={onFilterPress}
        >
          <Icon name="filter" size={20} color={pallette.white} />
        </TouchableOpacity>

        {/* Category Badge - Top Right */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>

        {/* newsType Badge - Below Category */}
        <View style={styles.newsTypeBadge}>
          <Text style={styles.newsTypeBadgeText}>{item.newsType}</Text>
        </View>

        {/* Priority Badge - Below newsType */}
        <View style={styles.priorityBadge}>
          <Text style={styles.priorityText}>{item.priority}</Text>
        </View>

        {/* Reporter/Time/Location Overlay - Bottom Left */}
        <View style={styles.imageInfoOverlay}>
          <View style={styles.locationTimeRow}>
            <Icon name="clock" size={12} color={pallette.white} />
            <Text style={styles.overlayText}> {formatTime(item.publishedAt)}</Text>
            <Text style={styles.overlaySeparator}> • </Text>
            <Icon name="user" size={12} color={pallette.white} />
            <Text style={styles.overlayText}> {item.username || "Reporter"}</Text>
            <Text style={styles.overlaySeparator}> • </Text>
            <Icon name="location-dot" size={12} color={pallette.white} />
            <Text style={styles.overlayText}> {item.location || "Hyderabad (D)"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.contentContainer}>
        {/* Headline - Only headline in content section */}
        <Text style={styles.headline}>{item.headline}</Text>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.fullContent}>{item.content}</Text>
          <View style={styles.contentSpacer} />
        </ScrollView>
      </View>
      
      <ActionBar />
       <ShareNews ref={shareRef} item={item} userId={userId} formatTime={formatTime} />
 
    </View>
  );
});

const styles = StyleSheet.create({
  newsContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  imageContainer: {
    height: SCREEN_WIDTH * 0.7,
    position: 'relative',
  },
  newsImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  filterButtonTop: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: pallette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  categoryBadge: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: pallette.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 1000,
  },
  categoryText: {
    color: pallette.white,
    fontSize: 12,
    fontFamily: bold,
    textTransform: 'uppercase',
  },
  newsTypeBadge: {
    position: 'absolute',
    top: 75, // Below category badge
    right: 20,
    backgroundColor: pallette.gold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 1000,
  },
  newsTypeBadgeText: {
    color: pallette.white,
    fontSize: 12,
    fontFamily: bold,
    textTransform: 'uppercase',
  },
  priorityBadge: {
    position: 'absolute',
    top: 110, // Below newsType badge
    right: 20,
    backgroundColor:  pallette.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 1000,
  },
  priorityText: {
    color: pallette.white,
    fontSize: 12,
    fontFamily: bold,
    textTransform: 'uppercase',
  },
  // Reporter/Time/Location Overlay
  imageInfoOverlay: {
   position: 'absolute',
  bottom: 20,
  left: 20,
  // backgroundColor: 'rgba(0, 0, 0, 0.7)',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 10,
  zIndex: 1000,
  minWidth: 150,
  },
  locationTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // flexWrap: 'wrap',
  },
  overlayText: {
    color: pallette.white,
    fontSize: 12,
    fontFamily: medium,
    marginLeft: 4,
  },
  overlaySeparator: {
    color: pallette.white,
    fontSize: 12,
    marginHorizontal: 8,
    opacity: 0.7,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: pallette.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    marginTop: -20,
  },
  headline: {
    fontSize: 17,
    fontFamily: semibold,
    color: pallette.black,
    marginBottom: 8,
    lineHeight: 26,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  time: {
    fontSize: 14,
    fontFamily: medium,
    color: pallette.grey,
  },
  newsType: {
    fontSize: 14,
    fontFamily: medium,
    color: pallette.primary,
  },
  fullContent: {
    fontSize: 15,
    fontFamily: regular,
    color: pallette.darkgrey,
    lineHeight: 22,
  },
  contentSpacer: {
    height: 80,
  },
  videoPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -30,
    marginTop: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  videoIndicator: {
    position: 'absolute',
    top: 40,
    right: 80,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1000,
  },
  videoIndicatorText: {
    color: pallette.white,
    fontSize: 10,
    fontFamily: bold,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  videoControlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    zIndex: 100,
  },
  videoTopControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    
  },
  videoBottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
   
  },
  controlButton: {
    padding: 10,
    marginHorizontal: 5,
  },
  timeText: {
    color: pallette.white,
    fontSize: 12,
    fontFamily: medium,
    minWidth: 40,
  },
  progressBarContainer: {
    flex: 1,
    height: 30,
    justifyContent: 'center',
    marginHorizontal: 10,
    position: 'relative',
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
  },
  progressBarFill: {
    height: 3,
    backgroundColor: pallette.primary,
    borderRadius: 1.5,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  progressThumb: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: pallette.white,
    position: 'absolute',
    top: -4,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    zIndex: 50,
  },
  loadingText: {
    color: pallette.white,
    fontSize: 12,
    fontFamily: medium,
    marginTop: 10,
  },
  errorContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -80 }, { translateY: -50 }],
    alignItems: 'center',
    zIndex: 50,
    width: 160,
  },
  errorText: {
    color: pallette.white,
    fontSize: 14,
    fontFamily: medium,
    marginTop: 10,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: pallette.primary,
    borderRadius: 20,
  },
  retryText: {
    color: pallette.white,
    fontSize: 14,
    fontFamily: medium,
  },
  // Action Bar Styles
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: pallette.white,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: pallette.lightgrey,
  },
  actionButton: {
    alignItems: 'center',
    minWidth: 60,
    paddingVertical: 4,
  },
  actionCount: {
    fontSize: 12,
    fontFamily: medium,
    color: pallette.darkgrey,
    marginTop: 4,
  },
  actionText: {
    fontSize: 12,
    fontFamily: medium,
    color: pallette.darkgrey,
    marginTop: 4,
  },
  likedText: {
    color: pallette.red,
  },
});

export default NewsItem;