import React from "react";
import { ScrollView, View, Text, Image, Pressable, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { timeStamp } from "../../../../src/lib/timeStamp";
import { chatReducer, arrayEmptyu } from "../../../../src/redux/chat";
import { globalStyles } from "../../../../src/styles/globalStyles";

export default function Conversations({chats, conversationSelect}){
    const dispatch = useDispatch();
    const newMessage = useSelector((state) => state.chatReducer.value.newMessage)
    const current = useSelector((state) => state.chatReducer.value.current)
    const typing = useSelector((state) => state.chatReducer.value.typing)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const COUNTER_DATA = useSelector((state) => state.chatReducer.value.COUNTER_DATA)

    return(
        <ScrollView>
            {
                chats.map((value, index) => {
                    var text = undefined;
                    if((value.recent_message.files === "1" || value.recent_message.files === true) && value.recent_message.text === ""){
                        text = "Files"
                    } else{
                        text = value.recent_message.text
                    }
                    if(current){
                        if(current.id === value.id){
                            var current_selected = true
                        } else {
                            var current_selected = false
                        }
                    }
                    if(current && typing.chat_id !== undefined && typing.chat_id.length > 0){
                        if(typeof typing.chat_id === "object"){
                            var match = typing.chat_id.filter(e => e === value.id);
                        } else if(typing.chat_id === value.id){
                            var match = value.id
                        }
                    }
                    //Filter out your own account array
                    if(value.members){
                        var members = [...value.members].filter((e) => e.id !== USER_DATA.account_id)
                    }

                    if(value.nicknames){
                        var nicknames = JSON.parse(value.nicknames)
                        if(nicknames.find((e) => e.id !== USER_DATA.account_id)){
                           var nickname = nicknames.find((e) => e.id !== USER_DATA.account_id).nickname
                        } else {
                            var nickname = undefined
                        }
                    } else {
                        var nickname = undefined;
                    }
                    
                    
                    //timestamp fix
                    var time_stamp = timeStamp(value.recent_message.timestamp, false)
                    return(
                        <TouchableOpacity
                            key={value + index}
                            onPress={(() => { conversationSelect(value.id)})}
                            style={{width: '100%', flexDirection: 'row', paddingTop: 8, paddingBottom: 8, alignItems: 'center'}}
                        >
                            {
                                members.length === 1 &&
                                <Image 
                                    style={{width: 40, height: 40, borderRadius: 20, marginRight: 10}}
                                    source={{uri: members[0].profile_picture ? `https://risala.codenoury.se/${members[0].profile_picture.substring(3)}` : 'https://codenoury.se/assets/generic-profile-picture.png'}}
                                />
                            }
                            {
                                members.length > 1 &&
                                <View style={{width: 40, height: 40, position: "relative", marginRight: 10}}>
                                    <Image 
                                        style={{width: 30, height: 30, position: "absolute", borderRadius: 15, right: 0, top: 0}}
                                        source={{uri: members[0].profile_picture ? `https://risala.codenoury.se/${members[0].profile_picture.substring(3)}` : 'https://codenoury.se/assets/generic-profile-picture.png'}}
                                    />
                                    <Image 
                                        style={{width: 30, height: 30, position: 'absolute', borderRadius: 15, bottom: 0, left: 0, zIndex: 10, borderWidth: 1, borderColor: '#000'}}
                                        source={{uri: members[1].profile_picture ? `https://risala.codenoury.se/${members[1].profile_picture.substring(3)}` : 'https://codenoury.se/assets/generic-profile-picture.png'}}
                                    />
                                </View>
                            }
                            <View style={{width: '80%'}}>
                                <Text style={style.conversationName}>
                                    {
                                        members.length === 1 &&
                                        <>
                                            {
                                                nickname ?
                                                <Text style={style.conversationName}>{nickname}</Text>
                                                :
                                                <Text style={style.conversationName}>{members[0].firstname + ' ' + members[0].lastname}</Text>
                                            }
                                        </>
                                    }
                                    {
                                        (members.length > 1 && !value.alias) &&
                                        members.map((e, i, row) => {
                                            if(i + 1 === row.length){
                                                return `${e.firstname}`
                                            } else {
                                                return  `${e.firstname}, `
                                            }
                                        })
                                    }
                                    {
                                        (members && value.alias) &&
                                        <Text style={style.conversationName}>{value.alias}</Text>
                                    }
                                </Text>
                                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end'}}>
                                    <Text style={{color: globalStyles.colors.white_1}}>
                                        {
                                            value.sender_id === USER_DATA.account_id ?
                                            `You: ${text.length > 24 ? (text.substring(0, 24) + '...') : text}` 
                                            :
                                            `${text.length > 30 ? text.substring(0, 30) + '...' : text}`
                                        }
                                    </Text>
                                    {
                                        (match === undefined || match.length === 0) ?
                                        <Text style={{color: globalStyles.colors.white_1}}>&#183; {time_stamp}</Text>
                                        : ""
                                    }
                                </View>
                            </View>
                        </TouchableOpacity>
                    )
                })
            }
        </ScrollView>
    )
};

const style = StyleSheet.create({
    conversationName: {
        color: globalStyles.colors.white, 
        fontWeight: '800', 
        fontSize: 16
    }
})
