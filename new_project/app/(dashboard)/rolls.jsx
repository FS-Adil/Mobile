import ThemedView from "../../components/ThemedView"

import { StyleSheet, Text, FlatList, View } from "react-native";
import { useState, useEffect } from "react";

import { getProducts, } from "../../services/new_api";
import { Colors } from "../../constants/Colors";

const Rolls = () => {

    const [products, setProducts] = useState([]);

    const [err, setError] = useState(null)



    const loadProducts = async () => {

        setError(null)

        try {

            const data = await getProducts();
            setProducts(data);

        } catch (error) {
            setError(error.message)
        }

    };

    const renderProduct = ({ item }) => (
        <View style={styles.productCard}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>{item.price.toLocaleString()} ₽</Text>
        </View>
    );


    useEffect(() => {
        loadProducts();
    }, []);

    return (
        <ThemedView style={styles.container}>
            <Text>
                Здесь будет список рулонов!
            </Text>

            <FlatList
                data={products}
                renderItem={renderProduct}
                // keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                // refreshControl={
                // <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                // }
                ListEmptyComponent={
                <Text style={styles.emptyText}>Товары не найдены</Text>
                }
            />

            {err && <Text style={styles.error}>
                                    {err}
                                </Text>}
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
    error: {
        color: Colors.warning,
        padding: 10,
        backgroundColor: '#f5c1c8',
        borderColor: Colors.warning,
        borderWidth: 1,
        borderRadius: 6,
        marginHorizontal: 10,
    },
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    productPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#28a745',
        marginTop: 10,
    },
    listContainer: {
        padding: 20,
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 16,
        marginTop: 50,
    },
})