import axios from "axios";
import store from "../src/redux/store";
import { chatReducer } from "../src/redux/chat";
import { useDispatch } from "react-redux";
import informationManager from "../src/lib/informationManager";

export function postRequest(URL, payload, headers){
    return new Promise((resolve, reject) => {
        let url = `https://risala.codenoury.se/api/${URL}`

        axios.post(url, payload, headers)
        .then((response) => {
            if(response.status === 200){
                resolve(response.data)
            } else {
                reject(response.data)
            }
        })
        .catch((err) => {
            reject(err)
        })
    })
}

export function getRequest(URL){
    return new Promise((resolve, reject) => {
        let url = `https://risala.codenoury.se/api/${URL}`

        axios(URL)
        .then((response) => {
            if(response.status === 200){
                resolve(response.data)
            } else {
                reject(response.data)
            }
        })
        .catch((err) => {
            reject(err)
        })
    })
}

export function errorManagement(payload){
    const state = store.getState().chatReducer.value
    const MESSAGES = state.MESSAGES

    return new Promise((resolve, reject) => {
        let url = `https://risala.codenoury.se/api/error`
    
        try {
            axios.post(url, {
                message: typeof payload.message === "string" ? payload.message : payload
            })
            .then((response) => {
                if(response.status === 200){
                    informationManager({ purpose: 'error', message: payload.message })
                    resolve(true)
                }
            })
            .catch((err) => {
                reject(err)
            })
        } catch (err) {
            reject(err)
        }
    })
}