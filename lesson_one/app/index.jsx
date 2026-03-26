import {StyleSheet, Text, View, Image} from 'react-native'
import Logo from '../assets/icon.png'
import {Link} from 'expo-router'

const Home = () => {
    return (
        <View style={styles.container}>

            <Image 
                source={Logo} 
                style={[styles.img, {width: 120, height: 120}]}
            ></Image>

            <Text style={styles.title}>
                The number 1
            </Text>

            <Text style={{marginTop: 10, marginBottom: 30}}>
                Reading List App
            </Text>

            <Link href='/about' style={styles.link}>
                About Page
            </Link>

            <Link href='/contact' style={[styles.link, {marginTop: 10, marginBottom: 30}]}>
                Contact Page
            </Link>

        </View>
    )
}

export default Home;

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
    img: {
        marginVertical: 20,
    },
    link: {
        backgroundColor: '#eee',
        padding: 20,
        borderRadius: 5,
        boxShadow: '4px 4px rgba(0, 0, 0, 0.1)',
    }
})