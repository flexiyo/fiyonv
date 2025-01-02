import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Linking,
  Animated,
} from "react-native";

const TodayPicks = () => {
  const [todayPicksVisibility, setTodayPicksVisibility] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const screenWidth = Dimensions.get("window").width;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const todayPicksData = [
    {
      type: "greet",
      title: "Jai Mata Di 🙏",
      content: (
        <Text className="text-white text-lg">
          <Text className="font-bold">App in Development!</Text> You can still
          explore, just click those fuzzy icons and email me for any
          suggestions:{" "}
          <Text
            onPress={() => Linking.openURL("mailto:flexiyo02@gmail.com")}
            className="text-blue-500 underline"
          >
            Send Email
          </Text>
        </Text>
      ),
      buttonText: "Check Now",
    },
    {
      type: "song",
      title: "Today's Song Pick",
      content: (
        <Text className="text-white text-lg">
          Listen to <Text className="font-bold">Tu Hai Kahan</Text> now and
          enjoy it with lyrics 🎵✨
        </Text>
      ),
      buttonText: "Listen Now",
    },
    // Add more data here as needed...
  ];

  const removeTodayPicks = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setTodayPicksVisibility(false));
  };

  return (
    <>
      {todayPicksVisibility && (
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="flex justify-center items-center my-4"
        >
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            ref={scrollViewRef}
            onScroll={({ nativeEvent }) => {
              const index = Math.round(
                nativeEvent.contentOffset.x / screenWidth
              );
              setActiveIndex(index);
            }}
            scrollEventThrottle={16}
            className="w-full"
          >
            {todayPicksData.map((item, index) => (
              <View
                key={index}
                className="p-4 bg-gray-900 rounded-lg"
                style={{
                  width: screenWidth * 0.93,
                  marginHorizontal: screenWidth * 0.04,
                }}
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-white text-xl font-semibold">
                    {item.title}
                  </Text>
                  <TouchableOpacity
                    onPress={removeTodayPicks}
                    className="p-2"
                  >
                    <Text className="text-white font-bold text-lg">×</Text>
                  </TouchableOpacity>
                </View>
                <View className="border-b border-gray-600 my-2" />
                <Text className="mb-4">{item.content}</Text>
                <TouchableOpacity
                  className="bg-blue-500 p-3 rounded-md shadow-lg active:bg-blue-600"
                  onPress={() => console.log(item.buttonText)}
                >
                  <Text className="text-white text-center font-semibold">
                    {item.buttonText}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      )}
    </>
  );
};

export default TodayPicks;
