import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, Image } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../../src/redux/chat";
import useLocale from "../../../src/lib/useLocale";
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

export default function GroupMembers({group, admin, setAdmin, options, setOptions, selected, setSelected}){
    const dispatch = useDispatch();
    const current = useSelector((state) => state.chatReducer.value.current)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const settings = useSelector((state) => state.chatReducer.value.settings)

    const locale = useLocale();
    const [expanded, setExpanded] = useState(false)

    useEffect(() => {
        if(!settings){
            setExpanded(false)
            setOptions(false)
        }
    }, [settings])

    useEffect(() => {
        if(current && USER_DATA){
            if(current.roles){
                if(USER_DATA.account_id === current.roles.admin){
                    setAdmin(true)
                } else {
                    setAdmin(false)
                }
            } else {
                setAdmin(false)
            }
        }
    }, [current])
    

    function addMember(){
        dispatch(chatReducer({
            isChat_window: true,
            chat_window: {purpose: 'add_member'},

        }))
    }

    function expandFunction(){
        setExpanded(!expanded)
    }

    function moreOptionSelect(value, e){
        setSelected(value)
        setOptions(e.clientY)
    }

    return(
        <View className={expanded ? "options-wrapper-wrapper expanded" : "options-wrapper-wrapper"}>
            <View
                className="options-wrapper-wrapper-header"
                onClick={expandFunction} 
            >
                <Text>{locale === "en" ? "Chat members" : "Chattmedlemmar"}</Text>
                <MaterialIcons name="expand-more" className="material-icons more" />
                <MaterialIcons name="expand-less" className="material-icons less" />
            </View>
            <View className="options-wrapper">
                {
                    group &&
                    group.map((value, index) => {
                        return(
                            <View
                                className="group-member"
                                key={index}
                            >
                                <View className="user-info-wrapper">
                                    <Image soure={{uri: value.profile_picture ? `https://risala.datablock.dev/${value.profile_picture.substring(3)}` : "https://datablock.dev/assets/generic-profile-picture.png"}}/>
                                    <View>
                                        <Text>{value.firstname + ' ' + value.lastname}</Text>
                                        {
                                            current.roles &&
                                            <>
                                                {
                                                    current.roles.creator === value.id &&
                                                    <Text>{locale === "en" ? "Group creator" : "Gruppskapare"}</Text>
                                                }
                                                {
                                                    (current.roles.admin === value.id && current.roles.creator !== value.id) &&
                                                    <Text>Admin</Text>
                                                }
                                                {
                                                    current.roles.admin !== value.id && current.roles.creator !== value.id &&
                                                    <Text>{locale === "en" ? "Member" : "Gruppmedlem"}</Text>
                                                }
                                            </>
                                        }
                                    </View>
                                </View>
                                <View className="member-options" onClick={((e) => { moreOptionSelect(value, e) })}>
                                    <MaterialIcons name="more-horiz" className="material-icons" />
                                </View>
                            </View>
                        )
                    })
                }
                <View className="group-member">
                    <View className="user-info-wrapper">
                        <Image source={{uri: USER_DATA.profile_picture ? `https://risala.datablock.dev/${USER_DATA.profile_picture.substring(3)}` : "https://datablock.dev/assets/generic-profile-picture.png"}}/>
                        <View>
                            <Text>{USER_DATA.firstname + ' ' + USER_DATA.lastname}</Text>
                            {
                                current.roles &&
                                <>
                                    {
                                        current.roles.creator === USER_DATA.account_id &&
                                        <Text>{locale === "en" ? "Group creator" : "Gruppskapare"}</Text>
                                    }
                                    {
                                        (current.roles.admin === USER_DATA.account_id && current.roles.creator !== USER_DATA.account_id) &&
                                        <Text>Admin</Text>
                                    }
                                    {
                                        current.roles.admin !== USER_DATA.account_id && current.roles.creator !== USER_DATA.account_id &&
                                        <Text>{locale === "en" ? "Member" : "Gruppmedlem"}</Text>
                                    }
                                </>
                            }
                        </View>
                    </View>
                    <View className="member-options" onClick={((e) => { moreOptionSelect(USER_DATA, e) })}>
                        <MaterialIcons name="more-horiz" className="material-icons" />
                    </View>
                </View>
                <View className="settings-option" onClick={addMember}>
                    <View className="add">
                        <MaterialIcons name="add" className="material-icons" />
                    </View>
                    <Text>{locale === "en" ? "Add members" : "Lägg till personer"}</Text>
                </View>
            </View>
        </View>
    )
}