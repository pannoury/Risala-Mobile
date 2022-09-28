import React, { useEffect, useState, useRef } from "react";
import { View, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { postRequest, errorManagement } from "../../../api/api";
import { chatReducer } from "../../../src/redux/chat";
import { timeStamp } from "../../../src/lib/timeStamp";
import useLocale from "../../../src/lib/useLocale";
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

// Components
import RecievedMessage      from "./components/RecievedMessage";
import SentMessage          from "./components/SentMessage";
import TimeSeparator        from "./components/TimeSeparator";
import EventSeparator       from "./components/EventSeparator";
import ArrowBottom          from "./components/ArrowBottom";
import GroupBadge           from "./components/GroupBadge";
import Typing               from "./components/Typing";
import CallEvent            from "./components/CallEvent";
import informationManager   from "../../../src/lib/informationManager";
import ChatBottom           from "../ChatBottom/ChatBottom";

export default function ChatDisplay({ navigation }) {
    const dispatch = useDispatch();
    const locale = useLocale();
    const newMessage = useSelector((state) => state.chatReducer.value.newMessage)
    const reply = useSelector((state) => state.chatReducer.value.reply)
    const COUNTER_DATA = useSelector((state) => state.chatReducer.value.COUNTER_DATA)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const current = useSelector((state) => state.chatReducer.value.current)
    const chat = useSelector((state) => state.chatReducer.value.chat)
    const chat_settings = useSelector((state) => state.chatReducer.value.chat_settings)

    const typingAudio = useRef()
    const inputRef = useRef()

    const [height, setHeight] = useState();
    const [offset, setOffset] = useState(0)
    const [moreMessage, setMoreMessage] = useState(false)
    const [loading, setLoading] = useState(true)
    const [chatLoading, setChatLoading] = useState(false) //When fetching more messages
    const [group, setGroup] = useState(false)
    const [alias, setAlias] = useState(undefined)
    const [control, setControl] = useState(false)
    const [nickname, setNickname] = useState(undefined)
    const [counter, setCounter] = useState(undefined)

    const chatDisplayWindow = useRef(null);

    function conversationOptions(){

    }

    useEffect(() => {
        setOffset(0)
        setLoading(true)
        setMoreMessage(false)
        setChatLoading(false)
        //setHeight(document.querySelector('.chat-main').clientHeight - 151)

        if(current){
            if(current.members.length > 2){
                setGroup(true)
            } else {
                setGroup(false)
            }

            var display = chatDisplayWindow.current
            setTimeout(() => {
                display.scrollTop = display.scrollHeight
            }, 300)
        } else {
            setGroup(false)
        }

        dispatch(chatReducer({
            reply: {
                reply: false,
                text: undefined
            }
        }))
    }, [current])

    useEffect(() => {
        if(chat && COUNTER_DATA && current){
            setLoading(false)
            if(chat.length >= 100 && moreMessage === false){
                setOffset(chat.length)
                postRequest('chat/size', {id: current.id})
                .then((response) => {
                    if(chat.length < response.count){
                        setMoreMessage(true)
                    } else {
                        setMoreMessage(false)
                    }
                })
                .catch((err) => {
                    errorManagement(err)
                })
            }
        } else {
            setOffset(0)
            setLoading(true)
            setMoreMessage(false)
            setChatLoading(false)
            setControl(false)
        }
    }, [chat, moreMessage, COUNTER_DATA, current, control])

    useEffect(() => {
        if(moreMessage === true){
            console.log(chatDisplayWindow)
            chatDisplayWindow?.current.addEventListener('scroll', scrollDetect)
        } else {
            try {
                chatDisplayWindow?.current.removeEventListener('scroll', scrollDetect)
            } catch (e){
                
            }
        }

        return() => {
            if(moreMessage && chatDisplayWindow?.current){
                chatDisplayWindow.current.removeEventListener('scroll', scrollDetect)
            }
        }
    }, [moreMessage, current, chat])

    useEffect(() => {
        if(reply.reply && newMessage.is_searching){
            dispatch(chatReducer({
                reply: {
                    reply: false,
                    text: undefined
                }
            }))
        }
    }, [reply])

    useEffect(() => {
        setLoading(true)
        if(current && current.members){
            setCounter()
            if(current.members.length > 2){
                setGroup(current.members)
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
        }
    }, [current])

    function scrollDetect(e){
        if(chatDisplayWindow?.scrollTop === 0 && moreMessage && chatDisplayWindow.current.childElementCount >= 100 && !loading){
            setChatLoading(true)
            postRequest('chat/chat', {
                chat_id: current.id,
                offset: chatDisplayWindow.current.childElementCount
            })
            .then((response) => {

                var data = response
                dispatch(chatReducer({chat: (data.reverse().concat(chat))}))
                setTimeout(() => {
                    setChatLoading(false)
                }, 100)

                if(response.length < 100){
                    setMoreMessage(false)
                    chatDisplayWindow.current.removeEventListener('scroll', scrollDetect)
                }
            })
            .catch((err) => {
                informationManager({purpose: 'error', message: "An error has occured with fetching messages, please reload the page"})
            })
        }
    }

    function goBack(){
        navigation.goBack()
    }

    function conversationSettings(){
        navigation.navigate('Settings')
    }

    return(
        <SafeAreaView 
            className="chat-display"
            style={{height: '100%', backgroundColor: '#000'}}
        >
            <View style={style.chatTop}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}> 
                    <TouchableOpacity onPress={goBack}>
                        <MaterialIcons name="chevron-left" size={30} color={chat_settings.color}/>
                    </TouchableOpacity>
                    {
                        (group && !loading) &&
                        <TouchableOpacity 
                            onPress={conversationSettings}
                            style={{flexDirection: 'row', alignItems: 'center'}}
                        >
                            <View style={{height: 40, width: 40}}>
                                <Image
                                    style={{width: 30, height: 30, borderRadius: 15, position: 'absolute', top: 0, left: 10}} 
                                    source={{uri: group[0].profile_picture ? `https://risala.codenoury.se/${group[0].profile_picture.substring(3)}` : "https://codenoury.se/assets/generic-profile-picture.png"}}
                                />
                                <Image
                                    style={{width: 30, height: 30, borderRadius: 15, position: 'absolute', bottom: 0, borderWidth: 1, borderColor: '#000'}} 
                                    source={{uri: group[1].profile_picture ? `https://risala.codenoury.se/${group[1].profile_picture.substring(3)}` : "https://codenoury.se/assets/generic-profile-picture.png"}}
                                />
                            </View>
                            <Text style={style.chatTopName}>
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
                        </TouchableOpacity>
                    }
                    {
                        (!group && !loading && COUNTER_DATA) &&
                        <TouchableOpacity 
                            onPress={conversationSettings}
                            style={{flexDirection: 'row', alignItems: 'center'}}
                        >
                            <Image 
                                style={{width: 30, height: 30, borderRadius: 15}}
                                source={{uri: COUNTER_DATA ? COUNTER_DATA[0].profile_picture ? `https://risala.codenoury.se/${COUNTER_DATA[0].profile_picture.substring(3)}` : "https://codenoury.se/assets/generic-profile-picture.png" : "https://codenoury.se/assets/generic-profile-picture.png" }}
                            />
                            {
                                nickname ?
                                <Text style={style.chatTopName}>{nickname}</Text>
                                :
                                <Text style={style.chatTopName}>
                                    { COUNTER_DATA ? COUNTER_DATA[0].firstname + ' ' + COUNTER_DATA[0].lastname : ""}
                                </Text>
                            }
                        </TouchableOpacity>
                    }
                </View>
                <View style={{flexDirection: 'row'}}>
                    {
                        !group &&
                        <>
                            <TouchableOpacity 
                                data-value="call"
                                //onClick={(() => { callClick('call') })}
                            >
                                <MaterialIcons name="call" size={24} color={chat_settings.color} />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={{marginLeft: 10}}
                                data-value="video"
                                //onClick={(() => { callClick('video') })}
                            >
                                <MaterialIcons name="videocam" size={24} color={chat_settings.color} />
                            </TouchableOpacity>
                        </>
                    }
                </View>
            </View>  
            <ScrollView 
                ref={chatDisplayWindow}
                current-id={current ? current.id : null}
                style={{backgroundColor: '#000'}}
                //onContentSizeChange={() => chatDisplayWindow.current.scrollToEnd({animated: true})}
            >
                {
                    chatLoading &&
                    <View className="messages-loading">
                        <ActivityIndicator size="small" color={"#fff"}/>
                    </View>
                }
                {
                    (chat && current && !newMessage.new_conversation && !loading && group && !moreMessage) &&
                    <View className="group-badge">
                        <GroupBadge locale={locale}/>
                    </View>
                }
                {
                    (chat && !newMessage.new_conversation && !loading && current) &&
                    chat.map((value, index, array) => {

                        //Designated sender or reciever
                        if(USER_DATA.account_id === value.sender_id){
                            var sender = true
                        } else {
                            var sender = false
                        }

                        //timestamp fix
                        var timestamp = timeStamp(value.timestamp, true)

                        return(
                            <>
                                {
                                    value.time_separator &&
                                    <>
                                        {
                                            (value.time_separator === 1 || value.time_separator === true) &&
                                            <TimeSeparator 
                                                value={value} 
                                                current_id={current.id}
                                                index={index}
                                                key={value.message_id}
                                            />
                                        }
                                        {
                                            (value.time_separator === 2 || value.time_separator === 3) &&
                                            <EventSeparator 
                                                value={value} 
                                                index={index}
                                                locale={locale}
                                                key={value.message_id}
                                            />
                                        }
                                        {
                                            value.time_separator === 4 &&
                                            <CallEvent
                                                value={value}
                                                index={index}
                                                key={value.message_id}
                                                locale={locale}
                                                array={array}
                                                USER_DATA={USER_DATA}
                                                current={current}
                                            />
                                        }
                                    </>
                                }
                                {
                                    !value.time_separator &&
                                    <>
                                        {
                                            sender ?
                                            <SentMessage 
                                                value={value}
                                                key={value.message_id}
                                                index={index}
                                                timestamp={timestamp}
                                                array={array}
                                                inputRef={inputRef}
                                            />
                                            :
                                            <RecievedMessage
                                                value={value}
                                                index={index}
                                                key={value.message_id}
                                                timestamp={timestamp}
                                                array={array}
                                                inputRef={inputRef}
                                            />
                                        }
                                    </>
                                }
                            </>
                        )
                    })
                }
                {
                    loading === true &&
                    <View className="loading">
                        <View className="mock"><View className="skeleton"></View></View>
                        <View className="mock-short"><View className="mock"><View className="skeleton"></View></View></View>
                        <View className="mock"><View className="skeleton"></View></View>
                        <View className="mock-short"><View className="mock"><View className="skeleton"></View></View></View>
                        <View className="mock"><View className="skeleton"></View></View>
                        <View className="mock-short"><View className="mock"><View className="skeleton"></View></View></View>
                        <View className="mock"><View className="skeleton"></View></View>
                        <View className="mock-short"><View className="mock"><View className="skeleton"></View></View></View>
                        <View className="mock"><View className="skeleton"></View></View>
                        <View className="mock-short"><View className="mock"><View className="skeleton"></View></View></View>
                    </View>
                }
                <Typing 
                    typingAudio={typingAudio} 
                    chatDisplayWindow={chatDisplayWindow}
                />
            </ScrollView>
            <ChatBottom />
            <ArrowBottom
                chatDisplayWindow={chatDisplayWindow}
            />
        </SafeAreaView>
    )
}

const style = StyleSheet.create({
    chatTop: {
        height: 50, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        color: '#fff',
        backgroundColor: '#000000cc'
    },
    chatTopName: {
        color: '#fff', 
        marginLeft: 10, 
        fontWeight: '600', 
        fontSize: 18
    }
})