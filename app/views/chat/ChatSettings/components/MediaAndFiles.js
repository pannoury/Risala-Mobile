
    function MediaAndFilesWindow(){
        const selectedMenu = {
            backgroundColor: chat_settings.color
        }

        function fileClick(e){
            dispatch(chatReducer({
                imageCarousel: {
                    images: filesAndMedia.images,
                    selected: e
                }
            }))
        }

        return(
            <>
                <View className="media-files-top">
                    <MaterialIcons 
                        name="keyboard-backspace"
                        className="material-icons"
                        onClick={(() => {
                            setMediaFiles(false)
                            setMediaFilesPurpose(undefined)
                        })}
                    />
                    <Text>{locale === "en" ? "Media and Files" : "Media och Filer"}</Text>
                </View>
                <View className="media-files-selection">
                    <View 
                        className={mediaFilesPurpose === "media" ? "media-files-option selected" : "media-files-option"} 
                        data-value="media"
                        style={mediaFilesPurpose === "media" ? selectedMenu : null}
                        onClick={(() => {
                            setMediaFilesPurpose("media")
                        })}
                    >
                        <Text style={{color: '#fff'}}>Media</Text>
                    </View>
                    <View 
                        className={mediaFilesPurpose === "files" ? "media-files-option selected" : "media-files-option"} 
                        data-value="files"
                        style={mediaFilesPurpose === "files" ? selectedMenu : null}
                        onClick={(() => {
                            setMediaFilesPurpose("files")
                        })}
                    >
                        <Text style={{color: '#fff'}}>{locale === "en" ? "Files" : "Filer"}</Text>
                    </View>
                </View>
                <View className={mediaFilesPurpose === "files" ? "media-files-display files" : "media-files-display"}>
                    {
                        (filesAndMedia && mediaFilesPurpose === "media") &&
                        filesAndMedia.images.map((value, index) => {

                            var type = value.type.split('/')[0]
                            var widthStyle = document.querySelector('.chat-settings').clientWidth * 0.3

                            if(type === "image" || type === "video"){
                                if(type === "video"){
                                    return(
                                        <View 
                                            className="image"
                                            key={value.path}
                                            style={{height: `${widthStyle}px`}}
                                            onClick={(() => { fileClick(value.path) })}
                                        >
                                            <Video src={`../${value.path.substring(3)}`}/>
                                        </View>
                                    )
                                } else {
                                    return(
                                        <View 
                                            className="image"
                                            key={value.path}
                                            style={{height: `${widthStyle}px`}}
                                            onClick={(() => { fileClick(value.path) })}
                                        >
                                            <Image source={{uri: `https://risala.datablock.dev/${value.path.substring(3)}`}}/>
                                        </View>
                                    )
                                }
                            }
                        })
                    }
                    {
                        (filesAndMedia && mediaFilesPurpose === "files") &&
                        filesAndMedia.files.map((value, index) => {
                            var name = value.path.substring(21)
                            var fileSize = fileSizeFormatter(value.size, 2)

                            if(window.location.hostname === "localhost"){
                                return(
                                    <TouchableOpacity 
                                        className="file-row"
                                        key={value.path}
                                        href={`../${value.path.substring(3)}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                    >
                                        <MaterialIcons name="description"/>
                                        <View className="file-description">
                                            <Text style={{color: '#fff'}}>{name.length > 20 ? `${name.substring(0,20)}...` : name}</Text>
                                            <Text style={{color: '#fff'}}>{fileSize}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            } else{
                                return(
                                    <TouchableOpacity 
                                        className="file-row"
                                        key={value.path}
                                        href={`https://risala.datablock.dev/${value.path.substring(3)}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                    >
                                        <MaterialIcons name="description"/>
                                        <View className="file-description">
                                            <Text>{name}</Text>
                                            <Text>{fileSize}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            }
                        })
                    }
                </View>
            </>
        )
    }