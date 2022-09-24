import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { View, ScrollView, Text } from "react-native";
import { chatReducer } from "../../../src/redux/chat";
import fileSizeFormatter from "../../../src/lib/fileSizeFormatter";
import useLocale from "../../../src/lib/useLocale";
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

//Components
import GroupMembers from './GroupMembers';

export default function ChatSettings({}){
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

    const videoExtension = ['mkv', 'mp4', 'mpe', 'mpeg', 'mpeg4', 'mpeg-4']

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

    useEffect(() => {
        if(options){
            
            window.addEventListener('click', windowClick)
        } else {
            window.removeEventListener('click', windowClick)
        }

        return(() => {
            window.removeEventListener('click', windowClick)
        })
    }, [options])

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
        <>
            {
                current &&
                <View className={settings === true ? "chat-settings visible" : "chat-settings"}>
                {
                    (isMediaFiles && mediaFilesPurpose && !isLoading) &&
                    <MediaAndFilesWindow/>
                }
                {
                    (!isMediaFiles && !mediaFilesPurpose && !isLoading) &&
                    <>
                        <View className="conversation-overview">
                            {
                                group ?
                                <>
                                    <View className="group-figure">
                                        <figure>
                                            <img src={group[0].profile_picture ? `${group[0].profile_picture}` : "https://codenoury.se/assets/generic-profile-picture.png"}/>
                                        </figure>
                                        <figure>
                                            <img src={group[1].profile_picture ? `${group[1].profile_picture}` : "https://codenoury.se/assets/generic-profile-picture.png"}/>
                                        </figure>
                                    </View>
                                    <Text>
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
                                            <>{alias}</>
                                        }
                                    </Text>
                                </>
                                :
                                <>
                                    {
                                        COUNTER_DATA[0] &&
                                        <>
                                            <figure>
                                                <img src={(current.members && current.members.length > 0) ? COUNTER_DATA[0].profile_picture ? COUNTER_DATA[0].profile_picture : "https://codenoury.se/assets/generic-profile-picture.png" : "https://codenoury.se/assets/generic-profile-picture.png"}/>
                                            </figure>
                                            {
                                                nickname ?
                                                <Text>{nickname}</Text>
                                                :
                                                <Text>{ (current.members && current.members.length > 0) ? COUNTER_DATA[0].firstname + ' ' + COUNTER_DATA[0].lastname : "Participant"}</Text>
                                            }
                                        </>
                                    }
                                </>
                            }
                        </View>
                        <View className="settings-list">
                            <CustomiseChat/>
                            <MediaAndFilesDropDown/>
                            {
                                group && group !== undefined &&
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
                    isLoading &&
                    <View>

                    </View>
                }
                {
                    options &&
                    <View 
                        className="member-settings"
                        style={{top: `${options + 20}px`}}
                    >
                        <Text>
                            {locale === "en" ? "Send a message" : "Skicka meddelande"}
                        </Text>
                        {
                            admin &&
                            <>
                            <View className="line"></View>
                                <Text
                                    onClick={makeAdmin}
                                >
                                    {locale === "en" ? "Make admin" : "Gör till administratör"}
                                </Text>
                                {
                                    isSelf ?
                                    <Text
                                        onClick={removeUser}
                                    >
                                        {locale === "en" ? "Leave Group" : "Lämna Gruppen"}
                                    </Text>
                                    :
                                    <Text 
                                        onClick={removeUser}
                                    >
                                        {locale === "en" ? "Remove member" : "Ta bort medlem"}
                                    </Text>
                                }
                            </>
                        }
                        {
                            isSelf && !admin &&
                            <>
                                <View className="line"></View>
                                <Text
                                    onClick={removeUser}
                                >
                                    {locale === "en" ? "Leave Group" : "Lämna Gruppen"}
                                </Text>
                            </>
                        }
                    </View>
                }
                </View>
            }
        </>
    )

    function MediaAndFilesWindow(){
        const selectedMenu = {
            backgroundColor: chat_settings.color
        }

        function fileClick(e){
            dispatch(chatReducer({
                imageCarousel: {
                    images: filesAndMedia.images,
                    selected: e
                }
            }))
        }

        return(
            <>
                <View  className="media-files-top">
                    <i 
                        className="material-icons"
                        onClick={(() => {
                            setMediaFiles(false)
                            setMediaFilesPurpose(undefined)
                        })}
                    >keyboard_backspace</i>
                    {locale === "en" ? "Media and Files" : "Media och Filer"}
                </View>
                <View className="media-files-selection">
                    <View 
                        className={mediaFilesPurpose === "media" ? "media-files-option selected" : "media-files-option"} 
                        data-value="media"
                        style={mediaFilesPurpose === "media" ? selectedMenu : null}
                        onClick={(() => {
                            setMediaFilesPurpose("media")
                        })}
                    >
                        Media
                    </View>
                    <View 
                        className={mediaFilesPurpose === "files" ? "media-files-option selected" : "media-files-option"} 
                        data-value="files"
                        style={mediaFilesPurpose === "files" ? selectedMenu : null}
                        onClick={(() => {
                            setMediaFilesPurpose("files")
                        })}
                    >
                        {locale === "en" ? "Files" : "Filer"}
                    </View>
                </View>
                <View className={mediaFilesPurpose === "files" ? "media-files-display files" : "media-files-display"}>
                    {
                        (filesAndMedia && mediaFilesPurpose === "media") &&
                        filesAndMedia.images.map((value, index) => {

                            var type = value.type.split('/')[0]
                            var widthStyle = document.querySelector('.chat-settings').clientWidth * 0.3

                            if(type === "image" || type === "video"){
                                if(type === "video"){
                                    return(
                                        <View 
                                            className="image"
                                            key={value.path}
                                            style={{height: `${widthStyle}px`}}
                                            onClick={(() => { fileClick(value.path) })}
                                        >
                                            <video src={`../${value.path.substring(3)}`}/>
                                        </View>
                                    )
                                } else {
                                    return(
                                        <View 
                                            className="image"
                                            key={value.path}
                                            style={{height: `${widthStyle}px`}}
                                            onClick={(() => { fileClick(value.path) })}
                                        >
                                            <img src={`../${value.path.substring(3)}`}/>
                                        </View>
                                    )
                                }
                            }
                        })
                    }
                    {
                        (filesAndMedia && mediaFilesPurpose === "files") &&
                        filesAndMedia.files.map((value, index) => {
                            var name = value.path.substring(21)
                            var fileSize = fileSizeFormatter(value.size, 2)

                            if(window.location.hostname === "localhost"){
                                return(
                                    <a 
                                        className="file-row"
                                        key={value.path}
                                        href={`../${value.path.substring(3)}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                    >
                                        <MaterialIcons name="description"/>
                                        <View className="file-description">
                                            <Text>
                                                {name.length > 20 ? `${name.substring(0,20)}...` : name}
                                            </Text>
                                            <Text>{fileSize}</Text>
                                        </View>
                                    </a>
                                )
                            } else{
                                return(
                                    <a 
                                        className="file-row"
                                        key={value.path}
                                        href={`https://risala.codenoury.se/${value.path.substring(3)}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                    >
                                        <MaterialIcons name="description"/>
                                        <View className="file-description">
                                            <Text>{name}</Text>
                                            <Text>{fileSize}</Text>
                                        </View>
                                    </a>
                                )
                            }
                        })
                    }
                </View>
            </>
        )
    }

    //Store dropdown options
    function CustomiseChat(){
        return(
            <View className="options-wrapper-wrapper">
                <View 
                    className="options-wrapper-wrapper-header"
                    onClick={settingsOptionClick} 
                >
                    <Text>{locale === "en" ? "Customise Chat" : "Anpassa Chatt"}</Text>
                    <i className="material-icons more">expand_more</i>
                    <i className="material-icons less">expand_less</i>
                </View>
                <View className="options-wrapper">
                    {
                        group &&
                        <View className="settings-option" onClick={(() => { chatWindow('change_name') })}>
                            <View className="settings-color">
                                <MaterialIcons name="edit"/>
                            </View>
                            <Text>{locale === "en" ? "Change group name" : "Ändra Chattnamn"}</Text>
                        </View>
                    }
                    <View className="settings-option" onClick={(() => { chatWindow('change_color') })}>
                        <View
                            className="settings-color" style={chat_settings.color ? {backgroundColor: chat_settings.color} : {backgroundColor: '#d39400'}}
                        >
                            <View className="dot"></View>
                        </View>
                        <Text>{locale === "en" ? "Change Theme" : "Ändra Tema"}</Text>
                    </View>
                    <View className="settings-option" onClick={(() => { chatWindow('change_emoji') })}>
                        {
                            chat_settings.emoji &&
                            <View className="emoji">
                                {chat_settings.emoji}
                            </View>
                        }
                        <Text>{locale === "en" ? "Change Emoji" : "Byt Emoji"}</Text>
                    </View>
                    <View className="settings-option" onClick={(() => { chatWindow('change_nickname') })}>
                        <View className="settings-color">
                            Aa
                        </View>
                        <Text>{locale === "en" ? "Change nickname" : "Ändra Smeknamn"}</Text>
                    </View>
                </View>
            </View>
        )
    }

    function MediaAndFilesDropDown(){
        return(
            <View className="options-wrapper-wrapper">
                <View 
                    className="options-wrapper-wrapper-header"
                    onClick={settingsOptionClick} 
                >
                    <Text>{locale === "en" ? "Media and Files" : "Mediaobjekt och Filer"}</Text>
                    <i className="material-icons more">expand_more</i>
                    <i className="material-icons less">expand_less</i>
                </View>
                <View className="options-wrapper">
                    <View 
                        className="settings-option"
                        onClick={(() => {
                            setMediaFiles(true)
                            setMediaFilesPurpose("media")
                        })}
                    >
                        <View>
                            <MaterialIcons name="image"/>
                        </View>
                        <Text>{locale === "en" ? "Media" : "Media"}</Text>
                    </View>
                    <View 
                        className="settings-option"
                        onClick={(() => {
                            setMediaFiles(true)
                            setMediaFilesPurpose("files")
                        })}
                    >
                        <View>
                            <MaterialIcons name="description"/>
                        </View>
                        <Text>{locale === "en" ? "Files" : "Filer"}</Text>
                    </View>
                </View>
            </View>
        )
    }
}