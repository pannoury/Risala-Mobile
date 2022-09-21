import React from "react"
import { Modal, View, Image, Text, StyleSheet, Button, Pressable, TouchableOpacity } from "react-native"
import { useSelector, useDispatch } from "react-redux"
import { globalStyles } from "../../../src/styles/globalStyles"
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { PanGestureHandler, NativeViewGestureHandler, State, TapGestureHandler } from 'react-native-gesture-handler';

export default function UserModal({ userSettings, setUserSettings }){
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)

    return(
        <Modal
            animationType="slide"
            visible={userSettings}
            transparent={true}
        >
            <View style={style.view}>
                <View style={style.line}/>
                <Pressable 
                    style={style.button}
                    onPress={(() => { setUserSettings(!userSettings) })}
                >
                    <Text style={{color: "#fff", fontSize: 16, fontWeight: '600'}}>Done</Text>
                </Pressable>
                <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 40}}>
                    <Image 
                        style={{width: 80, height: 80, borderRadius: 40, marginBottom: 10}}
                        source={{uri: USER_DATA.profile_picture ? `https://risala.codenoury.se/${USER_DATA.profile_picture.substring(3)}` : "https://codenoury.se/assets/generic-profile-picture.png"}}
                    />
                    <Text style={{color: '#fff', fontSize: 22, fontWeight: '800'}}>{`${USER_DATA.firstname} ${USER_DATA.lastname}`}</Text>
                </View>
                <View style={{width: '80%', marginTop: 40}}>
                    <TouchableOpacity style={style.settingsList}><MaterialIcons color="#fff" size={22} name="bug-report"/><Text style={style.settingsText}>Bug reporting</Text></TouchableOpacity>
                    <TouchableOpacity style={style.settingsList}><MaterialIcons color="#fff" size={22} name="settings"/><Text style={style.settingsText}>Settings</Text></TouchableOpacity>
                    <TouchableOpacity style={style.settingsList}><MaterialIcons color="#fff" size={22} name="logout"/><Text style={style.settingsText}>Log out</Text></TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

const style = StyleSheet.create({
    line: {
        position: 'absolute',
        top: 10,
        height: 2,
        borderRadius: 3,
        backgroundColor: globalStyles.colors.white_2,
        width: 100
    },
    view: {
        alignItems: 'center',
        marginTop: '16%',
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