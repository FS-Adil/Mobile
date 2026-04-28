import { Stack } from "expo-router";
import { StyleSheet} from "react-native";


const RootLayout = () => {
    return (
        <Stack screenOptions={{
            headerStyle: {backgroundColor: '#ddd'},
            headerTintColor: '#333',
        }}>
            <Stack.Screen name="index" options={{title: 'Домашняя страница'}}/>
            <Stack.Screen name="contact" options={{title: 'Наши контакты'}}/>
            <Stack.Screen name="about" options={{title: 'Наша История'}}/>
        </Stack>
    )
}

export default RootLayout;

const styles = StyleSheet.create({

})