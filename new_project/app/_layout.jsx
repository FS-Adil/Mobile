import { Stack } from "expo-router";
import { StatusBar, StyleSheet, useColorScheme} from "react-native";

import { Colors } from "../constants/Colors";
import { UserProvider } from "../contexts/UserContext";


const RootLayout = () => {

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    return (
        <UserProvider>
            <StatusBar value="auto"/>
            <Stack screenOptions={{
                headerStyle: {backgroundColor: theme.background},
                headerTintColor: theme.title,
            }}>
                <Stack.Screen name="index" options={{title: 'Домашняя страница'}}/>
                <Stack.Screen name="about" options={{title: 'Информация'}}/>
                <Stack.Screen name="(auth)" options={{headerShown: false }}/>
                <Stack.Screen name="(dashboard)" options={{headerShown: false }}/>
            </Stack>
        </UserProvider>
    )
}

export default RootLayout;

const styles = StyleSheet.create({

})