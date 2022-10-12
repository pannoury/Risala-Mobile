import React, { useEffect } from "react"
import { Modal, View, Image, Text, StyleSheet, Button, Pressable, TouchableOpacity, Dimensions } from "react-native"
import { useSelector, useDispatch } from "react-redux"
import { globalStyles } from "../../../src/styles/globalStyles"
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

// Animation
import Animated, { runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { PanGestureHandler } from "react-native-gesture-handler";

export default function UserModal({ userSettings, setUserSettings }){
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)

    useEffect(() => {
        translateY.value = !userSettings ? 0 : translateY.value
    }, [userSettings])

    // Animations
    const translateY = useSharedValue(0)

    const panGestureEvent = useAnimatedGestureHandler({
        onStart: (event, context) => {
            context.translateY = translateY.value
        },
        onActive: (event, context) => {
            if(translateY.value < 0){
                translateY.value = -2
            } else {
                translateY.value = event.translationY + context.translateY
            }
        },
        onEnd: () => {
            if(translateY.value > 20){
                test();
            } else {
                translateY.value = withTiming(0);
            }
        },
    })

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {translateY: translateY.value}
            ]
        }
    })

    function test(){
        'worklet';
        console.log('test')
    }

    return(
        <Modal
            animationType="slide"
            visible={userSettings}
            transparent={true}
        >
            <PanGestureHandler onGestureEvent={panGestureEvent}>
            <Animated.View style={[style.view, animatedStyle]}>
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
                        source={{uri: USER_DATA.profile_picture ? `https://risala.datablock.dev/${USER_DATA.profile_picture.substring(3)}` : "https://datablock.dev/assets/generic-profile-picture.png"}}
                    />
                    <Text style={{color: '#fff', fontSize: 22, fontWeight: '800'}}>{`${USER_DATA.firstname} ${USER_DATA.lastname}`}</Text>
                </View>
                <View style={{width: '80%', marginTop: 40}}>
                    <TouchableOpacity style={style.settingsList}><MaterialIcons color="#fff" size={22} name="bug-report"/><Text style={style.settingsText}>Bug reporting</Text></TouchableOpacity>
                    <TouchableOpacity style={style.settingsList}><MaterialIcons color="#fff" size={22} name="settings"/><Text style={style.settingsText}>Settings</Text></TouchableOpacity>
                    <TouchableOpacity style={style.settingsList}><MaterialIcons color="#fff" size={22} name="logout"/><Text style={style.settingsText}>Log out</Text></TouchableOpacity>
                </View>
            </Animated.View>
            </PanGestureHandler>
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