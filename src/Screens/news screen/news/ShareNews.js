// components/news/ShareNews.js
import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import { pallette } from '../../helpers/colors';
import { medium, bold } from '../../helpers/fonts';

const ShareNews = forwardRef(({ item, formatTime, onShared, onError }, ref) => {
  const viewShotRef = useRef(null);

  useImperativeHandle(ref, () => ({
    share: async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        let uri = null;
        if (viewShotRef.current) {
          uri = await viewShotRef.current.capture();
        }
        if (!uri) {
          onError?.('Failed to capture image for sharing');
          return;
        }

        const shareOptions = {
          title: item.headline || 'News Article',
          message: ``,
          url: `file://${uri}`,
          type: 'image/png',
          failOnCancel: false,
        };

        const result = await Share.open(shareOptions);
        if (result.success || result.dismissedAction === false) {
          onShared?.();
        }

        return result;
      } catch (error) {
        console.error('Share error:', error);
        onError?.('Failed to share news');
      }
    },
  }));

  return (
    <ViewShot
      ref={viewShotRef}
      options={{ format: 'png', quality: 0.95, result: 'tmpfile', width: 450, height: 500 }}
      style={styles.container}
    >
      <View style={styles.card}>
        {/* Media Image */}
        {item.mediaUrl ? (
          <Image source={{ uri: item.mediaUrl }} style={styles.image} resizeMode="cover" />
        ) : null}

        {/* Content */}
        <View style={styles.content}>
          {/* <Text style={styles.category}>{item.category?.toUpperCase() || 'NEWS'}</Text> */}
          <Text style={styles.headline} numberOfLines={2}>{item.headline}</Text>
          <Text style={styles.snippet} numberOfLines={8}>{item.content}</Text>
        </View>

        {/* Footer with user, time, branding */}
        <View style={styles.footer}>
          <View style={styles.authorTime}>
            <Text style={styles.user}>By {item.username}</Text>
             <Text style={styles.user}> • {item.district}</Text>
            <Text style={styles.time}>{formatTime(item.publishedAt)}</Text>
          </View>
          <View style={styles.branding}>
            <Text style={styles.sharedBy}>Shared by NewsNow</Text>
            {/* <Text style={styles.website}>www.newsnow.com</Text>
            <Text style={styles.download}>Download the app for more</Text> */}
          </View>
        </View>
      </View>
    </ViewShot>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -1200, 
    left: 0,
    width: 450,
    height: 500,
    backgroundColor: pallette.white,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: pallette.lightgrey,
    backgroundColor: pallette.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 220,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  category: {
    fontFamily: bold,
    fontSize: 12,
    color: pallette.primary,
    marginBottom: 6,
  },
  headline: {
    fontFamily: bold,
    fontSize: 20,
    color: pallette.black,
    marginBottom: 8,
  },
  snippet: {
    fontFamily: medium,
    fontSize: 14,
    color: pallette.darkgrey,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: pallette.lightgrey,
    backgroundColor: '#f9f9f9',
  },
  authorTime: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  user: {
    fontFamily: medium,
    fontSize: 12,
    color: pallette.grey,
  },
  time: {
    fontFamily: medium,
    fontSize: 12,
    color: pallette.grey,
  },
  branding: {
    alignItems: 'flex-start',
  },
  sharedBy: {
    fontFamily: bold,
    fontSize: 12,
    color: pallette.primary,
  },
  website: {
    fontFamily: medium,
    fontSize: 12,
    color: pallette.primary,
    textDecorationLine: 'underline',
    marginVertical: 2,
  },
  download: {
    fontFamily: medium,
    fontSize: 12,
    color: pallette.darkgrey,
  },
});

export default ShareNews;
