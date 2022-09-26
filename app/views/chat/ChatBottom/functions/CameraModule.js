import React, { useState } from "react";
import { View, Modal, StyleSheet } from "react-native";
import { Camera, CameraType } from 'expo-camera';

export default function CameraModule(){
    const [cameraType, setCameraType] = useState(CameraType.back)

    const style = StyleSheet.create({

    })

    return(
        <Modal
            transparent={true}
        >
            <Camera
                style={{height: '100%', width: '100%'}}
            >
                <View>

                </View>
            </Camera>
        </Modal>
    )
}