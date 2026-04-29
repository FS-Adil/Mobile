import ThemedView from "../../components/ThemedView"

import { StyleSheet, Text } from "react-native";

import { Link } from "expo-router";

const Create = () => {
    return (
        <ThemedView style={styles.container}>
            <Text style={[styles.heading, {marginBottom: 100}]}>
               Страница Администратора
            </Text>

            <Text>
               Регистрация на платформе новых пользователей.
            </Text>

            <Link href={'/register'} style={[ styles.card, {marginTop: 10}]}>
                <Text style={{textAlign: 'center'}}>
                    Регистрация
                </Text>
            </Link>

            <Text>
               Другие настройки...
            </Text>

        </ThemedView>
    )
}

export default Create;

const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    heading: {
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#eee',
        padding: 20,
        margin: 20,
        marginBottom: 50,
        borderRadius: 5,
        boxShadow: '4px 4px rgba(0, 0, 0, 0.3)'
    },
})