import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

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

const app_version = () => {
    return Constants.manifest.version;
}

const app_name = () => {
    return Constants.manifest.slug;
}

export async function sendReport(report,error_code){
    report = report.toString();
    const instance = await getStorage('@instance');
    const api_key = await getStorage('@api_key');
    const device_uid = await getStorage('@device_uid');
    let data = {
        report:report,
        instance:instance,
        device_uid:device_uid,
        api_key:api_key,
        app_version:app_version(),
        app_name:app_name(),
    }

    error_code ? data.error_code = error_code:false;

    fetch('https://boot4tester.quicksteps.ch/qsapi/standard/report',{
        method:'POST',
        headers: {
            'Accept':       'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
        .then((response) => response.json())
        .then((responseData) => {

        })
        .catch((error) => {
            //sendReport(error);
        })
}
