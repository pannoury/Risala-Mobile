import React, { useState, useEffect } from "react";
import { Modal, ScrollView, Text, View, StyleSheet, Pressable, Image, TextInput, FlatList } from "react-native";
import { globalStyles } from "../../../src/styles/globalStyles";
import { useDispatch, useSelector } from "react-redux";
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { chatReducer } from "../../../src/redux/chat";
import { postRequest } from "../../../api/api";

export default function NewMessageModal(){
    const dispatch = useDispatch();
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const chats = useSelector((state) => state.chatReducer.value.chats)
    const USER_SEARCH = useSelector((state) => state.chatReducer.value.USER_SEARCH)
    const newMessage = useSelector((state) => state.chatReducer.value.newMessage)

    const [userSelected, setUserSelected] = useState(undefined) //select of user in suggestion window
    const [userSearch, setUserSearch] = useState("");
    const [userSearchResult, setUserSearchResult] = useState(undefined);
    const [userSuggestLoading, setUserSuggestLoading] = useState(false)

    useEffect(() => {
        if(newMessage.is_searching){
            findConversation([...USER_SEARCH.ID, USER_DATA.account_id])
        }
    }, [newMessage.is_searching, newMessage.new_conversation, USER_SEARCH])

    function closeNewMessage(){
        dispatch(chatReducer({
            newMessage: {
                is_searching: false
            }
        }))
    }

    function userMsgSearch(e){
        if(e.nativeEvent.text.length === 0){
            setUserSuggestLoading(true)
        }

        //e.preventDefault()
        setUserSearch(e.nativeEvent.text)
        //e.target.focus()

        if(e.nativeEvent.text !== ""){
            postRequest('chat/search', {
                search: e.nativeEvent.text.replace(/[^A-Za-z\s]/g, ""),
                user: USER_DATA.account_id,
                selected: USER_SEARCH.ID
            })
            .then((response) => {
                setUserSuggestLoading(false)
                setUserSearchResult(response)

                console.log(response)
            })
            .catch((err) => {
                informationManager({purpose: 'error', message: err.message})
                errorManagement(err)
                
            })
        } else {
            setUserSuggestLoading(false)
            setUserSearchResult("")
        }
    }

    function findConversation(searchID){
        let match;
        let matchIndex;
        chats.map(e => e.members.filter((e,i,a) => a.length === searchID.length)).forEach((conversation, index, array) => {
            if(conversation.map(e => e.id).sort().toString() === searchID.sort().toString()) {
                match = chats[index].id
                matchIndex = index
            }
        })

        // No match
        if(!match){
            
            dispatch(chatReducer({
                newMessage: {
                    is_searching: true,
                    new_conversation: true
                }
            }))
        } else if(match){ // Match
            dispatch(chatReducer({
                newMessage: {
                    is_searching: true,
                    new_conversation: false
                },
                current: chats.find(e => e.id === match)
            }))
        }
    }

    function SearchResultSuggestion({item}){
        return(
            <View
                style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10, width: '100%'}}
                data-id={item.account_id}
                data-firstname={item.firstname}
                data-lastname={item.lastname}
                data-profile_picture={item.profile_picture}
                //onClick={(() => { userSelect(item.account_id, item.firstname, item.lastname, item.profile_picture)})}
            >
                <Image
                    style={{width: 40, height: 40, borderRadius: 20, marginRight: 10}}
                    source={{uri: item.profile_picture ? `https://risala.codenoury.se/${item.profile_picture.substring(3)}` : "https://codenoury.se/assets/generic-profile-picture.png"}}
                />
                <Text style={{color: '#fff', fontSize: 20}}>
                    {item.firstname} {item.lastname}
                </Text>
            </View>
        )
    }

    return(
        <Modal
            animationType="slide"
            visible={newMessage?.is_searching === true ? true : false}
            transparent={true}
        >  
            <View style={style.view}>
                <View style={{width: '100%', height: 50, justifyContent: 'center', alignItems: 'center'}}>
                    <Pressable 
                        style={style.button}
                        onPress={closeNewMessage}
                    >
                        <Text style={{color: "#fff", fontSize: 16, fontWeight: '600'}}>Cancel</Text>
                    </Pressable>
                    <Text style={{color: '#fff', fontWeight: '600', fontSize: 18, marginTop: 18}}>New message</Text>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center', width: '100%'}}>
                    <Text style={{color: '#fff', marginRight: 10}}>To:</Text>
                    <TextInput
                        onChange={userMsgSearch}
                        style={{color: '#fff', height: 200, width: '100%'}}
                    />
                </View>
                <View style={{width: '100%', height: '100%', paddingLeft: 10, paddingRight: 10}}>
                    <FlatList
                        data={userSearchResult}
                        keyExtractor={(e) => e.account_id}
                        renderItem={SearchResultSuggestion}
                    />
                </View>
            </View>
        </Modal>
    )
}

const style = StyleSheet.create({
    view: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        marginTop: '14%',
        height: '100%',
        backgroundColor: '#111',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25
    },
    button: {
        position: 'absolute',
        right: 20,
        top: 20,
    },
    settingsList: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 10,
        marginBottom: 10,
        borderRadius: 6,
        backgroundColor: globalStyles.colors.white_3
    },
    settingsText: {
        marginLeft: 10, 
        color: '#fff',
        fontWeight: '600'
    }
})