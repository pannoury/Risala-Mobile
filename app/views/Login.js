import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, Image, StyleSheet, Button, TextInput } from "react-native";
import { getStorage, setStorage } from "../src/lib/asyncStorage";
import { postRequest } from "../api/api";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import 'react-native-gesture-handler';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

// Styles
import { globalStyles } from "../src/styles/globalStyles";

// Components
import SignIn from "../views/login/SignIn";

export default function Login({ page, setPage }){
    const [usernameInput, setUserNameInput] = useState('')
    const [passwordInput, setPasswordInput] = useState('')
    const [isWrong, setIsWrong] = useState(false)

    useEffect(() => {
        getStorage('user')
        .then((response) => {
          if(response){
            checkUser(JSON.parse(response).response)
          }
          
        })
        .catch((err) => {
          console.error(err)
        })
    
        function checkUser(value){
          postRequest('accounts', {
            account: value.account_id, 
            username: value.username
          })
          .then((response) => {
            navigation.navigate('Chat', { name: 'Chat' })
          })
        }
    }, [])

    useEffect(() => {
        console.log(usernameInput)
    }, [usernameInput])

    return(
        <View style={{height: '100%', backgroundColor: '#000'}}>
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen name="Sign In" component={SignIn} options={{ headerShown: false }}/>
                </Stack.Navigator>
            </NavigationContainer>
        </View>
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
        width: '90%'
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