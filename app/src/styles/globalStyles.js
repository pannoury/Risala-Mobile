import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
    views: {
        width: '90%'
    },
    colors: {
        yellow: '#ffb301',
        yellow_10: '#d39400',
        white: '#fff',
        white_1: '#ffffffb3',
        white_2: '#ffffff33',
        white_3: '#ffffff1a',
        black:   '#000',
        black_1: '#141414',
        black_2: '#ffffff1a',
        black_3: '#2c2c2c',
        black_4: '#1d1d1d',
        red: '#e62b2b'
    },
    text: {
        whiteHeader: {
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 40
        },
        subText: {
            color: '#ffffffb3',
            marginTop: 10,
            marginBottom: 10,
            fontSize: 18,
            textAlign: 'center'
        },
        label: {
            color: '#ffffffb3',
            fontWeight: 'bold',
            marginBottom: 4,
        }
    },
    input: {
        borderColor: '#ffffffb3',
        borderWidth: 1,
        borderRadius: 6,
        minHeight: 50,
        backgroundColor: '#141414',
        color: '#fff',
        paddingLeft: 10,
        marginBottom: 14
    }, 
    button: {
        borderRadius: 6,
        backgroundColor: '#ffb301',
        color: '#000',
        padding: 20,
        marginBottom: 20,
    }
})