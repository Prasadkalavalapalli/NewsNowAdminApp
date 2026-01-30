// components/news/CommentsPanel.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { pallette } from '../../helpers/colors';
import { regular, medium, semibold, bold } from '../../helpers/fonts';
import apiService from '../../../Axios/Api';
import { useAppContext } from '../../../Store/contexts/app-context';
import ErrorMessage from '../../helpers/errormessage';

const CommentsPanel = React.memo(({ 
  showComments, 
  toggleComments, 
  currentNewsId,
   onCommentAdded
}) => {
  const { user } = useAppContext();
  const userId = user?.userId || 2;
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (showComments && currentNewsId) {
      loadComments();
    }
  }, [showComments, currentNewsId]);

  const loadComments = async () => {
    if (!currentNewsId) return;
    
    try {
      setLoading(true);
      const response = await apiService.getComments(currentNewsId);
      
      if (Array.isArray(response.data)) {
        const formattedComments = response.data.map(comment => ({
          id: comment.id,
          userId: comment.userId,
          user: comment.userName || 'User',
          text: comment.comment,
          time: formatTime(comment.createdAt),
          createdAt: comment.createdAt
        }));
        
        setComments(formattedComments);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      return 'Recently';
    }
  };

  const submitComment = async () => {
    if (!currentNewsId || !newComment.trim()) return;
    
    const commentText = newComment.trim();
    
    try {
      setSubmitting(true);
      
      // Clear input immediately
      setNewComment('');
      
      // Submit to API
      await apiService.addComment(currentNewsId, userId, { comment: commentText });
      
      // Add new comment optimistically to local state
      const newCommentObj = {
        id: Date.now(),
        userId,
        user: 'You',
        text: commentText,
        time: 'Just now',
        createdAt: new Date().toISOString()
      };
      
      setComments(prev => [newCommentObj, ...prev]);
        // ✅ Call the callback to notify NewsViewScreen
      if (onCommentAdded) {
        onCommentAdded();
      }
      
      
      // Refresh comments from server
      await loadComments();
      
    } catch (error) {
      console.error('Error adding comment:', error);
      ErrorMessage.show('Failed to add comment');
      // Restore comment if failed
      setNewComment(commentText);
    } finally {
      setSubmitting(false);
    }
  };

  if (!showComments) return null;

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.keyboardView}>
      <View style={styles.commentsContainer}>
        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>
            Comments ({comments.length})
          </Text>
          <TouchableOpacity onPress={toggleComments}>
            <Icon name="xmark" size={20} color={pallette.grey} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.addCommentContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Write a comment..."
            value={newComment}
            onChangeText={setNewComment}
            multiline={true}
            placeholderTextColor={pallette.grey}
            editable={!submitting}
          />
          <TouchableOpacity 
            style={[styles.submitButton, (!newComment.trim() || submitting) && styles.submitButtonDisabled]}
            onPress={submitComment}
            disabled={!newComment.trim() || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={pallette.white} />
            ) : (
              <Icon name="paper-plane" size={18} color={pallette.white} />
            )}
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.commentsList}
          keyboardShouldPersistTaps="handled"
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={pallette.primary} />
              <Text style={styles.loadingText}>Loading comments...</Text>
            </View>
          ) : (
            <>
              {comments.map((item) => (
                <View key={item.id} style={styles.commentItem}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>
                      {item.user?.charAt(0) || 'U'}
                    </Text>
                  </View>
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentUserName}>{item.user || 'User'}</Text>
                      <Text style={styles.commentTime}>{item.time || 'Recently'}</Text>
                    </View>
                    <Text style={styles.commentText}>{item.text}</Text>
                  </View>
                </View>
              ))}
              
              {comments.length === 0 && (
                <View style={styles.noCommentsContainer}>
                  <Icon name="comment-slash" size={40} color={pallette.grey} />
                  <Text style={styles.noCommentsText}>No comments yet</Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  keyboardView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  commentsContainer: {
    backgroundColor: pallette.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: 400,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  commentsTitle: {
    fontSize: 18,
    fontFamily: semibold,
    color: pallette.black,
  },
  commentsList: {
    maxHeight: 300,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: medium,
    color: pallette.grey,
    marginTop: 10,
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: pallette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  commentAvatarText: {
    color: pallette.white,
    fontSize: 16,
    fontFamily: bold,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: 14,
    fontFamily: semibold,
    color: pallette.black,
  },
  commentTime: {
    fontSize: 12,
    fontFamily: regular,
    color: pallette.grey,
  },
  commentText: {
    fontSize: 14,
    fontFamily: regular,
    color: pallette.darkgrey,
    lineHeight: 20,
  },
  noCommentsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noCommentsText: {
    fontSize: 16,
    fontFamily: medium,
    color: pallette.darkgrey,
    marginTop: 12,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: pallette.lightgrey,
  },
  commentInput: {
    flex: 1,
    backgroundColor: pallette.lightgrey,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: regular,
    color: pallette.black,
    maxHeight: 80,
    marginRight: 12,
  },
  submitButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: pallette.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: pallette.grey,
  },
});

export default CommentsPanel;