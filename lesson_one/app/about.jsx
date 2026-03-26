import {StyleSheet, Text, View, Image, useColorScheme} from 'react-native'
import { Colors } from "../constants/Colors";
import {Link} from 'expo-router'

const About = () => {

    const colorScheme = useColorScheme();
    
    const theme = Colors[colorScheme] ?? Colors.light;

    return (
        <View style={[styles.container, {backgroundColor: theme.background}]}>

            <Text style={[styles.title, {color: theme.title}]}>
                About Page
            </Text>

            <Link href='/' style={[styles.link, {marginTop: 10, marginBottom: 30}]}>
                Home Back
            </Link>

        </View>
    )
}

export default About;

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