import React, { useEffect, useState, useRef, useContext } from "react";
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Touchable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer, arrayEmpty, objectAdd } from "../../../src/redux/chat";
import sendMessage from "./functions/sendMessage";
import { SocketContext } from "../../../src/lib/Socket";
import { MaterialIcons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons'

import EmojiWindow          from "../EmojiWindow";
import informationManager   from "../../../src/lib/informationManager";

export default function ChatBottom({inputRef}){
    const [inputValue, setInputValue] = useState('');
    const emoji_window = useRef(null)
    const fileInput = useRef();

    const imageExtension = ['gif', 'png', 'jpeg', 'jpg', 'svg']

    const [chatHeight, setChatHeight] = useState(1)
    const [initialDisplayHeight, setInitialDisplayHeight] = useState(0)
    const [isTyping, setIsTyping] = useState(false) // <-- This is whether YOU are typing or not

    const dispatch = useDispatch();
    const socket = useContext(SocketContext)
    const chat_bottom_height = useSelector((state) => state.chatReducer.value.chat_bottom_height)
    const newMessage = useSelector((state) => state.chatReducer.value.newMessage)
    const typing = useSelector((state) => state.chatReducer.value.typing)
    const current = useSelector((state) => state.chatReducer.value.current)
    const reply = useSelector((state) => state.chatReducer.value.reply)
    const USER_SEARCH = useSelector((state) => state.chatReducer.value.USER_SEARCH)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const COUNTER_DATA = useSelector((state) => state.chatReducer.value.COUNTER_DATA)
    const emoji = useSelector((state) => state.chatReducer.value.emoji)
    const chat_settings = useSelector((state) => state.chatReducer.value.chat_settings)
    const isFiles = useSelector((state) => state.chatReducer.value.isFiles)
    const files = useSelector((state) => state.chatReducer.value.files)
    const chat = useSelector((state) => state.chatReducer.value.chat)
    const chats = useSelector((state) => state.chatReducer.value.chats)
    const uploadFiles = useSelector((state) => state.chatReducer.value.uploadFiles)
    const MESSAGES = useSelector((state) => state.chatReducer.value.MESSAGES)

    useEffect(() => {
        if(reply){
            //
        }
    }, [reply])

    useEffect(() => {
        //For typing bubble
        if(current){

            //Group Chat Isnt the if, else state redundant below?
            var id = current.members.map((e) => e.id)

            if(inputValue.length > 0 && !newMessage.new_conversation && !isTyping){
                setIsTyping(true)
                socket.emit('typing', { value: inputValue.length, room: current.id, id: id });
            } else if(inputValue === "" || inputValue.length === 0 && isTyping){
                setIsTyping(false)
                socket.emit('typing', { value: false, room: current.id, id: id })
            }
        }

        //
        //
        //Fix height for display
        if(inputValue.length === 0 || inputValue === "" && chatHeight > 1){
            setChatHeight(1) //Counts number of rows for chatwindow
        } else {
            //var row = Math.floor((inputRef.current.scrollHeight / 20) > 6 ? 6 : inputRef.current.scrollHeight / 20)
            //setChatHeight(row)
        }
    }, [inputValue])

    //This useEffect hook sets everything to default when you change conversation
    useEffect(() => {
        dispatch(chatReducer({isFiles: false}))
        setInputValue('')
        dispatch(arrayEmpty('files'))
    }, [current])
    
    function emojiSelect(e){
        setInputValue(`${inputRef.current.value}${e.target.textContent}`)
    }

    //For messeger
    var shift = false;
    function inputKeyDown(e){
        if(e.type === "keydown"){
            if(e.key === "Enter"){
                var textWithoutSpaces = inputRef.current.value.split("\n").find(e => e !== '') //Checks if text only is made of spaces, is true if not, else is false
                if(shift === false && ((inputRef.current.value.length > 0 && textWithoutSpaces) || isFiles)){
                    if(current){
                        e.preventDefault()
                        sendMessage(null, inputRef, socket);
                        setInputValue('')
                        dispatch(arrayEmpty('files'))
                    } else if(USER_SEARCH){
                        if(USER_SEARCH.ID){
                            if(USER_SEARCH.ID.length > 0){
                                e.preventDefault()
                                sendMessage(null, inputRef, socket);
                                setInputValue('')
                                dispatch(arrayEmpty('files'))
                            }
                        }
                    } else {
                        setInputValue('')
                    }
                } else if(shift === true){
                    //var display = document.querySelector('.chat-display ul')
                    //display.scrollTop = display.scrollHeight
                } else{
                    e.preventDefault()
                }
            } else if(e.key === "Shift" && shift === false){
                shift = true;
            }
        } else if(e.type === "keyup"){
            if(e.code === "ShiftLeft" || e.code === "ShiftRight"){
                shift = false;
            }
        } else if(e.type === 'backspace'){
            var row = (inputRef.current.scrollHeight / 20) > 6 ? 6 : inputRef.current.scrollHeight / 20
            
        }
    }

    //Sets height
    useEffect(() => {
        setHeight()
    }, [reply, chatHeight, isFiles])

    useEffect(() => {
        //setInitialDisplayHeight(document.querySelector('.chat-main').clientHeight - 151)
    }, [current])

    function setHeight(){
        if(chatHeight > 0){
            var totAdd = (((chatHeight - 1) * 20) + 50);
        } else {
            var totAdd = 40;
        }
        
        if(reply.reply){
            var totAdd = totAdd + 53
        }

        if(isFiles){
            var totAdd = totAdd + 70
        }

        //
        if(totAdd === 50){
            //document.querySelector('.chat-display').style.height = `${initialDisplayHeight}px`
        } else {
            //document.querySelector('.chat-display').style.height = `${(initialDisplayHeight - totAdd) + 70}px`
        }

        dispatch(chatReducer({chat_bottom_height: totAdd}))

        setTimeout(() => {
            //var display = document.querySelector('.chat-display ul')
            //display.scrollTop = display.scrollHeight
        }, 10)
    }

    // FILE INPUT FUNCTIONS

    function fileClick(e){

        if(current){
            chatConfirmed(e)
        } else if(USER_SEARCH){
            if(USER_SEARCH.ID){
                if(USER_SEARCH.ID.length > 0){
                    chatConfirmed(e)
                }
            }
        }

        async function chatConfirmed(e){
            if(e.type === "change" || e._reactName === "onChange"){
                e.preventDefault();
                //
                if(e.target.files.length > 0){

                    var type = e.target.files[0].type.split('/')[0]

                    function getDimensions(file, type){
                        return new Promise((resolve, reject) => {
                            if(type === 'image'){
                                let img = new Image()
                                img.onload = () => {
                                    var width = img.naturalWidth
                                    var heigth = img.naturalHeight
                                    window.URL.revokeObjectURL(img.src)
    
                                    resolve({
                                        dimensions: [width, heigth],
                                        file: file
                                    })
                                }
                                img.src = window.URL.createObjectURL(file)
                            } else if(type === 'video'){
                                var url = URL.createObjectURL(file)
                                //let video = document.createElement('video')
                                //video.src = url
                                //video.onloadedmetadata = () => {
                                //    var width = video.videoWidth
                                //    var height = video.videoHeight
                                //
                                //    resolve({
                                //        dimensions: [width, height],
                                //        file: file
                                //    })
                                //}
                            }
                        })
                    }

                    var fileMediaObject = {
                        path: e.target.files[0].name,
                        size: e.target.files[0].size,
                        type: e.target.files[0].type
                    }

                    if(type === 'image' || type === 'video' && fileMediaObject.size < 20971520){
                        getDimensions(e.target.files[0], type)
                        .then((e) => {
                            
                            fileMediaObject.dimensions = e.dimensions
                            var newMediaArray = [...uploadFiles.images, fileMediaObject]
    
                            if(files.length === 0){
                                dispatch(chatReducer({
                                    isFiles: true,
                                    files: [e.file],
                                    uploadFiles: {
                                        files: uploadFiles.files,
                                        images: newMediaArray
                                    }
                                }))
                            } else {
                                dispatch(chatReducer({
                                    isFiles: true,
                                    files: [...files, e.file],
                                    uploadFiles: {
                                        files: uploadFiles.files,
                                        images: newMediaArray
                                    }
                                }))
                            }
                        })
                    } else if(type !== 'image' && type !== 'video' && fileMediaObject.size < 20971520) {
                        var newFileArray = [...uploadFiles.files, fileMediaObject]

                        if(files.length === 0){
                            dispatch(chatReducer({
                                isFiles: true,
                                files: [e.target.files[0]],
                                uploadFiles: {
                                    files: newFileArray,
                                    images: uploadFiles.images
                                }
                            }))
                        } else {
                            dispatch(chatReducer({
                                isFiles: true,
                                files: [...files, e.target.files[0]],
                                uploadFiles: {
                                    files: newFileArray,
                                    images: uploadFiles.images
                                }
                            }))
                        }
                    } else {
                        informationManager({ purpose: "error", message: "File size is too large. Maximum file size is 20MB"})
                    }
                }
                
            } else if(e.type === "click"){
                fileInput.current.click()
            }
        }
    }

    //This function removes the file from the state "files"
    function removeFile(index, value){

        if(files.length === 1){
            dispatch(chatReducer({isFiles: false}))
        }
        dispatch(chatReducer({
            files: [...files].filter((e, i) => i !== index),
            uploadFiles: {
                files: [...uploadFiles.files].filter(e => e.path !== value.name),
                images: [...uploadFiles.images].filter(e => e.path !== value.name)
            }
        }))
    }

    const style = StyleSheet.create({
        wrapper: {
            width: '100%',
            height: 50,
            justifyContent: 'flex-end'
        },
        messageBoxWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
        },
        optionsWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 10
        },
        optionsStyle: {
            marginRight: 10,
            marginLeft: 10
        },
        messageBox: {
            flexDirection: 'row',
            alignItems: 'center',
            width: isTyping ? '90%' : '54%',
            backgroundColor: '#141414',
            paddingTop: 8,
            paddingBottom: 8,
            paddingLeft: 12,
            paddingRight: 30,
            borderRadius: 20,
            marginRight: 20
        },
        input: {
            height: `${chatHeight * 20}`, 
            overflowY: chatHeight >= 6 ? 'auto' : 'hidden',
            width: '100%',
            color: '#fff'
        }
    })

    return(
        <View 
            className="chat-bottom"
            style={style.wrapper}
            //style={{height: `${chat_bottom_height}px`, paddingTop: reply.reply ? 0 : "10px"}}
        >
            {
                reply.reply &&
                <View className="reply-window">
                    <View className="reply-preview">
                        <Text>
                            {
                                reply.replying_to_id === USER_DATA.account_id ?
                                "Replying to yourself" :
                                `Replying to ${reply.replying_to_name}`
                            }
                        </Text>
                        <Text>
                            {
                                reply.type ? reply.type
                                :
                                reply.text.length > 40 ? (reply.text.substring(0, 40) + '...') : reply.text
                            }
                        </Text>
                    </View>
                    <Text 
                        className="close-reply-window"
                        onClick={(() => {
                            dispatch(objectAdd({key: 'reply', value: {
                                reply: false,
                                text: undefined,
                                replying_to_name: undefined,
                                replying_to_id: undefined,
                                message_id: undefined
                            }}))
                        })}
                    >
                        &#10005;
                    </Text>
                </View>
            }
            <View 
                style={style.messageBoxWrapper}
                className="message-box-wrapper"
            >
                <View className="message-insert-options" style={{flexDirection: 'row'}}>
                    <TouchableOpacity style={style.optionsStyle}>
                        <FontAwesome name="camera" color={chat_settings.color} size={24}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={style.optionsStyle}
                        className="attach-file"
                        onClick={fileClick}
                    >
                        
                        <FontAwesome name="image" color={chat_settings.color} size={24}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={style.optionsStyle}>
                        <FontAwesome name="microphone" color={chat_settings.color} size={24} />
                    </TouchableOpacity>
                    <View
                        className="file-input" 
                        type="file"
                        style={{display: "none"}}
                        ref={fileInput}
                        onChange={fileClick}
                    >
                    </View>
                </View>
                <View 
                    className="message-box"
                    onClick={(() => inputRef.current.focus())}
                    style={style.messageBox}
                    //style={{height: isFiles ? `${((chatHeight - 1) * 20) + 110}px` : `${((chatHeight - 1) * 20) + 40}`}}
                >
                    {
                        isFiles &&
                        <>
                            <View className="bottom-file-wrapper">
                                {
                                    files.map((value, index) => {
                                        var type = value.type.split('/')[0]
                                        //

                                        if(type === "application"){
                                            return(
                                                <View className="file-wrapper">
                                                    <View 
                                                        className="remove"
                                                        onClick={(() => {
                                                            removeFile(index, value)
                                                        })}
                                                    >
                                                        <MaterialIcons name="close" />
                                                    </View>
                                                    <View className="file" title={value.name}>
                                                        <MaterialIcons name="description" />
                                                    </View>
                                                </View>
                                            )
                                        } else if(type === "image"){
                                            return(
                                                <View className="file-wrapper">
                                                    <View 
                                                        className="remove"
                                                        onClick={(() => {
                                                            removeFile(index, value)
                                                        })}
                                                    >
                                                        <MaterialIcons name="close" />
                                                    </View>
                                                    <Image source={URL.createObjectURL(value)}/>
                                                </View>
                                            )
                                        } else if(type === "video"){
                                            var file = new Blob(
                                                [value],
                                                {"type": "video\/mp4"}
                                            )
                                            return(
                                                <View className="file-wrapper">
                                                    <View 
                                                        className="remove"
                                                        onClick={(() => {
                                                            removeFile(index, value)
                                                        })}
                                                    >
                                                        <MaterialIcons name="close" />
                                                    </View>
                                                    <MaterialIcons name="play-circle" className="material-icons play" />
                                                    <video src={URL.createObjectURL(file)}/>
                                                </View>
                                            )
                                        }
                                    })
                                }
                                <View 
                                    className="add-more"
                                    onClick={fileClick}
                                >
                                    <MaterialIcons name="add-to-photos" />
                                </View>
                            </View>
                        </>
                    }
                    <TextInput
                        className="message-input-box"
                        onChangeText={setInputValue}
                        placeholder={"Type a message..."}
                        ref={inputRef}
                        style={style.input}
                        value={inputValue}
                    />
                    <TouchableOpacity 
                        className="emoji-button"
                        onClick={(() => {dispatch(chatReducer({emoji: !emoji}))})}
                    >
                        <MaterialCommunityIcons name="emoticon-happy" color={chat_settings.color} size={24}/>
                    </TouchableOpacity>
                </View>
                {
                    isTyping &&
                    <TouchableOpacity>
                        <MaterialIcons name="send" color={chat_settings.color}/>
                    </TouchableOpacity>
                }
                {
                    (chat_settings.emoji && !isTyping) ?
                    <View 
                        className="chat-emoji"
                        onClick={((e) => {
                            if(current){
                                sendMessage(e.target.textContent, inputRef, socket)
                                setInputValue('')
                                dispatch(arrayEmpty('files'))
                            } else if(USER_SEARCH){
                                if(USER_SEARCH.ID){
                                    if(USER_SEARCH.ID.length > 0){
                                        sendMessage(e.target.textContent, inputRef, socket)
                                        setInputValue('')
                                        dispatch(arrayEmpty('files'))
                                    }
                                }
                            }
                        })}
                    >
                        <Text style={{fontSize: 24}}>{chat_settings.emoji}</Text>
                    </View>
                    :
                    <View 
                        className="chat-emoji"
                        onClick={((e) => {
                            if(current){
                                sendMessage(e.target.textContent, inputRef, socket)
                                setInputValue('')
                                dispatch(arrayEmpty('files'))
                            } else if(USER_SEARCH){
                                if(USER_SEARCH.ID){
                                    if(USER_SEARCH.ID.length > 0){
                                        sendMessage(e.target.textContent, inputRef, socket)
                                        setInputValue('')
                                        dispatch(arrayEmpty('files'))
                                    }
                                }
                            }
                        })}
                    >
                        &#x1F44D;
                    </View>
                }
            </View>
            {
                emoji &&
                <EmojiWindow 
                    emojiSelect={emojiSelect}
                />
            }
        </View>
    )
}