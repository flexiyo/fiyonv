import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import axios from "axios";
import {
  View,
  Text,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import {TouchableOpacity} from "react-native-gesture-handler";
import BottomSheet, {BottomSheetView} from "@gorhom/bottom-sheet";
import RNFSTurbo from "react-native-fs-turbo";
import MaIcon from "react-native-vector-icons/MaterialIcons";

import {fiyosaavnApiBaseUri} from "../constants.js";
import AppContext from "../context/items/AppContext";
import MusicContext from "../context/items/MusicContext";
import CustomTopNavbar from "../layout/items/CustomTopNavbar";
import TrackDeck from "../components/music/TrackDeck";
import useMusicUtils from "../hooks/useMusicUtils";
import TrackList from "../components/music/TrackList";

const Music = ({route}) => {
  const connectedToInternet = route.params?.connectedToInternet;

  const {contentQuality, setContentQuality} = useContext(AppContext);
  const {topTracks, setTopTracks, currentTrack} = useContext(MusicContext);
  const {getTrackData, getTracksFromDB} = useMusicUtils();

  const [searchText, setSearchText] = useState("");
  const [printError, setPrintError] = useState("");
  const [apiError, setApiError] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [isDownloadLoading, setIsDownloadLoading] = useState(false);
  const [modalDownloadData, setModalDownloadData] = useState("");
  const [isMusicSettingsModalOpen, setIsMusicSettingsModalOpen] =
    useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const musicSettingsBottomSheetRef = useRef(null);
  const downloadBottomSheetRef = useRef(null);

  const searchTracks = useCallback(
    async searchTerm => {
      if (!searchTerm.trim()) {
        setTracks(topTracks);
        return;
      }
      try {
        setApiLoading(true);
        const {data: response} = await axios.get(
          `${fiyosaavnApiBaseUri}/search/songs`,
          {
            params: {
              query: searchTerm,
              page: 1,
              limit: 30,
            },
          },
        );
        setTracks(response.data.results);
        setApiError(false);
      } catch (error) {
        setApiError(true);
        setPrintError(`${error.code} : ${error.message}`);
      } finally {
        setApiLoading(false);
      }
    },
    [topTracks],
  );

  const getTopTracks = async () => {
    if (!connectedToInternet) {
      const tracksFromDB = await getTracksFromDB();
      setTopTracks(tracksFromDB);
      setTracks(tracksFromDB);
      setApiLoading(false);
      return;
    }

    setApiLoading(true);
    try {
      let fetchedTracks;
      if (topTracks.length > 0) {
        fetchedTracks = topTracks;
      } else {
        const {data: response} = await axios.get(
          `${fiyosaavnApiBaseUri}/playlists?id=1134543272&limit=40`,
        );
        fetchedTracks = response.data.songs.sort(() => Math.random() - 0.5);
      }
      setTopTracks(fetchedTracks);
      setTracks(fetchedTracks);
    } catch (error) {
      console.error("Error fetching top tracks from API:", error);
      setApiError(true);
      setPrintError(
        "Error fetching top tracks. Please check your internet connection.",
      );
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    getTopTracks();
  }, [connectedToInternet]);

  const downloadTrack = async () => {
    if (!modalDownloadData?.fileUrl) {
      Alert.alert(
        "Download Error",
        "No download URL found. Please select a valid track.",
      );
      return;
    }
    try {
      setDownloadProgress(0);
      const {data} = await axios.get(modalDownloadData.fileUrl, {
        responseType: "blob",
        onDownloadProgress: progressEvent => {
          const progress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100,
          );
          setDownloadProgress(progress);
        },
      });

      if (
        !RNFSTurbo.exists(`${RNFSTurbo.ExternalStorageDirectoryPath}/flexiyo`)
      ) {
        await RNFSTurbo.mkdir(
          `${RNFSTurbo.ExternalStorageDirectoryPath}/flexiyo`,
        );
      }

      const mp4Path = `${RNFSTurbo.ExternalStorageDirectoryPath}/flexiyo/${modalDownloadData.fileName}`;
      const base64MP4 = btoa(
        new Uint8Array(data).reduce(
          (acc, byte) => acc + String.fromCharCode(byte),
          "",
        ),
      );

      await RNFSTurbo.writeFile(mp4Path, base64MP4, "base64");
      setDownloadProgress(100);
      Alert.alert("Download Complete", `File saved at: ${mp4Path}`);
    } catch (error) {
      console.error("Error during download:", error);
      Alert.alert(
        "Download Failed",
        "There was an error downloading the file.",
      );
    } finally {
      setIsDownloadModalOpen(false);
      setDownloadProgress(0);
    }
  };

  const handleSearchChange = event => {
    const value = event.nativeEvent.text;
    setSearchText(value);
    searchTracks(value);
  };

  const openDownloadModal = async trackId => {
    try {
      setIsDownloadLoading(true);
      let trackData;
      if (currentTrack.id !== trackId) {
        trackData = await getTrackData(trackId);
      } else {
        trackData = currentTrack;
      }

      if (!trackData) {
        Alert.alert("Error", "Track data not found.");
        return;
      }

      setModalDownloadData({
        fileUrl: trackData.link,
        fileName: `${trackData.name} - ${trackData.artists
          .split(",")[0]
          .trim()}.mp4`,
        fileImage: trackData.image,
      });
      setIsDownloadModalOpen(true);
      setApiError(false);
    } catch (error) {
      console.error("Error opening download modal:", error);
      setApiError(true);
      setPrintError(`${error.code} : ${error.message}`);
      Alert.alert("Error", "Could not fetch track data for download.");
    } finally {
      setIsDownloadLoading(false);
    }
  };

  const closeDownloadModal = () => {
    setIsDownloadModalOpen(false);
  };

  const openMusicSettings = async () => {
    setIsMusicSettingsModalOpen(true);
  };

  const closeMusicSettingsModal = async () => {
    setIsMusicSettingsModalOpen(false);
  };

  useEffect(() => {
    if (isMusicSettingsModalOpen) {
      musicSettingsBottomSheetRef.current?.expand();
    } else {
      musicSettingsBottomSheetRef.current?.close();
    }
  }, [isMusicSettingsModalOpen]);

  useEffect(() => {
    if (isDownloadModalOpen) {
      downloadBottomSheetRef.current?.expand();
    } else {
      downloadBottomSheetRef.current?.close();
    }
  }, [isDownloadModalOpen]);

  return (
    <View className="flex-1 bg-[#000b13]">
      <CustomTopNavbar
        // navbarCover={jioSaavnLogo}
        navbarTitle="Music"
        navbarSecondIcon="fa fa-gear"
        onSecondIconClick={openMusicSettings}
      />
      <View className="flex flex-row items-center bg-gray-900 rounded-lg px-3 py-1 my-3 mx-3">
        <TextInput
          className="flex-1 bg-transparent outline-none text-gray-100 placeholder-gray-500"
          placeholder="Search for tracks..."
          placeholderTextColor="#A0A0A0"
          value={searchText}
          onChange={handleSearchChange}
        />
        <Text className={`text-gray-500`}>
          {apiLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <MaIcon name="search" size={20} color="#A0A0A0" />
          )}
        </Text>
      </View>
      {apiError && <Text className="text-red-500 px-3">{printError}</Text>}
      <View className="flex-1 px-3">
        <TrackList tracks={tracks} onOpenDownloadModal={openDownloadModal} />
      </View>
      <BottomSheet
        ref={musicSettingsBottomSheetRef}
        enablePanDownToClose
        snapPoints={["50%"]}
        index={-1}
        handleStyle={{backgroundColor: "#111131d"}}
        backgroundStyle={{backgroundColor: "#11131d"}}
        handleIndicatorStyle={{backgroundColor: "transparent"}}
        onClose={closeMusicSettingsModal}>
        <BottomSheetView
          className="flex flex-col"
          style={{paddingVertical: 10}}>
          <Text className="text-gray-400 font-semibold mb-2">
            Content Quality
          </Text>
          <View className="flex flex-row items-center space-x-2">
            {["low", "normal", "high"].map(quality => (
              <TouchableOpacity
                key={quality}
                onPress={() => setContentQuality(quality)}
                className={`p-2 rounded-full ${
                  contentQuality === quality ? "bg-green-500" : "bg-gray-600"
                }`}>
                <Text className="text-white capitalize">{quality}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </BottomSheetView>

        <TouchableOpacity
          onPress={closeMusicSettingsModal}
          style={{padding: 10}}>
          <Text style={{color: "#fff", textAlign: "center"}}>Close</Text>
        </TouchableOpacity>
      </BottomSheet>
      <BottomSheet
        ref={downloadBottomSheetRef}
        enablePanDownToClose
        snapPoints={["50%"]}
        index={-1}
        handleStyle={{backgroundColor: "#111131d"}}
        backgroundStyle={{backgroundColor: "#11131d"}}
        handleIndicatorStyle={{backgroundColor: "transparent"}}
        onClose={closeDownloadModal}>
        <BottomSheetView
          className="flex flex-col"
          style={{paddingVertical: 10}}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}>
            <Image
              source={{uri: modalDownloadData.fileImage}}
              className="w-12 h-12 rounded-md"
            />
            <Text className="text-white ml-3 flex-1">
              {modalDownloadData.fileName}
            </Text>
          </View>
          <Text className="text-gray-300 mb-2">
            Progress: {downloadProgress}%
          </Text>
          <View className="relative w-full h-4 bg-gray-600 rounded-full mb-4">
            <View
              className="absolute h-full bg-green-500 rounded-full"
              style={{width: `${downloadProgress}%`}}
            />
          </View>
          {isDownloadLoading && <ActivityIndicator color="white" />}
        </BottomSheetView>

        <BottomSheetView
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            padding: 10,
          }}>
          <TouchableOpacity
            onPress={closeDownloadModal}
            style={{
              backgroundColor: "#444",
              padding: 10,
              borderRadius: 5,
            }}>
            <Text style={{color: "#fff"}}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={downloadTrack}
            disabled={isDownloadLoading}
            style={{
              backgroundColor: isDownloadLoading ? "#666" : "#4CAF50",
              padding: 10,
              borderRadius: 5,
            }}>
            <Text style={{color: "#fff"}}>
              {isDownloadLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                "Download"
              )}
            </Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
      <TrackDeck />
    </View>
  );
};

export default Music;
