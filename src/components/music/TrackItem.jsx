import React, {useState, useContext} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  ActivityIndicator,
} from "react-native";
import FaIcon from "react-native-vector-icons/FontAwesome";
import MaIcon from "react-native-vector-icons/MaterialIcons";

import useMusicUtils from "../../hooks/useMusicUtils";
import AppContext from "../../context/items/AppContext";

const TrackItem = ({track, index, onOpenDownloadModal}) => {
  const {contentQuality} = useContext(AppContext);
  const {getTrack} = useMusicUtils();
  const [isDownloadLoading, setIsDownloadLoading] = useState(false);
  const [scale] = useState(new Animated.Value(1));

  const handleItemClick = () => {
    getTrack(track.id);
  };

  const handleDownloadClick = async () => {
    setIsDownloadLoading(true);
    await onOpenDownloadModal(track.id);
    setIsDownloadLoading(false);
  };

  return (
    <Animated.View style={{transform: [{scale}]}}>
      <TouchableOpacity
        onPressIn={() =>
          Animated.spring(scale, {toValue: 0.98, useNativeDriver: true}).start()
        }
        onPressOut={() =>
          Animated.spring(scale, {toValue: 1, useNativeDriver: true}).start(
            () => handleItemClick(),
          )
        }>
        <View className="flex flex-row mb-6 h-16 w-full items-center justify-between">
          <Image
            className="overflow-hidden mx-auto w-16 h-16 object-cover rounded-md border border-gray-800"
            source={{
              uri: Array.isArray(track.image)
                ? contentQuality === "low"
                  ? track.image[0].url
                  : contentQuality === "normal"
                  ? track.image[1].url
                  : contentQuality === "high"
                  ? track.image[2].url
                  : track.image[1].url
                : track.image,
            }}
            alt="Track"
          />
          <View className="w-9/12 flex flex-col pl-3 pr-10">
            <Text
              className="text-md text-white font-semibold"
              numberOfLines={1}>
              {track.name}
            </Text>
            <Text
              className="text-sm text-gray-400"
              numberOfLines={1}
              key={index}>
              {track.artists.primary
                ? track.artists.primary.map(artist => artist.name).join(", ")
                : track.artists}
            </Text>
          </View>
          <View className="flex justify-center items-center w-10 h-10 pr-3">
            {isDownloadLoading ? (
              <ActivityIndicator size="small" color="gray" />
            ) : (
              <TouchableOpacity
                onPressIn={() =>
                  Animated.spring(scale, {
                    toValue: 0.98,
                    useNativeDriver: true,
                  }).start()
                }
                onPressOut={() =>
                  Animated.spring(scale, {
                    toValue: 1,
                    useNativeDriver: true,
                  }).start(() => handleDownloadClick())
                }
                className="flex justify-center items-center">
                <MaIcon name="arrow-circle-down" size={24} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default TrackItem;
