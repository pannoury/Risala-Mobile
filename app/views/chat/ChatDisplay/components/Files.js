import React from "react";
import { View, Text, Image, Dimensions, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../../../src/redux/chat";
import fileSizeFormatter from '../../../../src/lib/fileSizeFormatter'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { Video, AVPlaybackStatus } from 'expo-av';
import { globalStyles } from "../../../../src/styles/globalStyles";

export default function Files({ value, filePath, recieved, fileReply, reply }){
    const dispatch = useDispatch();
    const current = useSelector((state) => state.chatReducer.value.current)
    const filesAndMedia = useSelector((state) => state.chatReducer.value.filesAndMedia)
    const chat_settings = useSelector((state) => state.chatReducer.value.chat_settings)

    //Styled components for Aspect Ratios
    const smallSize = Dimensions.get("window").width * 0.2
    const midSize = Dimensions.get("window").width * 0.25
    const largeSize = Dimensions.get("window").width * 0.3621
    const oneToOne = { width: midSize, height: midSize, borderRadius: 3}
    const sixteenToNine = { width: largeSize, height: smallSize, borderRadius: 3}
    const nineToSixteen = { width: smallSize, height: largeSize, borderRadius: 3}

    function fileClick(e){
        dispatch(chatReducer({
            imageCarousel: {
                images: filesAndMedia.images,
                selected: e
            }
        }))
    }

    if(value.text === ""){
        return(
            <>
                {   (!fileReply && filePath) &&
                    filePath.map((value, index) => {
                        
                        var type = value.type.split('/')[0]
                        //The file is an image
                        if(type === "image" || type === "video"){

                            var imageStyle;
                            var width = value.dimensions[0]
                            var heigth = value.dimensions[1]
                            var aspectRatio = width/heigth
                    
                            if(aspectRatio > 1){ //16:9
                                imageStyle = sixteenToNine
                            } else if(aspectRatio === 1){
                                imageStyle = oneToOne
                            } else {
                                imageStyle = nineToSixteen
                            }

                            if(type === "image"){
                                return(
                                    <TouchableOpacity style={{marginRight: 8}}>
                                        <Image 
                                            key={value.path + index + 'not-reply'} 
                                            style={imageStyle}
                                            onClick={(() => { fileClick(value.path) })}
                                            source={{uri: `https://risala.codenoury.se/${value.path.substring(3)}`}}
                                        />
                                    </TouchableOpacity>
                                )
                            } else {
                                return(
                                    <TouchableOpacity>
                                        <Video
                                            className="video" 
                                            key={value.path + index + 'not-reply'} 
                                            style={imageStyle}
                                            onClick={(() => { fileClick(value.path) })}
                                            source={{uri: `https://risala.codenoury.se/${value.path.substring(3)}`}}
                                        />
                                    </TouchableOpacity>
                                )
                            }
                        } else {
                            
                            var fileSize = fileSizeFormatter(value.size, 2)

                            //The file is a file or a non-image, treat it as a file
                            return(
                                <>
                                    <View 
                                        className="file-wrapper" 
                                        href={`https://risala.codenoury.se/${value.path.substring(3)}`} 
                                        target="_blank" rel="noopener noreferrer" 
                                        title={value.name}
                                        key={value.path + index + 'not-reply'} 
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            backgroundColor: '#393939', 
                                            paddingLeft: 10, 
                                            paddingRight: 10,
                                            paddingTop: 8,
                                            paddingBottom: 8,
                                            borderRadius: 6
                                        }}
                                    >
                                        <View style={{backgroundColor: '#000', padding: 6, width: 30, height: 30, marginRight: 6, borderRadius: 15, alignItems: 'center', justifyContent: 'center'}}>
                                            <MaterialIcons name="description" size={20} color={'#fff'}/>
                                        </View>
                                        <View className="file-description">
                                            <Text style={{color: '#fff', fontWeight: '600'}}>{value.path.substring(21)}</Text>
                                            <Text style={{color: globalStyles.colors.white_1}}>{fileSize}</Text>
                                        </View>
                                    </View>
                                </>
                            )

                        }
                    })
                }
                {
                    (fileReply && filePath) &&
                    filePath.map((value, index) => {
                        try {
                            var fileObject = filesAndMedia.files.find(e => e.path === value)
                        } catch {
                            var fileObject = current.files.files.find(e => e.path === value)
                        }
                        var fileSize = fileSizeFormatter(fileObject.size, 2)
                        return(
                            fileObject &&
                            <TouchableOpacity>
                                <View
                                    className="file-wrapper" 
                                    href={`https://risala.codenoury.se/${fileObject.path.substring(3)}`} 
                                    target="_blank" rel="noopener noreferrer" 
                                    title={fileObject.path}
                                    key={fileObject.path + 'file-reply'}
                                >
                                    <MaterialIcons name="description" />
                                    <View className="file-description">
                                        <Text>{fileObject.path.substring(21)}</Text>
                                        <Text>{fileSize}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )
                    })
                }
            </>
        )
    } else {
        return(
            <View className="file-message">
                <View className="files">
                {
                    (!fileReply && filePath) &&
                    filePath.map((value, index) => {
                        
                        var type = value.type.split('/')[0]
                        //The file is an image
                        if(type === "image" || type === "video"){

                            var imageStyle;
                            var width = value.dimensions[0]
                            var heigth = value.dimensions[1]
                            var aspectRatio = width/heigth
                    
                            if(aspectRatio > 1.7 && aspectRatio < 1.8){ //16:9
                                imageStyle = sixteenToNine
                            } else if(aspectRatio === 1){
                                imageStyle = oneToOne
                            } else {
                                imageStyle = nineToSixteen
                            }

                            if(type === "image"){
                                return(
                                    <TouchableOpacity>
                                        <Image 
                                            key={value.path} 
                                            onClick={(() => { fileClick(value.path) })}
                                            style={imageStyle}
                                            source={{uri: `https://risala.codenoury.se/${value.path.substring(3)}`}}
                                        />
                                    </TouchableOpacity>
                                )
                            } else {
                                return(
                                    <TouchableOpacity>
                                        <Video
                                            className="video" 
                                            key={value.path} 
                                            onClick={(() => { fileClick(value.path) })}
                                            style={imageStyle}
                                            source={{uri: `https://risa.codenoury.se/${value.path.substring(3)}`}}
                                        />
                                    </TouchableOpacity>
                                )
                            }
                        } else {
                            var fileSize = fileSizeFormatter(value.size, 2)
                            //The file is a file or a non-image, treat it as a file
                            return(
                                <TouchableOpacity>
                                    <View 
                                        className="file-wrapper" 
                                        href={`https://risala.codenoury.se/${value.path.substring(3)}`} 
                                        target="_blank" rel="noopener noreferrer" 
                                        title={value.name}
                                        key={value.path}
                                    >
                                        <MaterialIcons name="description" />
                                        <View className="file-description">
                                            <Text>{value.path.substring(21)}</Text>
                                            <Text>{fileSize}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )
                        }
                    })
                }
                {
                    (fileReply && filePath) &&
                    filePath.map((value, index) => {

                        try {
                            var fileObject = filesAndMedia.files.find(e => e.path === value)
                        } catch {
                            var fileObject = current.files.files.find(e => e.path === value)
                        }
                        
                        var fileSize = fileSizeFormatter(fileObject.size, 2)
                        return(
                            fileObject &&
                            <TouchableOpacity>
                                <View 
                                    className="file-wrapper" 
                                    href={`https://risala.codenoury.se/${fileObject.path.substring(3)}`} 
                                    target="_blank" rel="noopener noreferrer" 
                                    title={fileObject.path}
                                    key={fileObject.path}
                                >
                                    <MaterialIcons name="description"/>
                                    <View className="file-description">
                                        <Text>{fileObject.path.substring(21)}</Text>
                                        <Text>{fileSize}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )
                    })
                }
                </View>
                {
                    !fileReply &&
                    <View className="message" style={!recieved ? {backgroundColor: chat_settings.color} : null}>
                        <Text>{value.text}</Text>
                    </View>
                }
            </View>
        )
    }
}