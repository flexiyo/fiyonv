import React, {useState, useEffect, useContext, useRef} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  PanResponder,
} from "react-native";
import {openDatabase} from "react-native-sqlite-storage";
import MaIcon from "react-native-vector-icons/MaterialIcons";
import FaIcon6 from "react-native-vector-icons/FontAwesome6";
import BottomSheet, {BottomSheetScrollView} from "@gorhom/bottom-sheet";
import {Svg, Path} from "react-native-svg";

import MusicContext from "../../context/items/MusicContext";
import useMusicUtils from "../../hooks/useMusicUtils";

const TrackDeck = () => {
  const {
    currentTrack,
    setCurrentTrack,
    loopAudio,
    setLoopAudio,
    isAudioPlaying,
    setAudioProgress,
    audioProgressPercentage,
    isTrackDeckSheetOpen,
    setIsTrackDeckSheetOpen,
  } = useContext(MusicContext);

  const {
    getTrackLyrics,
    handleAudioPlay,
    handleAudioPause,
    handleNextAudioTrack,
  } = useMusicUtils();

  const [isDragging, setIsDragging] = useState(false);
  const [lyrics, setLyrics] = useState("");

  const bottomSheetRef = useRef(null);
  const lyricsWrapperRef = useRef(null);
  const progressBarRef = useRef(null);

  const openMusicCacheDb = async () => {
    return new Promise((resolve, reject) => {
      openDatabase(
        {name: "MusicCacheDB.db", location: "default"},
        db => {
          db.executeSql(
            `CREATE TABLE IF NOT EXISTS tracks (
              id TEXT PRIMARY KEY,
              name TEXT,
              album TEXT,
              artists TEXT,
              image TEXT,
              link TEXT,
              lyrics TEXT
            )`,
            [],
            () => resolve(db),
            error => reject(error),
          );
        },
        error => reject(error),
      );
    });
  };

  const cacheTrackData = async trackData => {
    try {
      const db = await openMusicCacheDb();
      await new Promise((resolve, reject) => {
        db.transaction(
          txn => {
            txn.executeSql(
              `INSERT OR REPLACE INTO tracks (id, name, album, artists, image, link, lyrics) VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                trackData.id,
                trackData.name,
                trackData.album,
                trackData.artists,
                trackData.image,
                trackData.link,
                trackData.lyrics,
              ],
              () => resolve(),
              error => reject(error),
            );
          },
          error => reject(error),
        );
      });
    } catch (error) {
      console.error("Error in cacheTrackData:", error);
    }
  };

  useEffect(() => {
    const fetchLyricsAndCache = async () => {
      if (currentTrack && currentTrack.id) {
        const db = await openMusicCacheDb();
        const cachedTrackData = await new Promise((resolve, reject) => {
          db.transaction(txn => {
            txn.executeSql(
              `SELECT * FROM tracks WHERE id = ?`,
              [currentTrack.id],
              (_, result) => {
                if (result.rows && result.rows.length > 0) {
                  resolve(result.rows.item(0));
                } else {
                  resolve(null);
                }
              },
              error => reject(error),
            );
          });
        });

        if (cachedTrackData && cachedTrackData.lyrics) {
          setLyrics(cachedTrackData.lyrics);
          setCurrentTrack(prevTrack => ({
            ...prevTrack,
            lyrics: cachedTrackData.lyrics,
          }));
          return;
        }
        try {
          const lyricsResponse = await getTrackLyrics(currentTrack);
          setLyrics(
            lyricsResponse
              ? lyricsResponse
              : "Couldn't load lyrics for this song.",
          );
          setCurrentTrack(prevTrack => ({
            ...prevTrack,
            lyrics: lyricsResponse,
          }));
          await cacheTrackData({...currentTrack, lyrics: lyricsResponse});
        } catch (error) {
          console.error("Error fetching and setting lyrics:", error);
          setLyrics("Couldn't load lyrics for this song.");
          setCurrentTrack(prevTrack => ({
            ...prevTrack,
            lyrics: null,
          }));
        }
      } else {
        setLyrics("Couldn't load lyrics for this song.");
      }
    };
    fetchLyricsAndCache();
  }, [currentTrack.id]);

  useEffect(() => {
    if (isTrackDeckSheetOpen) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isTrackDeckSheetOpen]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      enablePanDownToClose
      snapPoints={["100%"]}
      index={-1}
      onClose={() => setIsTrackDeckSheetOpen(false)}
      handleStyle={{backgroundColor: "#11131d"}}
      backgroundStyle={{backgroundColor: "#11131d"}}
      handleIndicatorStyle={{backgroundColor: "transparent"}}>
      <BottomSheetScrollView className="px-6 bg-primary-bg h-full w-full">
        <View className="flex flex-row justify-between items-center h-20 w-full px-2 my-4">
          <TouchableOpacity onPress={() => bottomSheetRef.current?.close()}>
            <MaIcon name="close" size={35} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => shareTrack()}>
            <MaIcon name="share" size={35} color="white" />
          </TouchableOpacity>
        </View>
        <View className="flex justify-center items-center aspect-square w-full my-2 bg-secondary-bg rounded-lg">
          <Image
            source={{
              uri: currentTrack?.image?.replace(/(50x50|150x150)/, "500x500"),
            }}
            className="object-cover rounded-lg w-full h-full"
            alt="player-image"
          />
        </View>
        <View className="m-4">
          <Text className="text-white font-bold text-2xl mb-1">
            {currentTrack?.name}
          </Text>
          <Text className="text-gray-400 font-semibold text-md">
            {currentTrack?.artists}
          </Text>
        </View>
        <View className="m-6 h-1 bg-gray-500 rounded-full relative">
          <View
            className="h-full rounded-md bg-white"
            style={{width: `${audioProgressPercentage}%`}}
          />
        </View>
        <View className="flex-row justify-around items-center m-6">
          <TouchableOpacity onPress={() => setLoopAudio(!loopAudio)}>
            <FaIcon6
              name="repeat"
              size={25}
              color={loopAudio ? "#1ED760" : "#ffffff"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={isAudioPlaying ? handleAudioPause : handleAudioPlay}
            className="rounded-full bg-white p-6">
            <Svg
              role="img"
              aria-hidden="true"
              viewBox="0 0 24 24"
              width={25}
              height={25}>
              {isAudioPlaying ? (
                <Path
                  d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"
                  fill="#000000"
                />
              ) : (
                <Path
                  d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"
                  fill="#000000"
                />
              )}
            </Svg>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNextAudioTrack}>
            <Svg
              role="img"
              aria-hidden="true"
              viewBox="0 0 16 16"
              fill="#ffffff"
              width={25}
              height={25}>
              <Path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z" />
            </Svg>
          </TouchableOpacity>
        </View>
        <View className="flex flex-col w-full h-[35rem] p-4 my-6 rounded-2xl bg-secondary-bg ">
          <Text className="font-bold text-white text-3xl mx-2 mb-4">
            Lyrics
          </Text>
          <BottomSheetScrollView ref={lyricsWrapperRef} className="h-full">
            <Text className="text-white text-xl  whitespace-pre-wrap">
              {lyrics?.replace(/<br>/g, "\n")}
            </Text>
          </BottomSheetScrollView>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

export default TrackDeck;
