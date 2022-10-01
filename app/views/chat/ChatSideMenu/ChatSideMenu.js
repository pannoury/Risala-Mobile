import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, SafeAreaView, Image, StatusBar, Pressable, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer, arrayEmptyu } from "../../../src/redux/chat";
import Conversations from "./components/Conversations";
import { globalStyles } from "../../../src/styles/globalStyles";
import searchFunction from "./functions/searchFunction";
import { getStorage } from "../../../src/lib/asyncStorage";
import { postRequest } from "../../../api/api";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Entypo from '@expo/vector-icons/Entypo';



// Components
import TempChats    from "./components/TempChats";
import UserModal    from "../ChatTop/UserModal";
import NewMessageModal from "../ChatTop/NewMessageModal";

export default function ChatSideMenu({ navigation }){
    const dispatch = useDispatch();
    const newMessage = useSelector((state) => state.chatReducer.value.newMessage)
    const current = useSelector((state) => state.chatReducer.value.current)
    const chats = useSelector((state) => state.chatReducer.value.chats)
    const chat = useSelector((state) => state.chatReducer.value.chat)
    const typing = useSelector((state) => state.chatReducer.value.typing)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const noConversations = useSelector((state) => state.chatReducer.value.noConversations)

    const [tempChats, setTempChats] = useState(undefined) //Temp chat are chats which you have searched
    const [loading, setLoading] = useState(true)
    const [userSettings, setUserSettings] = useState(false)

    //Retrives conversation based on current
    //Current is an object, and id is used to retrieve conversation data
    useEffect(() => {
        if(current && USER_DATA){
            if(chat && chat.length > 0){
                if(chat[0].id !== current.id){
                    postRequest('chat/chat', {chat_id: current.id})
                    .then((response) => {
                        dispatch(chatReducer({
                            chat: response.reverse(),
                            chat_settings: current.settings,
                            filesAndMedia: current.files,
                        }))
                    })
                    .catch((err) => {
                        errorManagement(err)
                    })
                }
            } else {
                postRequest('chat/chat', {chat_id: current.id})
                .then((response) => {
                    dispatch(chatReducer({
                        chat: response.reverse(),
                        chat_settings: current.settings,
                        filesAndMedia: current.files,
                    }))
                })
                .catch((err) => {
                    errorManagement(err)
                })
            }

            dispatch(chatReducer({COUNTER_DATA: current.members.filter((e) => e.id !== USER_DATA.account_id)}))
        }
    }, [current])

    useEffect(() => {

        if(USER_DATA){
            postRequest('accounts', {
                account: USER_DATA.account_id,
                username: USER_DATA.username
            })
            .then((response) => {
                getHistory();
            })
            .catch((err) => {
                console.log(err)
            })
        }
        
    }, [USER_DATA])

    //Get conversations
    function getHistory(){
        postRequest('chat', {id: USER_DATA.account_id})
        .then((response) => {
            response.map((e) => {
                e.members = JSON.parse(e.members)
                e.settings = JSON.parse(e.settings)
                e.files = JSON.parse(e.files)
                e.recent_message = JSON.parse(e.recent_message)
                e.roles ? e.roles = JSON.parse(e.roles) : null
            })
            dispatch(chatReducer({
                chats: response,
                current: response[0]
            }))
            setLoading(false)
        })
        .catch((err) => {
            errorManagement(err)
        })
    }

    function conversationSelect(chat_id){
        console.log(chat_id)
        if(chats.length >= 2 && current.id !== chat_id){
            dispatch(chatReducer({current: chats.find(e => e.id === chat_id)}))
        } else if(chats.length >= 1 && !current){ //this is when your first conversation was initated by someone else
            dispatch(chatReducer({current: chats.find(e => e.id === chat_id)}))
        }

        navigation.navigate('Display')
    }

    // Build some sort of algorithm
    // This is an effort to reduce strains on backend
    function conversationSearch(e){
        var value = e.nativeEvent.text
        
        if(value.length > 0 && !newMessage.is_searching){
            if(!tempChats){
                setLoading(true)
            }

            var chatMatches = []
            var searchString = value.toLowerCase()

            // Version 2
            if(chats){
                var finalScore = searchFunction(searchString, chats, USER_DATA)

                var temporaryChatMatches = finalScore
                setTempChats(temporaryChatMatches)
                setLoading(false)
            }
            
        } else {
            setTempChats(undefined)
            setLoading(false)
        }
    }

    function newMessageInit(){
        dispatch(chatReducer({
            newMessage: {
                is_searching: true,
                new_conversation: true
            }
        }))
    }

    return(
        <SafeAreaView style={{backgroundColor: '#000', height: '100%', flex: 1}}>
            <View>
                <View style={style.viewTop}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '90%', marginBottom: 10}}>
                        <TouchableOpacity onPress={(() => { setUserSettings(!userSettings) })}>
                            <Image 
                                style={{width: 30, height: 30, borderRadius: 15}}
                                source={{uri: USER_DATA.profile_picture ? `https://risala.codenoury.se/${USER_DATA.profile_picture.substring(3)}` : "https://codenoury.se/assets/generic-profile-picture.png"}}
                            />
                        </TouchableOpacity>
                        <Text style={{color: "#fff", fontSize: 26, fontWeight: '600'}}>Chats</Text>
                        <TouchableOpacity onPress={newMessageInit}>
                            <Entypo name="new-message" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <View style={{width: '100%', alignItems: 'center'}}>
                        <TextInput
                            placeholder="Search"
                            onChange={conversationSearch}
                            autoComplete="off"
                            type="text" 
                            style={style.textInput}
                        />
                    </View>
                </View>
                <ScrollView style={{height: '100%'}}>
                    {
                        newMessage.is_searching &&
                        <View>
                        </View>
                    }
                    {
                        (chats && !loading && !tempChats) &&
                        <Conversations 
                            chats={chats}
                            conversationSelect={conversationSelect}
                        />
                    }
                    {
                        tempChats &&
                        <TempChats
                            tempChats={tempChats}
                            conversationSelect={conversationSelect}
                        />
                    }
                </ScrollView>
            </View>
            <UserModal 
                userSettings={userSettings}
                setUserSettings={setUserSettings}
            />
            <NewMessageModal/>
        </SafeAreaView>
    )
}

const style = StyleSheet.create({
    viewTop: {
        flexDirection: 'column',
        alignItems: 'center'
    },
    viewOne: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    viewTwo: {
        justifyContent: 'center',
    },
    textInput: {
        width: '90%',
        backgroundColor: globalStyles.colors.black_1,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: globalStyles.colors.white_2,
        color: globalStyles.colors.white,
        marginBottom: 10
    }
})


