import React, { useEffect, useState, useRef, useContext } from "react";
import { View, Text, Image, StyleSheet, Button, ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer, objectAdd } from "../src/redux/chat";
import { callSettingReducer } from "../src/redux/callSettings";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import 'react-native-gesture-handler';
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Components
import ChatSideMenu from "./chat/ChatSideMenu/ChatSideMenu";
import ChatDisplay from "./chat/ChatDisplay/ChatDisplay";
import ChatSettings from "./chat/ChatSettings/ChatSettings";

// Library
import { SocketContext } from "../src/lib/Socket";
import { postRequest, errorManagement } from "../api/api";
import { getStorage } from "../src/lib/asyncStorage";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackActions } from "@react-navigation/native";

// Socket Events
import { socketMessage, socketTyping, socketRemove, socketExit, socketJoin } from '../src/lib/socketRoutes/socketRoutes';

const Stack = createNativeStackNavigator();

export default function Chat({ navigation, page, setPage }){
    const socket = useContext(SocketContext)
    const dispatch = useDispatch();
    const current = useSelector((state) => state.chatReducer.value.current)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const isMobile = useSelector((state) => state.chatReducer.value.isMobile)
    const chat = useSelector((state) => state.chatReducer.value.chat)
    const callSettings = useSelector((state) => state.callSettingReducer)

    //Chat Window States
    const chat_window = useSelector((state) => state.chatReducer.value.chat_window) //Data for the purpose behind popup Window
    const isChat_window = useSelector((state) => state.chatReducer.value.isChat_window) //true or false

    const [access, setAccess] = useState(false)
    const [stackView, setStackView] = useState('Index')

    // Socket routes
    useEffect(() => {
        if(USER_DATA){
            socket.connect()

            socket.on('connect', () => {
                socket.emit('join', USER_DATA.account_id)
            })

            socket.on('message', socketMessage)
            socket.on('typing', socketTyping)
            socket.on('remove', socketRemove)
            socket.on('group-exit', socketExit)
            socket.on('group-join', socketJoin)

            //Call routes
            //socket.on('call-init', (data) => { 
            //    callInit(data, socket) 
            //})
            //socket.on('call-join', callJoin)
        }

        return(() => {
            socket.removeAllListeners()
            socket.disconnect()
        })
    }, [USER_DATA])

    // Check if user exists
    useEffect(() => {

        if (getStorage('user')) {
            getStorage('user')
            .then((response) => {
                var response = JSON.parse(response).response
                dispatch(chatReducer({
                    USER_DATA: {
                        account_id: response.account_id,
                        username: response.username,
                        firstname: response.firstname,
                        lastname: response.lastname,
                        profile_picture: response.profile_picture
                    }
                }))
            })

            //postRequest('accounts', {
            //    account: user.id,
            //    username: user.username
            //})
            //.then((response) =>{
            //    setAccess(true)
            //    getHistory();
            //    dispatch(objectAdd({key: 'USER_DATA', value: response}))
            //})
            //.catch((err) => {
            //  
            //  setTimeout(() => {
            //    router.push("/login/")
            //  }, 3000)
            //})
        } else {
          
        }

    }, [])

    return(
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Sidemenu" component={ChatSideMenu} options={{headerShown: false}}/>
                <Stack.Screen name="Display" component={ChatDisplay} options={{headerShown: false}} />
                <Stack.Screen name="Settings" component={ChatSettings} options={{headerShown: false}}/>
            </Stack.Navigator>
        </NavigationContainer>
    )
}