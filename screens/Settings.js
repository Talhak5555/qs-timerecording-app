import React from "react";
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  View, Dimensions, Alert
} from "react-native";
import { Block, Text, theme, Icon } from "galio-framework";
import { Switch } from "../components";

import argonTheme from "../constants/Theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import {sendReport} from "../components/SendQSReports";
import * as Updates from 'expo-updates';
import AwesomeAlert from "react-native-awesome-alerts";
import * as Location from "expo-location";
const { width , height} = Dimensions.get("screen");

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

export default class Settings extends React.Component {
  state = {
    isAlert:false,
    titleAlert:'',
    messageAlert:'',
    showCancelButtonAlert:false,
    showConfirmButtonAlert:false,
    cancelTextAlert:'',
    confirmTextAlert:'',
    camera_on:global.camera_on,
    location_on:global.location_on,
    location:false,
    instance:false,
  };

  constructor(props) {
    super(props);
    this.getAsync()
  }

  getAsync = async () => {
    this.setState({instance:await getStorage('@instance')});
  }


  toggleSwitch = switchNumber =>
      this.setState({ [switchNumber]: !this.state[switchNumber] });

  renderItem = ({ item }) => {
    const { navigate } = this.props.navigation;

    switch (item.type) {
      case "switch":
        return (
            <Block row middle space="between" style={styles.rows}>
              <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color="#525F7F">{item.title}</Text>
              <Switch
                  onValueChange={() => this.toggleSwitch(item.id)}
                  value={this.state[item.id]}
              />
            </Block>
        );
      case "button":
        return (
            <Block style={styles.rows}>
              <TouchableOpacity onPress={() => (item.id !== 'Payment' && item.id !== 'gift') && navigate(item.id)}>
                <Block row middle space="between" style={{ paddingTop: 7 }}>
                  <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color="#525F7F">{item.title}</Text>
                  <Icon
                      name="angle-right"
                      family="font-awesome"
                      style={{ paddingRight: 5 }}
                  />
                </Block>
              </TouchableOpacity>
            </Block>
        );
      case "button-action":
        return (
            <Block style={styles.rows}>
              <TouchableOpacity onPress={() => setStorage('@app_intro','false') && navigate('Onboarding')}>
                <Block row middle space="between" style={{ paddingTop: 7 }}>
                  <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color="#525F7F">{item.title}</Text>
                </Block>
              </TouchableOpacity>
            </Block>
        );
      case "update-action":
        return (
            <Block style={styles.rows}>
              <TouchableOpacity onPress={async () => {
                try {
                  const update = await Updates.checkForUpdateAsync();
                  console.log(update)
                  if (update.isAvailable) {
                    this.setState({
                      isAlert:true,
                      titleAlert:'Neue Version verfügbar',
                      messageAlert:'Möchten Sie es installieren?',
                      showCancelButtonAlert:true,
                      showConfirmButtonAlert:true,
                      cancelTextAlert:'abbrechen',
                      confirmTextAlert:'installieren',
                    })
                  }else {
                    this.setState({
                      isAlert:true,
                      titleAlert:'Sie haben die aktuellste Version',
                      showCancelButtonAlert:true,
                      cancelTextAlert:'Ok',
                    })
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
              }}>
                <Block row middle space="between" style={{ paddingTop: 7 }}>
                  <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color="#525F7F">{item.title}</Text>
                </Block>
              </TouchableOpacity>
            </Block>
        );
      case "switch-camera":
        return (
            <Block row middle space="between" style={styles.rows}>
              <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color="#525F7F">{item.title}</Text>
              <Switch
                  onValueChange={(status) => {
                    this.toggleSwitch(item.id);
                    global.camera_on = status;
                  }}
                  value={this.state[item.id]}
              />
            </Block>
        );
      case "switch-location":
        return (
            <Block>
              <Block row middle space="between" style={styles.rows}>
                <TouchableOpacity onPress={async () => {
                  let locationperm = await Location.requestForegroundPermissionsAsync();
                  let locationenabled = await Location.hasServicesEnabledAsync();
                  if(locationperm.status === 'granted'&&locationenabled){
                    let location = await Location.watchPositionAsync({accuracy: Location.Accuracy.BestForNavigation,distanceInterval:10},(response)=>{
                      this.setState({location:response})
                    });
                  }else if(!locationenabled){
                    Alert.alert(
                        "Location not enabled",
                        false,
                        [
                          { text: "OK", onPress: () => {
                              console.log("OK Pressed")
                            } }
                        ]
                    )
                  }
                }}>
                  <Text style={{ fontFamily: 'open-sans-regular' }} size={14} color="#525F7F">{item.title}</Text>
                </TouchableOpacity>
                <Switch
                    onValueChange={(status) => {
                      this.toggleSwitch(item.id);
                      global.location_on = status;
                    }}
                    value={this.state[item.id]}
                />
              </Block>
              <Block row middle style={styles.rows}>
                <Text>{this.state.location? (
                    'Longitude: '+this.state.location.coords.longitude+
                    ' Latitude:'+this.state.location.coords.latitude
                ):false}</Text>
              </Block>
            </Block>
        );

    }
  };

  render() {
    const recommended = [
      { title: "Use FaceID to sign in", id: "face", type: "switch" },
      { title: "Auto-Lock security", id: "autolock", type: "switch" },
      { title: "Notifications", id: "NotificationsSettings", type: "button" }
    ];

    const payment = [
      { title: "Manage Payment Options", id: "Payment", type: "button" },
      { title: "Manage Gift Cards", id: "gift", type: "button" }
    ];

    const privacy = [
      { title: "User Agreement", id: "Agreement", type: "button" },
      { title: "Privacy", id: "Privacy", type: "button" },
      { title: "About", id: "About", type: "button" }
    ]

    const config = [
      { title: "Kamera", id: "camera_on", type: "switch-camera" },
      { title: "Standort", id: "location_on", type: "switch-location" },
    ]


    const app = [
      { title: "App auf Update überprüfen", id: "app_update", type: "update-action" },
      { title: "App zurücksetzen", id: "app_reset", type: "button-action" },
    ];

    return (
        <View
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.settings}
        >
          <Block style={styles.title}>
            <FlatList
                data={config}
                keyExtractor={(item, index) => item.id}
                renderItem={this.renderItem}
            />
          </Block>
          <Block style={styles.title}>
            <FlatList
                data={app}
                keyExtractor={(item, index) => item.id}
                renderItem={this.renderItem}
            />
          </Block>
          <Block style={styles.title}>
            <Text style={{marginLeft:20}}>Instanz: {this.state.instance}</Text>
          </Block>
          <Block style={styles.title}>
            <Text style={{marginLeft:20}}>Version {Constants.manifest.version}</Text>
          </Block>
          <AwesomeAlert
              show={this.state.isAlert}
              showProgress={false}
              title={this.state.titleAlert}
              message={this.state.messageAlert}
              closeOnTouchOutside={false}
              closeOnHardwareBackPress={false}
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
        </View>
    );
  }
}

const styles = StyleSheet.create({
  settings: {
    paddingVertical: theme.SIZES.BASE / 3
  },
  title: {
    paddingTop: theme.SIZES.BASE,
    paddingBottom: theme.SIZES.BASE / 2
  },
  rows: {
    height: theme.SIZES.BASE * 2,
    paddingHorizontal: theme.SIZES.BASE,
    marginBottom: theme.SIZES.BASE / 2
  }
});
