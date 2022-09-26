import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../../../src/redux/chat";
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { globalStyles } from "../../../../src/styles/globalStyles";
import { TouchableOpacity } from "react-native-gesture-handler";

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
                    <View style={style.wrapper} className="group-badge-wrapper">
                        <View style={style.badgeImageWrapper}>
                            <Image style={style.badgeImageOne} source={{uri: others[0].profile_picture ? `https://risala.codenoury.se/${others[0].profile_picture.substring(3)}` : "https://codenoury.se/assets/generic-profile-picture.png"}}/>
                            <Image style={style.badgeImageTwo} source={{uri: others[1].profile_picture ? `https://risala.codenoury.se/${others[1].profile_picture.substring(3)}` : "https://codenoury.se/assets/generic-profile-picture.png"}}/>
                        </View>
                        <Text style={style.badgeHeader} className="group-name">
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
                            <Text style={style.badgeHeader} className="group-name">{current.alias}</Text>
                        }
                        <Text style={style.creator}>{string}</Text>
                        <View style={style.settingsWrapper}>
                            <View style={style.settingsButton} onClick={(() => {
                                dispatch(chatReducer({
                                    isChat_window: true,
                                    chat_window: { purpose: "add_member"},
                                }))
                            })}>
                                <TouchableOpacity style={style.icon}>
                                    <MaterialIcons name="person-add" color={'#fff'} size={26}/>
                                </TouchableOpacity>
                                <Text style={style.settingsText}>{locale === "en" ? "Add user" : "Lägg till"}</Text>
                            </View>
                            <View style={style.settingsButton} onClick={(() => {
                                dispatch(chatReducer({
                                    isChat_window: true,
                                    chat_window: { purpose: "change_name"},
                                }))
                            })}>
                                <TouchableOpacity style={style.icon}>
                                    <MaterialIcons name="edit" color={'#fff'} size={26}/>
                                </TouchableOpacity>
                                <Text style={style.settingsText}>{locale === "en" ? "Change name" : "Namn"}</Text>
                            </View>
                            <View style={style.settingsButton} onClick={(() => {
                                dispatch(chatReducer({
                                    isChat_window: true,
                                    chat_window: { purpose: "view_members"},
                                }))
                            })}>
                                <TouchableOpacity style={style.icon}>
                                    <MaterialIcons name="groups" color={'#fff'} size={26}/>
                                </TouchableOpacity>
                                <Text style={style.settingsText}>{locale === "en" ? "Group members" : "Medlemmar"}</Text>
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

const style = StyleSheet.create({
    wrapper: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40
    },
    badgeImageWrapper: {
        width: 80,
        height: 80
    },
    badgeImageOne: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        top: 0,
        right: 0
    },
    badgeImageTwo: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#000',
        bottom: 0,
        left: 0
    },
    badgeHeader: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '600'
    },
    creator: {
        marginTop: 4,
        color: globalStyles.colors.white_1
    },
    settingsWrapper: {
        width: '100%',
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly'
    },
    settingsButton: {
        alignItems: 'center'
    },
    settingsText: {
        color: '#fff'
    },
    icon: {
        backgroundColor: globalStyles.colors.white_2,
        padding: 6,
        width: 40,
        height: 40,
        borderRadius: 20,
    }
})