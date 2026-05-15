import ThemedView from "../../components/ThemedView"
import ThemedButton from "../../components/ThemedButton";

import { StyleSheet, Text } from "react-native";
import { useUser } from "../../hooks/useUser";

import { useRouter } from "expo-router";

import { useState, useEffect } from "react";

import { tokenStorage } from "../../storage/tokenStorage";


const Profile = () => {

    const [userRole, setUserRole] = useState(null);
    const [userName, setUserName] = useState(null);

    useEffect(() => {
        const loadUserData = async () => {
        const { role, username } = await tokenStorage.getUserData();
        setUserRole(role);
        setUserName(username);
        console.log('User role:', role);
        console.log('User name:', username);
        };
        
        loadUserData();
    }, []);

    const router = useRouter();

    const { logout } = useUser()


    const handleSubmit = async() => {

            router.push('/');
            await logout()
             
    }

    return (
        <ThemedView style={styles.container}>

            <Text style={styles.heading}>
                Мои данные:
            </Text>

            <Text>
                {/* Роль: {user?.role || 'Гость'} */}
                Роль: {userRole || 'Гость'}
            </Text>

            <Text>
                {/* Логин: {user?.login || 'Не авторизован'} */}
                Логин: {userName || 'Не авторизован'}
            </Text>

            <Text style={{marginTop: 100}}>
                Для выхода из учетной записи нажмите кнопку ниже:
            </Text>


            <ThemedButton onPress={handleSubmit}>
                <Text style={{color: '#f2f2f2'}}>
                    Выход
                </Text>
            </ThemedButton>

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