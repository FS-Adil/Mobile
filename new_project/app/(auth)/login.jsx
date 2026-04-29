import { Text, StyleSheet, } from "react-native";

import { Link, useRouter } from "expo-router";

import ThemedView from "../../components/ThemedView";
import ThemedButton from "../../components/ThemedButton";

const Login = () => {

    const router = useRouter();

    const handleSubmit = () => {
        console.log("Input is life!")
        router.push('/rolls'); 
    }

    return (
        <ThemedView style={styles.container}>

            <Text style={styles.title}>
                Пройдите авторизацию для использования данного приложения!
            </Text>

            <ThemedButton onPress={handleSubmit}>
                <Text style={{color: '#f2f2f2', textAlign: 'center'}}>
                    Вход
                </Text>
            </ThemedButton>


            {/* <Text style={{textAlign: 'center', marginTop: 100}}>
                Пройдите регистрацию если нет учетки!
            </Text> */}

            {/* <Link href={'/register'} style={[ styles.card, {marginTop: 10}]}>
                <Text style={{textAlign: 'center'}}>
                    Регистрация
                </Text>
            </Link> */}

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