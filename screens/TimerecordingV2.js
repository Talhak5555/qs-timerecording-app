import React from "react";
import {
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Keyboard,
  StatusBar,
  Platform,
  Alert,
  View,
  SafeAreaView,
} from "react-native";
// Galio components
import { Block, Text, theme } from "galio-framework";
// Argon themed components
import { argonTheme } from "../constants/";
import { Button, Icon, Input } from "../components/";
import Images from "../constants/Images";
import * as PropTypes from "prop-types";
import Spinner from "react-native-loading-spinner-overlay";
import * as Location from "expo-location";
import { Camera } from "expo-camera";
import AwesomeAlert from "react-native-awesome-alerts";
import * as FileSystem from "expo-file-system";
import { sendReport } from "../components/SendQSReports";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import {
  checkEmployerPassword,
  getEmployerMonthData,
  setEmployerStatus,
} from "../components/API";
import Table from "../components/Table";
import DateAndTime from "./Timerecording/DateAndTime";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("screen");

function DismissKeyboard(props) {
  return null;
}

DismissKeyboard.propTypes = { children: PropTypes.node };

class TimerecordingV2 extends React.Component {
  state = {
    spinner: false,
    image_uri: false,
    showLogo: true,
    passwordScreen: true,
    passwordInput: true,
    passwordCheckBtn: true,
    password: false,
    actionStatus: false,
    actionsScreen: false,
    loginBtn: false,
    logoutBtn: false,
    pauseStartBtn: false,
    pauseEndBtn: false,
    noteBtn: true,
    note: false,
    backBtn: false,
    backStates: {
      passwordScreen: true,
      actionsScreen: false,
      infoBtn: false,
      loginBtn: false,
      logoutBtn: false,
      pauseStartBtn: false,
      pauseEndBtn: false,
      welcomeText: false,
      btnDisabled: false,
      base64: false,
      note: false,
      showLogo: true,
    },
    infoScreen: false,
    infoBtn: false,
    infoData: false,
    welcomeText: false,
    contact_name: "",
    contact_id: false,
    showSuccessAlert: false,
    titleSuccessAlert: "Erfolg",
    messageSuccessAlert: "",
    confirmBtnSuccessAlert: false,
    confirmTextSuccessAlert: "",
    showNoteAlert: false,
    showErrorAlert: false,
    messageErrorAlert: "Es ist ein Fehler aufgetreten",
    curDate: false,
    curTime: false,
    curDay: false,
    latitude: 0,
    longitude: 0,
    base64: false,
    btnDisabled: false,
    logo: {
      uri:
        "https://" +
        this.props.route.params.props.constantsData.instance +
        ".quicksteps.ch/img/" +
        this.props.route.params.props.constantsData.instance +
        ".logo.png",
    },
  };

  loaction_timestamp = false;

  constructor(props) {
    super(props);
    this.state.api_key = this.props.route.params.props.constantsData.api_key;
    this.state.instance = this.props.route.params.props.constantsData.instance;
    this.state.device_uid =
      this.props.route.params.props.constantsData.device_uid;
    //this.daysArray = ['sonntag', 'montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag'];
    let _this = this;

    global.location_on ? this.getNewLocation() : false;

    /*setInterval(() => {
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

      let curDay = false;
      let curdate = dateday+'.'+month+'.'+date.getFullYear();
      let curtime = hour+':'+minutes+':'+seconds;

      _this.daysArray.map((item, key) => {
        if (key === new Date().getDay()) {
          curDay = item.toUpperCase();
        }
      })
      if(!this.state.spinner && !this.state.showSuccessAlert && !this.state.showErrorAlert && !this.state.showNoteAlert){
        this.setState({
          curDate : curdate,
          curTime : curtime,
          curDay : curDay
        })
      }

    }, 1000)*/
  }

  /*shouldComponentUpdate = (props,states) => {
    if(
        states.showErrorAlert
        || states.showSuccessAlert
        || states.spinner
    )
      return true;

    return true;
  }*/

  checkContactPassword = async () => {
    this.setState({ spinner: true, main: false });

    global.camera_on ? await this.snap() : false;

    let currenttimestamp = Date.parse(new Date());
    //if(this.loaction_timestamp&& currenttimestamp>(this.loaction_timestamp+(2*60*1000))){
    //global.location_on ? this.getNewLocation():false;
    //}
    const apiKey = await AsyncStorage.getItem("@api_key");
    const instance = await AsyncStorage.getItem("@instance");

    if (apiKey !== null && instance !== null) {
      await checkEmployerPassword(this.state.password, apiKey, instance).then(
        async (res) => {
          if (res) {
            if (res.status === 200) {
              let loggedin =
                res.employer_status === 1 ||
                res.employer_status === "reason_24";
              let loggedout =
                res.employer_status === 2 ||
                res.employer_status === 0 ||
                res.employer_status === "reason_21";

              let inpause = res.employer_status === 3;

              switch (res.employer_status) {
                case 0:
                  loggedout = true;
                  break;
                case 1:
                  loggedin = true;
                  break;
                case 2:
                  loggedout = true;
                  break;
                case 3:
                  inpause = true;
                  break;
                case "reason_1":
                  loggedout = true;
                  break;
                case "reason_2":
                  loggedout = true;
                  break;
                case "reason_3":
                  loggedout = true;
                  break;
                case "reason_4":
                  loggedout = true;
                  break;
                case "reason_5":
                  loggedout = true;
                  break;
                case "reason_6":
                  loggedout = true;
                  break;
                case "reason_7":
                  loggedout = true;
                  break;
                case "reason_8":
                  loggedout = true;
                  break;
                case "reason_9":
                  loggedout = true;
                  break;
                case "reason_10":
                  loggedout = true;
                  break;
                case "reason_11":
                  loggedout = true;
                  break;
                case "reason_12":
                  loggedout = true;
                  break;
                case "reason_13":
                  loggedout = true;
                  break;
                case "reason_14":
                  loggedout = true;
                  break;
                case "reason_15":
                  loggedout = true;
                  break;
                case "reason_16":
                  loggedout = true;
                  break;
                case "reason_17":
                  loggedout = true;
                  break;
                case "reason_18":
                  loggedout = true;
                  break;
                case "reason_19":
                  loggedout = true;
                  break;
                case "reason_20":
                  loggedout = true;
                  break;
                case "reason_21":
                  loggedout = true;
                  break;
                case "reason_22":
                  loggedout = true;
                  break;
                case "reason_23":
                  loggedout = true;
                  break;
                case "reason_24":
                  loggedin = true;
                  break;
                case "reason_25":
                  loggedout = true;
                  break;
                default:
                  loggedin = false;
                  loggedout = false;
                  inpause = false;
                  break;
              }

              this.setState({
                showLogo: false,
                contact_id: res.employer.id,
                contact_name: res.employer.vorname,
                passwordScreen: false,
                actionsScreen: true,
                loginBtn: loggedout,
                logoutBtn: loggedin,
                pauseStartBtn: loggedin,
                pauseEndBtn: inpause,
                infoBtn: true,
                noteBtn: true,
                backBtn: true,
                welcomeText: true,
                password: false,
                spinner: false,
              });

              if (res.employer_status < 3) {
                //await this.getNewLocation();
                //await this.snap();
              }
            } else {
              //@todo keyboard triggern

              this.setState({
                passwordScreen: true,
              });
            }
            this.setState({ spinner: false });
          } else {
            //@todo Error alert
            this.setState({ spinner: false, showErrorAlert: true });
          }
        }
      );
    } else {
      return;
    }
  };

  setEmployerStatus = async () => {
    this.setState({ spinner: true, btnDisabled: true });

    const apiKey = await AsyncStorage.getItem("@api_key");
    const instance = await AsyncStorage.getItem("@instance");

    if (apiKey !== null && instance !== null) {
      await setEmployerStatus({
        contact_id: this.state.contact_id,
        longitude: this.state.longitude,
        latitude: this.state.latitude,
        status: this.state.actionStatus,
        base64: this.state.base64,
        note: this.state.note,
        apiKey,
        instance,
      }).then((res) => {
        if (res) {
          if (res.status == 200) {
            let titleSuccessAlert = "Erfolgreich";
            if (this.state.actionStatus === 1) {
              titleSuccessAlert = "Erfolgreich eingeloggt";
            }
            if (this.state.actionStatus === 2) {
              titleSuccessAlert = "Erfolgreich ausgeloggt";
            }
            if (this.state.actionStatus === 3) {
              titleSuccessAlert = "Erfolgreich";
            }

            this.setState({
              titleSuccessAlert: titleSuccessAlert,
              messageSuccessAlert: "um " + res.time + " Uhr",
              showSuccessAlert: true,
            });

            this.state.base64 = false;

            let _this = this;
            setTimeout(function () {
              _this.setState({ showSuccessAlert: false });
            }, 4000);
          } else if (res.status == 400) {
            this.setState({
              spinner: false,
              messageErrorAlert:
                this.state.messageErrorAlert + "\n Fehlercode: QS003",
              showErrorAlert: true,
            });
          }
        } else {
          //@todo Error alert
        }
        this.setState({ spinner: false });
      });
    } else {
      return;
    }
  };

  snap = async () => {
    if (this.camera) {
      let base64 = false;
      let uri = false;
      const options = { quality: 0, skipProcessing: true, base64: true };
      let picture = await this.camera.takePictureAsync(options);
      this.image_uri = picture.uri;
      /*
      .then(async (resdata)=>{
            uri = resdata.uri;
            console.log('no base64')
            base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
            console.log(base64)
            /*if(uri){
              await ImageManipulator.manipulateAsync(uri, [{ resize: { height: 600 } }], { compress: 0.3,format: ImageManipulator.SaveFormat.PNG}).then(async (res) => {
                this.setState({spinner:false})
                base64 = await FileSystem.readAsStringAsync(res.uri, { encoding: 'base64' });
              }).catch((error)=>{
                this.setState({spinner:false})
                sendReport(error);
              }).finally(()=>{
                this.setState({spinner:false})
                this.camera.resumePreview();
              });
            }*/ /*
              })
          .catch((error)=>{
            console.log('err4')
            this.setState({spinner:false})
            sendReport(error,'QS007');
            this.camera.resumePreview();
          })
          .finally(()=>{
            console.log('fin')
            this.camera.resumePreview();
          });*/
      this.camera.resumePreview();
      if (!picture) {
        sendReport("Failed take Picture", "QS007");
      }

      if (picture.base64) this.state.base64 = picture.base64;
    } else {
      this.state.base64 = 0;
    }
  };

  passwordScreen = () => {
    return (
      <>
        <Block center style={{ marginTop: 10, width: "90%" }}>
          <Block style={{ width: "100%", marginBottom: 5 }}>
            <Input
              textInputStyle={{
                fontSize: width < 700 ? 20 : 40,
                color: argonTheme.COLORS.WHITE,
              }}
              style={{
                height: width < 700 ? 50 : 100,
                borderRadius: 0,
                backgroundColor: "#353b4a",
              }}
              ref={(input) => (this.inputElement = input)}
              autoFocus={true}
              blurOnSubmit={false}
              password
              borderless
              keyboardAppearance={"dark"}
              keyboardType={"numeric"}
              placeholder=""
              onChangeText={(password) => {
                this.state.password = password;
              }}
              onSubmitEditing={() => {
                Keyboard.dismiss();
                this.checkContactPassword();
              }}
              iconContent={
                <Icon
                  size={width < 700 ? 20 : 30}
                  color="#ADB5BD"
                  name="padlock-unlocked"
                  family="ArgonExtra"
                  style={styles.inputIcons}
                />
              }
            />
          </Block>
        </Block>
        <Block center style={{ width: "90%" }}>
          <Button
            style={{
              width: "100%",
              height: width < 700 ? 50 : 100,
              backgroundColor: "#353b4a",
              borderRadius: 0,
            }}
            onPress={() => {
              Keyboard.dismiss();
              this.checkContactPassword();
            }}
          >
            <Text size={width < 700 ? 20 : 30} color={argonTheme.COLORS.WHITE}>
              Ok
            </Text>
          </Button>
        </Block>
      </>
    );
  };

  loginBtn = () => {
    return (
      <Button
        disabled={this.state.btnDisabled}
        color="success"
        style={{ width: "100%", height: width < 800 ? 50 : 100 }}
        onPress={async () => {
          this.setState({ spinner: true, actionStatus: 1 });
          this.state.actionStatus = 1;
          this.setEmployerStatus();
        }}
      >
        <Text size={20} color={argonTheme.COLORS.WHITE}>
          Einloggen
        </Text>
      </Button>
    );
  };

  logoutBtn = () => {
    return (
      <Button
        disabled={this.state.btnDisabled}
        color="error"
        style={{ width: "100%", height: width < 800 ? 50 : 100 }}
        onPress={async () => {
          this.setState({ spinner: true, actionStatus: 2 });
          this.state.actionStatus = 2;
          this.setEmployerStatus();
        }}
      >
        <Text size={20} color={argonTheme.COLORS.WHITE}>
          Ausloggen
        </Text>
      </Button>
    );
  };

  pauseStartBtn = () => {
    return (
      <Button
        disabled={this.state.btnDisabled}
        color={"default"}
        style={{ width: "100%", height: width < 800 ? 50 : 100 }}
        onPress={async () => {
          this.setState({ spinner: true, actionStatus: 3 });
          this.state.actionStatus = 3;
          this.setEmployerStatus();
        }}
      >
        <Text size={20} color={argonTheme.COLORS.WHITE}>
          Pause starten
        </Text>
      </Button>
    );
  };

  pauseEndBtn = () => {
    return (
      <Button
        disabled={this.state.btnDisabled}
        color={"default"}
        style={{ width: "100%", height: width < 800 ? 50 : 100 }}
        onPress={async () => {
          this.setState({ spinner: true, actionStatus: 3 });
          this.state.actionStatus = 3;
          this.setEmployerStatus();
        }}
      >
        <Text size={20} color={argonTheme.COLORS.WHITE}>
          Pause beenden
        </Text>
      </Button>
    );
  };

  actionsScreen = () => {
    return (
      <Block center style={{ width: "90%" }}>
        {this.state.loginBtn ? this.loginBtn() : false}
        {this.state.logoutBtn ? this.logoutBtn() : false}
        {this.state.pauseStartBtn ? this.pauseStartBtn() : false}
        {this.state.pauseEndBtn ? this.pauseEndBtn() : false}
        {this.state.backBtn ? this.backBtn() : false}
      </Block>
    );
  };

  infoBtn = () => {
    return (
      <TouchableOpacity
        // style={{ marginLeft: 10, width: "100%" }}
        onPress={async () => {
          this.setState({ spinner: true, actionsScreen: false });
          const apiKey = await AsyncStorage.getItem("@api_key");
          const instance = await AsyncStorage.getItem("@instance");

          if (apiKey !== null && instance !== null) {
            await getEmployerMonthData(
              this.state.contact_id,
              apiKey,
              instance
            ).then((res) => {
              this.state.infoData = res;
              this.setState({
                spinner: false,
                infoScreen: true,
                showLogo: false,
                infoBtn: false,
                noteBtn: false,
              });
            });
          } else {
            return;
          }
        }}
      >
        <Icon
          size={width < 800 ? 20 : 30}
          color="#ADB5BD"
          name="clockcircleo"
          family="AntDesign"
          style={{ marginLeft: 10, padding: 3 }}
        />
      </TouchableOpacity>
    );
  };

  noteBtn = () => {
    return (
      <TouchableOpacity
        onPress={async () => {
          this.setState({ showNoteAlert: true });
        }}
      >
        <Icon
          size={width < 800 ? 20 : 30}
          color="#ADB5BD"
          name="sticky-note-2"
          family="MaterialIcons"
          style={{ marginLeft: 10, padding: 3 }}
        />
      </TouchableOpacity>
    );
  };

  infoScreen = () => {
    let remaining_holiday = 0;
    let yearly_data = this.state.infoData.data2.yearly;
    yearly_data.map((row, index) => {
      if (row.id === this.state.contact_id) {
        remaining_holiday = row.vacTotal - row.reason_2;
        remaining_holiday =
          remaining_holiday + (remaining_holiday === 1 ? " Tag" : " Tage");
      }
    });

    return (
      <Block center style={{ width: "100%" }}>
        <Block
          style={{
            flex: 1,
            alignSelf: "stretch",
            flexDirection: "row",
            width: "100%",
            marginBottom: 20,
          }}
        >
          <Block style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
              Arbeitsstunden
            </Text>
            <Text style={{ color: "#fff", fontSize: 16 }}>
              {this.state.infoData.data2.hoursTotalTime}
            </Text>
          </Block>
          {this.state.infoData.data2.hoursTodoTime !== "00:00" ? (
            <Block style={{ flex: 1 }}>
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                Sollstunden
              </Text>
              <Text style={{ color: "#fff", fontSize: 16 }}>
                {this.state.infoData.data2.hoursTodoTime}
              </Text>
            </Block>
          ) : (
            false
          )}
          <Block style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
              Resturlaub
            </Text>
            <Text style={{ color: "#fff", fontSize: 16 }}>
              {remaining_holiday}
            </Text>
          </Block>
        </Block>
        <Table rows={this.state.infoData.data.dataSet.data} />
        <Block center style={{ width: "100%", marginTop: 10 }}>
          {this.state.backBtn
            ? this.backBtn({
                actionsScreen: true,
                infoScreen: false,
                showLogo: true,
                infoBtn: true,
                noteBtn: true,
              })
            : false}
        </Block>
      </Block>
    );
  };

  backBtn = (states) => {
    let backStates = states ? states : this.state.backStates;
    return (
      <Button
        style={{
          width: "100%",
          height: width < 800 ? 50 : 100,
          backgroundColor: "#353b4a",
          borderRadius: 0,
        }}
        onPress={() => {
          Keyboard.dismiss();
          this.setState(backStates);
        }}
      >
        <Text size={20} color={argonTheme.COLORS.WHITE}>
          zurück
        </Text>
      </Button>
    );
  };

  welcomeText = () => {
    return (
      <Block center style={{ width: "100%", marginBottom: 20 }}>
        <Block center style={{ width: "50%" }}>
          <Text size={30} color={argonTheme.COLORS.WHITE}>
            Hallo {this.state.contact_name}
          </Text>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              // borderWidth: 1,
              // borderColor: "green",
              width: 100,
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <Text size={30} color={argonTheme.COLORS.WHITE}>
              {this.state.infoBtn ? this.infoBtn() : false}
            </Text>
            <Text size={30} color={argonTheme.COLORS.WHITE}>
              {this.state.noteBtn ? this.noteBtn() : false}
            </Text>
          </View>
        </Block>
      </Block>
    );
  };

  versionInfo = () => {
    return (
      <TouchableOpacity
        style={{ marginLeft: 1, width: "100%" }}
        onPress={() => {
          this.props.navigation.navigate("Settings");
        }}
      >
        <Text
          style={{ marginTop: 5 }}
          size={width < 800 ? 10 : 10}
          color={argonTheme.COLORS.MUTED}
        >
          V{Constants.manifest.version}
        </Text>
      </TouchableOpacity>
    );
  };

  settingsBtn = () => {
    return (
      <TouchableOpacity
        style={{ marginLeft: 1 }}
        onPress={() => {
          this.props.navigation.navigate("Settings");
        }}
      >
        <Icon
          size={width < 800 ? 20 : 25}
          color="#ADB5BD"
          name="settings"
          family="MaterialIcons"
          style={{ marginLeft: 5, padding: 3 }}
        />
      </TouchableOpacity>
    );
  };

  currentTime = () => {
    return (
      <Block center style={{ textAlign: "right" }}>
        <Text size={width < 700 ? 14 : 18} color={argonTheme.COLORS.MUTED}>
          {this.state.curDay}, {this.state.curDate}
        </Text>
        <TouchableOpacity
          hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}
          onPress={() => {
            this.props.navigation.navigate("Settings");
          }}
        >
          <Text
            size={width < 700 ? 30 : 50}
            color={argonTheme.COLORS.MUTED}
            style={{ fontWeight: "bold" }}
          >
            {this.state.curTime}
          </Text>
        </TouchableOpacity>
      </Block>
    );
  };

  getNewLocation = async () => {
    if (!this.location_permission)
      this.location_permission =
        await Location.requestForegroundPermissionsAsync();

    if (this.location_permission.status === "granted") {
      try {
        await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Highest, distanceInterval: 10 },
          (location) => {
            this.state.latitude = location.coords.latitude;
            this.state.longitude = location.coords.longitude;
            this.loaction_timestamp = Date.parse(new Date());
          }
        );
        //let location = await Location.getLastKnownPositionAsync({maxAge:300000,requiredAccuracy : 50});
      } catch (error) {
        sendReport(error, "QS006");
      }
    }
  };

  Logo = () => {
    return this.state.showLogo ? (
      <Block
        center
        style={{
          width: "70%",
          height: width < 700 ? "18%" : "25%",
          marginBottom: width < 700 ? 10 : 20,
          marginTop: width < 700 ? 10 : 20,
        }}
      >
        <Image
          onError={() => this.setState({ logo: Images.QSLogoWhite })}
          source={this.state.logo}
          style={{ resizeMode: "contain", height: "100%", width: "100%" }}
        />
      </Block>
    ) : (
      false
    );
  };

  UserImage = () => {
    console.log(this.state.showLogo);
    console.log(this.image_uri);
    return !this.state.showLogo && this.state.actionsScreen ? (
      <Block
        center
        style={{
          width: "70%",
          height: width < 700 ? "18%" : "25%",
          marginBottom: width < 700 ? 10 : 20,
          marginTop: width < 700 ? 10 : 20,
        }}
      >
        <Image
          source={{ uri: this.image_uri }}
          style={{ resizeMode: "contain", height: "100%", width: "100%" }}
        />
      </Block>
    ) : (
      false
    );
  };

  render() {
    return (
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, backgroundColor: "#282d38" }}
        keyboardShouldPersistTaps="always"
      >
        <LinearGradient
          // Background Linear Gradient
          locations={[0.3, 0.6]}
          colors={["#282d38", "#0a0a09"]}
          style={styles.background}
        />
        <Block style={{ marginBottom: width < 700 ? 5 : 10 }}>
          <Block style={{ width: "100%", padding: 7 }}>
            <DateAndTime />
          </Block>
        </Block>
        <SafeAreaView style={styles.container}>
          {global.camera_on ? (
            <Camera
              style={styles.container}
              type={Camera.Constants.Type.front}
              ref={(ref) => {
                this.camera = ref;
              }}
              onCameraReady={() => {
                console.log("camera Ready");
              }}
              onMountError={(error) => {
                sendReport(error);
                console.log("cammera error", error);
              }}
            />
          ) : (
            false
          )}
        </SafeAreaView>
        {this.Logo()}
        {this.UserImage()}
        <Block>{this.state.welcomeText ? this.welcomeText() : false}</Block>
        <Block flex center>
          <StatusBar
            hidden={Platform.OS == "ios" ? false : true}
            translucent={true}
          />
          <Block
            middle
            center
            style={{
              width: width < 800 ? width * 0.9 : width * 0.8,
              borderRadius: 5,
            }}
          >
            {this.state.passwordScreen ? this.passwordScreen() : false}
            {this.state.actionsScreen ? this.actionsScreen() : false}
            {this.state.infoScreen ? this.infoScreen() : false}
          </Block>
        </Block>
        <Spinner
          visible={this.state.spinner}
          textContent={""}
          size={"large"}
          textStyle={{ color: "#fff" }}
        />
        <AwesomeAlert
          show={this.state.showSuccessAlert}
          showProgress={false}
          title={this.state.titleSuccessAlert}
          message={this.state.messageSuccessAlert}
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={false}
          showCancelButton={true}
          showConfirmButton={this.state.confirmBtnSuccessAlert}
          cancelText="Ok"
          confirmText={this.state.confirmTextSuccessAlert}
          cancelButtonColor="#3C6528"
          confirmButtonColor="#3C6528"
          contentContainerStyle={{
            width: width < 800 ? width * 0.9 : width * 0.5,
          }}
          actionContainerStyle={{ itemAlign: "center" }}
          cancelButtonStyle={{ width: 100 }}
          cancelButtonTextStyle={{ textAlign: "center", fontSize: 20 }}
          titleStyle={{ fontSize: 25, textAlign: "center" }}
          messageStyle={{ fontSize: 20, textAlign: "center" }}
          onDismiss={() => {
            let _this = this;
            setTimeout(function () {
              _this.setState(_this.state.backStates);
            }, 300);
          }}
          onCancelPressed={() => {
            this.setState({ showSuccessAlert: false });
          }}
        />
        <AwesomeAlert
          show={this.state.showNoteAlert}
          showProgress={false}
          title={""}
          customView={
            <Input
              placeholder={"Notiz schreiben"}
              multiline={true}
              numberOfLines={6}
              style={{ height: 200, width: 300 }}
              iconContent={false}
              autoFocus={true}
              keyboardAppearance={"dark"}
              onChangeText={(note) => {
                this.state.note = note;
              }}
              onSubmitEditing={() => {}}
            />
          }
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={false}
          showCancelButton={true}
          showConfirmButton={true}
          cancelText="abbrechen"
          confirmText={"ok"}
          cancelButtonColor="#f4f9fc"
          confirmButtonColor="#3C6528"
          contentContainerStyle={{
            width: width < 800 ? width * 0.9 : width * 0.5,
          }}
          actionContainerStyle={{ itemAlign: "center" }}
          cancelButtonStyle={{ width: 100 }}
          cancelButtonTextStyle={{
            textAlign: "center",
            fontSize: 15,
            color: "#585e61",
          }}
          confirmButtonStyle={{ width: 100 }}
          confirmButtonTextStyle={{ textAlign: "center", fontSize: 15 }}
          titleStyle={{ fontSize: 25, textAlign: "center" }}
          messageStyle={{ fontSize: 20, textAlign: "center" }}
          onCancelPressed={() => {
            this.setState({ showNoteAlert: false, note: false });
          }}
          onConfirmPressed={() => {
            this.setState({ showNoteAlert: false });
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
          confirmText={"weiter"}
          cancelButtonColor="#a53012"
          confirmButtonColor="#3C6528"
          contentContainerStyle={{
            width: width < 800 ? width * 0.9 : width * 0.5,
          }}
          actionContainerStyle={{ itemAlign: "center" }}
          cancelButtonStyle={{ width: 100 }}
          cancelButtonTextStyle={{ textAlign: "center", fontSize: 20 }}
          titleStyle={{ fontSize: 25, textAlign: "center" }}
          messageStyle={{ fontSize: 20, textAlign: "center" }}
          onCancelPressed={() => {
            this.setState({
              messageErrorAlert: "Es ist ein Fehler aufgetreten",
              showErrorAlert: false,
            });
            let _this = this;
            setTimeout(function () {
              _this.setState(_this.state.backStates);
            }, 300);
          }}
          onConfirmPressed={() => {
            this.hideAlert();
            let navigation = this.props.navigation;
            navigation.navigate("App", { props: this.state.props });
          }}
        />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: "none",
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
    width: width < 700 ? width * 0.9 : width * 0.6,
    height: height < 812 ? height * 0.6 : height * 0.5,
    backgroundColor: "#F4F5F7",
    borderRadius: 4,
    shadowColor: argonTheme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 1,
    overflow: "hidden",
  },
  socialConnect: {
    flex: height < 812 ? 0.5 : 0.5,
    maxHeight: height < 812 ? height * 0.6 : height * 0.6,
    maxWidth: width < 700 ? width * 0.9 : width * 0.9,
    backgroundColor: argonTheme.COLORS.WHITE,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(136, 152, 170, 0.3)",
  },
  socialButtons: {
    width: 120,
    height: 40,
    backgroundColor: "#fff",
    shadowColor: argonTheme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 1,
  },
  socialTextButtons: {
    color: argonTheme.COLORS.PRIMARY,
    fontWeight: "800",
    fontSize: 14,
  },
  inputIcons: {
    marginLeft: 12,
    marginRight: 30,
  },
  passwordCheck: {
    paddingLeft: 2,
    paddingTop: 6,
    paddingBottom: 15,
  },
  createButton: {
    width: width * 0.5,
    marginTop: 25,
    marginBottom: 40,
  },
  qsImage: {
    width: "75%",
    height: "50%",
    zIndex: 9999,
  },
  LoginContainer: {
    marginTop: 20,
  },
  InputsContainer: {
    width: width < 700 ? width * 0.7 : width * 0.5,
    marginTop: 10,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: height,
  },
});

export default TimerecordingV2;
