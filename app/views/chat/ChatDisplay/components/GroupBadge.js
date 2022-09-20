import React from "react";
import { View, Text, Image } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../../../src/redux/chat";
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

export default function GroupBadge({ locale }){
    const dispatch = useDispatch();
    const current = useSelector((state) => state.chatReducer.value.current)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const COUNTER_DATA = useSelector((state) => state.chatReducer.value.COUNTER_DATA)
    const chat = useSelector((state) => state.chatReducer.value.chat)


    if(current.members && chat){
        if(current.members.length > 2){
            try {
                var firstSender = chat.find(e => e.sender_id !== null).sender_id
                var firstSenderObject = current.members.find(e => e.id === firstSender)
                var others = current.members.filter(e => e.id !== USER_DATA.account_id)
        
                if(firstSender === USER_DATA.account_id){
                    var sendername = "You"
                } else {
                    var sendername = others.find(e => e.id === firstSender).firstname
                }
        
                var string = `${sendername} created this group`
                
                return(
                    <View className="group-badge-wrapper">
                        <View className="group-figure">
                            <Image source={{uri: others[0].profile_picture ? `${others[0].profile_picture}` : "https://codenoury.se/assets/generic-profile-picture.png"}}/>
                            <Image source={{uri: others[1].profile_picture ? `${others[1].profile_picture}` : "https://codenoury.se/assets/generic-profile-picture.png"}}/>
                        </View>
                        <Text className="group-name">
                            {
                                !current.alias &&
                                others.map((e,i, row) => {
                                    if(i + 1 === row.length){
                                        return e.firstname
                                    } else {
                                        return `${e.firstname}, `
                                    }
                                })
                            }
                        </Text>
                        {
                            current.alias &&
                            <Text className="group-name">{current.alias}</Text>
                        }
                        <Text className="creator">{string}</Text>
                        <View className="group-chat-settings">
                            <View onClick={(() => {
                                dispatch(chatReducer({
                                    isChat_window: true,
                                    chat_window: { purpose: "add_member"},
                                }))
                            })}>
                                <MaterialIcons name="person-add"/>
                                <Text>{locale === "en" ? "Add user" : "Lägg till"}</Text>
                            </View>
                            <View onClick={(() => {
                                dispatch(chatReducer({
                                    isChat_window: true,
                                    chat_window: { purpose: "change_name"},
                                }))
                            })}>
                                <MaterialIcons name="edit"/>
                                <Text>{locale === "en" ? "Change name" : "Namn"}</Text>
                            </View>
                            <View onClick={(() => {
                                dispatch(chatReducer({
                                    isChat_window: true,
                                    chat_window: { purpose: "view_members"},
                                }))
                            })}>
                                <MaterialIcons name="groups"/>
                                <Text>{locale === "en" ? "Group members" : "Medlemmar"}</Text>
                            </View>
                        </View>
                    </View>
                )
            } catch {
                return null
            }
        } else {
            return null
        }
    } else {
        return null
    }
}