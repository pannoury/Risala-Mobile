import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { useSelector } from "react-redux";
import MaterialIcons from '@expo/vector-icons/MaterialIcons'


export default function ArrowBottom({chatDisplayWindow}){
    const current = useSelector((state) => state.chatReducer.value.current)
    const reply = useSelector((state) => state.chatReducer.value.reply)
    const [arrowBotton, setArrowBotton] = useState(false)
    const [isListening, setIsListening] = useState(false)

    //useEffect(() => {
    //    if(chatDisplayWindow.current){
    //        console.log(chatDisplayWindow)
    //        setTimeout(() => {
    //            chatDisplayWindow.current.addEventListener('scroll', isTypingScrollDetect)
    //        }, 500)
    //    }
    //
    //    return(() => {
    //        if(isListening){
    //            chatDisplayWindow.current.removeEventListener('scroll', isTypingScrollDetect)
    //        }
    //    })
    //}, [current, chatDisplayWindow])

    function isTypingScrollDetect(e){
        setIsListening(true)
        var chatList = chatDisplayWindow.current
        var position = chatList?.scrollTop / (chatList?.scrollHeight - chatList?.clientHeight)

        if(position < 0.9){
            setArrowBotton(true)
        } else if(position > 0.95){
            setArrowBotton(false)
        }
    }

    function arrowClick(){
        setArrowBotton(false)
        var display = chatDisplayWindow.current
        display.scrollTop = display.scrollHeight
    }

    const displayArrow = { display: 'flex' }
    const hideArrow = { display: 'none' }

    return(
        <View 
            className="arrow-bottom-button"
            onClick={arrowClick}
            style={(arrowBotton && !reply.reply) ? displayArrow : hideArrow}
        >
            <MaterialIcons name="keyboard-arrow-down" color={"#fff"} size={26}/>
        </View>
    )
}