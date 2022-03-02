import React from "react";
import {
  StyleSheet,
  ImageBackground,
  Dimensions,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard, Image, ActivityIndicator, NativeModules, ScrollView, View, Platform
} from "react-native";
import {Block, Checkbox, Text, theme} from "galio-framework";

import { Button, Icon, Input } from "../components";
import { Images, argonTheme } from "../constants";
import WebView from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AwesomeAlert from "react-native-awesome-alerts";

const { width, height } = Dimensions.get("screen");

const DismissKeyboard = ({ children }) => (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      {children}
    </TouchableWithoutFeedback>
);

class QSWebView extends React.Component {
  state = {
    loader:false,
    url:false,
    WebViewRef:false,
    showAlert:false,
    props:false
  }

  constructor(props) {
    super(props);
    this.state.props = props;
  }


  showAlert = () => {
    this.setState({
      showAlert: true
    });
  };

  hideAlert = () => {
    this.setState({
      showAlert: false
    });
  };


  setStorage = async(name,value) => {
    try {
      await AsyncStorage.setItem(name, value)
    } catch (e) {
      // saving error
    }
  }

  getStorage = async(name) => {
    try {
      const value = await AsyncStorage.getItem(name)
      if(value !== null) {
        return value;
      }
    } catch (e) {
      return {error:e}
    }
  }

  logout = async () => {
    const dataSet = {api: await this.getStorage('@api_key_user')};
    return(
        fetch('https://unsergenuss.quicksteps.ch/qsapi/apps/logoutUser',{
          method:'POST',
          headers: {
            'Accept':       'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataSet)
        })
            .then((response) => response.json())
            .then((responseData) => {
              this.state.WebViewRef.stopLoading();
              return responseData;
            })
    )
  }

  render() {
    const route = this.props.route;
    const navigation = this.props.navigation;
    const props = this.props;
    const url = 'https://'+route.params.props.constantsData.instance+'.quicksteps.ch/time';
    this.state.url = url;
    return (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            paddingTop: Platform.OS === 'ios' ? theme.SIZES.BASE*3.0:0,
          }}>
            <StatusBar hidden={ Platform.OS === 'ios' ? false:true}  translucent={true}/>
            <WebView
                ref={WEBVIEW_REF => (this.state.WebViewRef = WEBVIEW_REF)}
                source={{ uri: url }}
                onNavigationStateChange={this.handleWebViewNavigationStateChange}
                onShouldStartLoadWithRequest={request=>{return this.handleShouldStartLoadWithRequest(request,props)}}
                scalesPageToFit={Platform.OS === 'ios'}
                javaScriptCanOpenWindowsAutomatically={true}
                pullToRefreshEnabled={true}
                setSupportMultipleWindows={true}
                javaScriptEnabled={true}
                allowingReadAccessToURL={true}
                allowFileAccess={true}
                allowFileAccessFromFileURLs={true}
                onAccessibilityEscape={true}
                allowsBackForwardNavigationGestures={true}
                injectedJavaScript={Platform.OS==='ios' ? '':`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=device-width, initial-scale=1.2, maximum-scale=1.2, user-scalable=0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
                sharedCookiesEnabled={true}
                onMessage={event => {
                  alert("Message>>>>>>>>"+event.nativeEvent.data);
                }}
                onError={event => {

                }}
            />
            <AwesomeAlert
                show={this.state.showAlert}
                showProgress={false}
                title="Sie haben das Zeiterfassungs Modul nicht gebucht"
                closeOnTouchOutside={false}
                closeOnHardwareBackPress={false}
                showCancelButton={true}
                showConfirmButton={false}
                cancelText="Ok"
                confirmText="Yes, delete it"
                confirmButtonColor="#DD6B55"
                onCancelPressed={() => {
                  this.hideAlert();
                  this.state.props.navigation.navigate('Onboarding')
                }}
                onConfirmPressed={() => {
                  this.hideAlert();
                }}
            />
          </View>

    );
  }

  handleWebViewNavigationStateChange = (newNavState) => {
    // newNavState looks something like this:
    // {
    //   url?: string;
    //   title?: string;
    //   loading?: boolean;
    //   canGoBack?: boolean;
    //   canGoForward?: boolean;
    // }

    const { url } = newNavState;
    if (!url) return;

    // handle certain doctypes
    if (url.includes('.pdf')) {
      this.state.WebViewRef.stopLoading();
      // open a modal with the PDF viewer
    }

    // one way to handle a successful form submit is via query strings
    if (url.includes('?message=success')) {
      this.webview.stopLoading();
      // maybe close this view?
    }

    // one way to handle errors is via query string
    if (url.includes('/login')) {
      if(this.state.WebViewRef){
        //this.setStorage('@app_intro','false');
        //this.setStorage('@session','');
        //this.setStorage('@api_key_user','');
        //NativeModules.DevSettings.reload()
        this.showAlert();
        let navi = this.state.props.navigation;
        let propss = this.state.props.route.params.props;
        setTimeout(function (){
          navi.navigate('Onboarding',{props:propss})
        },600)
      }
    }

    // redirect somewhere else
    if (url.includes('google.com')) {
      const newURL = 'https://reactnative.dev/';
      const redirectTo = 'window.location = "' + newURL + '"';
      this.webview.injectJavaScript(redirectTo);
    }
  };

  handleShouldStartLoadWithRequest = (request,props) => {

    if (request.url.includes('unsergenuss.quicksteps.ch/bill/fetchdoc')) {
      //Linking.openURL(request.url);
      return false;
    }

    if (request.url === (this.state.url+'/login/logout?timeout=false')) {
      this.logout().then((res)=>{
        this.state.WebViewRef.stopLoading();
        this.setStorage('@session','');
        this.setStorage('@api_key_user','').then(r => {
        });
      })

    }

    if (request.url === this.state.url+'/login/logout') {
      this.logout().then((res)=>{
        this.state.WebViewRef.stopLoading();
        this.setStorage('@session','');
        this.setStorage('@api_key_user','').then(r => {
        });
        //NativeModules.DevSettings.reload()

      })

    }


    if (request.url === this.state.url+'/login') {
      if(this.state.WebViewRef){
        this.setStorage('@app_intro','false');
        this.setStorage('@session','');
        this.setStorage('@api_key_user','');
        //NativeModules.DevSettings.reload()
        this.showAlert();
        setTimeout(function (){
          props.navigation.navigate('Onboarding',{props:props.route.params.props})
        },600)
      }
    }


    if (request.url.includes('/template/')){
      //console.log("navi: "+request);
      //navi.navigate('PDF', {url:request.url});
      //navi.navigate('PDF')
      //this.props.navi.navigate(PDFViewTest(request.url))
    }

    return true;
  }

}

export default QSWebView;
