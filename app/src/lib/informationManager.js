import store from "../redux/store";
import { chatReducer } from "../redux/chat";
import { v4 as uuidv4 } from "uuid";

export default function informationManager(value){
    const state = store.getState().chatReducer.value 
    const MESSAGES = state.MESSAGES

    var object = {
        ...value,
        id: uuidv4()
    }

    store.dispatch(chatReducer({
        MESSAGES: [object, ...MESSAGES]
    }))
}