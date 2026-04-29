import { View, useColorScheme} from "react-native";
import { Colors } from "../constants/Colors";

const ThemedView = ({style, children, ...props}) => {

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    return (
        <View style={[{
            backgroundColor: theme.background,
            padding: 20,
        }, style]} {...props}>
            {children}
        </View>
    )
}

export default ThemedView;