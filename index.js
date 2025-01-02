/**
 * @format
 */

import {AppRegistry} from 'react-native';
import ContextProviders from './src/context/ContextProviders.jsx';
import App from './src/App';
import {name as appName} from './app.json';
import audio from 'kaushal-react-native-track-player';

const RootComponent = () => (
  <ContextProviders>
    <App />
  </ContextProviders>
);

AppRegistry.registerComponent(appName, () => RootComponent);

audio.registerPlaybackService(() =>
  require('./src/services/audioPlaybackService.js'),
);
