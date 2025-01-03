import React, {useState, useEffect, useContext, useCallback} from "react";
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
import RNFSTurbo from "react-native-fs-turbo";
import CustomMusicModals from "../components/music/CustomMusicModals";

import {fiyosaavnApiBaseUri} from "../constants.js";
import AppContext from "../context/items/AppContext";
import MusicContext from "../context/items/MusicContext";
import CustomTopNavbar from "../layout/items/CustomTopNavbar";
import TrackDeck from "../components/music/TrackDeck";
import useMusicUtils from "../hooks/useMusicUtils";
import TrackItemsList from "../components/music/TrackItemsList.jsx";

const Music = () => {
  // Context values
  const {contentQuality, setContentQuality} = useContext(AppContext);
  const {topTracks, setTopTracks, currentTrack} = useContext(MusicContext);

  // Custom hooks
  const {getTrackData, getTracksFromDB, handleAudioPause} = useMusicUtils();

  // State variables
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
  const [isSpeechModalOpen, setIsSpeechModalOpen] = useState(true);
  const [speechListening, setSpeechListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState("");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const connectedToInternet = true;

  // Search tracks function
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

  // Fetch top tracks function
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

  // useEffect for initial track load and network change
  useEffect(() => {
    getTopTracks();
  }, [connectedToInternet]);

  // Handles track download
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
       await RNFSTurbo.mkdir(`${RNFSTurbo.ExternalStorageDirectoryPath}/flexiyo`);
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

  // Handle search text change
  const handleSearchChange = event => {
    const value = event.nativeEvent.text;
    setSearchText(value);
    searchTracks(value);
  };

  // Open Download Modal Function
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

  // Close download modal
  const closeDownloadModal = () => {
    setIsDownloadModalOpen(false);
  };

  // Open speech Modal function
  const openSpeechModal = async () => {
    setIsSpeechModalOpen(true);
    try {
      // Voice.start('en-IN');
      setSpeechListening(true);
      handleAudioPause();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      Alert.alert("Error", "Failed to start speech recognition.");
    }
  };

  // Close speech modal function
  const closeSpeechModal = useCallback(() => {
    setIsSpeechModalOpen(false);
    // Voice.stop();
    setSpeechListening(false);
  }, []);

  // Listen to the speech results
  useEffect(() => {
    const speechResultsHandler = event => {
      if (event.value && event.value.length > 0) {
        setSpeechTranscript(event.value[0]);
      }
    };
    // Voice.onSpeechResults(speechResultsHandler);

    return () => {
      // Voice.removeAllListeners('onSpeechResults');
    };
  }, []);

  useEffect(() => {
    if (!speechListening && speechTranscript) {
      searchTracks(speechTranscript);
      setSearchText(speechTranscript);
      setSpeechTranscript("");
      closeSpeechModal();
    }
  }, [speechListening, speechTranscript, closeSpeechModal, searchTracks]);

  // Open Settings Modal
  const openMusicSettings = async () => {
    setIsMusicSettingsModalOpen(true);
  };

  // Close Settings Modal
  const closeMusicSettingsModal = async () => {
    setIsMusicSettingsModalOpen(false);
  };

  // Renders the speech modal waves
  const renderSpeechModalWaves = () => (
    <View className="speechWave">
      <TouchableOpacity
        className="speechWaveBoxContainer"
        style={{
          outline: !speechTranscript && !speechListening ? "2px solid red" : 0,
        }}
        onPress={openSpeechModal}>
        <View className="speechWaveBox speechWaveBox1" />
        <View className="speechWaveBox speechWaveBox2" />
        <View className="speechWaveBox speechWaveBox3" />
        <View className="speechWaveBox speechWaveBox4" />
        <View className="speechWaveBox speechWaveBox5" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-[#000b13]">
      <CustomTopNavbar
        // navbarCover={jioSaavnLogo}
        navbarTitle="Music"
        navbarSecondIcon="fa fa-gear"
        onSecondIconClick={openMusicSettings}
      />
      <View className="flex flex-row items-center bg-gray-900 rounded-lg px-3 py-2 my-3 mx-3">
        <TextInput
          className="flex-1 bg-transparent outline-none text-gray-100 placeholder-gray-500"
          placeholder="Search for tracks..."
          placeholderTextColor="#A0A0A0"
          value={searchText}
          onChange={handleSearchChange}
        />
        <TouchableOpacity onPress={openSpeechModal}>
          <Text className="text-gray-200 mx-3 py-1 px-2 rounded hover:bg-slate-700">
            🎤
          </Text>
        </TouchableOpacity>
        <Text className={`text-gray-500`}>
          {apiLoading ? <ActivityIndicator color="#A0A0A0" /> : "🔍"}
        </Text>
      </View>
      {apiError && <Text className="text-red-500 px-3">{printError}</Text>}
      <View className="flex-1 px-3">
        <TrackItemsList
          tracks={tracks}
          onOpenDownloadModal={openDownloadModal}
        />
      </View>
      <CustomMusicModals
        isMusicSettingsModalOpen={isMusicSettingsModalOpen}
        closeMusicSettingsModal={closeMusicSettingsModal}
        contentQuality={contentQuality}
        setContentQuality={setContentQuality}
        isDownloadModalOpen={isDownloadModalOpen}
        closeDownloadModal={closeDownloadModal}
        modalDownloadData={modalDownloadData}
        downloadProgress={downloadProgress}
        downloadTrack={downloadTrack}
        isDownloadLoading={isDownloadLoading}
        isSpeechModalOpen={isSpeechModalOpen}
        closeSpeechModal={closeSpeechModal}
        speechTranscript={speechTranscript}
        speechListening={speechListening}
        topTracks={topTracks}
        openSpeechModal={openSpeechModal}
        renderSpeechModalWaves={renderSpeechModalWaves}
      />
      <TrackDeck />
    </View>
  );
};

export default Music;
