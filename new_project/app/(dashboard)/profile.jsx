import ThemedView from "../../components/ThemedView"

import { StyleSheet, Text } from "react-native";

import { Link } from "expo-router";

const Profile = () => {
    return (
        <ThemedView style={styles.container}>

            <Text style={styles.heading}>
                Мои данные:
            </Text>

            <Text>
                Имя:
            </Text>

            <Text>
                Логин:
            </Text>

            <Text style={{marginTop: 100}}>
                Для выхода из учетной записи нажмите кнопку ниже:
            </Text>

            <Link href="/" style={[styles.card, {marginTop: 20}]}>
                <Text style={{textAlign: 'center'}}>
                    Выход
                </Text>
            </Link>

        </ThemedView>
    )
}

export default Profile;

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
        borderRadius: 5,
        boxShadow: '4px 4px rgba(0, 0, 0, 0.3)'
    },

})