import {createContext, useEffect, useState} from "react";
import SQLite from "react-native-sqlite-storage";
import audio, {
  AppKilledPlaybackBehavior,
  Capability,
} from "kaushal-react-native-track-player";

const MusicContext = createContext(null);

export const MusicProvider = ({children}) => {
  const [currentTrack, setCurrentTrack] = useState({});
  const [topTracks, setTopTracks] = useState({});
  const [loopAudio, setLoopAudio] = useState(false);
  const [previouslyPlayedTracks, setPreviouslyPlayedTracks] = useState([]);
  const [isTrackDeckSheetOpen, setIsTrackDeckSheetOpen] = useState(false);

  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState({
    position: 0,
    duration: 0,
  });
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);

  const audioCapabilities = [
    Capability.Play,
    Capability.Pause,
    Capability.SeekTo,
    Capability.SkipToNext,
  ];

  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await audio.setupPlayer();
        audio.setVolume(1);
        audio.updateOptions({
          stopWithApp: true,
          android: {
            appKilledPlaybackBehavior:
              AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
            alwaysPauseOnInterruption: true,
          },
          capabilities: audioCapabilities,
          notificationCapabilities: audioCapabilities,
          compactCapabilities: audioCapabilities,
        });
        setIsAudioInitialized(true);
      } catch (error) {
        console.error("Error initializing audio player:", error);
      }
    };

    initializeAudio();
  }, []);

  useEffect(() => {
    const initDb = () => {
      const db = SQLite.openDatabase(
        "MusicCacheDB.db",
        () => {
          console.log("Database opened successfully");
        },
        error => {
          console.error("Error opening database:", error);
        },
      );

      db.transaction(tx => {
        tx.executeSql(
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
          () => console.log("Tracks table created successfully"),
          error => console.error("Error creating tracks table:", error),
        );
      });
    };

    initDb();
  }, []);

  useEffect(() => {
    const playAudio = async () => {
      if (!isAudioInitialized || !currentTrack.id || !currentTrack.link) return;
      setIsAudioLoading(true);
      setIsAudioPlaying(false);

      try {
        await audio.reset();
        await audio.add({
          id: currentTrack.id,
          url: currentTrack.link,
          title: currentTrack.name,
          artist: currentTrack.artists,
          artwork: currentTrack.image,
        });
        await audio.play();
        setIsAudioPlaying(true);
      } catch (error) {
        console.error("Error playing audio:", error);
      } finally {
        setIsAudioLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      playAudio();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [currentTrack.id, currentTrack.link, isAudioInitialized]);

  useEffect(() => {
    if (!isAudioPlaying) return;

    const interval = setInterval(async () => {
      try {
        const progress = await audio.getProgress();
        setAudioProgress(progress);
      } catch (error) {
        console.error("Error getting audio progress:", error);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isAudioPlaying]);

  const audioProgressPercentage = audioProgress.duration
    ? (audioProgress.position / audioProgress.duration) * 100
    : 0;

  return (
    <MusicContext.Provider
      value={{
        audio: isAudioInitialized ? audio : null,
        currentTrack,
        setCurrentTrack,
        topTracks,
        setTopTracks,
        loopAudio,
        setLoopAudio,
        isAudioLoading,
        setIsAudioLoading,
        isAudioPlaying,
        setIsAudioPlaying,
        previouslyPlayedTracks,
        setPreviouslyPlayedTracks,
        audioProgress,
        setAudioProgress,
        audioProgressPercentage,
        isTrackDeckSheetOpen,
        setIsTrackDeckSheetOpen,
      }}>
      {children}
    </MusicContext.Provider>
  );
};

export default MusicContext;
