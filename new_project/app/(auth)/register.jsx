import { Text, StyleSheet, TouchableWithoutFeedback, Keyboard } from "react-native";

import { Link, useRouter } from "expo-router";

import ThemedView from "../../components/ThemedView";
import ThemedButton from "../../components/ThemedButton";
import ThemedTextInput from "../../components/ThemedTextInput";

import { useState } from "react";
import { useUser } from "../../hooks/useUser";

const Register = () => {

    const router = useRouter();

    const [userName, setUserName] = useState('')
    
    const [password, setPassword] = useState('')

    const [err, setError] = useState(null)

    const { user, register } = useUser()

    const handleSubmit = async() => {

        setError(null)

        try {

            await register(userName, password)
            router.push('/register'); 

        } catch (error) {
            setError(error.message)
        }
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ThemedView style={styles.container}>

                <Text style={styles.title}>
                    Регистрация пользователя!
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

                <Link href="/create" style={[styles.card, {marginTop: 20}]}>
                    <Text style={{textAlign: 'center'}}>
                        На Главную
                    </Text>
                </Link>

            </ThemedView>
        </TouchableWithoutFeedback>
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