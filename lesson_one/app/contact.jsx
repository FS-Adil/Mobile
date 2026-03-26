import {StyleSheet, Text, View, Image} from 'react-native'

import {Link} from 'expo-router'

const Contact = () => {
    return (
        <View style={styles.container}>

            <Text style={styles.title}>
                Contact Page
            </Text>

            <Link href='/' style={[styles.link, {marginTop: 10, marginBottom: 30}]}>
                Home Back
            </Link>

        </View>
    )
}

export default Contact;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    link: {
        backgroundColor: '#eee',
        padding: 20,
        borderRadius: 5,
        boxShadow: '4px 4px rgba(0, 0, 0, 0.1)',
    }
})