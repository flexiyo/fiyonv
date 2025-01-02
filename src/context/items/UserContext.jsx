import React, {createContext, useState, useEffect} from 'react';
import {MMKV} from 'react-native-mmkv';

const mmkvStorage = new MMKV();

const UserContext = createContext(null);

export const UserProvider = ({children}) => {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedUserInfo = mmkvStorage.getString('userInfo');

        if (savedUserInfo) {
          setUserInfo(JSON.parse(savedUserInfo));
          setIsUserAuthenticated(true);
        } else {
          setIsUserAuthenticated(false);
          setUserInfo(null);
        }
      } catch (error) {
        console.error('Failed to load user data from MMKV', error);
      }
      setLoading(false);
    };

    loadUserData();
  }, []);

  const saveUserData = userData => {
    try {
      mmkvStorage.set('userInfo', JSON.stringify(userData));
      setUserInfo(userData);
      setIsUserAuthenticated(true);
    } catch (error) {
      console.error('Failed to save user data to MMKV', error);
    }
  };

  const clearUserData = () => {
    try {
      mmkvStorage.delete('userInfo');
      setUserInfo(null);
      setIsUserAuthenticated(false);
    } catch (error) {
      console.error('Failed to clear user data from MMKV', error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        isUserAuthenticated,
        setIsUserAuthenticated,
        userInfo,
        setUserInfo,
        loading,
        setLoading,
        saveUserData,
        clearUserData,
      }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
