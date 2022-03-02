import {sendReport} from "./SendQSReports";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Network from 'expo-network';

let instance = false;
let api_key = false;
let device_uid = false;
let networkState = false;
let networkIsConnected = false;

async function setStorage(name,value){
    try {
        await AsyncStorage.setItem(name, value)
    } catch (e) {
        sendReport(e,'QS00101')
        // saving error
    }
}

async function getStorage(name){
    try {
        const value = await AsyncStorage.getItem(name)
        if(value !== null) {
            return value;
        }
    } catch (e) {
        sendReport(e,'QS00102')
        return {error:e}
    }
}

async function getInstance(){
    return await getStorage('@instance');
}

async function getApiKey(){
    return await getStorage('@api_key');
}

async function getDeviceUID(){
    return await getStorage('@device_uid');
}

async function checkNetworkIsConnected(){
    networkState = await Network.getNetworkStateAsync();
    networkIsConnected = networkState.isConnected;
    return networkIsConnected
}

init();
async function init(){
    networkState = await Network.getNetworkStateAsync();
    networkIsConnected = networkState.isConnected;
    instance = await getInstance();
    api_key = await getApiKey();
    device_uid = await getDeviceUID();
}


export async function getEmployerMonthData(contact_id){
    await checkNetworkIsConnected();
    let responseDataa = false;
    if(networkIsConnected){
        let data = {
            api_key: api_key,
            device_uid: device_uid,
            employer_id: contact_id,
        }
        try {
            await fetch('https://'+instance+'.quicksteps.ch/api/time/getEmployerInfoData',{
                method:'POST',
                headers: {
                    'Accept':       'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
                .then((response) => response.json())
                .then((responseData) => {
                    responseDataa = responseData;
                })
                .catch(error => {
                    sendReport(error,'QS0081')
                });
        }catch (error){
            sendReport(error,'QS008')
        }
    }

    return responseDataa;
}

export async function checkEmployerPassword(password){
    await checkNetworkIsConnected();
    let responseDataa = false;
    if(networkIsConnected) {
        let data = {
            api_key: api_key,
            device_uid: device_uid,
            password: password,
        }

        try {
            await fetch('https://' + instance + '.quicksteps.ch/api/time/checkEmployerPassword', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
                .then((response) => response.json())
                .then((responseData) => {
                    responseDataa = responseData;
                })
                .catch(error => {
                    sendReport(error, 'QS0011')
                });
        } catch (error) {
            sendReport(error, 'QS001')
        }
    }

    return responseDataa;
}

export async function setEmployerStatus(params){
    await checkNetworkIsConnected();
    let responseDataa = false;
    if(networkIsConnected) {

        let data = {
            api_key: api_key,
            device_uid: device_uid,
            contact_id: params.contact_id,
            longitude: params.longitude,
            latitude: params.latitude,
            status: params.status,
            base64: params.base64,
            note: params.note
        }

        try {
            await fetch('https://' + instance + '.quicksteps.ch/api/time/setEmployerStatus', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
                .then((response) => response.json())
                .then((responseData) => {
                    console.log(responseData)
                    responseDataa = responseData;
                })
                .catch(error => {
                    sendReport(error, 'QS0021')
                });
        } catch (error) {
            sendReport(error, 'QS002')
        }
    }

    return responseDataa;
}