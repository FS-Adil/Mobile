import { Text, StyleSheet, } from "react-native";

import { Link, useRouter } from "expo-router";

import ThemedView from "../../components/ThemedView";
import ThemedButton from "../../components/ThemedButton";
import ThemedTextInput from "../../components/ThemedTextInput";
import { useState } from "react";
import { useUser } from "../../hooks/useUser";

const Login = () => {

    const router = useRouter();

    const [email, setEmail] = useState('')

    const [password, setPassword] = useState('')

    const { user } = useUser()

    const handleSubmit = () => {
        console.log("current user ", user)
        console.log("Input is life! ", email, password)
        router.push('/rolls'); 
    }

    return (
        <ThemedView style={styles.container}>

            <Text style={styles.title}>
                Пройдите авторизацию для использования данного приложения!
            </Text>

            <ThemedTextInput 
                style={{ width: '80%', marginBottom: 20 }}
                placeholder="Email" 
                keyboardType="email-address"
                onChangeText={setEmail}
                value={email}
            />

            <ThemedTextInput 
                style={{ width: '80%', marginBottom: 20 }}
                placeholder="Password" 
                onChangeText={setPassword}
                value={password}
                secureTextEntry
            />

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