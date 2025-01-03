import {ScrollView, View, Text} from "react-native";
import {TouchableOpacity} from "react-native-gesture-handler";
import TodayPicks from "../components/home/TodayPicks";
import Post from "../components/home/Post";

const Home = ({navigation}) => {
  return (
    <ScrollView id="home">
      <View className="home-container bg-body-bg">
        <TodayPicks />
        <TouchableOpacity onPress={() => navigation.navigate("Music")}>
          <Text className="text-white font-bold text-2xl bg-slate-700 py-2 text-center">
            Go to Music
          </Text>
        </TouchableOpacity>
        <Post />
        <Post />
        <Post />
        <Post />
      </View>
    </ScrollView>
  );
};

export default Home;
