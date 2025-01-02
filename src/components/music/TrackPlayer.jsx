import React, { useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import MaIcon from "react-native-vector-icons/MaterialIcons";
import MusicContext from "../../context/items/MusicContext";
import useMusicUtils from "../../hooks/useMusicUtils";

const TrackPlayer = () => {
  const {
    currentTrack,
    audioProgressPercentage,
    isAudioLoading,
    isAudioPlaying,
    isTrackDeckSheetOpen,
    setIsTrackDeckSheetOpen,
  } = useContext(MusicContext);

  const { handleAudioPlay, handleAudioPause, handleNextAudioTrack } =
    useMusicUtils();

  const [isMinimized, setIsMinimized] = useState(false);

  const handleTrackPlayerBoxClick = () => {
    setIsTrackDeckSheetOpen(true);
  };

  const handleMinimizePlayer = () => {
    setIsMinimized(!isMinimized);
  };

  const expandedPlayer = () => {
    return (
      <View className="absolute left-0 right-0 bottom-0 bg-gray-900 rounded-md outline border-x border-t  border-gray-800 my-2 mx-3 h-18 flex flex-col justify-between z-10">
        <View className="flex flex-row items-center justify-between p-1">
          <Pressable className="p-1" onPress={handleTrackPlayerBoxClick}>
            <Image
              source={{ uri: currentTrack.image }}
              className="w-14 h-14 rounded-md opacity-80"
            />
          </Pressable>
          <View className="flex-1 ml-3">
            <Text
              className="text-white text-sm"
              numberOfLines={1}
              onPress={handleTrackPlayerBoxClick}>
              {currentTrack.name}
            </Text>
            <Text
              className="text-gray-400 text-xs"
              numberOfLines={1}
              onPress={handleTrackPlayerBoxClick}>
              {currentTrack.artists}
            </Text>
          </View>
          <View className="flex flex-row items-center">
            <View className="mx-2">
              {isAudioLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : isAudioPlaying ? (
                <Pressable onPress={handleAudioPause}>
                  <MaIcon name="pause" size={30} color="white" />
                </Pressable>
              ) : (
                <Pressable onPress={handleAudioPlay}>
                  <MaIcon name="play-arrow" size={30} color="white" />
                </Pressable>
              )}
            </View>
            <Pressable className="mx-2" onPress={handleNextAudioTrack}>
              <MaIcon name="skip-next" size={30} color="white" />
            </Pressable>
          </View>
        </View>
        <View className="h-1 w-full bg-gray-800 rounded-b-md">
          <View
            className="h-full bg-green-600 rounded-b-md"
            style={{ width: `${audioProgressPercentage}%` }}
          />
        </View>
      </View>
    );
  };
  

  const minimalPlayer = () => (
    <View className="absolute left-0 right-0 bottom-0 bg-gray-900 rounded-md outline outline-1 outline-gray-800 m-2 h-15 flex flex-row items-center justify-between p-3 z-10">
      <View className="flex flex-row items-center">
        <Image
          source={{ uri: currentTrack.image }}
          className="w-10 h-10 rounded-md opacity-80"
        />
        <Pressable
          className="absolute left-2 top-2"
          onPress={isAudioPlaying ? handleAudioPause : handleAudioPlay}>
          <MaIcon
            name={isAudioPlaying ? "pause" : "play-arrow"}
            size={30}
            color="white"
          />
        </Pressable>
      </View>
      <Pressable className="ml-2" onPress={handleNextAudioTrack}>
        <MaIcon name="skip-next" size={30} color="white" />
      </Pressable>
    </View>
  );

  return (
    currentTrack.id &&
    !isTrackDeckSheetOpen &&
    (isMinimized ? minimalPlayer() : expandedPlayer())
  );
};

export default TrackPlayer;
