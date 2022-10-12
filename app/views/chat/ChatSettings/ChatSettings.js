import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { View, ScrollView, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { chatReducer } from "../../../src/redux/chat";
import fileSizeFormatter from "../../../src/lib/fileSizeFormatter";
import useLocale from "../../../src/lib/useLocale";
import { Video, AVPlaybackStatus } from 'expo-av';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons'

//Components
import GroupMembers from './GroupMembers';
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles } from "../../../src/styles/globalStyles";

export default function ChatSettings({ navigation }){
    const dispatch = useDispatch();
    const locale = useLocale();
    const current = useSelector((state) => state.chatReducer.value.current)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const COUNTER_DATA = useSelector((state) => state.chatReducer.value.COUNTER_DATA)
    const chat_settings = useSelector((state) => state.chatReducer.value.chat_settings)
    const settings = useSelector((state) => state.chatReducer.value.settings)
    const selectedUser = useSelector((state) => state.chatReducer.value.selectedUser)
    const filesAndMedia = useSelector((state) => state.chatReducer.value.filesAndMedia)

    const chat_window = useSelector((state) => state.chatReducer.value.chat_window) //Data for the purpose behind popup Window
    const isChat_window = useSelector((state) => state.chatReducer.value.isChat_window) //true or false

    //Media & Files states
    const [isMediaFiles, setMediaFiles] = useState(false)
    const [mediaFilesPurpose, setMediaFilesPurpose] = useState(undefined)
    
    const [isLoading, setLoading] = useState(true)
    const [group, setGroup] = useState(undefined)
    const [alias, setAlias] = useState(undefined)
    const [options, setOptions] = useState(undefined)
    const [optionSettings, setOptionsSetting] = useState(undefined) //Unclear usage
    const [nickname, setNickname] = useState(undefined);

    //Group Member States
    const [selected, setSelected] = useState(undefined) //<-- This is for Group Member selection
    const [admin, setAdmin] = useState(false)
    const [isSelf, setIsSelf] = useState(false)

    useEffect(() => {

        //If current is a group, then find group and store the values
        if(current && COUNTER_DATA){
            if(current.members.length > 2){
                var members = [...current.members].filter((e) => e.id !== USER_DATA.account_id)
                setGroup(members)
            } else {
                setGroup(undefined)
                var nicknames = current.nicknames

                if(nicknames){
                    nicknames = JSON.parse(current.nicknames)
                    if(nicknames.find((e) => e.id !== USER_DATA.account_id)){
                        setNickname(nicknames.find((e) => e.id !== USER_DATA.account_id).nickname)
                    } else {
                        setNickname(undefined)
                    }
                } else {
                    setNickname(undefined)
                }
            }

            if(current.alias){
                setAlias(current.alias)
            } else {
                if(current && current.alias){
                    setAlias(current.alias)
                } else {
                    setAlias(undefined)
                }
            }
            setLoading(false)
        } else {
            setGroup(undefined)
        }
    }, [current, COUNTER_DATA])

    //useEffect(() => {
    //    if(options){
    //        
    //        window.addEventListener('click', windowClick)
    //    } else {
    //        window.removeEventListener('click', windowClick)
    //    }
    //
    //    return(() => {
    //        window.removeEventListener('click', windowClick)
    //    })
    //}, [options])

    useEffect(() => {
        if(selected && USER_DATA){
            if((selected.id === USER_DATA.account_id) || (selected.account_id === USER_DATA.account_id)){
                setIsSelf(true)
            } else {
                setIsSelf(false)
            }
            dispatch(chatReducer({
                selectedUser: selected
            }))
        } else {
            setIsSelf(false)
        }
    }, [selected])

    //Fixed
    function windowClick(e){
        var optionsWindow = document.querySelector('.member-settings')
        if((!e.target.classList.contains('material-icons') && !e.target.parentElement.classList.contains('member-options')) && !e.target.classList.contains('member-options')){
            if(!optionsWindow.contains(e.target)){
                setOptions(undefined)
            }
        }
    }
    
    function settingsOptionClick(e){
        e.currentTarget.parentElement.classList.toggle('expanded')
    }

    function chatWindow(e){
        dispatch(chatReducer({
            isChat_window: true,
            chat_window: {purpose: e}
        }))
    }
    
    function makeAdmin(){
        dispatch(chatReducer({
            isChat_window: true,
            chat_window: {
                purpose: "change_admin"
            }
        }))
    }

    function removeUser(){
        dispatch(chatReducer({
            isChat_window: true,
            chat_window: {
                purpose: 'remove_member'
            }
        }))
    }

    function leaveChat(){
        dispatch(chatReducer({
            chat_window: { 
                purpose: 'remove_member'
            },
            isChat_window: true
        }))
        setSelected(USER_DATA)
    }

    return(
        <SafeAreaView style={style.wrapper}>
            <View style={style.top}>
                <TouchableOpacity onPress={() => { navigation.goBack() }}>
                    <MaterialIcons name="chevron-left" size={30} color={chat_settings.color}/>
                </TouchableOpacity>
            </View>
            <ScrollView style={{width: '100%', height: '100%'}}>
                <View style={{width: '100%', height: '100%', alignItems: 'center'}}>
                    <View style={style.overView} className="conversation-overview">
                    {
                        group ?
                        <>
                            <View style={style.groupHeader}>
                                <Image style={style.groupImageOne} source={{uri: group[0].profile_picture ? `https://risala.datablock.dev/${group[0].profile_picture.substring(3)}` : "https://datablock.dev/assets/generic-profile-picture.png"}}/>
                                <Image style={style.groupImageTwo} source={{uri: group[1].profile_picture ? `https://risala.datablock.dev/${group[1].profile_picture.substring(3)}` : "https://datablock.dev/assets/generic-profile-picture.png"}}/>
                            </View>
                            <Text style={style.topText}>
                                {
                                    (group && !alias) &&
                                    group.map((e, i, row) => {
                                        if(i + 1 === row.length){
                                            return e.firstname
                                        } else {
                                            return `${e.firstname}, `
                                        }
                                    })
                                }
                                {
                                    (group && alias) &&
                                    <Text style={style.topText}>{alias}</Text>
                                }
                            </Text>
                        </>
                        :
                        <>
                            {
                                COUNTER_DATA[0] &&
                                <>
                                    <Image 
                                        style={{width: 80, height: 80, borderRadius: 40}}
                                        source={{uri: COUNTER_DATA ? COUNTER_DATA[0].profile_picture ? `https://risala.datablock.dev/${COUNTER_DATA[0].profile_picture.substring(3)}` : "https://datablock.dev/assets/generic-profile-picture.png" : "https://datablock.dev/assets/generic-profile-picture.png" }}
                                    />
                                    {
                                        nickname ?
                                        <Text style={style.topText}>{nickname}</Text>
                                        :
                                        <Text style={style.topText}>{ (current.members && current.members.length > 0) ? COUNTER_DATA[0].firstname + ' ' + COUNTER_DATA[0].lastname : "Participant"}</Text>
                                    }
                                </>
                            }
                        </>
                    }
                    </View>
                    <View style={{width: '80%'}}>
                        {
                            (isMediaFiles && mediaFilesPurpose && !isLoading) &&
                            <MediaAndFilesWindow/>
                        }
                        {
                            (!isMediaFiles && !mediaFilesPurpose && !isLoading) &&
                            <>
                                <View className="settings-list" 
                                    style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%'}}
                                >
                                    <CustomiseChat/>
                                    <MediaAndFilesDropDown/>
                                    {
                                        group &&
                                        <View style={{width: '100%', marginTop: 20}}>
                                            <Text style={style.optionsHeader}>Chat Info</Text>
                                            <View style={style.optionsWrapper}>
                                                <TouchableOpacity 
                                                    style={{...style.optionsButton, justifyContent: 'space-between'}}
                                                >
                                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                        <MaterialIcons name="groups" color={'#fff'} size={22}/>
                                                        <Text style={style.optionsText}>Group members</Text>
                                                    </View>
                                                    <MaterialIcons name="chevron-right" color={'#fff'} size={24}/>
                                                </TouchableOpacity>
                                                <View style={style.optionsLine}/>
                                                <TouchableOpacity 
                                                    style={{...style.optionsButton, justifyContent: 'space-between'}}
                                                >
                                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                        <MaterialIcons name="logout" color={globalStyles.colors.red} size={22}/>
                                                        <Text style={{...style.optionsText, color: globalStyles.colors.red}}>Leave chat</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    }
                                    {
                                        group &&
                                        <>
                                            <GroupMembers
                                                admin={admin}
                                                setAdmin={setAdmin}
                                                options={options}
                                                setOptions={setOptions}
                                                group={group}
                                                selected={selected}
                                                setSelected={setSelected}
                                            />
                                            <View className="options-wrapper-wrapper">
                                                <View 
                                                    onClick={leaveChat}
                                                    className="settings-option"
                                                >
                                                    <MaterialIcons name="logout"/>
                                                    <Text>{locale === "en" ? "Leave Chat" : "Lämna chat"}</Text>
                                                </View>
                                            </View>
                                        </>
                                    }
                                </View>
                            </>
                        }
                        {
                            options &&
                            <View 
                                className="member-settings"
                                style={{top: `${options + 20}px`}}
                            >
                                <Text style={{color: '#fff'}}>{locale === "en" ? "Send a message" : "Skicka meddelande"}</Text>
                                {
                                    admin &&
                                    <>
                                        <View className="line"></View>
                                        <Text style={{color: '#fff'}} onClick={makeAdmin}>
                                            {locale === "en" ? "Make admin" : "Gör till administratör"}
                                        </Text>
                                        {
                                            isSelf ?
                                            <Text style={{color: '#fff'}} onClick={removeUser}>
                                                {locale === "en" ? "Leave Group" : "Lämna Gruppen"}
                                            </Text>
                                            :
                                            <Text style={{color: '#fff'}} onClick={removeUser}>
                                                {locale === "en" ? "Remove member" : "Ta bort medlem"}
                                            </Text>
                                        }
                                    </>
                                }
                                {
                                    isSelf && !admin &&
                                    <>
                                        <View className="line"></View>
                                        <Text style={{color: '#fff'}} onClick={removeUser}>
                                            {locale === "en" ? "Leave Group" : "Lämna Gruppen"}
                                        </Text>
                                    </>
                                }
                            </View>
                        }
                    </View>
                    {
                    
                    }
                </View>
            </ScrollView>
        </SafeAreaView>
    )

    //Store dropdown options
    function CustomiseChat(){
        return(
            <View style={{width: '100%', marginTop: 40}}>
                <Text style={style.optionsHeader}>{locale === "en" ? "Customisation" : "Anpassa Chatt"}</Text>
                <View style={style.optionsWrapper}>
                    <TouchableOpacity 
                        style={style.optionsButton}
                        className="settings-option" 
                        onClick={(() => { chatWindow('change_color') })}
                    >
                        <View style={{backgroundColor: chat_settings.color ? chat_settings.color : '#d39400', width: 20, height: 20, borderRadius: 10}}></View>
                        <Text style={style.optionsText}>{locale === "en" ? "Change Theme" : "Ändra Tema"}</Text>
                    </TouchableOpacity>
                    <View style={style.optionsLine}/>
                    <TouchableOpacity 
                        style={style.optionsButton}
                        className="settings-option" 
                        onClick={(() => { chatWindow('change_emoji') })}
                    >
                        {
                            chat_settings.emoji &&
                            <Text className="emoji" style={{fontSize: 20}}>
                                {chat_settings.emoji}
                            </Text>
                        }
                        <Text style={style.optionsText}>{locale === "en" ? "Change Emoji" : "Byt Emoji"}</Text>
                    </TouchableOpacity>
                    <View style={style.optionsLine}/>
                    <TouchableOpacity 
                        style={{...style.optionsButton, justifyContent: 'space-between'}}
                        className="settings-option" 
                        onClick={(() => { chatWindow('change_nickname') })}
                    >
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={{color: '#fff', fontWeight: '800', fontSize: 18}}>Aa</Text>
                            <Text style={style.optionsText}>{locale === "en" ? "Change nickname" : "Ändra Smeknamn"}</Text>
                        </View>
                        <MaterialIcons name="chevron-right" color={'#fff'} size={24}/>
                    </TouchableOpacity>
                    {
                        group &&
                        <>
                            <View style={style.optionsLine}/>
                            <TouchableOpacity
                                style={{...style.optionsButton, justifyContent: 'space-between'}}
                                onClick={(() => { chatWindow('change_name') })}
                            >
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <MaterialIcons name="edit" color={'#fff'} size={22}/>
                                    <Text style={style.optionsText}>{locale === "en" ? "Change group name" : "Ändra Chattnamn"}</Text>
                                </View>
                                <MaterialIcons name="chevron-right" color={'#fff'} size={24}/>
                            </TouchableOpacity>
                        </>
                    }
                </View>
            </View>
        )
    }

    function MediaAndFilesDropDown(){
        return(
            <View style={{width: '100%', marginTop: 20}} className="options-wrapper-wrapper">
                <Text style={style.optionsHeader}>More Actions</Text>
                <TouchableOpacity 
                    style={{...style.optionsButton, justifyContent: 'space-between'}}
                    className="options-wrapper-wrapper-header"
                    onClick={settingsOptionClick} 
                >
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <FontAwesome name="image" color={'#fff'} size={20}/>
                        <Text style={style.optionsText}>{locale === "en" ? "Media and files" : "Mediaobjekt och Filer"}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" color={'#fff'} size={24}/>
                </TouchableOpacity>
            </View>
        )
    }
}

const style = StyleSheet.create({
    wrapper: {
        height: '100%',
        width: '100%',
        backgroundColor: '#000',
        alignItems: 'center'
    },
    top: {
        width: '100%',
        height: 50,
        flexDirection: 'row'
    },
    groupHeader:{
        width: 80,
        height: 80
    },
    groupImageOne: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    groupImageTwo: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#000'
    },
    topText: {
        color: '#fff', 
        marginTop: 10, 
        fontSize: 22, 
        fontWeight: '800'
    },
    overView: {
        alignItems: 'center',
        height: 120
    },
    optionsWrapper: {
        width: '100%',
        backgroundColor: '#181818',
        borderRadius: 6,
    },
    optionsLine: {
        width: '90%',
        borderWidth: 0.5,
        borderTopColor: globalStyles.colors.white_1,
        marginLeft: '5%'
    },
    optionsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 12,
        paddingTop: 14,
        paddingBottom: 14,
        paddingRight: 12,
        backgroundColor: '#181818',
        borderRadius: 6,
    },
    optionsHeader: {
        color: globalStyles.colors.white_1, 
        marginBottom: 6, 
        marginLeft: 8, 
        fontWeight: '600'
    },
    optionsText: {
        color: '#fff', 
        marginLeft: 10, 
        fontWeight: '600'
    }
})