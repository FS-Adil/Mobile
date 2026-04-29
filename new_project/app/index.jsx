import { StyleSheet, Text, View, Image } from 'react-native'
import { Link } from 'expo-router'

import Logo from '../assets/img/icon.png'
import ThemedView from '../components/ThemedView'

const Home = () => {
    return (
        <ThemedView style={styles.container}>

            <Image source={Logo} style={[styles.img, {width: 200, height: 200, borderRadius: 10}]} ></Image>

            <Text style={[styles.title, {textAlign: 'center'}]}>Стартовая страница для приложения ФинКровля Mobile</Text>

            <Text style={{marginTop: 40, marginBottom: 5, textAlign: 'center'}}>Доступные страницы для не авторизованных пользователей!</Text>

            <Link href="/about" style={[styles.card, {marginTop: 20}]}>
                Информация о приложении
            </Link>

            <Link href="/login" style={[styles.card, {marginTop: 20}]}>
                Страница входа
            </Link>

        </ThemedView>
    )
}

export default Home

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