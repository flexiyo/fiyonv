import {PermissionsAndroid, Platform} from "react-native";

const permissionsToRequest = [
  PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
  PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  PermissionsAndroid.PERMISSIONS.CAMERA,
  PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
  PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
  PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
];

const requestPermissions = async () => {
  if (Platform.OS === "android") {
    try {
      const granted = await PermissionsAndroid.requestMultiple(
        permissionsToRequest,
        {
          title: "Permission Request",
          message: "This app needs these permissions to function correctly.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        },
      );

      permissionsToRequest.forEach(permission => {
        if (granted[permission] === PermissionsAndroid.RESULTS.GRANTED) {
          console.log(`${permission} permission granted`);
        } else {
          console.log(`${permission} permission denied`);
        }
      });
    } catch (err) {
      console.warn(err);
    }
  }
};

const getPermissions = () => permissionsToRequest;

export default {
  requestPermissions,
  getPermissions,
};
