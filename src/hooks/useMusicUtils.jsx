import {useContext, useCallback} from "react";
import axios from "axios";
import SQLite from "react-native-sqlite-storage";

import {fiyosaavnApiBaseUri} from "../constants.js";
import AppContext from "../context/items/AppContext";
import MusicContext from "../context/items/MusicContext";

const db = SQLite.openDatabase(
  {name: "MusicCacheDB.db", location: "default"},
  () => console.log("Database opened successfully"),
  error => console.error("Error opening SQLite database:", error),
);

const useMusicUtils = () => {
  const {contentQuality} = useContext(AppContext);
  const {
    audio,
    currentTrack,
    setCurrentTrack,
    loopAudio,
    setIsAudioPlaying,
    previouslyPlayedTracks,
    setPreviouslyPlayedTracks,
  } = useContext(MusicContext);

  const getTrackData = async trackId => {
    try {
      const {data} = await axios.get(`${fiyosaavnApiBaseUri}/songs/${trackId}`);
      const resultData = data.data[0];

      const trackData = {
        id: resultData.id,
        name: resultData.name,
        album: resultData.album.name,
        artists: resultData.artists.primary
          .map(artist => artist.name)
          .join(", "),
        image:
          contentQuality === "low"
            ? resultData.image[0].url
            : contentQuality === "normal"
            ? resultData.image[1].url
            : contentQuality === "high"
            ? resultData.image[2].url
            : resultData.image[1].url,
        link:
          contentQuality === "low"
            ? resultData.downloadUrl[1].url
            : contentQuality === "normal"
            ? resultData.downloadUrl[3].url
            : contentQuality === "high"
            ? resultData.downloadUrl[4].url
            : resultData.downloadUrl[3].url,
        lyrics: null,
      };

      return trackData;
    } catch (error) {
      console.error("Error fetching track data:", error);
      return null;
    }
  };

  const cacheTrackData = trackData => {
    try {
      db.transaction(tx => {
        tx.executeSql(
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
          () => console.log("Track cached successfully"),
          (_, error) => console.error("Error caching track data:", error),
        );
      });
    } catch (error) {
      console.error("Error caching track data:", error);
    }
  };

  const getTrack = async trackId => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          "SELECT * FROM tracks WHERE id = ?",
          [trackId],
          async (_, results) => {
            if (results.rows.length > 0) {
              const cachedTrack = results.rows.item(0);
              setCurrentTrack(cachedTrack);
            } else {
              const trackData = await getTrackData(trackId);
              if (trackData) {
                setCurrentTrack(trackData);
                cacheTrackData(trackData);
              }
            }
            setPreviouslyPlayedTracks(prevTracks => [...prevTracks, trackId]);
          },
          (_, error) => console.error("Error querying track data:", error),
        );
      });
    } catch (error) {
      console.error("Error getting track:", error);
    }
  };

  const getTrackLyrics = async trackData => {
    try {
      let data;
      try {
        const lyristResponse = await axios.get(
          `https://lyrist.vercel.app/api/${trackData.name}/${trackData.artists
            ?.split(",")[0]
            .trim()}`,
        );

        if (lyristResponse && lyristResponse.data.lyrics) {
          data = lyristResponse.data;
        } else {
          const saavnResponse = await axios.get(
            `${fiyosaavnApiBaseUri}/songs/${trackData.id}/lyrics`,
          );
          data = saavnResponse.data.data;
        }
      } catch (error) {
        const saavnResponse = await axios.get(
          `${fiyosaavnApiBaseUri}/songs/${trackData.id}/lyrics`,
        );
        data = saavnResponse.data.data;
      }

      setCurrentTrack(prevTrack => ({
        ...prevTrack,
        lyrics: data.lyrics || null,
      }));

      return data.lyrics || null;
    } catch (error) {
      setCurrentTrack(prevTrack => ({
        ...prevTrack,
        lyrics: null,
      }));
      throw new Error(`Error in getTrackLyrics: ${error}`);
    }
  };

  const getSuggestedTrackId = async () => {
    try {
      const {data} = await axios.get(
        `${fiyosaavnApiBaseUri}/songs/${currentTrack.id}/suggestions`,
        {params: {limit: 10}},
      );

      let suggestedTrackId;
      do {
        suggestedTrackId = data.data[Math.floor(Math.random() * 10)].id;
      } while (previouslyPlayedTracks.includes(suggestedTrackId));

      return suggestedTrackId;
    } catch (error) {
      console.error("Error fetching suggested track ID:", error);
      throw error;
    }
  };

  const getTracksFromDB = async () => {
    try {
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

  const handleAudioPlay = useCallback(() => {
    if (audio) {
      audio.play();
      setIsAudioPlaying(true);
    }
  }, [audio]);

  const handleAudioPause = useCallback(() => {
    if (audio) {
      audio.pause();
      setIsAudioPlaying(false);
    }
  }, [audio]);

  const handleNextAudioTrack = useCallback(
    async callType => {
      try {
        if (loopAudio && callType === "auto") {
          await getTrack(currentTrack.id);
        } else {
          const trackIdToFetch = await getSuggestedTrackId();
          await getTrack(trackIdToFetch);
        }
      } catch (error) {
        console.error("Error handling next track:", error);
      }
    },
    [getTrack, loopAudio, currentTrack.id],
  );

  return {
    getTrack,
    getTrackLyrics,
    getTrackData,
    getTracksFromDB,
    cacheTrackData,
    handleAudioPlay,
    handleAudioPause,
    handleNextAudioTrack,
    getSuggestedTrackId,
  };
};

export default useMusicUtils;
