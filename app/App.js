import React, {useEffect, useState, userContext} from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View, Image } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { SocketContext, SocketProvider } from './src/lib/Socket';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getStorage } from './src/lib/asyncStorage';
import { postRequest } from './api/api';
import store from './src/redux/store';
import { chatReducer } from './src/redux/chat';

// Views
import Login  from './views/Login';
import Chat   from './views/Chat';


// eslint-disable-next-line prettier/prettier
export default function App({ }){
  const [page, setPage] = useState('Home');

  useEffect(() => {
    setTimeout(() => {
      getStorage('user')
      .then((response) => {
        if(response){
          setPage('Chat')
        } else {
          setPage('Login')
        }
      })
      .catch((err) => {
        console.error(err)
      })
    }, 400);
  }, [])

  useEffect(() => {
    console.log(page)
  }, [page])

  return (
    <Provider store={store}>
      <SocketProvider>
        <SafeAreaProvider>
          <StatusBar
            backgroundColor="#000"
            barStyle={'light-content'}
          />
          {
            page === "Chat" &&
            <Chat 
              page={page}
              setPage={setPage}
            />
          }
          {
            page === "Login" &&
            <Login 
              page={page}
              setPage={setPage}
            />
          }
          {
            page === "Home" &&
            <Home/>
          }
        </SafeAreaProvider>
      </SocketProvider>
    </Provider>
  );
}

function Home(){
  const style = StyleSheet.create({
    image: {
      width: 200,
      height: 50,
      resizeMode: 'contain',
      margin: 'auto'
    }
  })

  return(
    <SafeAreaView style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000'}}>
      <Image
        style={style.image}
        source={require('./assets/logo-long-yellow.png')}
      ></Image>
    </SafeAreaView>
  )
}