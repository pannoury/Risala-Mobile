import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { View, Text, Image, StyleSheet } from "react-native";
import { chatReducer } from "../../../../src/redux/chat";
import removeEmojis from "../functions/removeEmojis";
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

import { globalStyles } from "../../../../src/styles/globalStyles";

export default function CallEvent({ value, index, locale, array, USER_DATA, current }){
    const dispatch = useDispatch();
    const chat_settings = useSelector((state) => state.chatReducer.value.chat_settings)

    var counter = current.members.find(e => e.id !== USER_DATA.account_id)

    var infoObject = JSON.parse(value.text)
    var isSender = value.sender_id === USER_DATA.account_id ? true : false
    var isMissed = infoObject.isMissed ? true : false

    if(infoObject.time){
        if(infoObject.time.substring(0,2) === "00"){ // 0 hours
            var newTime = infoObject.time.substring(3, 10)
            if(newTime.substring(0,2) === "00"){ // 0 minutes
                var newTime = newTime.substring(3, 5)
                if(newTime.substring(0) === "0"){
                    newTime = `${newTime.substring(1,3)} sec`
                } else {
                    newTime = `${newTime} sec`
                }
            } else {
                if(newTime.substring(0, 1) === "0"){
                    newTime = `${newTime.substring(1,2)} min`
                } else {
                    newTime = `${newTime} min`
                }
            }
        } else {
            var newTime = infoObject.time
        }
    }

    /********* Next/Previous message identifier *********/

    let previousMatch = false;
    let nextMatch = false;

    var sender = value.sender_id
    var senderTime = value.timestamp.substring(0, 10)

    // This section checks if the previous message was from the same sender, during the same date
    if(index !== 0 && array[index + 1]){
        //The previous message
        var previousSender = array[index - 1].sender_id
        var previousSenderTime = array[index - 1].timestamp.substring(0, 10)
        //The coming message
        var nextSender = array[index + 1] !== undefined ? array[index + 1].sender_id : undefined
        var nextSenderTime = array[index + 1] !== undefined ? array[index + 1].timestamp.substring(0, 10) : undefined

        var isPreviousEmoji = array[index - 1].text !== null ? removeEmojis(array[index - 1].text) : null
        var isNextEmoji = array[index + 1].text !== null ? removeEmojis(array[index +1].text) : null

        if(sender === previousSender && senderTime === previousSenderTime && (!array[index - 1].time_separator || array[index - 1].time_separator === 4) && isPreviousEmoji !== ""){
            previousMatch = true;
        }

        if(sender === nextSender && senderTime === nextSenderTime && (!array[index +1].time_separator || array[index +1].time_separator === 4) && isNextEmoji !== ""){
            nextMatch = true;
        }
    } else if(index !== 0){
        //The previous message
        var previousSender = array[index - 1].sender_id
        var previousSenderTime = array[index - 1].timestamp.substring(0, 10)

        var isPreviousEmoji = array[index - 1].text !== null ? removeEmojis(array[index - 1].text) : null

        if(sender === previousSender && senderTime === previousSenderTime && !array[index - 1].time_separator < 4 && isPreviousEmoji !== ""){
            previousMatch = true;
        }
    } else if(index === 0 && array[index + 1]){
        var isNextEmoji = array[index + 1].text !== null ? removeEmojis(array[index +1].text) : null
        
        //The coming message
        var nextSender = array[index + 1] !== undefined ? array[index + 1].sender_id : undefined
        var nextSenderTime = array[index + 1] !== undefined ? array[index + 1].timestamp.substring(0, 10) : undefined

        if(sender === nextSender && senderTime === nextSenderTime && (!array[index + 1].time_separator || array[index + 1].time_separator === 4) && isNextEmoji !== ""){
            nextMatch = true;
        }
    }

    const style = StyleSheet.create({
        listWrapper: {
            width: '100%', 
            justifyContent: isSender ? 'flex-end' : 'flex-start', 
            flexDirection: 'row', 
            alignItems: 'center'
        },
        callObjectWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: (nextMatch && !isSender) ? 40 : 0,
            marginBottom: nextMatch ? 4 : 0,
            backgroundColor: '#ffffff1a',
            borderRadius: 8,
            width: 150,
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 12,
            paddingRight: 12
        },
        callIcon: {
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isMissed ? globalStyles.colors.red : '#000',
            width: 30,
            height: 30,
            borderRadius: 15
        },
        smallIcon: {
            position: 'absolute',
            top: 6,
            right: 6,
        },
        smallIconVideo: {
            position: 'absolute',
            zIndex: 10,
            right: 11,
        }
    })

    return(
        <View
            id={value.message_id}
            className={value.sender_id === USER_DATA.account_id ? "sent-message call" : "recieved-message call"}
            title={value.timestamp}
            timestamp={value.timestamp}
            key={value.message_id}
            message_id={value.message_id}
            file={null}
            style={style.listWrapper}
        >
            {
                (!nextMatch && !isSender) &&
                <Image 
                    style={{width: 30, height: 30, borderRadius: 15, marginRight: 10}}
                    source={{uri: counter.profile_picture ? `https://risala.codenoury.se/${counter.profile_picture.substring(3)}` : "https://codenoury.se/assets/generic-profile-picture.png"}}
                />
            }
            <View 
                className="call-object-wrapper"
                style={style.callObjectWrapper}
            >
                {
                    (isSender) ?
                    <>
                        {
                            (infoObject.purpose === "call" && !isMissed) &&
                            <View className="event-icon" style={style.callIcon}>
                                <MaterialIcons name="call-made" size={10} color={'#fff'} style={style.smallIcon}/>
                                <MaterialIcons name="call" size={20} color={'#fff'}/>
                            </View>
                        }
                        {
                            (infoObject.purpose === "call" && isMissed) &&
                            <View className="event-icon missed" style={style.callIcon}>
                                <MaterialIcons name="close" size={10} color={'#fff'} style={style.smallIcon}/>
                                <MaterialIcons name="call" size={20} color={'#fff'}/>
                            </View>
                        }
                        {
                            (infoObject.purpose === "video" && !isMissed) &&
                            <View className="event-icon video" style={style.callIcon}>
                                <MaterialIcons name="call_made" size={10} color={'#fff'} style={style.smallIcon}/>
                                <MaterialIcons name="videocam" size={20} color={'#fff'}/>
                            </View>
                        }
                        {
                            (infoObject.purpose === "video" && isMissed) &&
                            <View className="event-icon video missed" style={style.callIcon}>
                                <MaterialIcons name="close" size={10} color={'#000'} style={style.smallIcon}/>
                                <MaterialIcons name="videocam" size={20} color={'#fff'}/>
                            </View>
                        }
                    </>
                    :
                    <>
                        {
                            (infoObject.purpose === "call" && !isMissed) &&
                            <View className="event-icon" style={style.callIcon}>
                                <MaterialIcons name="call-received" size={10} color={'#fff'} style={style.smallIcon}/>
                                <MaterialIcons name="call" size={20} color={'#fff'}/>
                            </View>
                        }
                        {
                            (infoObject.purpose === "call" && isMissed) &&
                            <View className="event-icon missed" style={style.callIcon}>
                                <MaterialIcons name="close" size={10} color={'#fff'} style={style.smallIcon}/>
                                <MaterialIcons name="call" size={20} color={'#fff'}/>
                            </View>
                        }
                        {
                            (infoObject.purpose === "video" && !isMissed) &&
                            <View className="event-icon video" style={style.callIcon}>
                                <MaterialIcons 
                                    name="call-received" 
                                    size={12} 
                                    color={globalStyles.colors.black} 
                                    style={style.smallIconVideo}
                                />
                                <MaterialIcons name="videocam" size={20} color={'#fff'}/>
                            </View>
                        }
                        {
                            (infoObject.purpose === "video" && isMissed) &&
                            <View className="event-icon video missed" style={style.callIcon}>
                                <MaterialIcons name="close" size={10} color={globalStyles.colors.red} style={style.smallIconVideo}/>
                                <MaterialIcons name="videocam" size={20} color={'#fff'}/>
                            </View>
                        }
                    </>
                }
                <View className="event-info" style={{marginLeft: 20}}>
                    <Text style={{color: '#fff', fontWeight: '700'}}>
                        {
                            (infoObject.purpose === "call" && !isMissed) &&
                            "Audio call"
                        }
                        {
                            infoObject.purpose !== "call" && !isMissed &&
                            "Video call"
                        }
                        {
                            infoObject.isMissed &&
                            "Missed call"
                        }
                    </Text>
                    <Text style={{color: globalStyles.colors.white_1}}>
                        {
                            infoObject.isMissed &&
                            value.timestamp.substring(11,16)
                        }
                        {
                            (infoObject.time !== "" && !infoObject.isMissed)&&
                            newTime
                        }
                        {
                            (infoObject.time === "" && !infoObject.isMissed)&&
                            value.timestamp.substring(11,16)
                        }
                    </Text>
                </View>
            </View>
        </View>
    )
}