import React from "react";
import {Easing, Animated, Dimensions, Platform} from "react-native";

import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// screens
// import Onboarding from "../screens/Onboarding";
import Pro from "../screens/Pro";
import Timerecording from "../screens/Timerecording";
// settings
import SettingsScreen from "../screens/Settings";
import NotificationsScreen from "../screens/Notifications";
// Notifications
import PersonalNotifications from "../screens/PersonalNotifications";
import SystemNotifications from "../screens/SystemNotifications";

// drawer
import CustomDrawerContent from "./Menu";

// header for screens
import { Icon, Header } from "../components";
import { argonTheme, tabs } from "../constants";
import QSWebView from "../screens/QSWebView";
import TimerecordingV2 from "../screens/TimerecordingV2";
import {theme} from "galio-framework";
import Constants from "expo-constants";

const { width } = Dimensions.get("screen");

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

function NotificationsStack(props) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === "Personal") {
            iconName = "user";
          } else if (route.name === "System") {
            iconName = "database";
          }
          // You can return any component that you like here!
          return (
            <Icon
              name={iconName}
              family="entypo"
              size={22}
              color={color}
              style={{ marginTop: 10 }}
            />
          );
        }
      })}
      tabBarOptions={{
        activeTintColor: argonTheme.COLORS.PRIMARY,
        inactiveTintColor: "gray",
        labelStyle: {
          fontFamily: "open-sans-regular"
        }
      }}
    >
      <Tab.Screen name="Personal" component={PersonalNotifications} />
      <Tab.Screen name="System" component={SystemNotifications} />
    </Tab.Navigator>
  );
}

function TimerecordingStack(props) {
    return (
        <Stack.Navigator mode="card" headerMode="screen" screenOptions={{
            cardStyle: { backgroundColor: '#282d38' }
        }}>
            <Stack.Screen
                name="Timerecording"
                component={TimerecordingV2}
                bgColor={argonTheme.COLORS.ACTIVE}
                options={{
                    header: ({ navigation, scene }) => (
                        <Header
                            title={""}
                            navigation={navigation}
                            scene={scene}
                            bgColor={'#282d38'}
                            titleColor="white"
                            iconColor={argonTheme.COLORS.MUTED}
                            titleStyle={{color:argonTheme.COLORS.MUTED, width: '100%'}}
                        />
                    ),
                    cardStyle: { backgroundColor: '#282d38' }
                }}
                initialParams={{props:props.route.params.props}}
            />
        </Stack.Navigator>
    );
}

function SettingsStack(props) {
  return (
    <Stack.Navigator mode="card" headerMode="screen">
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
            header: ({ navigation, scene }) => (
                <Header
                    title="Einstellungen"
                    navigation={navigation}
                    scene={scene}
                    bgColor={'#282d38'}
                    titleColor="white"
                    iconColor="white"
                />
            ),
            cardStyle: { backgroundColor: "#F8F9FE" }
        }}
      />

      <Stack.Screen
        name="NotificationsSettings"
        component={NotificationsScreen}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              back
              title="Notifications"
              scene={scene}
              navigation={navigation}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" }
        }}
      />

      <Stack.Screen
        name="Notifications"
        component={NotificationsStack}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              back
              title="Notifications"
              scene={scene}
              navigation={navigation}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" }
        }}
      />
    </Stack.Navigator>
  );
}

function AppStack(props) {
  return (
    <Drawer.Navigator
      style={{ flex: 1 }}
      drawerContent={props => <CustomDrawerContent {...props} />}
      drawerStyle={{
        backgroundColor: "#282d38",
        width: width * 0.8
      }}
      drawerContentOptions={{
        activeTintcolor: "#282d38",
        inactiveTintColor: "#282d38",
        activeBackgroundColor: "#282d38",
          itemStyle: {
          width: width * 0.75,
          backgroundColor: "#282d38",
          paddingVertical: 16,
          paddingHorizonal: 12,
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center",
          overflow: "hidden"
        },
        labelStyle: {
          fontSize: 18,
          marginLeft: 12,
          fontWeight: "normal"
        }
      }}
      initialRouteName="Timerecording"
    >
        <Drawer.Screen name="Timerecording" component={TimerecordingStack} initialParams={{props:props.route.params.props}} />
      <Drawer.Screen name="Settings" component={SettingsStack} initialParams={{props:props.route.params.props}}/>
    </Drawer.Navigator>
  );
}

export function OnboardingStack(props) {
  return (
    <Stack.Navigator mode="card" headerMode="none" screenOptions={{cardStyle: { backgroundColor: '#282d38' }}}>
        <Stack.Screen
        name="Onboarding"
        component={Pro}
        option={{
          headerTransparent: true
        }}
        initialParams={{props: props.params}}
      />
        <Stack.Screen name="QSWebView" component={QSWebView} initialParams={{props:props.params}}/>
        <Stack.Screen name="App" component={AppStack} initialParams={{props:props.params}} />

    </Stack.Navigator>
  );
}

export function RealAppStack(props) {
    return (
        <Stack.Navigator mode="card" headerMode="none" screenOptions={{headerShown: false}}>
            <Stack.Screen name="App" component={AppStack} initialParams={{props:props.params}}/>
        </Stack.Navigator>
    );
}

export function QSWebViewStack(props) {
    return (
        <Stack.Navigator initial={'App'} mode="card" headerMode="none" screenOptions={{headerShown: false,cardStyle: { backgroundColor: '#282d38' }}} >
            <Stack.Screen name="App" component={AppStack} initialParams={{props:props.params}}/>
            <Stack.Screen name="QSWebView" component={QSWebView} initialParams={{props:props.params}}/>
            <Stack.Screen
                name="Onboarding"
                component={Pro}
                option={{
                    headerTransparent: true
                }}
                initialParams={{props: props.params}}
            />
        </Stack.Navigator>
    );
}
