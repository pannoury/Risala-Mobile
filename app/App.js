import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Provider } from 'react-redux'
import store from './features/store';
import { SocketContext, SocketProvider } from './components/Socket';
import { useContext } from 'react';
import { useEffect } from 'react';
import { AsyncStorageStatic } from 'react-native';

export default function App() {
  const socket = useContext(SocketContext)

  useEffect(() => {
    console.log("Hello!")
  }, [])

  return (
    <Provider store={store}>
      <SocketProvider>
        <View style={styles.container}>
          <Text>Welcome to Risala!</Text>
          <StatusBar style="auto" />
        </View>
      </SocketProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
