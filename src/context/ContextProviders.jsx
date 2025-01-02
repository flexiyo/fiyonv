import React from 'react';
import {AppProvider} from './items/AppContext';
import {UserProvider} from './items/UserContext';
import {SocketProvider} from './items/SocketContext';
import {MusicProvider} from './items/MusicContext';
import {CreateProvider} from './items/CreateContext';

const ContextProviders = ({children}) => {
  return (
    <AppProvider>
      <UserProvider>
        <SocketProvider>
          <MusicProvider>
            <CreateProvider>{children}</CreateProvider>
          </MusicProvider>
        </SocketProvider>
      </UserProvider>
    </AppProvider>
  );
};

export default ContextProviders;
