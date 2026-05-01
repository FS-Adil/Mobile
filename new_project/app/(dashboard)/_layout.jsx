import { Tabs, } from "expo-router";

import { StatusBar, useColorScheme } from "react-native";
import { Ionicons } from '@expo/vector-icons'

import { Colors } from "../../constants/Colors";


export default function DashboardLayout() {

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    return (
        <>
            <StatusBar value="auto"/>
            <Tabs
                screenOptions={{
                    headerShown: false, 
                    tabBarStyle: {
                        backgroundColor: theme.navBackground,
                        paddingTop: 5,
                        paddingBottom: 60,
                        height: 120,
                    },
                    tabBarActiveTintColor: theme.iconColorFocused,
                    tabBarInactiveTintColor: theme.iconColor,
                }}
            >
                <Tabs.Screen 
                    name="rolls" 
                    options={{title: 'Рулоны', tabBarIcon: ({focused}) => (
                        <Ionicons
                            size={25}
                            name={focused ? 'document-text' : 'document-text-outline'}
                            color={focused ? theme.iconColorFocused : theme.iconColor}
                        />
                    )}}
                />
                <Tabs.Screen 
                    name="create" 
                    options={{title: 'Настройки', tabBarIcon: ({focused}) => (
                        <Ionicons
                            size={24}
                            name={focused ? 'settings' : 'settings-outline'}
                            color={focused ? theme.iconColorFocused : theme.iconColor}
                        />
                    )}}
                />
                <Tabs.Screen 
                    name="profile" 
                    options={{title: 'Профиль', tabBarIcon: ({focused}) => (
                        <Ionicons
                            size={24}
                            name={focused ? 'person' : 'person-outline'}
                            color={focused ? theme.iconColorFocused : theme.iconColor}
                        />
                    )}}
                />
            </Tabs>
        </>
    )
}