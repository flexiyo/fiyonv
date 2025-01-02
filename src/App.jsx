import "./App.css";
import React, { useContext, useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import {
  Home,
  Search,
  Create,
  Clips,
  Profile,
  Music,
  DirectInbox,
  DirectChat,
  Stories,
  Notifications,
  AuthLogin,
  AuthSignup,
  NotFound404,
} from "./pages";
import Navbar from "./layout/Navbar";
import TrackPlayer from "./components/music/TrackPlayer";
import LoadingScreen from "./components/app/LoadingScreen";
import UserContext from "./context/items/UserContext";
import AppContext from "./context/items/AppContext";

const { Navigator, Screen } = createNativeStackNavigator();

const App = () => {
  const { isAppLoading } = useContext(AppContext);
  const { loading, isUserAuthenticated } = useContext(UserContext);
  const navigationRef = useRef(null);

  useEffect(() => {
    if (isUserAuthenticated && navigationRef.current) {
      navigationRef.current.navigate("Home");
    }
  }, [isUserAuthenticated]);

  if (isAppLoading || loading) {
    return <LoadingScreen />;
  }

  const authenticatedRoutes = [
    { name: "Home", component: Home },
    { name: "Profile", component: Profile },
    { name: "Search", component: Search },
    { name: "Music", component: Music },
    { name: "Create", component: Create },
    { name: "Clips", component: Clips },
    { name: "DirectInbox", component: DirectInbox },
    { name: "DirectChat", component: DirectChat },
    { name: "Stories", component: Stories },
    { name: "Notifications", component: Notifications },
    { name: "NotFound404", component: NotFound404 },
  ];

  const unauthenticatedRoutes = [
    { name: "AuthLogin", component: AuthLogin },
    { name: "AuthSignup", component: AuthSignup },
    { name: "Music", component: Music },
  ];

  return (
    <GestureHandlerRootView>
      <TrackPlayer />
      <NavigationContainer ref={navigationRef}>
        {isUserAuthenticated ? (
          <>
            <Navbar />
            <Navigator initialRouteName="Home">
              {authenticatedRoutes.map((route) => (
                <Screen
                  key={route.name}
                  name={route.name}
                  component={route.component}
                  options={{ headerShown: false }}
                />
              ))}
            </Navigator>
          </>
        ) : (
          <Navigator initialRouteName="AuthLogin">
            {unauthenticatedRoutes.map((route) => (
              <Screen
                key={route.name}
                name={route.name}
                component={route.component}
                options={{ headerShown: false }}
              />
            ))}
          </Navigator>
        )}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;
