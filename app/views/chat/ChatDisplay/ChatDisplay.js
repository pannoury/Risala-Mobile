import React, { useEffect, useState, useRef } from "react";
import { View, ScrollView, SafeAreaView, ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { postRequest, errorManagement } from "../../../api/api";
import { chatReducer } from "../../../src/redux/chat";
import { timeStamp } from "../../../src/lib/timeStamp";

// Components
import RecievedMessage      from "./components/RecievedMessage";
import SentMessage          from "./components/SentMessage";
import TimeSeparator        from "./components/TimeSeparator";
import EventSeparator       from "./components/EventSeparator";
import ArrowBottom          from "./components/ArrowBottom";
import GroupBadge           from "./components/GroupBadge";
import Typing               from "./components/Typing";
import OptionsWindow        from "./components/OptionsWindow";
import CallEvent            from "./components/CallEvent";

export default function ChatDisplay({}) {
    const dispatch = useDispatch();
    const newMessage = useSelector((state) => state.chatReducer.value.newMessage)
    const reply = useSelector((state) => state.chatReducer.value.reply)
    const COUNTER_DATA = useSelector((state) => state.chatReducer.value.COUNTER_DATA)
    const current = useSelector((state) => state.chatReducer.value.current)
    const chat = useSelector((state) => state.chatReducer.value.chat)

    const typingAudio = useRef()

    const [height, setHeight] = useState();
    const [offset, setOffset] = useState(0)
    const [moreMessage, setMoreMessage] = useState(false)
    const [loading, setLoading] = useState(true)
    const [chatLoading, setChatLoading] = useState(false) //When fetching more messages
    const [group, setGroup] = useState(false)
    const [control, setControl] = useState(false)

    const chatDisplayWindow = useRef(null);

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
                setOffset(chatDisplayWindow.current.childElementCount)
                postRequest('chat/size', {id: current.id})
                .then((response) => {
                    if(chatDisplayWindow.current.childElementCount < response.count){
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
            chatDisplayWindow.current.addEventListener('scroll', scrollDetect)
        } else {
            try {
                chatDisplayWindow.current.removeEventListener('scroll', scrollDetect)
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

    function scrollDetect(e){
        if(document.querySelector('.chat-list-wrapper')?.scrollTop === 0 && moreMessage && chatDisplayWindow.current.childElementCount >= 100 && !loading){
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

    return(
        <View 
            className="chat-display"
            style={{height: height}}
        >   
            <ScrollView 
                ref={chatDisplayWindow}
                current-id={current ? current.id : null}
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
            <ArrowBottom/>
        </View>
    )
}