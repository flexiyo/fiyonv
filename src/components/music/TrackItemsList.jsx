import React, {useState, useContext, useCallback, memo, useMemo} from "react";
import {View, Text, Image, ActivityIndicator, StyleSheet, FlatList} from "react-native";
import {TapGestureHandler, State} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import MaIcon from "react-native-vector-icons/MaterialIcons";
import useMusicUtils from "../../hooks/useMusicUtils";
import AppContext from "../../context/items/AppContext";

const TrackItem = memo(({track, onOpenDownloadModal}) => {
  const {contentQuality} = useContext(AppContext);
  const {getTrack} = useMusicUtils();
  const [isDownloadLoading, setIsDownloadLoading] = useState(false);
  const scale = useSharedValue(1);
  const downloadScale = useSharedValue(1);

  const getImageSource = useCallback(() => {
    if (Array.isArray(track.image)) {
      const qualityIndex =
        {
          low: 0,
          normal: 1,
          high: 2,
        }[contentQuality] || 1;
      return {uri: track.image[qualityIndex]?.url || track.image[1]?.url};
    }
    return {uri: track.image};
  }, [track.image, contentQuality]);

  const handleDownloadClick = useCallback(async () => {
    setIsDownloadLoading(true);
    await onOpenDownloadModal(track.id);
    setIsDownloadLoading(false);
  }, [onOpenDownloadModal, track.id]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        itemContainer: {
          flexDirection: "row",
          marginBottom: 6,
          height: 70,
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 5,
        },
        imageContainer: {
          overflow: "hidden",
          marginHorizontal: "auto",
          width: 55,
          height: 55,
          objectFit: "cover",
          borderRadius: 4,
          borderWidth: 1,
          borderColor: "#374151",
        },
        textContainer: {
          flex: 1,
          flexDirection: "column",
          paddingLeft: 10,
          paddingRight: 10,
        },
        downloadContainer: {
          flex: 0,
          justifyContent: "center",
          alignItems: "center",
          width: 40,
          height: 40,
          paddingRight: 10,
        },
      }),
    [],
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: scale.value}],
    };
  });

  const animatedDownloadStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: downloadScale.value}],
    };
  });

  const handleTap = useCallback(() => {
    scale.value = withTiming(0.98, {duration: 100}, () => {
      scale.value = withTiming(1);
    });
    getTrack(track.id);
  }, [getTrack, track.id, scale]);

  const handleDownloadTap = useCallback(() => {
    downloadScale.value = withTiming(0.98, {duration: 100}, () => {
      downloadScale.value = withTiming(1);
    });
    handleDownloadClick();
  }, [handleDownloadClick, downloadScale]);

  return (
    <Animated.View style={animatedStyle}>
      <TapGestureHandler
        onHandlerStateChange={({nativeEvent}) => {
          if (nativeEvent.state === State.END) {
            handleTap();
          }
        }}>
        <Animated.View style={styles.itemContainer}>
          <Image
            style={styles.imageContainer}
            source={getImageSource()}
            alt="Track"
          />
          <View style={styles.textContainer}>
            <Text
              style={{color: "#fff", fontWeight: "bold", fontSize: 16}}
              numberOfLines={1}>
              {track.name}
            </Text>
            <Text style={{color: "#A0A0A0", fontSize: 12}} numberOfLines={1}>
              {typeof track.artists === "string"
                ? track.artists
                : track.artists.primary?.map(artist => artist.name).join(", ")}
            </Text>
          </View>
          <View style={styles.downloadContainer} pointerEvents="box-none">
            {isDownloadLoading ? (
              <ActivityIndicator size="small" color="gray" />
            ) : (
              <TapGestureHandler
                onHandlerStateChange={({nativeEvent}) => {
                  if (nativeEvent.state === State.END) {
                    handleDownloadTap();
                  }
                }}>
                <Animated.View
                  style={animatedDownloadStyle}
                  className="flex justify-center items-center">
                  <MaIcon name="arrow-circle-down" size={24} color="white" />
                </Animated.View>
              </TapGestureHandler>
            )}
          </View>
        </Animated.View>
      </TapGestureHandler>
    </Animated.View>
  );
});

const TrackItemsList = memo(({tracks, onOpenDownloadModal}) => {
  const renderItem = useCallback(
    ({item, index}) => (
      <TrackItem
        track={item}
        index={index}
        onOpenDownloadModal={onOpenDownloadModal}
      />
    ),
    [onOpenDownloadModal],
  );
  const keyExtractor = useCallback(item => String(item.id), []);
  return (
    <View className="flex-1">
      <FlatList
        data={tracks}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={100}
        windowSize={10}
        removeClippedSubviews={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
      />
    </View>
  );
});

export default TrackItemsList;
