import {Block, Text} from "galio-framework";
import {argonTheme} from "../../constants";
import {Dimensions, TouchableOpacity} from "react-native";
import React, {useEffect, useState} from "react";
const { width , height} = Dimensions.get("screen");

const DateAndTime = () => {
    const daysArray = ['sonntag', 'montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag'];
    const [dateTime, setDateTime] = useState({
        curDate:'0000-00-00',
        curTime:'00:00',
        curDay:'',
    });

    useEffect(()=>{
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

            let curDay = false;
            let curdate = dateday+'.'+month+'.'+date.getFullYear();
            let curtime = hour+':'+minutes+':'+seconds;

            daysArray.map((item, key) => {
                if (key === new Date().getDay()) {
                    curDay = item.toUpperCase();
                }
            })
            setDateTime({
                curDate : curdate,
                curTime : curtime,
                curDay : curDay
            })
        }, 1000)
    },[])

    return (
        <Block center style={{textAlign:'right'}}>
            <Text
                size={ width < 700 ? 14:18}
                color={argonTheme.COLORS.MUTED}
            >{dateTime.curDay}, {dateTime.curDate}</Text>
            <TouchableOpacity
                hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}
                onPress={()=>{
                    this.props.navigation.navigate('Settings')
                }}>
                <Text
                    size={ width < 700 ? 30 :50}
                    color={argonTheme.COLORS.MUTED}
                    style={{fontWeight:'bold'}}
                >{dateTime.curTime}</Text>
            </TouchableOpacity>
        </Block>
    )
}

export default DateAndTime;