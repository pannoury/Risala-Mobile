import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { chatReducer } from "../../../../src/redux/chat";
import isUrl from 'is-url'
import messageStyler from "../functions/messageStyler";
import { Video, AVPlaybackStatus } from 'expo-av';
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { globalStyles } from "../../../../src/styles/globalStyles";

import Files                from "./Files";
import removeEmojis         from "../functions/removeEmojis";

export default function RecievedMessage({index, value, optionSelect, timestamp, nickname, array, inputRef}){
    const dispatch = useDispatch();
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const COUNTER_DATA = useSelector((state) => state.chatReducer.value.COUNTER_DATA)
    const current = useSelector((state) => state.chatReducer.value.current)
    const filesAndMedia = useSelector((state) => state.chatReducer.value.filesAndMedia)

    // Nicknames
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

    //If current_chat is not null, and current_chat has members array, create a sender object
    //Which holds all values associated with the specific sender
    var group = false;
    var userNickname = undefined;
    if(current.members.length > 2){
        if(current.members){
            var sender = current.members.find((e) => e.id === value.sender_id)
            var group = true;
        }

        if(nickname){
            if(nickname.find(e => e.id === value.sender_id)){
                userNickname = nickname.find(e => e.id === value.sender_id).nickname
            }
        }
    }

    //Current_chat is a prop based on chats, wherein a filter has been used to match with current id
    //This apperantly can cause error, and hence we have included a the global state current to tackle this problem
    /********************************** REPLY ********************************************/
    var reply = false;
    if(value.reply_text !== undefined && value.reply_text !== null && value.reply_text !== ""){
        reply = true;

        //If group
        if(current.members.length > 2){
            var senderID = value.sender_id
            if(current.members.length > 2){

                if(nickname){
                    var senderObject = nickname.filter((e) => e.id === senderID)[0]
                    var recieverObject = nickname.filter((e) => e.id === value.reply_to_id)[0]

                    //

                    if(value.reply_to_id === USER_DATA.account_id){
                        if(senderObject[0]){
                            var replied_text = `${senderObject[0].nickname} replied to you`
                        } else {
                            var senderObject = current.members.filter((e) => e.id === senderID)
                            var replied_text = `${senderObject[0].firstname} replied to you`
                        }
                    } else {
                        var replied_text = `${senderObject ? senderObject.nickname : current.members.filter(e => e.id === value.sender_id)[0] ? current.members.filter(e => e.id === value.sender_id)[0] : "Participant" } 
                        replied to ${recieverObject ? recieverObject.nickname : current.members.filter(e => e.id === value.reply_to_id) ? current.members.filter(e => e.id === value.reply_to_id)[0].firstname : 'Participant'}`
                    }
                } else {
                    var senderObject = current.members.filter((e) => e.id === senderID)[0]
                    var recieverObject = current.members.filter((e) => e.id === value.reply_to_id)[0]
                    //
                    if(senderObject && recieverObject){
                        if(value.reply_to_id === USER_DATA.account_id){
                            var replied_text = `${senderObject.firstname} replied to you`
                        } else {
                            var replied_text = `${senderObject.firstname ? senderObject.firstname : 'Participant'} replied to ${recieverObject.firstname ? recieverObject.firstname : 'Participant'}`
                        }
                    } else {
                        if(value.reply_to_id === USER_DATA.account_id){
                            var replied_text = `Participant replied to you`
                        } else {
                            var replied_text = `Participant replied to Participant`
                        }
                    }
                }

            }
        } else { //not group
            if(nickname){
                if(nickname.filter((e) => e.id === COUNTER_DATA.id)){
                    var replied_text = `${nickname.filter((e) => e.id === value.sender_id)[0].nickname} replied to you`
                } else {
                    var replied_text = `${senderNickname.nickname} replied to you`
                }
            } else {
                var replied_text = `${COUNTER_DATA[0].firstname} replied to you`
            }

        }

        //Have you replied to an image or file?
        var fileReply = false;
        if(value.reply_text){
            try {
                var isMedia = JSON.parse(value.reply_text)
                
                if(isMedia.length === 1){
                    let file = isMedia[0].substr(isMedia[0].lastIndexOf(".") + 1)
                    
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
    if(value.files === "1"  || value.files === true){
        file = true;
        filePath = JSON.parse(value.file_paths)
        //
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

    function styleMessageBuble(){
        if(nextMatch && previousMatch){
            return [6, 20, 20, 6]
        } else if(nextMatch && !previousMatch){
            return [20, 20, 20, 6]
        } else if(previousMatch && !nextMatch){
            return [6, 20, 20, 20]
        } else {
            return null
        }
    }

    //Styled components for Aspect Ratios
    const smallSize = Dimensions.get("screen").width * 0.2
    const midSize = Dimensions.get("screen").width * 0.25
    const largeSize = Dimensions.get("screen").width * 0.3621
    const oneToOne = { width: midSize, height: midSize}
    const sixteenToNine = { width: largeSize, height: smallSize}
    const nineToSixteen = { width: smallSize, height: largeSize}

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
            backgroundColor: '#737272',
            paddingTop: 8, paddingBottom: 8, paddingLeft: 12, paddingRight: 12,
            borderTopLeftRadius: chatBorderRadius           ? chatBorderRadius[0] : 20,
            borderTopRightRadius: chatBorderRadius          ? chatBorderRadius[1] : 20,
            borderBottomRightRadius: chatBorderRadius       ? chatBorderRadius[2] : 20,
            borderBottomLeftRadius: chatBorderRadius        ? chatBorderRadius[3] : 20,
            maxWidth: Dimensions.get("screen").width * 0.6,
            alignSelf: 'flex-start',
            marginLeft: !nextMatch ? 0 : 40
        },
        list: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: !nextMatch ? 10 : 2
        },
        counterProfilePicture: {
            width: 30, 
            height: 30, 
            borderRadius: 15, 
            marginRight: 10
        }
    })

    return(
        <>
            <View
                id={value.message_id}
                message_id={value.message_id}
                key={value.message_id}
                user_id={sender ? sender.id : null}
                timestamp={value.timestamp}
                file={file ? filePath : null}
                title={timestamp}
                style={style.list}
            >
                {
                    (group && (!previousMatch && !nextMatch || previousMatch && !nextMatch)) &&
                    <Image 
                        style={style.counterProfilePicture}
                        source={{uri: sender ? sender.profile_picture ? `https://risala.codenoury/${sender.profile_picture.substring(3)}` : "https://codenoury.se/assets/generic-profile-picture.png" : "https://codenoury.se/assets/generic-profile-picture.png"}}
                    />
                }
                {
                    (!group && ((!previousMatch && !nextMatch) || previousMatch && !nextMatch)) &&
                    <Image 
                        style={style.counterProfilePicture}
                        source={{uri: COUNTER_DATA[0].profile_picture ? `https://risala.codenoury.se/${COUNTER_DATA[0].profile_picture.substring(3)}` : "https://codenoury.se/assets/generic-profile-picture.png"}}
                    />
                }
                {
                    reply === true ?
                    <View className="recieved-message-wrapper">
                        <View className="message-wrapper">
                            <View className="reply-wrapper">
                                <View 
                                    className="reply-from"
                                    message_id={value.reply_to_message_id}
                                    onClick={(() => { scrollToReply(value.reply_to_message_id) })}
                                    style={{flexDirection: 'row', marginBottom: 6}}
                                >
                                    <FontAwesome name="reply" color={globalStyles.colors.white_1} size={18}/>
                                    <Text style={{color: globalStyles.colors.white_1, marginLeft: 10}}>{replied_text}</Text>
                                </View>
                                {
                                    isMedia && value.reply_text &&
                                    <View className="reply-chat-bubble media"
                                        style={{flexDirection: 'row', alignItems: 'flex-end', flexWrap: 'wrap'}}
                                    >
                                        {
                                            isMedia.map((e, i) => {

                                                try {
                                                    var mediaObject = filesAndMedia.images.filter(mediaObject => mediaObject.path === e)[0]
                                                } catch {
                                                    var mediaObject = current.files.images.filter(mediaObject => mediaObject.path === e)[0]
                                                }
                                                
                                                if(mediaObject){
                                                    var aspectRatio = mediaObject.dimensions[0] / mediaObject.dimensions[1]
                                                    var type = mediaObject.type.split('/')[0]
                                                    var style = null
                                                    
                                                    if(aspectRatio > 1){ //16:9
                                                        style = sixteenToNine
                                                    } else if(aspectRatio === 1){
                                                        style = oneToOne
                                                    } else {
                                                        style = nineToSixteen
                                                    }
                                                }

                                                if(type === "image"){
                                                    return(
                                                        <TouchableOpacity style={{marginLeft: 8}}>
                                                            <Image 
                                                                key={e + 'reply'}
                                                                onClick={(() => { fileClick(e) })}
                                                                source={{uri: `https://risala.codenoury.se/${e.substring(3)}`}}
                                                                style={style ? style : null}
                                                            />
                                                        </TouchableOpacity>
                                                    )
                                                } else {
                                                    return(
                                                        <TouchableOpacity>
                                                            <Video 
                                                                source={{e}}
                                                                //style={style ? style : null}
                                                                key={e + 'reply'}
                                                                onClick={(() => { fileClick(e) })}
                                                            />
                                                        </TouchableOpacity>
                                                    )
                                                }
                                            })
                                        }
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
                                {
                                    (file && filePath) &&
                                    <View 
                                        className="message file" 
                                        //style={{backgroundColor: chat_settings.color}}
                                    >
                                        <Files
                                            value={value}
                                            filePath={filePath}
                                            recieved={false}
                                            key={value.message_id + 'file'}
                                        />
                                    </View>
                                }
                                {
                                    !isMedia && value.reply_text && !fileReply &&
                                    <View className="reply-chat-bubble" style={{}}>
                                        <Text style={{color: '#fff'}}>{value.reply_text}</Text>
                                    </View>
                                }
                                {
                                    (only_emoji === "" && value.text !== "") &&
                                    <View className="message emoji">
                                        <Text style={{fontSize: 40}}>{value.text}</Text>
                                    </View>
                                }
                                {
                                    ((!file && !filePath) || fileReply) &&
                                    <View 
                                        className="message"
                                        style={style.chatBubble}
                                    >
                                        {
                                            !url ?
                                            <Text style={{color: '#fff'}}>{`${value.text}`}</Text>
                                            :
                                            <Text href={value.text} target="_blank" style={{color: '#fff'}}>{value.text}</Text>
                                        }
                                    </View>
                                }
                            </View>
                        </View>
                    </View>
                    :
                    <NotReply/>
                }
                <Text className="message-time-stamp">
                    {timestamp}
                </Text>
            </View>
        </>
    )

    function NotReply(){
        return(
            <View>
                {
                    (sender && group && !previousMatch) &&
                    <>
                        {
                            userNickname ?
                            <Text className="sender-name" style={{color: '#fff'}}>{userNickname}</Text>
                            :
                            <Text className="sender-name" style={{color: '#fff'}}>{sender.firstname}</Text>
                        }
                    </>
                }
                <View className="message-wrapper">
                    {
                        (only_emoji === "" && value.text !== "") &&
                        <View className="message emoji">
                            <Text style={{fontSize: 40}}>{value.text}</Text>
                        </View>
                    }
                    {
                        (file && filePath) &&
                        <Files
                            value={value}
                            filePath={filePath}
                            recieved={true}
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
            </View>
        )
    }
}