import React, {useEffect} from "react";
import {View, Text, Image, ActivityIndicator, Dimensions} from "react-native";
import {TouchableOpacity} from "react-native-gesture-handler";
import {Dialog} from "react-native-simple-dialogs";

const CustomMusicModals = ({
  isMusicSettingsModalOpen,
  closeMusicSettingsModal,
  contentQuality,
  setContentQuality,
  isDownloadModalOpen,
  closeDownloadModal,
  modalDownloadData,
  downloadProgress,
  downloadTrack,
  isDownloadLoading,
  isSpeechModalOpen,
  closeSpeechModal,
  speechTranscript,
  speechListening,
  topTracks,
  openSpeechModal,
  renderSpeechModalWaves,
}) => {
  useEffect(() => {
    console.log("isMusicSettingsModalOpen:", isMusicSettingsModalOpen);
    console.log("isDownloadModalOpen:", isDownloadModalOpen);
    console.log("isSpeechModalOpen:", isSpeechModalOpen);
  }, [isMusicSettingsModalOpen, isDownloadModalOpen, isSpeechModalOpen]);

  return (
    <>
      {/* Settings Dialog */}
      <Dialog
        key={isMusicSettingsModalOpen}
        visible={isMusicSettingsModalOpen}
        onTouchOutside={closeMusicSettingsModal}
        onRequestClose={closeMusicSettingsModal}
        title="Music Settings"
        dialogStyle={{backgroundColor: "#15202b", borderRadius: 15}}>
        <View style={{paddingVertical: 10}}>
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
        </View>

        <TouchableOpacity
          onPress={closeMusicSettingsModal}
          style={{padding: 10}}>
          <Text style={{color: "#fff", textAlign: "center"}}>Close</Text>
        </TouchableOpacity>
      </Dialog>

      {/* Download Dialog */}
      <Dialog
        key={isDownloadModalOpen}
        visible={isDownloadModalOpen}
        onTouchOutside={closeDownloadModal}
        onRequestClose={closeDownloadModal}
        title="Download Track"
        dialogStyle={{backgroundColor: "#15202b", borderRadius: 15}}>
        <View style={{paddingVertical: 10}}>
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
        </View>

        <View
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
        </View>
      </Dialog>

      {/* Speech Dialog */}
      <Dialog
        key={isSpeechModalOpen}
        visible={isSpeechModalOpen}
        onTouchOutside={() => closeSpeechModal(false)}
        onRequestClose={() => closeSpeechModal(false)}
        dialogStyle={{
          backgroundColor: "#15202b",
          borderRadius: 15,
          width: Dimensions.get("window").width - 50,
        }}
        contentContainerStyle={{
          alignItems: "center",
          justifyContent: "center",
        }}
        onClose={() => closeSpeechModal(false)}>
        <View
          style={{
            paddingVertical: 10,
            alignItems: "center",
          }}>
          {renderSpeechModalWaves()}
          <Text className="text-white text-lg mt-4 text-center">
            {speechTranscript ||
              (!speechListening
                ? `Say "${topTracks[0]?.name || "your favorite track"}"`
                : "Listening...")}
          </Text>
        </View>

        <TouchableOpacity
          onPress={openSpeechModal}
          style={{
            backgroundColor: "#444",
            padding: 10,
            borderRadius: 5,
            marginTop: 10,
            alignSelf: "center",
          }}>
          <Text style={{color: "#fff"}}>Try Again</Text>
        </TouchableOpacity>
      </Dialog>
    </>
  );
};

export default CustomMusicModals;
