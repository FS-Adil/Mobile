import { Text, StyleSheet } from "react-native";

import { Link } from "expo-router";

import ThemedView from "../../components/ThemedView";

const Register = () => {
    return (
        <ThemedView style={styles.container}>

            <Text style={styles.title}>
                Регистрация пользователя!
            </Text>

            <Text style={{textAlign: 'center'}}>
                Если у Вас есть учетка, пройдите на страницу входа!
            </Text>

            <Link href={'/login'}  style={[styles.card, {marginTop: 20}]}>
                <Text style={{ textAlign: 'center'}}>
                    Страница входа
                </Text>
            </Link>

            <Link href="/" style={[styles.card, {marginTop: 20}]}>
                <Text style={{textAlign: 'center'}}>
                    Домашняя страница
                </Text>
            </Link>

        </ThemedView>
    )
}

export default Register;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        textAlign: 'center',
        fontSize: 18,
        marginBottom: 30,
    },
        card: {
        backgroundColor: '#eee',
        padding: 20,
        margin: 20,
        borderRadius: 5,
        boxShadow: '4px 4px rgba(0, 0, 0, 0.3)'
    },
})