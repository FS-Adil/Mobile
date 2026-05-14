import { Text, StyleSheet, TouchableWithoutFeedback, Keyboard, } from "react-native";

import { Link, useRouter } from "expo-router";

import ThemedView from "../../components/ThemedView";
import ThemedButton from "../../components/ThemedButton";
import ThemedTextInput from "../../components/ThemedTextInput";
import { useState } from "react";
import { useUser } from "../../hooks/useUser";
import { Colors } from "../../constants/Colors";

const Login = () => {

    const router = useRouter();

    const [userName, setUserName] = useState('')

    const [password, setPassword] = useState('')

    const [err, setError] = useState(null)

    const { login } = useUser()

    const handleSubmit = async() => {

        setError(null)

        try {

            await login(userName, password)
            router.push('/rolls'); 

        } catch (error) {
            setError(error.message)
        }
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ThemedView style={styles.container}>

                <Text style={styles.title}>
                    Пройдите авторизацию для использования данного приложения!
                </Text>

                <ThemedTextInput 
                    style={{ width: '80%', marginBottom: 20 }}
                    placeholder="Login" 
                    // keyboardType="email-address"
                    onChangeText={setUserName}
                    value={userName}
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

                {err && <Text style={styles.error}>
                        {err}
                    </Text>}

                <Link href="/" style={[styles.card, {marginTop: 20}]}>
                    <Text style={{textAlign: 'center'}}>
                        Домашняя страница
                    </Text>
                </Link>

            </ThemedView>
        </TouchableWithoutFeedback>
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
    error: {
        color: Colors.warning,
        padding: 10,
        backgroundColor: '#f5c1c8',
        borderColor: Colors.warning,
        borderWidth: 1,
        borderRadius: 6,
        marginHorizontal: 10,
    }
})