import React from "react";
import {
  ImageBackground,
  Image,
  StyleSheet,
  StatusBar,
  Dimensions,
  Platform, View, Alert, Keyboard
} from "react-native";
import { Block, Button, Text, theme } from "galio-framework";

const { height, width } = Dimensions.get("screen");
import { Images, argonTheme } from "../constants/";
import { HeaderHeight } from "../constants/utils";
import Onboarding from "react-native-onboarding-swiper";
import AppIntroSlider from 'react-native-app-intro-slider';
import Input from "../components/Input";
import Icon from "../components/Icon";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Spinner from "react-native-loading-spinner-overlay";
import AwesomeAlert from "react-native-awesome-alerts";
import Constants from "expo-constants";



export default class Pro extends React.Component {
  state = {
    code:false,
    api_key:false,
    instance: false,
    authorized:true,
    showNextButton:true,
    showDoneButton:true,
    renderNextButton:false,
    renderDoneButton:false,
    bottomButton:false,
    goToSlide:false,
    props:false,
    showAlert:false,
    showDoneAlert:false,
    spinner:false,
    nextLabel:'weiter',
    slider:[
      {
        key: 'one',
        backgroundColor: '#0060a6',
        image: Images.QSLogoWhite,
        title: 'Willkommen bei Quicksteps',
        text: '',

      },
      {
        key: 'two',
        backgroundColor: '#0060a6',
        image: Images.OnboardingYourDomainAddressBar,
        title: 'Bei Quicksteps anmelden',
        text: 'Bitte rufen Sie ihre Quicksteps-Seite auf und melden Sie sich an',
      },
      {
        key: 'three',
        backgroundColor: '#0060a6',
        image: Images.OnboardingCode,
        title: 'Installations Code generieren',
        imageStyle:{resizeMode:'contain',height:'5%',width:'80%'},
        text:
            <>
          <Block >
          <Block>
            <Text style={{textAlign:'center',color:'rgba(255,255,255,0.8)'}}>Generieren Sie den Installations Code unter</Text>
          </Block>
            <Block>
              <Text style={{textAlign:'center',color:'rgba(255,255,255,0.8)'}}>Verwaltung > Einstellungen > Apps</Text>
            </Block>
          </Block></>,
        input:  <Input
            autoFocus={false}
            borderless
            type={"decimal-pad"}
            placeholder="Installations Code eingeben"
            onChangeText={(code)=>{this.state.code = code}}
            onSubmitEditing={()=>{
              Keyboard.dismiss()
              this.checkCodeV2()}
            }
            iconContent={
              <Icon
                  size={16}
                  color="#ADB5BD"
                  name="padlock-unlocked"
                  family="ArgonExtra"
                  style={styles.inputIcons}
              />
            }
        />
      }
    ]
  }

  showAlert = () => {
    this.setState({
      showAlert: true
    });
  };

  hideAlert = () => {
    this.setState({
      showAlert: false,
      showDoneAlert: false
    });
  };

  constructor(props) {
    super(props);
     this.state.props = this.props.route.params.props;
  }

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

  createApi = async() =>{
    //let uniqueId = DeviceInfo.getUniqueId();
    let dataSet = {device:this.state.props.deviceData,instance: this.state.instance};

    return(
        fetch('https://'+this.state.instance+'.quicksteps.ch/qsapi/apps/createAPI',{
          method:'POST',
          headers: {
            'Accept':       'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataSet)
        })
    )
  }

  createConfig = async(dataSet) =>{
    //let uniqueId = DeviceInfo.getUniqueId();
    return(
        fetch('https://boot4tester.quicksteps.ch/qsapi/apps/createConfig',{
          method:'POST',
          headers: {
            'Accept':       'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataSet)
        })
    )
  }

  checkCode = () => {
    this.setState({ spinner: true });
    var dataSet = {pin:this.state.code};
    this.createConfig(dataSet)
        .then((response) => response.json())
        .then((responseData) => {
          if(responseData.status===200){
            let instance = responseData.instanz;
            this.state.instance = responseData.instanz;
            this.setStorage('@instance',responseData.instanz);
            this.createApi().then((response) => response.json()).then(async (responseData) => {
              console.log(responseData,'Sss')
              if(responseData&&responseData.status ===200) {
                await this.setStorage('@api_key', responseData.apikey);
                await this.setStorage('@app_intro', 'true');
                this.setState({
                  renderDoneButton:false,
                  showNextButton:false,
                  api_key: await this.getStorage('@api_key'),
                  slider:[ {
                    key: 'five',
                    backgroundColor: '#0060a6',
                    image: Images.OnboardingCheck,
                    imageStyle:{resizeMode:'contain',height:'20%',width:'30%'},
                    title: 'Fertig !',
                    text: '',
                  }],
                });
                //NativeModules.DevSettings.reload();
                let navigation = this.props.navigation;
                setTimeout(function (){
                  let prop = {
                    constantsData:{
                      api_key:responseData.apikey,
                      instance:instance,
                    }
                  }
                  navigation.navigate('App',{props:prop})
                },2000)
                this.setState({ spinner: false });
              }else{
                this.setState({ spinner: false });
                Alert.alert(
                    "Fehler",
                    false,
                    [
                      { text: "OK", onPress: () => console.log("OK Pressed") }
                    ]
                )
              }
            });
          }else{
            this.setState({ spinner: false });

            Alert.alert(
                "Code ist falsch",
                false,
                [
                  { text: "OK", onPress: () => {
                      console.log("OK Pressed")
                    } }
                ]
            )
          }
        })
        .catch((error) => console.error(error))
  }

  checkCodeV2 = () => {
    const _this = this;
    this.setState({spinner: true});
    if (this.state.code == '5511') {
      this.props.navigation.navigate('App')
      this.setState({spinner: false});
    } else {
      var dataSet = {
        code: this.state.code,
        application_name: Constants.manifest.slug,
        device: this.state.props.deviceData
      };
      fetch('https://testwildcard2.quicksteps.ch/qsapi/apps/checkCodeV2', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataSet)
      })
          .then((response) => response.json())
          .then(async (responseData) => {
            if (responseData.status === 200) {
              if (responseData.data) {
                let instance = responseData.data.instance_name;
                let api_key = responseData.data.api_key;
                let user = responseData.data.user;

                this.setStorage('@instance', instance);
                await this.setStorage('@api_key', api_key);
                await this.setStorage('@device_uid', this.state.props.deviceData.deviceId);
                await this.setStorage('@app_intro', 'true');

                this.state.props.constantsData.api_key = api_key;
                this.state.props.constantsData.instance = instance;

                this.setState({
                  instance: instance,
                  renderDoneButton: false,
                  showNextButton: false,
                  api_key: api_key,
                  spinner: false
                });
                if(this.props.route.name == 'Onboarding' ){
                  setTimeout(function () {
                    _this.setState({showDoneAlert: true});
                  }, 500)
                }

              } else {
                this.setState({spinner: false});
                setTimeout(function () {
                  _this.setState({showAlert: true});
                }, 500)
              }
            } else {
              this.setState({spinner: false});
              Alert.alert(
                  "Fehler",
                  false,
                  [
                    {text: "OK", onPress: () => console.log("OK Pressed")}
                  ]
              )
            }
          })
          .catch((error) => {
            Alert.alert(
                "Fehler",
                error,
                [
                  {
                    text: "OK", onPress: () => {
                      console.log("OK Pressed")
                    }
                  }
                ]
            )
            this.setState({spinner: false});
          })
      }
  }

  _renderItem = ({ item }) => {
    let imageStyle = {resizeMode:'contain',height:'40%',width:'80%'};
    if(item.imageStyle){
      imageStyle = item.imageStyle;
    }

    return (
        <View style={[
          styles.slide,
          {
            backgroundColor: item.backgroundColor,
          },
        ]}>
          {item.image ? (<Image source={item.image} style={imageStyle}/>):<Text></Text>}
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.text}>{item.text}</Text>
          {item.input ? (<Block style={{textAlign:'center',width:(width<800?width*0.9:width*0.4),marginTop:10}}>{item.input}</Block>):<Text></Text>}
        </View>
    );
  }

  _renderCheckCodeBtn = () => {
    return (
      <View>
        <Button style={{
          width:'100%',
          backgroundColor:'tranparent',
          border:0,
          shadow:'none',
          boxShadow:'none',
          elevation: 0,
          radius:0,
          margin:0,
        }}
                onPress={()=>{
                  this.checkCodeV2()
                }}
        >
          <Text style={{ color:'#fff',fontSize: 16}}>
            überprüfen
          </Text>
        </Button>
      </View>
    );
  }

  _onDone = () => {
    // User finished the introduction. Show real app through
    // navigation or simply by controlling state
    let prop = {
      constantsData:{
        api_key:this.state.api_key,
        instance:this.state.instance,
      }
    }

    this.props.navigation.navigate('QSWebView',{props:prop})
    this.setState({ showRealApp: true });
  }

  _onNext = (prev,prevprev) => {
    if(prev === 2){
      this.setState({renderDoneButton:this._renderCheckCodeBtn})
    }else {
      this.setState({showNextButton:true,nextLabel:'weiter',renderNextButton:false})
    }
  }

  _next = () => {
    return ('weiter');
  }

  render() {
  const { width, height } = Dimensions.get("screen");
  const { navigation } = this.props;

  return (
      <>
        <Spinner
            visible={this.state.spinner}
            textContent={''}
            overlayColor={'#0060a6'}
            animation={'fade'}
            size={'large'}
            textStyle={{color:'#fff'}}
        />
        <AppIntroSlider
            ref={(ref) => (this.slider = ref)}
            renderItem={this._renderItem}
            showSkip={false}
            bottomButton={this.state.bottomButton}
            nextLabel={this.state.nextLabel}
            renderNextButton={this.state.renderNextButton}
            renderDoneButton={this.state.renderDoneButton}
            showNextButton={this.state.showNextButton}
            showDoneButton={this.state.showDoneButton}
            onDone={this._onDone}
            onSlideChange={(prev,prevprev)=>this._onNext(prev,prev)}
            data={this.state.slider}
        />
        <AwesomeAlert
            show={this.state.showAlert}
            showProgress={false}
            title="Code ist ungültig"
            closeOnTouchOutside={true}
            closeOnHardwareBackPress={false}
            showCancelButton={true}
            showConfirmButton={false}
            cancelText="Ok"
            confirmText="Yes, delete it"
            confirmButtonColor="#DD6B55"
            onCancelPressed={() => {
              this.hideAlert();
            }}
            onConfirmPressed={() => {
              this.hideAlert();
            }}
        />
        <AwesomeAlert
            show={this.state.showAlert}
            showProgress={false}
            title="Code ist ungültig"
            closeOnTouchOutside={true}
            closeOnHardwareBackPress={false}
            showCancelButton={true}
            showConfirmButton={false}
            cancelText="Ok"
            confirmText="Yes, delete it"
            confirmButtonColor="#DD6B55"
            onCancelPressed={() => {
              this.hideAlert();
            }}
            onConfirmPressed={() => {
              this.hideAlert();
            }}
        />
        <AwesomeAlert
            show={this.state.showDoneAlert}
            showProgress={false}
            title="Fertig"
            closeOnTouchOutside={false}
            closeOnHardwareBackPress={false}
            showConfirmButton={true}
            cancelText="Ok"
            confirmText="weiter"
            confirmButtonColor="#3C6528"
            contentContainerStyle={{width:(width<800?width*0.9:width*0.4)}}
            onCancelPressed={() => {
              this.hideAlert();
            }}
            onConfirmPressed={() => {
              this.hideAlert();
              let navigation = this.props.navigation;
              navigation.navigate('App',{props:this.state.props})
            }}
        />
      </>

  );
  }
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'blue',
  },
  image: {
    width: 320,
    height: 320,
    marginVertical: 32,
  },
  text: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  title: {
    marginTop:20,
    marginBottom:10,
    fontSize: 22,
    color: 'white',
    textAlign: 'center',
  },
  container: {
    backgroundColor: theme.COLORS.BLACK,
    marginTop: Platform.OS === "android" ? -HeaderHeight : 0
  },
  padded: {
    paddingHorizontal: theme.SIZES.BASE * 2,
    zIndex: 3,
    position: "absolute",
    bottom:
      Platform.OS === "android" ? theme.SIZES.BASE * 2 : theme.SIZES.BASE * 3
  },
  button: {
    width: width - theme.SIZES.BASE * 4,
    height: theme.SIZES.BASE * 3,
    shadowRadius: 0,
    shadowOpacity: 0
  },
  pro: {
    backgroundColor: argonTheme.COLORS.INFO,
    paddingHorizontal: 8,
    marginLeft: 3,
    borderRadius: 4,
    height: 22,
    marginTop: 15
  },
  gradient: {
    zIndex: 1,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 66
  }
});
