import React, {useState, useEffect, useContext, useCallback} from "react";
import axios from "axios";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  ProgressViewIOS,
} from "react-native";
import SQLite from "react-native-sqlite-storage";

import {fiyosaavnApiBaseUri} from "../constants.js";
import AppContext from "../context/items/AppContext";
import MusicContext from "../context/items/MusicContext";
import CustomTopNavbar from "../layout/items/CustomTopNavbar";
import TrackItem from "../components/music/TrackItem";
import TrackDeck from "../components/music/TrackDeck";
import useMusicUtils from "../hooks/useMusicUtils";

const dbName = "MusicCacheDB.db";
let db;

const Music = ({connectedToInternet}) => {
  const {contentQuality, setContentQuality} = useContext(AppContext);
  const {topTracks, setTopTracks, currentTrack} = useContext(MusicContext);
  const {getTrack, getTrackData, handleAudioPause} = useMusicUtils();

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
  const [isSpeechModalOpen, setIsSpeechModalOpen] = useState(false);
  const [speechListening, setSpeechListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState("");
  const [downloadProgress, setDownloadProgress] = useState(0);

  const openDB = async () => {
    return new Promise((resolve, reject) => {
      db = SQLite.openDatabase(
        {
          name: dbName,
          location: "default",
        },
        () => {
          resolve(db);
        },
        error => {
          console.error("Error opening database:", error);
          reject(error);
        },
      );
    });
  };

  const searchTracks = useCallback(
    async searchTerm => {
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
        setApiLoading(false);
        return response.data.results;
      } catch (error) {
        setApiError(true);
        setPrintError(`${error.code} : ${error.message}`);
        setApiLoading(false);
      }
    },
    [fiyosaavnApiBaseUri],
  );

  const getTracksFromDB = async () => {
    try {
      if (!db) await openDB();
      return new Promise((resolve, reject) => {
        db.transaction(txn => {
          txn.executeSql(
            `SELECT * FROM tracks`,
            [],
            (tx, result) => {
              const rows = result.rows._array;
              resolve(rows);
            },
            error => reject(error),
          );
        });
      });
    } catch (error) {
      console.error("Error fetching tracks from SQLite:", error);
      return [];
    }
  };

  const getTopTracks = async () => {
    setApiLoading(true);
    try {
      let tracks;
      if (topTracks.length > 0) {
        tracks = topTracks;
      } else {
        const {data: response} = await axios.get(
          `${fiyosaavnApiBaseUri}/playlists?id=1134543272&limit=40`,
        );
        tracks = response.data.songs.sort(() => Math.random() - 0.5);
      }
      setTopTracks(tracks);
      setTracks(tracks);
    } catch (error) {
      console.error("Error fetching top tracks from API:", error);
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    getTopTracks();
  }, []);

  const downloadTrack = async modalDownloadData => {
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

      const base64 = btoa(
        new Uint8Array(data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          "",
        ),
      );
      // const filePath = `${RNFS.DocumentDirectoryPath}/${modalDownloadData.fileName}`;
      // await RNFS.writeFile(filePath, base64, 'base64');
      setDownloadProgress(100);
      // Alert.alert('Download Complete', `File saved at: ${filePath}`);
    } catch (error) {
      console.error(`Error downloading track: ${error.message}`);
      Alert.alert(
        "Download Failed",
        "There was an error downloading the file.",
      );
      setDownloadProgress(0);
    } finally {
      setIsDownloadModalOpen(false);
      setDownloadProgress(0);
    }
  };

  const handleSearchChange = event => {
    const value = event.nativeEvent.text;
    setSearchText(value);
    if (value.trim() !== "") {
      searchTracks(value);
    } else {
      getTopTracks();
    }
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
      setModalDownloadData({
        fileUrl: trackData.link,
        fileName: `${trackData.name} - ${trackData.artists
          .split(",")[0]
          .trim()}.mp3`,
        fileImage: trackData.image,
      });
      setIsDownloadModalOpen(true);
      setApiError(false);
    } catch (error) {
      setApiError(true);
      setPrintError(`${error.code} : ${error.message}`);
    } finally {
      setIsDownloadLoading(false);
    }
  };

  const closeDownloadModal = () => {
    setIsDownloadModalOpen(false);
  };

  const openSpeechModal = async () => {
    setIsSpeechModalOpen(true);
    try {
      // Voice.start('en-IN');
      setSpeechListening(true);
      handleAudioPause();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
    }
  };

  const closeSpeechModal = useCallback(() => {
    setIsSpeechModalOpen(false);
    // Voice.stop();
    setSpeechListening(false);
  }, []);

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

  const openMusicSettings = async () => {
    setIsMusicSettingsModalOpen(true);
  };

  const closeMusicSettingsModal = async () => {
    setIsMusicSettingsModalOpen(false);
  };

  const renderTracks = () => {
    return tracks.map((track, index) => (
      <TrackItem
        key={index}
        index={index}
        track={track}
        onGetTrack={getTrack}
        onOpenDownloadModal={trackId => openDownloadModal(trackId)}
        isDownloadLoading={isDownloadLoading}
      />
    ));
  };
  const onShare = async () => {
    try {
      const shareOptions = {
        message: `https://flexiyo.web.app/music?track=${currentTrack.id}`,
      };
      await Share.open(shareOptions);
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  const renderSpeechModalWaves = () => {
    return (
      <View className="speechWave">
        <View
          className="speechWaveBoxContainer"
          style={{
            outline:
              !speechTranscript && !speechListening ? "2px solid red" : 0,
          }}
          onClick={openSpeechModal}>
          <View className="speechWaveBox speechWaveBox1" />
          <View className="speechWaveBox speechWaveBox2" />
          <View className="speechWaveBox speechWaveBox3" />
          <View className="speechWaveBox speechWaveBox4" />
          <View className="speechWaveBox speechWaveBox5" />
        </View>
      </View>
    );
  };

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
        <Text className={`text-gray-500`}>{apiLoading ? "..." : "🔍"}</Text>
      </View>
      {apiError && <Text className="text-red-500 px-3">{printError}</Text>}
      <ScrollView className="flex-1 px-3">{renderTracks()}</ScrollView>
      <Modal
        transparent
        visible={isMusicSettingsModalOpen}
        onRequestClose={closeMusicSettingsModal}
        animationType="slide">
        <View className="flex-1 bg-black bg-opacity-70 justify-center items-center">
          <View className="bg-gray-900 rounded-lg w-4/5 p-6">
            <Text className="text-white text-lg font-bold">Settings</Text>
            <View className="border-b border-gray-500 mt-2" />
            <View className="flex flex-row justify-between items-center py-3">
              <Text className="text-gray-400 font-semibold">
                Content Quality
              </Text>
              <View className="flex flex-row items-center">
                {["low", "normal", "high"].map(quality => (
                  <TouchableOpacity
                    key={quality}
                    onPress={() => setContentQuality(quality)}
                    className={`bg-gray-800 p-2 rounded mr-2 ${
                      contentQuality === quality ? "bg-green-500" : ""
                    }`}>
                    <Text className="text-white capitalize">{quality}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TouchableOpacity
              onPress={closeMusicSettingsModal}
              className="mt-4">
              <Text className="text-white text-center">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        transparent
        visible={isDownloadModalOpen}
        onRequestClose={closeDownloadModal}
        animationType="slide">
        <View className="flex-1 bg-black bg-opacity-70 justify-center items-center">
          <View className="bg-gray-900 rounded-lg w-4/5 p-6">
            <Text className="text-white text-lg font-bold mb-3">
              Do you want to download?
            </Text>
            <View className="flex flex-row my-4 items-center bg-gray-800 p-2 rounded">
              <Image
                source={{uri: modalDownloadData.fileImage}}
                className="w-14 h-14 rounded"
              />
              <Text className="text-white mx-2">
                {modalDownloadData.fileName}
              </Text>
            </View>
            <Text className="mb-3 text-white">
              Download in progress: {downloadProgress}%
            </Text>
            {Platform.OS === "ios" ? (
              <ProgressViewIOS progress={downloadProgress / 100} />
            ) : (
              <ActivityIndicator
                animating={downloadProgress < 100}
                size="large"
                color="white"
              />
            )}
            <View className="flex flex-row justify-around mt-5">
              <TouchableOpacity
                onPress={closeDownloadModal}
                className="bg-gray-700 px-4 py-2 rounded">
                <Text className="text-white text-center">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => downloadTrack(modalDownloadData)}
                className="bg-green-600 px-4 py-2 rounded">
                <Text className="text-white text-center">Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        transparent
        visible={isSpeechModalOpen}
        onRequestClose={closeSpeechModal}
        animationType="slide">
        <View className="flex-1 bg-black bg-opacity-70 justify-center items-center">
          <View className="bg-gray-900 rounded-lg w-4/5 p-6 text-center">
            {renderSpeechModalWaves()}
            <View className="text-center">
              {!speechTranscript && !speechListening ? (
                <Text className="text-white">
                  Didn't catch that. Speak again.
                </Text>
              ) : !speechTranscript ? (
                <Text className="text-white">
                  Say "{topTracks[0] && topTracks[0].name}"
                </Text>
              ) : (
                <Text className="text-white">{speechTranscript}</Text>
              )}
              {!speechTranscript && !speechListening && (
                <TouchableOpacity
                  onPress={openSpeechModal}
                  className="bg-gray-700 px-4 py-2 mt-3 rounded">
                  <Text className="text-white text-center">Try Again</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
      <TrackDeck />
    </View>
  );
};

export default Music;
