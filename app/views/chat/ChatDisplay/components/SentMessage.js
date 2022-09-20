import React, { useState } from "react";
import { View, Text } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { chatReducer } from "../../../../src/redux/chat";
import isUrl from 'is-url'
import FontAwesome from '@expo/vector-icons/FontAwesome'

import Files                from "./Files";
import MessageMoreOptions   from "./MessageMoreOptions";
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
    const oneToOne = { maxWidth: '200px', maxHeight: '200px'}
    const sixteenToNine = { maxWidth: '364px', maxHeigth: '201px'}
    const nineToSixteen = { maxWidth: '201px', maxHeigth: '364px'}

    function styleMessageBuble(){
        if(nextMatch && previousMatch){
            return '20px 6px 6px 20px'
        } else if(nextMatch && !previousMatch){
            return '20px 20px 6px 20px'
        } else if(previousMatch && !nextMatch){
            return '20px 6px 20px 20px'
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

    function doubleClick(e){
        var target = e.target

        //if(!target.classList.contains('focused-message')){
        //    setIsFocused(true)
        //    target.classList.add('focused-message')
        //} else {
        //    setIsFocused(false)
        //    target.classList.remove('focused-message')
        //}
        //
        //
    }

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
            >
                <Text className="message-time-stamp">
                    {timestamp}
                </Text>
                {
                    reply === true ?
                    <View className="message-wrapper">
                        <MessageMoreOptions 
                            sent={true} 
                            inputRef={inputRef} 
                        />
                        <View className="reply-wrapper">
                            <a 
                                className="reply-from"
                                message_id={value.reply_to_message_id}
                                onClick={(() => { scrollToReply(value.reply_to_message_id) })}
                            >
                                <FontAwesome name="reply" color={"#fff"} size={24}/>
                                <Text>
                                    {replied_text}
                                </Text>
                            </a>
                            {
                                isMedia && value.reply_text &&
                                <div className="reply-chat-bubble media">
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
                                                
                                                if(aspectRatio > 1.7 && aspectRatio < 1.8){ //16:9
                                                    style = sixteenToNine
                                                } else if(aspectRatio === 1){
                                                    style = oneToOne
                                                } else {
                                                    style = nineToSixteen
                                                }
                                            }


                                            if(type === "image"){
                                                return(
                                                    <figure 
                                                        style={style ? style : null}
                                                        key={e + 'reply'}
                                                        onClick={(() => { fileClick(e) })}
                                                    >
                                                        <img src={e}/>
                                                    </figure>
                                                )
                                            } else {
                                                return(
                                                    <figure 
                                                        style={style ? style : null}
                                                        key={e + 'replyu'}
                                                        onClick={(() => { fileClick(e) })}
                                                    >
                                                        <video src={e} controls/>
                                                    </figure>
                                                )
                                            }
                                        })
                                    }
                                </div>
                            }
                            {
                                !isMedia && value.reply_text && !fileReply &&
                                <div className="reply-chat-bubble">
                                    {value.reply_text}
                                </div>
                            }
                            {
                                fileReply &&
                                <div>
                                    <Files 
                                        value={value}
                                        filePath={filePath}
                                        recieved={false}
                                        fileReply={true}
                                        key={value.message_id + 'file'}
                                    />
                                </div>
                            }
                            { /******** Has the sender only sent emojis? ************/
                                (only_emoji === "" && value.text !== "") &&
                                <div className="message emoji">
                                    {value.text}
                                </div>
                            }
                            {
                                (file && filePath) &&
                                <div className="message file" style={{backgroundColor: chat_settings.color}}>
                                    <Files
                                        value={value}
                                        filePath={filePath}
                                        recieved={false}
                                        key={value.message_id + 'file'}
                                    />
                                </div>
                            }
                            {
                                ((!file && !filePath && only_emoji !== "") || fileReply) &&
                                <div 
                                    className="message" 
                                    style={{backgroundColor: chat_settings.color, marginTop: fileReply ? '-20px' : null, borderRadius: styleMessageBuble()}}
                                >
                                    {
                                        !url ?
                                        `${value.text}`
                                        :
                                        <a href={value.text} target="_blank">{value.text}</a>
                                    }
                                </div>
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
            <View className="message-wrapper">
                <MessageMoreOptions 
                    sent={true}
                    inputRef={inputRef}
                />
                {
                    (only_emoji === "" && value.text !== "") &&
                    <View className="message emoji">
                        {value.text}
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
                        onDoubleClick={doubleClick}
                        style={{backgroundColor: chat_settings.color, borderRadius: styleMessageBuble()}}
                    >
                        {
                            !url ?
                            `${value.text}`
                            :
                            <a href={value.text} target="_blank">{value.text}</a>
                        }
                    </View>
                }
            </View>
        )
    }
}