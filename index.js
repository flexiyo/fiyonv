/**
 * @format
 */

import { AppRegistry, PermissionsAndroid } from 'react-native';
import ContextProviders from './src/context/ContextProviders.jsx';
import App from './src/App';
import { name as appName } from './app.json';
import audio from 'kaushal-react-native-track-player';
import PermissionService from './src/services/PermissionService.js';

const RootComponent = () => (
  <ContextProviders>
    <App />
  </ContextProviders>
);

AppRegistry.registerComponent(appName, () => {
    const permissions = PermissionService.getPermissions();
    permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO)
    PermissionService.requestPermissions();
    return RootComponent
});

audio.registerPlaybackService(() =>
  require('./src/services/AudioService.js'),
);