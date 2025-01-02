import {createContext, useEffect, useState} from 'react';
import {MMKV} from 'react-native-mmkv';

const AppContext = createContext(null);

const mmkvStorage = new MMKV();

export const AppProvider = ({children}) => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [contentQuality, setContentQuality] = useState(
    mmkvStorage.getString('contentQuality') || 'low',
  );

  useEffect(() => {
    const initializeApp = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsAppLoading(false);
    };

    initializeApp();
  }, []);

  useEffect(() => {
    mmkvStorage.set('contentQuality', contentQuality);
  }, [contentQuality]);

  return (
    <AppContext.Provider
      value={{
        isAppLoading,
        setIsAppLoading,
        contentQuality,
        setContentQuality,
      }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
