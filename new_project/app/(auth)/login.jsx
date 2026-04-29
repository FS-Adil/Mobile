import { Text, StyleSheet } from "react-native";

import { Link } from "expo-router";

import ThemedView from "../../components/ThemedView";

const Login = () => {
    return (
        <ThemedView style={styles.container}>

            <Text style={styles.title}>
                Пройдите авторизацию для использования данного приложения!
            </Text>

            <Link href={'/register'} style={[ styles.card, {marginTop: 100}]}>
                <Text style={{textAlign: 'center'}}>
                    Пройдите регистрацию если нет учетки!
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

export default Login;

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