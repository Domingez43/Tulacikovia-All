import React, { useState, useEffect } from 'react';
import { AppRegistry, Dimensions, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, Route, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'mobx-react';
import RootStore from './src/store/RootStore';
import * as Font from 'expo-font';
import { authDetails } from './src/store/AuthStore';
import AuthController from './src/controllers/AuthController';
import {Appearance} from 'react-native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { LogBox } from 'react-native';
import {Root as PopupRootProvider} from 'react-native-popup-confirm-toast';
import { observe } from 'mobx';
import { userStore } from './src/store/UserStore';
import { StatusBar } from 'expo-status-bar';
import AppealController from './src/controllers/AppealController';
import { FullScreenRoutes } from './src/configs/RoutesConfig';
import HomeController from './src/controllers/HomeController';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import MapsController from './src/controllers/MapsController';
import ProfileController from './src/controllers/ProfileController';
import { AdoptionScreen } from './src/screens/AdoptionScreen';
import AdoptionController from './src/controllers/AdoptionController';
import ManageAdoptionsController from './src/controllers/ManageAdoptionsController';

LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();//Ignore all log notifications

Appearance.setColorScheme('light');

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [fontloaded, setFontLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!authDetails.isLoggedIn())

  const fetchFonts = () => {
    return Font.loadAsync({
      'GreycliffCF-Heavy': require('./assets/fonts/GreycliffCF-Heavy.otf'),
      'GreycliffCF-Regular': require('./assets/fonts/GreycliffCF-Regular.otf'),
      'GreycliffCF-ExtraBold': require('./assets/fonts/GreycliffCF-ExtraBold.otf'),
      'GreycliffCF-Bold': require('./assets/fonts/GreycliffCF-Bold.otf'),
      'GreycliffCF-Medium': require('./assets/fonts/GreycliffCF-Medium.otf')
    });
  };

  useEffect(() => {
    fetchFonts().then(async () => { setFontLoaded(true); });
    (async () => {
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      console.log('Location: ' + JSON.stringify(location.coords));

      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.coords.latitude}&lon=${location.coords.longitude}`)
            .then(response => response.json())
            .then(data => {
                console.log({data});
                // Extract city and country information from the response
                const city = data.address.city || data.address.town || data.address.village || data.address.hamlet;
                userStore.setLocation({latitude: location.coords.latitude, longitude: location.coords.longitude, city: city});
            }) .catch(error => {
              console.error('Error:', error);
            });
    })();
  },[])

  if(!fontloaded) return (
    <View style={{width: '100%', height: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
      <Text>Loading...</Text>
    </View>
  )

  const _ = observe(userStore, change => {
    console.log("Changed")
    setIsLoggedIn(!authDetails.isLoggedIn());
  })

  return (
    <Provider {...RootStore}>
      <ActionSheetProvider>
        <PopupRootProvider>
          <NavigationContainer>
          {(isLoggedIn) 
              ? (<AuthController />)
              : (
                  <Stack.Navigator>
                    <Stack.Screen name="Root" component={AppRoot} options={{headerShown: false}} />
                  </Stack.Navigator>)
          }
          </NavigationContainer>
          <StatusBar style="auto" />
        </PopupRootProvider>
      </ActionSheetProvider>
    </Provider>
  );
}

const IconComponent = ({icon, selected, size}: any) => {
  return (
    <View style={{flexDirection: 'column', alignItems: 'center', gap: 5, marginBottom: 5 + ((selected) ? 0 : 7)}}>
      <Image style={{width: size * Dimensions.get('window').fontScale * 1.65, aspectRatio: 1}} source={icon} contentFit="cover" transition={200} tintColor={(selected) ? '#80B3FF' : '#C2C2C2'} />
      <View style={{height: 7, aspectRatio: 1, borderRadius: 15, backgroundColor: (selected) ? '#80B3FF' : '#EAEAEA', display: (selected) ? 'flex' : 'none'}}></View>
    </View>
  )
}

function AppRoot() {

  const getTabBarStyle = (route: Partial<Route<string>>) => {
    const routeName = getFocusedRouteNameFromRoute(route);
    if (routeName === undefined) return 'flex';

    return FullScreenRoutes.includes(routeName) ? 'none' : 'flex';
  }

  const userMapsTabOption = ({insets}: any) => {
    return (
      <Tab.Screen
        name="MapScreen"
        component={MapsController}
        options={({route}) => ({
          tabBarStyle: {
            borderTopWidth: 0,
            // paddingBottom: insets?.bottom,
            display: getTabBarStyle(route),
            height: '11.5%',
            paddingTop: 20
          },
          headerShown: false,
          tabBarShowLabel: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconSelected = require('./assets/maps.png'); 
            let iconOutlined = require('./assets/maps_outline.png'); 
            return ( <IconComponent size={size} icon={(focused) ? iconSelected : iconOutlined} selected={focused} />)
          },
        })}
      />
    )
  }

  const homeScreenTabOption = ({insets}: any) => {
    return (
      <Tab.Screen
        name="HomeScreen"
        component={(userStore.userProfile?.type == "USER") ? HomeController : AppealController}
        options={({route}) => ({
          tabBarStyle: {
            borderTopWidth: 0,
            // paddingBottom: insets?.bottom,
            display: getTabBarStyle(route),
            height: '11.5%',
            paddingTop: 20
          },
          headerShown: false,
          tabBarShowLabel: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconSelected = require('./assets/home.png'); 
            let iconOutlined = require('./assets/home_outlined.png'); 
            return ( <IconComponent size={size} icon={(focused) ? iconSelected : iconOutlined} selected={focused} />)
          },
        })}
      />
    )
  }

  const eventScreenTabOption = ({insets}: any) => {
    return (
      <Tab.Screen
        name="EventScreen"
        component={(userStore.userProfile?.type == "USER") ? ProfileController : AppealController}
        options={({route}) => ({
          tabBarStyle: {
            borderTopWidth: 0,
            // paddingBottom: insets?.bottom,
            display: getTabBarStyle(route),
            height: '11.5%',
            paddingTop: 20
          },
          headerShown: false,
          tabBarShowLabel: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconSelected = require('./assets/calendar_listing.png'); 
            let iconOutlined = require('./assets/calendar_listing_outlined.png'); 
            return ( <IconComponent size={size} icon={(focused) ? iconSelected : iconOutlined} selected={focused} />)
          },
        })}
      />
    )
  }

  const profileScreenTabOption = ({insets}: any) => {
    return (
      <Tab.Screen
        name="ProfileScreen"
        component={ProfileController}
        options={({route}) => ({
          tabBarStyle: {
            borderTopWidth: 0,
            display: getTabBarStyle(route),
            height: '11.5%',
            paddingTop: 20
          },
          headerShown: false,
          tabBarShowLabel: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconSelected = require('./assets/user.png'); 
            let iconOutlined = require('./assets/user_outline.png'); 
            return ( <IconComponent size={size} icon={(focused) ? iconSelected : iconOutlined} selected={focused} />)
          },
        })}
      />
    )
  }

  const adoptionScreenTabOption = ({insets}: any) => {
    return (
      <Tab.Screen
        name="AdoptionScreen"
        component={(userStore.userProfile?.type == "USER") ? AdoptionController : ManageAdoptionsController}
        options={({route}) => ({
          tabBarStyle: {
            borderTopWidth: 0,
            display: getTabBarStyle(route),
            height: '11.5%',
            paddingTop: 20
          },
          headerShown: false,
          tabBarShowLabel: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconSelected = require('./assets/heart.png'); 
            let iconOutlined = require('./assets/heart_outline.png'); 
            return ( <IconComponent size={size} icon={(focused) ? iconSelected : iconOutlined} selected={focused} />)
          },
        })}
      />
    )
  }

  return (
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
          <Tab.Navigator
            screenOptions={({route}) => ({
              headerShown: false,
              headerTransparent: false,
              tabBarStyle: {
                borderTopWidth: 0,
                height: insets?.bottom,
              },
              tabBarActiveTintColor: '#80B3FF',
              tabBarInactiveTintColor: 'gray',
            })}
            initialRouteName="HomeScreen">
            {homeScreenTabOption(insets)}
            {adoptionScreenTabOption(insets)}
            {(userStore.userProfile?.type == "USER") ? userMapsTabOption(insets) : <></>}
            {profileScreenTabOption(insets)}
          </Tab.Navigator>

        )}
    </SafeAreaInsetsContext.Consumer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

AppRegistry.registerComponent('main', () => App);