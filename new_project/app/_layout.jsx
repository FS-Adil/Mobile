import { Stack } from "expo-router";
import { StatusBar, StyleSheet, useColorScheme} from "react-native";

import { Colors } from "../constants/Colors";


const RootLayout = () => {

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    return (
        <>
            <StatusBar value="auto"/>
            <Stack screenOptions={{
                headerStyle: {backgroundColor: theme.background},
                headerTintColor: theme.title,
            }}>
                <Stack.Screen name="index" options={{title: 'Домашняя страница'}}/>
                <Stack.Screen name="about" options={{title: 'Информация'}}/>
                <Stack.Screen name="(auth)" options={{headerShown: false }}/>
            </Stack>
        </>
    )
}

export default RootLayout;

const styles = StyleSheet.create({

})