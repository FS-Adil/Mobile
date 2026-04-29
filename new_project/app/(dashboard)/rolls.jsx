import ThemedView from "../../components/ThemedView"

import { StyleSheet, Text } from "react-native";

const Rolls = () => {
    return (
        <ThemedView style={styles.container}>
            <Text>
                Здесь будет список рулонов!
            </Text>
        </ThemedView>
    )
}

export default Rolls;

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
})