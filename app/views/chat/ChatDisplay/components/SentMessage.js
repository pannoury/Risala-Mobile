import React, { useState } from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { chatReducer } from "../../../../src/redux/chat";
import isUrl from 'is-url'
import { Video, AVPlaybackStatus } from 'expo-av';
import { globalStyles } from "../../../../src/styles/globalStyles";
import FontAwesome from '@expo/vector-icons/FontAwesome'

import Files                from "./Files";
import removeEmojis         from "../functions/removeEmojis";
import messageStyler        from "../functions/messageStyler";

export default function SentMessage({index, value, optionSelect, timestamp, array, inputRef}){
    const dispatch = useDispatch();
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const chat_settings = useSelector((state) => state.chatReducer.value.chat_settings)
    const current = useSelector((state) => state.chatReducer.value.current)
    const filesAndMedia = useSelector((state) => state.chatReducer.value.filesAndMedia)

    const [isFocused, setIsFocused] = useState(false)

    //Nicknames
    if(value.id === current.id){
        if(current.nicknames){
            var nickname = JSON.parse(current.nicknames)
        } else {
            var nickname = null
        }
    } else {
        var nickname = null
    }

    // This section checks if the previous message was from the same sender, during the same date
    var sender = value.sender_id
    var senderTime = value.timestamp.substring(0, 10)
    var styler = messageStyler(index, array, sender, senderTime)
    let previousMatch = styler[0];
    let nextMatch = styler[1];

    /* Checks whether a string is a url or not*/
    if(value.text){
        var url = isUrl(value.text) ? true : false;
    }

    /********************************** REPLY ********************************************/
    var reply = false;
    if(value.reply_text !== undefined && value.reply_text !== null && value.reply_text !== ""){
        reply = true;

        //If group <-- This will be needed to be updated soon
        if(current.members.length > 2){
            if(nickname){
                if(nickname.find((e => e.id === value.reply_to_id))){
                    var replied_text = `You replied to ${nickname.find((e => e.id === value.reply_to_id)).nickname}`
                } else {
                    var replied_text = `You replied to ${value.reply_to_name}`
                }
            }
        } else {
            if(USER_DATA.account_id === value.reply_to_id){
                var replied_text = 'You replied to yourself'
            } else if(USER_DATA.account_id !== value.reply_to_id){
                if(nickname){
                    if(nickname.find((e => e.id === value.reply_to_id))){
                        var replied_text = `You replied to ${nickname.find((e => e.id === value.reply_to_id)).nickname}`
                    } else {
                        var replied_text = `You replied to ${value.reply_to_name}`
                    }
                } else {
                    var replied_text = `You replied to ${value.reply_to_name}`
                }
            }
        }


        //Have you replied to an image or file?
        //Update
        var fileReply = false;
        if(value.reply_text){
            try {
                var isMedia = JSON.parse(value.reply_text)
                //
                
                if(isMedia.length === 1){
                    //
                    
                    if(current.files.files.map(e => e.path).some(e => isMedia[0].includes(e))){
                        isMedia = false;
                        fileReply = true;
                    }
                }
            } catch {
                var isMedia = false;
            }
        }
    }
    /************************************************************************************/

    /********************************** Files *******************************************/
    var file = false;
    var filePath = false;
    if(value.files === "1" || value.files === true){
        file = true;
        filePath = JSON.parse(value.file_paths)
    }
    /************************************************************************************/

    /********************************** Emoji *******************************************/
    if(!file && value.text){
        var only_emoji = removeEmojis(value.text)
    }
    /************************************************************************************/

    if(fileReply){
        filePath = JSON.parse(value.reply_text)
    }

    //Styled components for Aspect Ratios
    const smallSize = Dimensions.get("screen").width * 0.2
    const midSize = Dimensions.get("screen").width * 0.25
    const largeSize = Dimensions.get("screen").width * 0.3621
    const oneToOne = { width: midSize, height: midSize}
    const sixteenToNine = { width: largeSize, height: smallSize}
    const nineToSixteen = { width: smallSize, height: largeSize}

    function styleMessageBuble(){
        if(nextMatch && previousMatch){
            return [20, 6, 6, 20]
        } else if(nextMatch && !previousMatch){
            return [20, 20, 6, 20]
        } else if(previousMatch && !nextMatch){
            return [20, 6, 20, 20]
        } else {
            return null
        }
    }

    function scrollToReply(message_id){
        var elementWithMessageId = document.querySelector(`[message_id="${message_id}"]`)
        var positionFromTopOfScrollableDiv = elementWithMessageId.offsetTop

        var chatListWrapper = document.querySelector('.chat-list-wrapper')
        chatListWrapper.scrollTop = positionFromTopOfScrollableDiv - 150
    }

    function fileClick(e){
        dispatch(chatReducer({
            imageCarousel: {
                images: filesAndMedia.images,
                selected: e
            }
        }))
    }

    var chatBorderRadius = styleMessageBuble()

    const style = StyleSheet.create({
        chatBubble: {
            backgroundColor: chat_settings.color,
            paddingTop: 8, paddingBottom: 8, paddingLeft: 12, paddingRight: 12,
            borderTopLeftRadius: chatBorderRadius           ? chatBorderRadius[0] : 20,
            borderTopRightRadius: chatBorderRadius          ? chatBorderRadius[1] : 20,
            borderBottomRightRadius: chatBorderRadius       ? chatBorderRadius[2] : 20,
            borderBottomLeftRadius: chatBorderRadius        ? chatBorderRadius[3] : 20,
            maxWidth: Dimensions.get("screen").width * 0.6
        },
        list: {
            width: '100%', 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: !nextMatch ? 10 : 2
        }
    })

    return(
        <>
            <View
                id={value.message_id}
                className={reply === true ? "sent-message reply" : "sent-message"}
                message_id={value.message_id}
                timestamp={value.timestamp}
                key={value.message_id}
                file={file ? `[${filePath.map(e => `"${e.path}"`)}]` : null}
                title={timestamp}
                style={style.list}
            >
                <Text style={globalStyles.timestamp}>{timestamp}</Text>
                {
                    reply === true ?
                    <View className="message-wrapper">
                        <View className="reply-wrapper">
                            <View 
                                className="reply-from"
                                message_id={value.reply_to_message_id}
                                onClick={(() => { scrollToReply(value.reply_to_message_id) })}
                            >
                                <FontAwesome name="reply" color={"#fff"} size={24}/>
                                <Text>{replied_text}</Text>
                            </View>
                            {
                                isMedia && value.reply_text &&
                                <View 
                                    className="reply-chat-bubble media" 
                                    style={{flexDirection: 'row', alignItems: "flex-end", flexWrap: 'wrap'}}
                                >
                                    {
                                        isMedia.map((e, i) => {

                                            try {
                                                var mediaObject = filesAndMedia.images.filter(mediaObject => mediaObject.path === e)[0]
                                            } catch {
                                                var mediaObject = current.files.images.filter(mediaObject => mediaObject.path === e)[0]
                                            }
                                            
                                            //
                                            if(mediaObject){
                                                var aspectRatio = mediaObject.dimensions[0] / mediaObject.dimensions[1]
                                                var type = mediaObject.type.split('/')[0]
                                                var style = null
                                                
                                                if(aspectRatio > 1.7){ //16:9
                                                    style = sixteenToNine
                                                } else if(aspectRatio === 1){
                                                    style = oneToOne
                                                } else {
                                                    style = nineToSixteen
                                                }
                                            }


                                            if(type === "image"){
                                                return(
                                                    <Image 
                                                        source={{e}}
                                                        key={e + 'reply'}
                                                        onClick={(() => { fileClick(e) })}
                                                        style={style}
                                                    />
                                                )
                                            } else {
                                                return(
                                                    <Video 
                                                        key={e + 'replyu'}
                                                        onClick={(() => { fileClick(e) })}
                                                        source={{e}}
                                                        style={style}
                                                    />
                                                )
                                            }
                                        })
                                    }
                                </View>
                            }
                            {
                                !isMedia && value.reply_text && !fileReply &&
                                <View className="reply-chat-bubble" style={style.chatBubble}>
                                    <Text>{value.reply_text}</Text>
                                </View>
                            }
                            {
                                fileReply &&
                                <View>
                                    <Files 
                                        value={value}
                                        filePath={filePath}
                                        recieved={false}
                                        fileReply={true}
                                        key={value.message_id + 'file'}
                                    />
                                </View>
                            }
                            { /******** Has the sender only sent emojis? ************/
                                (only_emoji === "" && value.text !== "") &&
                                <View className="message emoji">
                                    <Text>{value.text}</Text>
                                </View>
                            }
                            {
                                (file && filePath) &&
                                <View className="message file" style={{backgroundColor: chat_settings.color}}>
                                    <Files
                                        value={value}
                                        filePath={filePath}
                                        recieved={false}
                                        key={value.message_id + 'file'}
                                    />
                                </View>
                            }
                            {
                                ((!file && !filePath && only_emoji !== "") || fileReply) &&
                                <View 
                                    className="message" 
                                    style={style.chatBubble}
                                    //style={{backgroundColor: chat_settings.color, marginTop: fileReply ? '-20px' : null, borderRadius: styleMessageBuble()}}
                                >
                                    {
                                        !url ?
                                        <Text>{`${value.text}`}</Text>
                                        :
                                        <Text href={value.text} target="_blank">{value.text}</Text>
                                    }
                                </View>
                            } 
                        </View>
                    </View>
                    :
                    <NotReply/>
                }
            </View>
        </>
    )

    function NotReply(){
        return(
            <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                {
                    (only_emoji === "" && value.text !== "") &&
                    <View className="message emoji">
                        <Text>{value.text}</Text>
                    </View>
                }
                {
                    (file && filePath) &&
                    <Files
                        value={value}
                        filePath={filePath}
                        recieved={false}
                        key={value.message_id + 'file'}
                    />
                }
                {
                    (only_emoji !== "" && !file && !filePath) &&
                    <View 
                        className="message" 
                        style={style.chatBubble}
                    >
                        {
                            !url ?
                            <Text style={{color: '#fff'}}>{`${value.text}`}</Text>
                            :
                            <Text href={value.text} style={{color: '#fff'}}>{value.text}</Text>
                        }
                    </View>
                }
            </View>
        )
    }
}