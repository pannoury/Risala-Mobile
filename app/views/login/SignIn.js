import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Image, Text, TextInput, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles } from "../../src/styles/globalStyles";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../src/redux/chat";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { postRequest } from "../../api/api";
import { setStorage, getStorage } from "../../src/lib/asyncStorage";
 
export default function SignIn({}){
    const dispatch = useDispatch();
    const USER_DATA = useSelector((state) => { state.chatReducer.value.USER_DATA })
    const [isWrong, setIsWrong] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [usernameInput, setUserNameInput] = useState('')
    const [passwordInput, setPasswordInput] = useState('')

    useEffect(() => {
        console.log("Signin")
    }, [])

    function signIn(){
        console.log(usernameInput, passwordInput)
        postRequest('login', {
            username: usernameInput,
            password: passwordInput
        })
        .then((response) => {
            console.log(response)
            if(response === "No match was found"){
                setIsWrong(true)
            } else {
                setIsWrong(false)
                setStorage('user', JSON.stringify({response}))
                dispatch(chatReducer({
                    USER_DATA: {
                        account_id: response.account_id,
                        username: response.username,
                        firstname: response.firstname,
                        lastname: response.lastname,
                        profile_picture: response.profile_picture
                    }
                }))
            }
        })
        .catch((err) => {
            console.error(err)
        })
    }

    return(
        <SafeAreaView>
            <ScrollView style={{minHeight: '100%', backgroundColor: '#000'}}>
                <View style={style.container}>
                    <View style={{width: '90%', alignItems: 'center', justifyContent: 'flex-start'}}>
                        <Image
                            style={style.logo} 
                            source={require('../../assets/logo-long-yellow.png')}
                        ></Image>
                        <Text style={globalStyles.text.whiteHeader}>Sign in</Text>
                        <Text style={globalStyles.text.subText}>
                            Enter your credentials to access the chat application
                        </Text>
                    </View>
                    {
                        isWrong &&
                        <View style={style.wrongDiv}>
                            <Text style={{color: "#fff", fontSize: 12, fontWeight: 'bold'}}>
                                Wrong username/password entered. Please try again
                            </Text>
                        </View>
                    }
                    <View style={{width: '90%'}}>
                        <Text style={globalStyles.text.label}>Username</Text>
                        <TextInput
                            style={style.input}
                            placeholder="joe@hotmail.com"
                            onChangeText={setUserNameInput}
                            value={usernameInput}
                        >
                        </TextInput>
                    </View>
                    <View style={{width: '90%'}}>
                        <Text style={globalStyles.text.label}>Password</Text>
                        <View style={{position: 'relative'}}>
                            <TextInput
                                style={style.input}
                                onChangeText={setPasswordInput}
                                value={passwordInput}
                                secureTextEntry={isVisible ? false : true}
                            >
                            </TextInput>
                            <MaterialCommunityIcons 
                                name={isVisible ? 'eye' : "eye-off"} 
                                size={24} 
                                color={'#fff'}
                                style={{position: 'absolute', right: 10, top: 12}}
                                onPress={(() => { setIsVisible(!isVisible) })}
                            />
                        </View>
                    </View>
                    <View
                        style={{flexDirection: 'column'}}
                    >
                        <Button
                            title="Sign in"
                            color={'#ffb301'}
                            style={globalStyles.button}
                            onPress={signIn}
                        />
                        <View style={style.flexRow}>
                            <Text style={{color: '#fff'}} >Don't have an account?</Text>
                            <Text style={style.link}>Sign up</Text>
                        </View>
                        <View style={style.flexRow}>
                            <Text style={{color: "#fff"}}>Forgotten your password?</Text>
                            <Text style={style.link}>Restore account</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const style = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#000',
        height: '100%',
        width: '100%'
    },
    flexRow: {
        flexDirection: 'row'
    }, 
    color: {
        color: '#ffb301'
    },
    header: {
        fontSize: 40
    },
    logo: {
        width: 200,
        height: 50,
        resizeMode: 'contain',
        margin: 'auto'
    },
    input: {
        ...globalStyles.input,
        width: '100%'
    },
    link: {
        color: '#ffb301',
        marginLeft: 10
    },
    wrongDiv: {
        backgroundColor: 'red',
        borderRadius: 6,
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 20,
        paddingRight: 20,
        maxWidth: '90%',
        marginTop: 20,
        marginBottom: 20,
    }
})