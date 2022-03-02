import React from 'react';
import { Image, LogBox } from 'react-native';
import AppLoading from 'expo-app-loading';
import * as Font from 'expo-font';
import { Asset } from 'expo-asset';
import { Block, GalioProvider } from 'galio-framework';
import { NavigationContainer } from '@react-navigation/native';
import NativeDeviceInfo from "react-native/Libraries/Utilities/NativeDeviceInfo";
import * as Device from 'expo-device';
import * as Network from 'expo-network';
import Constants from 'expo-constants';
import './constants/global';

LogBox.ignoreLogs(['Setting a timer']);
// Before rendering any navigation stack
import { enableScreens } from 'react-native-screens';
enableScreens();

import {RealAppStack, OnboardingStack, QSWebViewStack} from './navigation/Screens';
import { Images, argonTheme } from './constants';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import AppUpdate from "./screens/AppUpdate";

// cache app images
const assetImages = [
  Images.Onboarding,
  Images.LogoOnboarding,
  Images.Logo,
  Images.Pro,
  Images.ArgonLogo,
  Images.iOSLogo,
  Images.androidLogo,
  Images.QSLogoBlue,
  Images.QSLogoWhite,
  Images.OnboardingCode,
  Images.OnboardingAddressBar,
  Images.OnboardingCheck,
];

// cache product images

function cacheImages(images) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

const setStorage = async(name,value) => {
  try {
    await AsyncStorage.setItem(name, value)
  } catch (e) {
    // saving error
  }
}

const getStorage = async(name) => {
  try {
    const value = await AsyncStorage.getItem(name)
    if(value !== null) {
      return value;
    }
  } catch (e) {
    return {error:e}
  }
}

export default class App extends React.Component {
  state = {
    isLoadingComplete: false,
    fontLoaded: false,
    deviceData: false,
    networkData: false,
    constantsData: false,
    api_key: false,
    api_key_user: false,
    session: false,
    instance: false,
    app_intro: false,
  }

  async componentDidMount() {
    await Font.loadAsync({
      'argon': require('./assets/font/argon.ttf'),
      'open-sans-regular': require('./assets/font/argon.ttf'),
      'open-sans-light': require('./assets/font/argon.ttf'),
      'open-sans-bold': require('./assets/font/argon.ttf'),
    });

    this.setState({ fontLoaded: true });
  }
  
  render() {
    let params = {
      deviceData: this.state.deviceData,
      networkData: this.state.networkData,
      constantsData: this.state.constantsData,
    }

    if(!this.state.isLoadingComplete) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      return (
        <NavigationContainer>
          <GalioProvider theme={argonTheme}>
            <AppUpdate />
            <Block flex style={{backgroundColor:'#282d38'}}>
              {this.state.app_intro ? (
                  <QSWebViewStack  params={params}/>
              ):(
                  <OnboardingStack  params={params}/>
              )}
            </Block>
          </GalioProvider>
        </NavigationContainer>
      );
    }
  }

  _loadResourcesAsync = async () => {
    //setStorage('@app_intro','false')

    let camera_status = await Camera.requestCameraPermissionsAsync();
    let loacation_status = await Location.requestForegroundPermissionsAsync();

    await setStorage('@camera_status',JSON.stringify(camera_status))
    await setStorage('@loacation_status',JSON.stringify(loacation_status))

    /*
    const locinterval =setInterval(async function (){
      let location = await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Lowest});
      const { latitude , longitude } = location.coords
      console.log(latitude , longitude)
    },300000)*/
    //clearInterval(locinterval)

    const deviceData = {};
    const networkData = {};
    const constantsData = {};
    const app_intro = await getStorage('@app_intro');
    const api_key = await getStorage('@api_key');
    const instance = await getStorage('@instance');
    const api_key_user = await getStorage('@api_key_user');
    const session = await getStorage('@session');
    const device_uid = await getStorage('@device_uid');

    this.state.app_intro = app_intro === 'true' ;
    this.state.api_key = api_key ? api_key:false;
    this.state.instance = instance ? instance:false;
    this.state.session = session ? session:false;
    this.state.api_key_user = api_key_user ? api_key_user:false;

    constantsData.app_version = Constants.manifest.version;
    constantsData.platform = Constants.platform;
    constantsData.statusBarHeight = Constants.statusBarHeight;
    constantsData.api_key = api_key;
    constantsData.instance = instance;
    constantsData.session = session;
    constantsData.api_key_user = api_key_user;
    constantsData.device_uid = device_uid;

    deviceData.deviceName = Device.deviceName;
    deviceData.deviceId = Constants.deviceId;
    deviceData.brand = Device.brand;
    deviceData.manufacturer = Device.manufacturer;
    deviceData.modelId = Device.modelId;
    deviceData.modelName = Device.modelName;
    deviceData.osBuildId = Device.osBuildId;
    deviceData.osInternalBuildId = Device.osInternalBuildId;
    deviceData.osName = Device.osName;
    deviceData.osVersion = Device.osVersion;
    deviceData.productName = Device.productName;
    deviceData.totalMemory = Device.totalMemory;
    deviceData.deviceYearClass = Device.deviceYearClass;
    deviceData.getDeviceTypeAsync = await Device.getDeviceTypeAsync();
    deviceData.getMaxMemoryAsync = Device.osName === 'iOS' ? false:await Device.getMaxMemoryAsync();
    deviceData.getUptimeAsync = await Device.getUptimeAsync();
    deviceData.isRootedExperimentalAsync = await Device.isRootedExperimentalAsync();
    deviceData.isDevice = Device.isDevice;

    networkData.getNetworkStateAsync = await Network.getNetworkStateAsync()
    networkData.getIpAddressAsync = await Network.getIpAddressAsync()
    networkData.isAirplaneModeEnabledAsync = Device.osName === 'iOS' ? false:await Network.isAirplaneModeEnabledAsync()

    this.setState({
      deviceData:deviceData,
      networkData:networkData,
      constantsData:constantsData,
    })

    return Promise.all([
      ...cacheImages(assetImages),
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    if(this.state.fontLoaded) {
      this.setState({ isLoadingComplete: true });
    }
  };

}
