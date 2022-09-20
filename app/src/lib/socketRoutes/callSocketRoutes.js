import store from "../../redux/store";
import { chatReducer } from "../../redux/chat";
import { callSettingReducer } from "../../redux/callSettings";

function callInit(data, socket){
    const state         =   store.getState().chatReducer.value
    const callSettings  =   store.getState().callSettingReducer
    const USER_DATA     =   state.USER_DATA

    if(!data.initiator && !callSettings.isActive){
        store.dispatch(callSettingReducer({...data}))
    } else if(callSettings.id !== data.id) {
        
        // You are already busy in a call, so perhaps this could be tweaked better
        socket.emit('call-closed', {
            id: callSettings.id,
            user_id: USER_DATA.account_id,
            name: `${USER_DATA.firstname} ${USER_DATA.lastname}`,
            reason: `${USER_DATA.firstname} ${USER_DATA.lastname} is busy in another call`,
            room: data.joined.filter(e => e.id !== USER_DATA.account_id)
        })
    }
}

function callJoin(data){
    const state         =   store.getState().chatReducer.value
    const callSettings  =   store.getState().callSettingReducer
    const USER_DATA     =   state.USER_DATA

    store.dispatch(callSettingReducer({
        signalData: data.signal,
        joined: [...store.getState().callSettingReducer.joined, data.joined]
    }))
}

export { callInit, callJoin }