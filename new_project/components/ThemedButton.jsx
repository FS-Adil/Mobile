import { StyleSheet, Pressable } from "react-native";

import { Colors } from "../constants/Colors";


const ThemedButton = ({style, children, ...props}) => {

    return (
        <Pressable 
            style={({pressed}) => [styles.bnt, pressed && styles.pressed, style]}
            {...props}
        >
            {children}
        </Pressable>
    )
}

export default ThemedButton;

const styles = StyleSheet.create({

    bnt: {
        backgroundColor: Colors.primary,
        padding: 18,
        borderRadius: 6,
        marginVertical: 10
    },
    pressed: {
        opacity: 0.8,
    },

})