import { Text, StyleSheet } from "react-native";

import { Link } from "expo-router";

import ThemedView from "../../components/ThemedView";
import ThemedButton from "../../components/ThemedButton";

const Register = () => {

    const handleSubmit = () => {
        console.log("Register is life!")
    }

    return (
        <ThemedView style={styles.container}>

            <Text style={styles.title}>
                Регистрация пользователя!
            </Text>

            <ThemedButton onPress={handleSubmit}>
                <Text style={{color: '#f2f2f2', textAlign: 'center'}}>
                    Регистрация
                </Text>
            </ThemedButton>

            {/* <Text style={{textAlign: 'center', marginTop: 100}}>
                Если у Вас есть учетка, пройдите на страницу входа!
            </Text>

            <Link href={'/login'}  style={[styles.card, {marginTop: 10}]}>
                <Text style={{ textAlign: 'center'}}>
                    Страница входа
                </Text>
            </Link> */}

            <Link href="/rolls" style={[styles.card, {marginTop: 20}]}>
                <Text style={{textAlign: 'center'}}>
                    На Главную
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
        alignItems: 'center'
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