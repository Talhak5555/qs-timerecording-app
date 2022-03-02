import React from "react";
import {
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity, Image, Keyboard, StatusBar, Platform, Alert, View, SafeAreaView
} from "react-native";
// Galio components
import {Block, Text, Button as GaButton, theme, Toast} from "galio-framework";
// Argon themed components
import { argonTheme, tabs } from "../constants/";
import { Button, Select, Icon, Input, Header, Switch } from "../components/";
import Images from "../constants/Images";
import * as PropTypes from "prop-types";
import Spinner from "react-native-loading-spinner-overlay";
import * as Location from "expo-location";
import {Camera} from "expo-camera";
import AwesomeAlert from "react-native-awesome-alerts";
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import {sendReport} from '../components/SendQSReports'
import Constants from "expo-constants";
import {LinearGradient} from "expo-linear-gradient";
import {getEmployerMonthData} from "../components/API";

const { width , height} = Dimensions.get("screen");

function DismissKeyboard(props) {
  return null;
}

DismissKeyboard.propTypes = {children: PropTypes.node};

class Timerecording extends React.Component {
  state = {
    "switch-1": true,
    "switch-2": false ,
    image: {uri:'https://'+this.props.route.params.props.constantsData.instance+'.quicksteps.ch/img/'+this.props.route.params.props.constantsData.instance+'.logo.png'},
    selectOptions : ["01", "02", "03", "04", "05"],
    instance:false,
    api_key:false,
    device_uid:false,
    password:false,
    spinner:false,
    main:true,
    loggedin:false,
    loggedout:false,
    inpause:false,
    isback:false,
    infoScreen:false,
    welcome:false,
    contact_name:'',
    contact_id:false,
    button_status:false,
    showSuccessAlert:false,
    titleSuccessAlert:'Erfolg',
    messageSuccessAlert:'Um 10:78 Uhr',
    messageErrorAlert:'Es ist ein Fehler aufgetreten',
    showErrorAlert:false,
    base64:false,
    inputAutoFocus:true,
    curDate:false,
    curTime:false,
    curDay:false,
    employer_id:false,
    latitude:0,
    longitude:0,
  };


  constructor(props) {
    super(props);
    this.state.api_key = this.props.route.params.props.constantsData.api_key;
    this.state.instance = this.props.route.params.props.constantsData.instance;
    this.state.device_uid = this.props.route.params.props.constantsData.device_uid;
    //this.daysArray = ['sonntag', 'montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag'];
    let _this = this;

    /*_this.daysArray.map((item, key) => {
      if (key == new Date().getDay()) {
        this.state.curDay=item.toUpperCase();
      }
    })*/

    setInterval(() => {
      let date = new Date();
      let hour = date.getHours();
      let minutes = date.getMinutes();
      let seconds = date.getSeconds();
      let dateday = date.getDate();
      let month = date.getMonth()+1;

      if (minutes < 10) {minutes = '0' + minutes;}
      if (seconds < 10) {seconds = '0' + seconds;}
      if (hour < 10) {hour = '0' + hour;}
      if (dateday < 10) {dateday = '0' + dateday;}
      if (month < 10) {month = '0' + month;}


      let curdate = dateday+'.'+month+'.'+date.getFullYear();
      let curtime = hour+':'+minutes+':'+seconds;


      this.setState({
        curDate : curdate,
        curTime : curtime
      })
    }, 1000)
  }

  checkEmployerPassword = async () => {
    this.setState({spinner:true,main:false})

    let data = {
      api_key:this.state.api_key,
      device_uid:this.state.device_uid,
      password:this.state.password,
    }

    await this.getNewLocation();

    fetch('https://'+this.state.instance+'.quicksteps.ch/api/time/checkEmployerPassword',{
      method:'POST',
      headers: {
        'Accept':       'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
        .then((response) => response.json())
        .then(async (responseData) => {
          if(responseData.status === 200){
            let loggedin = responseData.employer_status === 1;
            let loggedout = responseData.employer_status === 2 || responseData.employer_status === 0;
            let inpause = responseData.employer_status === 3;

            this.setState({
              contact_id:responseData.employer.id,
              contact_name:responseData.employer.vorname,
              main:false,
              loggedin:loggedin,
              loggedout:loggedout,
              inpause:inpause,
              info:true,
              isback:true,
              welcome:true,
              password:false,
              employer_id:responseData.employer.id
            });

            if(responseData.employer_status < 3){
              await this.snap();
            }

          }else {
            //@todo keyboard triggern
            this.setState({
              main:true
            });
          }

          this.setState({spinner:false})
        })
        .catch((error) => {
          this.setState({messageErrorAlert: this.state.messageErrorAlert+'\n Fehlercode: QS001',showErrorAlert:true})
          this.setState({
            spinner:false
          })
          sendReport(error,'QS001');
        })
  };

  setEmployerStatus = async () => {

    let data = {
      api_key:this.state.api_key,
      contact_id:this.state.contact_id,
      longitude:this.state.longitude,
      latitude:this.state.latitude,
      status:this.state.button_status,
      base64:this.state.base64
    }

    fetch('https://'+this.state.instance+'.quicksteps.ch/api/time/setEmployerStatus',{
      method:'POST',
      headers: {
        'Accept':       'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
        .then((response) => response.json())
        .then((responseData) => {
          if(responseData.status == 200){
            let titleSuccessAlert = 'Erfolgreich';
            if(this.state.button_status === 1){ titleSuccessAlert = 'Erfolgreich eingeloggt' }
            if(this.state.button_status === 2){ titleSuccessAlert = 'Erfolgreich ausgeloggt' }
            if(this.state.button_status === 3){ titleSuccessAlert = 'Erfolgreich'}

            this.setState({
              titleSuccessAlert:titleSuccessAlert,
              messageSuccessAlert:'um '+responseData.time+' Uhr',
              showSuccessAlert:true
            })
            let _this = this;
            setTimeout(function (){
              _this.setState({
                showSuccessAlert:false,
              })
            },4000)
            setTimeout(function (){
              _this.setState({
                loggedin:false,
                loggedout:false,
                inpause:false,
                isback:false,
                info:false,
                welcome:false,
                main:true
              })
            },4300)
          }else if(responseData.status == 400){
            this.setState({
              spinner:false,
              messageErrorAlert: this.state.messageErrorAlert+'\n Fehlercode: QS003',
              showErrorAlert:true
            })
          }

          this.setState({
            spinner:false
          })
        })
        .catch((error) => {
          this.setState({messageErrorAlert:'Diese Aktion konnte nicht ausgeführt werden \n Fehlercode: QS002',showErrorAlert:true})
          this.setState({
            spinner:false
          })
          sendReport(error);
        })
  };

  getNewLocation = async () => {
    let location_permission = await Location.requestBackgroundPermissionsAsync();
    if(location_permission.status === 'granted') {
      try{
        let location = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Lowest});
        this.state.latitude = location.coords.latitude;
        this.state.longitude = location.coords.longitude;
        //this.setState({ latitude:location.coords.latitude,longitude:location.coords.longitude});
      }catch (error){
        sendReport(error,'QS006')
      }
    }
  };

  snap = async () => {
    if (this.camera) {
      let base64 = false;
      let uri = false;
      const options = { quality: 0,  skipProcessing: true };
      await this.camera.takePictureAsync(options)
          .then(async (resdata)=>{
            uri = resdata.uri;
            base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
            if(uri){
              await ImageManipulator.manipulateAsync(
                  uri,
                  [{ resize: { height: 600 } }],
                  { compress: 0.3,format: ImageManipulator.SaveFormat.PNG}
              ).then(async (res) => {
                this.setState({spinner:false})
                base64 = await FileSystem.readAsStringAsync(res.uri, { encoding: 'base64' });
              }).catch((error)=>{
                this.setState({spinner:false})
                let _this = this;
                sendReport(error);
                /*setTimeout(function (){
                  _this.setState({showErrorAlert:true})
                },200)*/
              }).finally(()=>{
                this.setState({spinner:false})
                this.camera.resumePreview();
              });
            }
          })
          .catch((error)=>{
            this.setState({spinner:false})
            sendReport(error);
          })
          .finally(()=>{
            this.setState({spinner:false})
            this.camera.resumePreview();
          });


      if(base64)
        this.state.base64 = base64;

      this.camera.resumePreview();
    }else{
      this.state.base64 = 0;
    }
  };

  main = () => {
    return (
        <>
        <Block center style={{marginTop:10,width:'90%'}}>
          <Block style={{width:'100%',marginBottom: 5 }}>
            <Select
                defaultIndex={1}
                options={this.state.selectOptions}
                style={{display: 'none'}}
                textStyle={{fontSize: 15}}
                dropdownStyle={{minHeight:height*0.3}}
                dropdownTextStyle={{fontSize: 40}}
                isFullWidth={true}
            />
          </Block>
          <Block style={{width:'100%',marginBottom: 5 }}>
            <Input
                textInputStyle={{fontSize: width < 700 ? 20 :40 ,color: argonTheme.COLORS.WHITE}}
                style={{height: width < 700 ? 50 :100,borderRadius:0,backgroundColor:'#353b4a'}}
                ref={input => this.inputElement = input}
                autoFocus={this.state.inputAutoFocus}
                blurOnSubmit={false}
                password
                borderless
                keyboardAppearance={'dark'}
                keyboardType={"numeric"}
                placeholder=""
                onChangeText={(password)=>{this.state.password=password;}}
                onSubmitEditing={()=>{
                  Keyboard.dismiss()
                  this.checkEmployerPassword();
                }}
                iconContent={
                  <Icon
                      size={width < 700 ? 20 :30}
                      color="#ADB5BD"
                      name="padlock-unlocked"
                      family="ArgonExtra"
                      style={styles.inputIcons}
                  />
                }
            />
          </Block>
        </Block>
    <Block center style={{width:'90%'}}>
      <Button style={{width:'100%',height:width < 700 ? 50 :100,backgroundColor:'#353b4a',borderRadius:0}} onPress={()=>{
        Keyboard.dismiss()
        this.checkEmployerPassword();
      }}>
        <Text
            size={width < 700 ? 20 :30}
            color={argonTheme.COLORS.WHITE}
        >
          Ok
        </Text>
      </Button>
    </Block>
        </>
    );
  }

  loggedout = () => {
    return (
        <Block center style={{width:'90%'}}>
          <Button color='success' style={{width:'100%',height:width < 700 ? 50 :100}} onPress={async ()=>{
            Keyboard.dismiss()
            this.setState({spinner:true,button_status:1})
            this.state.button_status = 1;
            this.setEmployerStatus();

          }}>
            <Text
                size={20}
                color={argonTheme.COLORS.WHITE}
            >
              Einloggen
            </Text>
          </Button>
        </Block>
    );
  }

  loggedin = () => {
    return (
        <Block center style={{width:'90%'}}>
          <Button color='error' style={{width:'100%',height:width < 700 ? 50 :100}} onPress={async ()=>{
            Keyboard.dismiss()
            this.setState({spinner:true,button_status:2})
            this.state.button_status = 2;
            this.setEmployerStatus()
          }}>
            <Text
                size={20}
                color={argonTheme.COLORS.WHITE}
            >
              Ausloggen
            </Text>
          </Button>
          <Button color={'default'}   style={{width:'100%',height:width < 700 ? 50 :100}} onPress={async()=>{
            Keyboard.dismiss()
            this.setState({spinner:true,button_status:3})
            this.state.button_status = 3;
            this.setEmployerStatus()
          }}>
            <Text
                size={20}
                color={argonTheme.COLORS.WHITE}
            >
              Pause starten
            </Text>
          </Button>
        </Block>
    );
  }

  inpause = () => {
    return (
        <Block center style={{width:'90%'}}>
          <Button color={'default'} style={{width:'100%',height:width < 700 ? 50 :100}} onPress={()=>{
            Keyboard.dismiss()
            this.setState({spinner:true,button_status:3})
            this.state.button_status = 3;
            this.setEmployerStatus()
          }}>
            <Text
                size={20}
                color={argonTheme.COLORS.WHITE}
            >
              Pause beenden
            </Text>
          </Button>
        </Block>
    );
  }

  isback = (states) => {
    return (
        <Block center style={{width:'90%'}}>
          <Button  style={{width:'100%',height:width < 700 ? 50 :100,backgroundColor:'#353b4a',borderRadius:0}} onPress={()=>{
            Keyboard.dismiss()
            this.setState({
              main:true,
              loggedin:false,
              loggedout:false,
              inpause:false,
              isback:false,
              info:false,
              welcome:false,
              inputAutoFocus:true
            })
          }}>
            <Text
                size={20}
                color={argonTheme.COLORS.WHITE}
            >
              zurück
            </Text>
          </Button>
        </Block>
    );
  }

  isbacktoActions = () => {
    return (
        <Block center style={{width:'90%'}}>
          <Button  style={{width:'100%',height:width < 700 ? 50 :100,backgroundColor:'#353b4a',borderRadius:0}} onPress={()=>{
            Keyboard.dismiss()
            this.setState({
              main:true,
              loggedin:false,
              loggedout:false,
              inpause:false,
              isback:false,
              info:false,
              welcome:false,
              inputAutoFocus:true
            })
          }}>
            <Text
                size={20}
                color={argonTheme.COLORS.WHITE}
            >
              zurück
            </Text>
          </Button>
        </Block>
    );
  }

  info = () => {
    return (
        <Block center style={{width:'90%'}}>
          <Button color={'default'} style={{width:'100%',height:width < 700 ? 50 :100,borderRadius:0}} onPress={async()=>{
            Keyboard.dismiss()
            this.setState({spinner:true})
            await getEmployerMonthData(this.state.employer_id).then((res)=>{
              console.log(res)
              this.setState({
                spinner:false,
                loggedin:false,
                loggedout:false,
                inpause:false,
                isback:true,
                info:false,
                infoScreen:true,
              })
            })
          }}>
            <Text
                size={20}
                color={argonTheme.COLORS.WHITE}
            >
              Info
            </Text>
          </Button>
        </Block>
    );
  }

  welcome = () => {
    return (
        <Block center style={{width:'100%',marginBottom: 20}}>
          <Text
              size={30}
              color={argonTheme.COLORS.WHITE}
          >Hallo {this.state.contact_name}</Text>
        </Block>
    );
  }

  versionInfo = () => {
    return (
          <Text
              size={10}
              color={argonTheme.COLORS.MUTED}
          >V{Constants.manifest.version}</Text>
    );
  }

  currentTime = () => {
    return (
        <Block center style={{textAlign:'center'}}>
          <Text
              size={ width < 700 ? 14:18}
              color={argonTheme.COLORS.MUTED}
          >{this.state.curDay}, {this.state.curDate}</Text>
          <Text
              size={ width < 700 ? 30 :50}
              color={argonTheme.COLORS.MUTED}
          >{this.state.curTime}</Text>
        </Block>
    );
  }


  render() {
    return (
        <ScrollView contentContainerStyle={{flexGrow: 1,backgroundColor:'transparent'}}
                    keyboardShouldPersistTaps='always'
        >
          <LinearGradient
            // Background Linear Gradient
              locations={[0.3,0.60]}
            colors={['#353b4a', '#0a0a09']}
            style={styles.background}
        />
          <Block left style={{marginBottom: width < 700 ? 5 :10}}>
            <Block style={{width:'100%',padding:7,marginTop:Platform.OS === 'ios' ? theme.SIZES.BASE*1.5:0}}>
            {this.versionInfo()}
            {this.currentTime()}
            </Block>
          </Block>
          <SafeAreaView style={styles.container}>
            <Camera style={styles.container} type={Camera.Constants.Type.front}
                    ref={ref => {this.camera = ref;}}
                    onCameraReady={ () => {console.log('camera Ready');}}
                    onMountError={(error) => {sendReport(error);console.log("cammera error", error);}}
            />
          </SafeAreaView>
          <Block center style={{width:'70%',height:width < 700 ? '18%' :'25%',marginBottom: width < 700 ? 10 :20,marginTop:width < 700 ? 10 :20}}>
            <Image  onError={()=>this.setState({image:Images.QSLogoWhite})} source={this.state.image} style={{resizeMode:'contain',height:'100%',width:'100%'}} />
          </Block>
          <Block>
            {this.state.welcome ? this.welcome():false}
          </Block>
          <Block flex center >
          <StatusBar hidden={true}  translucent={true}/>
            <Block middle center style={{height:undefined,width:(width<800?width*0.9:width*0.8),borderRadius: 5}}>
              {this.state.main ? this.main():false}
              {this.state.loggedin ? this.loggedin():false}
              {this.state.loggedout ? this.loggedout():false}
              {this.state.inpause ? this.inpause():false}
              {this.state.info ? this.info():false}
              {this.state.isback ? this.isback():false}
            </Block>
        </Block>
          <Spinner
              visible={this.state.spinner}
              textContent={''}
              size={'large'}
              textStyle={{color:'#fff'}}
          />
          <AwesomeAlert
              show={this.state.showSuccessAlert}
              showProgress={false}
              title={this.state.titleSuccessAlert}
              message={this.state.messageSuccessAlert}
              closeOnTouchOutside={false}
              closeOnHardwareBackPress={false}
              showCancelButton={true}
              cancelText="Ok"
              confirmText="weiter"
              cancelButtonColor="#3C6528"
              confirmButtonColor="#3C6528"
              contentContainerStyle={{width:(width<800?width*0.9:width*0.5)}}
              actionContainerStyle={{itemAlign:'center'}}
              cancelButtonStyle={{width:100}}
              cancelButtonTextStyle={{textAlign:'center',fontSize: 20}}
              titleStyle={{fontSize: 25,textAlign:'center'}}
              messageStyle={{fontSize: 20,textAlign:'center'}}
              onCancelPressed={() => {
                Keyboard.dismiss()
                this.setState({
                  showSuccessAlert:false,
                })
                let _this = this;
                setTimeout(function (){
                  _this.setState({
                    loggedin:false,
                    loggedout:false,
                    inpause:false,
                    isback:false,
                    welcome:false,
                    main:true,
                  })
                },400)
              }}
          />
          <AwesomeAlert
              show={this.state.showErrorAlert}
              showProgress={false}
              title="Ups !"
              message={this.state.messageErrorAlert}
              closeOnTouchOutside={false}
              closeOnHardwareBackPress={false}
              showCancelButton={true}
              cancelText="Ok"
              confirmText="weiter"
              cancelButtonColor="#a53012"
              confirmButtonColor="#3C6528"
              contentContainerStyle={{width:(width<800?width*0.9:width*0.5)}}
              actionContainerStyle={{itemAlign:'center'}}
              cancelButtonStyle={{width:100}}
              cancelButtonTextStyle={{textAlign:'center',fontSize: 20}}
              titleStyle={{fontSize: 25,textAlign:'center'}}
              messageStyle={{fontSize: 20,textAlign:'center'}}
              onCancelPressed={() => {
                this.setState({
                  messageErrorAlert:'Es ist ein Fehler aufgetreten',
                  showErrorAlert:false,
                })
                let _this = this;
                setTimeout(function (){
                  _this.setState({
                    loggedin:false,
                    loggedout:false,
                    inpause:false,
                    isback:false,
                    info:false,
                    welcome:false,
                    main:true,
                  })
                },400)
              }}
              onConfirmPressed={() => {
                this.hideAlert();
                let navigation = this.props.navigation;
                navigation.navigate('App',{props:this.state.props})
              }}
          />
        </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container:{
    display:'none',
    opacity: 0,
    ...StyleSheet.absoluteFillObject,
  },
  capture: {
    backgroundColor: "#f5f6f5",
    height: Math.floor(height * 0.09),
    width: Math.floor(height * 0.09),
    borderRadius: Math.floor(Math.floor(height * 0.09) / 2),
    marginHorizontal: 31,
  },
  registerContainer: {
    width: width < 700 ? width * 0.9:width * 0.6,
    height: height < 812 ? height * 0.6 : height * 0.5,
    backgroundColor: "#F4F5F7",
    borderRadius: 4,
    shadowColor: argonTheme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 1,
    overflow: "hidden"
  },
  socialConnect: {
    flex: height < 812 ? 0.5 : 0.5,
    maxHeight: height < 812 ? height*0.6 : height*0.6,
    maxWidth: width < 700 ? width*0.9 : width*0.9,
    backgroundColor: argonTheme.COLORS.WHITE,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(136, 152, 170, 0.3)"
  },
  socialButtons: {
    width: 120,
    height: 40,
    backgroundColor: "#fff",
    shadowColor: argonTheme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 1
  },
  socialTextButtons: {
    color: argonTheme.COLORS.PRIMARY,
    fontWeight: "800",
    fontSize: 14
  },
  inputIcons: {
    marginLeft: 12,
    marginRight: 30
  },
  passwordCheck: {
    paddingLeft: 2,
    paddingTop: 6,
    paddingBottom: 15
  },
  createButton: {
    width: width * 0.5,
    marginTop: 25,
    marginBottom: 40
  },
  qsImage: {
    width: '75%',
    height: '50%',
    zIndex:9999
  },
  LoginContainer: {
    marginTop: 20
  },
  InputsContainer: {
    width: width < 700 ? width*0.7:width*0.5,
    marginTop: 10
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height,
  },

});

export default Timerecording;
