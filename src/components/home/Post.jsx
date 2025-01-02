import React from "react";
import {Text, Image, TouchableOpacity, View} from "react-native";
import {Svg, Path, Line, Polygon} from "react-native-svg";

const Post = () => {
  return (
    <View className="post bg-gray-800 h-80" testID="post-1">
      <View className="post-container">
        <View className="post-details">
          <View className="post-heading">
            <View className="post-profile-pic">
              <Image
                source={{
                  uri: "https://pravatar.cc/300",
                }}
                alt="Profile Pic"
                className="w-10 h-10 rounded-full"
              />
            </View>
            <View className="post-sub-details">
              <Text className="post-username text-white">kaushal.krishna</Text>
              <View className="post-sub-heading flex-row items-center">
                <Text className="text-gray-400">🎵</Text>
                <Text className="text-gray-400">
                  {"  "}
                  Dhundhala • Yashraj, Talwiinder, Dropped out
                </Text>
              </View>
            </View>
            <View className="post-top-right">
              <View className="post-top-right-icons flex-row">
                <Text className="text-gray-400 text-2xl">ℹ️</Text>
                <Text className="text-gray-400 text-2xl">...</Text>
              </View>
            </View>
          </View>
        </View>
        <View className="post-content">
          <Image
            source={{
              uri: "https://demo.tiny.pictures/main/example1.jpg?width=500&height=250&resizeType=cover&gravity=0.5%2C0.38",
            }}
            alt="Post"
            className="w-full h-64"
          />
        </View>
        <View className="post-engagement">
          <View className="engagement-container flex-row justify-between">
            <View className="engagement-bottom-left-icons flex-row">
              <TouchableOpacity className="engaging-icon">
                <Text className="text-2xl text-gray-400">❤️</Text>
              </TouchableOpacity>
              <TouchableOpacity className="engaging-icon">
                <Svg className="h-6 w-6 text-gray-400" viewBox="0 0 24 24">
                  <Path
                    d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"
                    fill="none"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </Svg>
              </TouchableOpacity>
              <TouchableOpacity className="engaging-icon">
                <Svg className="h-6 w-6 text-gray-400" viewBox="0 0 24 24">
                  <Line
                    fill="none"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    x1="22"
                    x2="9.218"
                    y1="3"
                    y2="10.083"
                  />
                  <Polygon
                    fill="none"
                    points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </Svg>
              </TouchableOpacity>
            </View>
            <View className="engagement-bottom-right-icons">
              <TouchableOpacity className="engaging-icon">
                <Svg className="h-6 w-6 text-gray-400" viewBox="0 0 24 24">
                  <Polygon
                    fill="none"
                    points="20 21 12 13.44 4 21 4 3 20 3 20 21"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </Svg>
              </TouchableOpacity>
            </View>
          </View>
          <View className="post-engagement-counts">
            <Text className="likes-count text-white">344 Likes</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Post;
