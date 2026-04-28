import { StyleSheet, Text, View, Image } from "react-native";
import { Link } from 'expo-router'

import Logo from '../assets/img/icon.png'

const Contact = () => {
    return (
        <View style={styles.container}>

            <Image source={Logo} style={[styles.img, {width: 200, height: 200, borderRadius: 10}]}></Image>

            <Text style={styles.title}>
                Contact Page
            </Text>

            <Link href="/" style={[styles.card, {marginTop: 20}]}>
                Home Page
            </Link>

        </View>
    )
}

export default Contact;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        paddingTop: 20,
        fontWeight: 'bold',
        fontSize: 18
    },
    card: {
        backgroundColor: '#eee',
        padding: 20,
        borderRadius: 5,
        boxShadow: '4px 4px rgba(0, 0, 0, 0.3)'
    },
    img: {
        marginVertical: 20,
    }
})