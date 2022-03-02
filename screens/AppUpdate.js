import React from "react";
import {
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity, Image, Keyboard, StatusBar, Platform, Alert, View, SafeAreaView
} from "react-native";
// Galio components
import {Block, Text, theme, } from "galio-framework";
// Argon themed components
import { argonTheme } from "../constants/";
import { Button, Icon, Input } from "../components/";
import Images from "../constants/Images";
import * as PropTypes from "prop-types";
import Spinner from "react-native-loading-spinner-overlay";
import * as Location from "expo-location";
import {Camera} from "expo-camera";
import AwesomeAlert from "react-native-awesome-alerts";
import * as FileSystem from 'expo-file-system';
import {sendReport} from '../components/SendQSReports'
import Constants from "expo-constants";
import {LinearGradient} from "expo-linear-gradient";
import {checkEmployerPassword, getEmployerMonthData, setEmployerStatus} from "../components/API";
import Table from "../components/Table";
import * as Updates from "expo-updates";

const { width , height} = Dimensions.get("screen");

function DismissKeyboard(props) {
  return null;
}

DismissKeyboard.propTypes = {children: PropTypes.node};

class TimerecordingV2 extends React.Component {
  state = {
    spinner:false,
    isAlert:false,
    titleAlert:'',
    messageAlert:'',
    showCancelButtonAlert:false,
    showConfirmButtonAlert:false,
    cancelTextAlert:'',
    confirmTextAlert:'',
  };



  constructor(props) {
    super(props);
    if (!__DEV__) {
      this.checkAppUpdate()
    }
  }


  checkAppUpdate = async() => {
    this.setState({spinner: true, main: false})
    const update = await Updates.checkForUpdateAsync();
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        this.setState({
          isAlert:true,
          titleAlert:'Neue Version verfügbar',
          messageAlert: '',
          showCancelButtonAlert:false,
          showConfirmButtonAlert:true,
          cancelTextAlert:'abbrechen',
          confirmTextAlert:'installieren',
        })
      }else {
        /*this.setState({
          isAlert:false,
          titleAlert:'Sie haben die aktuellste Version',
          showCancelButtonAlert:true,
          cancelTextAlert:'Ok',
        })*/
      }
    } catch (e) {
      this.setState({
        isAlert:true,
        titleAlert:'Fehlercode: QS005',
        showCancelButtonAlert:true,
        cancelTextAlert:'Ok',
      })
      sendReport(e,'QS005')
      // handle or log error
    }
  }

  modalScreen = () => {
    return (
        <AwesomeAlert
            show={this.state.isAlert}
            showProgress={false}
            title={this.state.titleAlert}
            message={this.state.messageAlert}
            closeOnTouchOutside={true}
            closeOnHardwareBackPress={true}
            showCancelButton={this.state.showCancelButtonAlert}
            showConfirmButton={this.state.showConfirmButtonAlert}
            cancelText={this.state.cancelTextAlert}
            confirmText={this.state.confirmTextAlert}
            cancelButtonColor="#f4f9fc"
            confirmButtonColor="#4c8033"
            contentContainerStyle={{width:(width<800?width*0.9:width*0.5)}}
            actionContainerStyle={{itemAlign:'center'}}
            cancelButtonTextStyle={{textAlign:'center',color:'#383e41',fontSize:width<=800?20:20}}
            confirmButtonTextStyle={{textAlign:'center',fontSize: width<=800?20:20}}
            titleStyle={{fontSize: 25,textAlign:'center'}}
            messageStyle={{fontSize: 20,textAlign:'center'}}
            onCancelPressed={() => {
              this.setState({
                isAlert:false,
                titleAlert:'',
                messageAlert:'',
                showCancelButtonAlert:false,
                showConfirmButtonAlert:false,
                cancelTextAlert:'',
                confirmTextAlert:'',
              })
            }}
            onConfirmPressed={async () => {
              await Updates.fetchUpdateAsync();
              await Updates.reloadAsync();
            }}
        />
    );
  };

  render (){
    return this.modalScreen();
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

export default TimerecordingV2;
