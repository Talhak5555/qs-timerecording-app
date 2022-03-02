import React from "react";
import {StyleSheet, Dimensions, ScrollView, SafeAreaView, View, TouchableOpacity} from "react-native";
import {Block, theme, Text, Toast} from "galio-framework";

import {Camera} from "expo-camera";
import Button from "../components/Button";
const { width , height} = Dimensions.get("screen");

class CameraScreen extends React.Component {
   state = {
     camera:false
   }

  takePicture = async () => {
    if (this.camera) {
      const options = { quality: 0.5, base64: true, skipProcessing: true };
      const data = await this.camera.takePictureAsync(options);
      console.log("picture base64sss", data);
      const base64 = data.base64;

      this.camera.resumePreview();
    }else{
      console.log("picture");
    }


  };

  render() {
    const {takePhoto} = this.props

    return (
        <>
        <SafeAreaView style={styles.container}>
          <Camera
              ref={ref => {
                this.camera = ref;
              }}
              style={styles.container}
              type={Camera.Constants.Type.front}
              flashMode={Camera.Constants.FlashMode.on}
              onMountError={(error) => {
                console.log("cammera error", error);
              }}
          />
          <View style={styles.container}>
            <View style={styles.control}>
              <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={()=>{this.takePicture()}}
                  style={styles.capture}
              />
            </View>
          </View>
        </SafeAreaView>
          <Button onPress={()=>this.takePicture()}>
            <Text>Kek</Text>
          </Button>
        </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display:'none',
    opacity: 0,
    ...StyleSheet.absoluteFillObject,
  },
  media: {
    ...StyleSheet.absoluteFillObject,
  },
  closeCross: {
    width: "68%",
    height: 1,
    backgroundColor: "black",
  },
  control: {
    position: "absolute",
    flexDirection: "row",
    bottom: 38,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  capture: {
    backgroundColor: "#f5f6f5",
    height: Math.floor(height * 0.09),
    width: Math.floor(height * 0.09),
    borderRadius: Math.floor(Math.floor(height * 0.09) / 2),
    marginHorizontal: 31,
  },
  recordIndicatorContainer: {
    flexDirection: "row",
    position: "absolute",
    top: 25,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    opacity: 0.7,
  },
  recordTitle: {
    fontSize: 14,
    color: "#ffffff",
    textAlign: "center",
  },
  recordDot: {
    borderRadius: 3,
    height: 6,
    width: 6,
    backgroundColor: "#ff0000",
    marginHorizontal: 5,
  },
  text: {
    color: "#fff",
  },
});

export default CameraScreen;
