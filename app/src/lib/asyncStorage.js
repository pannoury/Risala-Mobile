import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

function setStorage(name, value){
    return new Promise((resolve, reject) => {
        try {
            AsyncStorage.setItem(name, value)
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}

function getStorage(name){
    return new Promise((resolve, reject) => {
        try {
            AsyncStorage.getItem(name)
            .then((value) => {
                resolve(value)
            })
        } catch (error) {
            reject(error)
        }
    })
}

export { setStorage, getStorage }