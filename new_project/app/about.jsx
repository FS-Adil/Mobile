import { StyleSheet, Text, View, Image } from "react-native";
import { Link } from 'expo-router'

import Logo from '../assets/img/icon.png'
import ThemedView from "../components/ThemedView";

const About = () => {
    return (
        <ThemedView style={styles.container}>

            <Image source={Logo} style={[styles.img, {width: 200, height: 200, borderRadius: 10}]}></Image>

            <Text style={{textAlign: 'center', padding: 20}}>
                Данное приложение разработано для внутреннего пользования сотрудниками компании ФинКровля. 
                Для входа в приложение, перейдите на Домашнюю страницу и авторизуйтесь. 
                Если у Вас нет учетной записи для входа в приложение, обратитесь в ИТ-отдел компании ФинКровля.
            </Text>

            <Link href="/" style={[styles.card, {marginTop: 20}]}>
                Домашняя страница
            </Link>

        </ThemedView>
    )
}

export default About;

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