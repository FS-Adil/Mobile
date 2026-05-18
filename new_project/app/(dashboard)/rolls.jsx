import ThemedView from "../../components/ThemedView"
import { StyleSheet, Text, SectionList, View, TextInput, TouchableOpacity, LayoutAnimation, Platform, UIManager, ActivityIndicator, Modal, KeyboardAvoidingView, Keyboard, ScrollView } from "react-native";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { getProducts } from "../../services/new_api";
import { Colors } from "../../constants/Colors";
import { Ionicons } from '@expo/vector-icons';

// Включаем LayoutAnimation для Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Rolls = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [err, setError] = useState(null);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    
    // Состояния для отслеживания свернутых групп
    const [collapsedOrganizations, setCollapsedOrganizations] = useState({});
    const [collapsedManufacturers, setCollapsedManufacturers] = useState({});

    // Ref для хранения sections и searchInput
    const sectionsRef = useRef([]);
    const progressInterval = useRef(null);
    const searchInputRef = useRef(null);

    // Отслеживание клавиатуры
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    // Функция для симуляции прогресса загрузки
    const startProgressSimulation = () => {
        setLoadingProgress(0);
        let progress = 0;
        
        progressInterval.current = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) {
                progress = 90;
                clearInterval(progressInterval.current);
            }
            setLoadingProgress(Math.min(progress, 90));
        }, 300);
    };

    const completeProgress = () => {
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
        }
        setLoadingProgress(100);
        setTimeout(() => {
            setIsRefreshing(false);
            setLoadingProgress(0);
        }, 500);
    };

    // Функция для нормализации текста
    const normalizeText = (text) => {
        return text?.toString().toLowerCase().replace(/\s+/g, ' ').trim() || '';
    };

    // Функция для разбиения поискового запроса на токены
    const getSearchTokens = (query) => {
        return normalizeText(query)
            .split(' ')
            .filter(token => token.length > 0);
    };

    // Функция для проверки, содержит ли текст все токены
    const containsAllTokens = (text, tokens) => {
        const normalizedText = normalizeText(text);
        return tokens.every(token => normalizedText.includes(token));
    };

    // Функция поиска с умным сопоставлением
    const searchProducts = (products, query) => {
        if (!query.trim()) return products;

        const tokens = getSearchTokens(query);
        if (tokens.length === 0) return products;

        return products.filter(product => {
            const searchableText = [
                product.name,
                product.manufacturer,
                product.organization,
                product.batch,
                product.pricePerSquareMeter?.toString(),
                product.pricePerTon?.toString(),
                product.areaSquareMeters?.toString(),
                product.weightTons?.toString(),
                product.batchDate ? new Date(product.batchDate).toLocaleDateString() : '',
                `${product.name} ${product.manufacturer}`,
                `${product.manufacturer} ${product.name}`,
                `${product.name} ${product.organization}`,
                `${product.manufacturer} ${product.organization}`,
            ].join(' ');

            return containsAllTokens(searchableText, tokens);
        });
    };

    // Группировка продуктов
    const groupProducts = (products) => {
        const grouped = {};

        products.forEach(product => {
            const org = product.organization || 'Без организации';
            const manufacturer = product.manufacturer || 'Без производителя';
            const rollName = product.name || 'Без названия';

            if (!grouped[org]) {
                grouped[org] = {};
            }
            if (!grouped[org][manufacturer]) {
                grouped[org][manufacturer] = {};
            }
            if (!grouped[org][manufacturer][rollName]) {
                grouped[org][manufacturer][rollName] = [];
            }
            grouped[org][manufacturer][rollName].push(product);
        });

        const sectionsData = [];
        
        Object.entries(grouped).forEach(([org, manufacturers]) => {
            const manufacturerData = [];
            
            Object.entries(manufacturers).forEach(([manufacturer, rollNames]) => {
                const rollData = [];
                
                Object.entries(rollNames).forEach(([rollName, items]) => {
                    rollData.push({
                        title: rollName,
                        data: [items],
                        type: 'roll'
                    });
                });
                
                if (rollData.length > 0) {
                    manufacturerData.push({
                        title: manufacturer,
                        data: rollData,
                        type: 'manufacturer',
                        organizationName: org
                    });
                }
            });
            
            if (manufacturerData.length > 0) {
                sectionsData.push({
                    title: org,
                    data: manufacturerData,
                    type: 'organization'
                });
            }
        });

        return sectionsData;
    };

    // Мемоизированные секции с учетом поиска
    const sections = useMemo(() => {
        const filteredProducts = searchProducts(allProducts, searchQuery);
        const grouped = groupProducts(filteredProducts);
        sectionsRef.current = grouped;
        return grouped;
    }, [allProducts, searchQuery]);

    // Подсчет результатов поиска
    const searchResultsCount = useMemo(() => {
        if (!searchQuery.trim()) return null;
        const filteredProducts = searchProducts(allProducts, searchQuery);
        return filteredProducts.length;
    }, [allProducts, searchQuery]);

    // Функция для переключения состояния организации
    const toggleOrganization = useCallback((orgName) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setCollapsedOrganizations(prev => ({
            ...prev,
            [orgName]: !prev[orgName]
        }));
    }, []);

    // Функция для переключения состояния производителя
    const toggleManufacturer = useCallback((manufacturerKey) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setCollapsedManufacturers(prev => ({
            ...prev,
            [manufacturerKey]: !prev[manufacturerKey]
        }));
    }, []);

    // Функция для сворачивания всех групп
    const collapseAll = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const currentSections = sectionsRef.current;
        const newCollapsedOrgs = {};
        const newCollapsedManuf = {};
        
        currentSections.forEach(org => {
            newCollapsedOrgs[org.title] = true;
            org.data.forEach(manuf => {
                newCollapsedManuf[`${org.title}_${manuf.title}`] = true;
            });
        });
        
        setCollapsedOrganizations(newCollapsedOrgs);
        setCollapsedManufacturers(newCollapsedManuf);
    }, []);

    // Функция для разворачивания всех групп
    const expandAll = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setCollapsedOrganizations({});
        setCollapsedManufacturers({});
    }, []);

    const loadProducts = async () => {
        setError(null);
        setIsRefreshing(true);
        startProgressSimulation();
        
        try {
            const data = await getProducts();
            setAllProducts(data);
            completeProgress();
        } catch (error) {
            completeProgress();
            setError(error.message);
        }
    };

    // Компонент карусели загрузки
    const LoadingCarousel = () => {
        const carouselItems = [
            { icon: "server-outline", text: "Подключение к серверу..." },
            { icon: "cloud-download-outline", text: "Загрузка данных..." },
            { icon: "cube-outline", text: "Обработка рулонов..." },
            { icon: "layers-outline", text: "Группировка..." },
            { icon: "checkmark-circle-outline", text: "Завершение..." },
        ];

        const currentStep = Math.floor((loadingProgress / 100) * carouselItems.length);
        const currentItem = carouselItems[Math.min(currentStep, carouselItems.length - 1)];

        return (
            <Modal
                transparent={true}
                animationType="fade"
                visible={isRefreshing}
                onRequestClose={() => {}}
            >
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingCard}>
                        <View style={styles.carouselContainer}>
                            <View style={styles.iconContainer}>
                                <Ionicons 
                                    name={currentItem.icon} 
                                    size={48} 
                                    color="#3498db" 
                                />
                            </View>
                            
                            <Text style={styles.loadingText}>{currentItem.text}</Text>
                            
                            <View style={styles.progressBarContainer}>
                                <View style={[styles.progressBar, { width: `${loadingProgress}%` }]} />
                            </View>
                            
                            <Text style={styles.progressText}>
                                {Math.round(loadingProgress)}%
                            </Text>
                            
                            <ActivityIndicator 
                                size="small" 
                                color="#3498db" 
                                style={styles.spinner}
                            />
                        </View>
                        
                        <View style={styles.loadingDots}>
                            {carouselItems.map((_, index) => (
                                <View 
                                    key={index}
                                    style={[
                                        styles.dot,
                                        index === Math.min(currentStep, carouselItems.length - 1) && styles.activeDot
                                    ]}
                                />
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    // Компонент таблицы для отображения данных рулона
    const RollTable = ({ items }) => {
        const totalArea = items.reduce((sum, item) => sum + (item.areaSquareMeters || 0), 0);
        const totalWeight = items.reduce((sum, item) => sum + (item.weightTons || 0), 0);
        const totalPricePerSqMeter = items.reduce((sum, item) => sum + (item.pricePerSquareMeter || 0), 0);
        const totalPricePerTon = items.reduce((sum, item) => sum + (item.pricePerTon || 0), 0);

        return (
            <View style={styles.tableContainer}>
                {/* Заголовок таблицы */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, styles.batchColumn]}>Партия</Text>
                    <Text style={[styles.tableHeaderCell, styles.priceColumn]}>Цена м²</Text>
                    <Text style={[styles.tableHeaderCell, styles.priceColumn]}>Цена тонна</Text>
                    <Text style={[styles.tableHeaderCell, styles.measureColumn]}>Остаток м²</Text>
                    <Text style={[styles.tableHeaderCell, styles.measureColumn]}>Остаток тонн</Text>
                    <Text style={[styles.tableHeaderCell, styles.dateColumn]}>Дата партии</Text>
                </View>

                {/* Строки таблицы */}
                {items.map((item, index) => (
                    <View 
                        key={item.id || index} 
                        style={[
                            styles.tableRow,
                            index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd
                        ]}
                    >
                        <Text style={[styles.tableCell, styles.batchColumn]}>
                            {item.batch || 'Н/Д'}
                        </Text>
                        <Text style={[styles.tableCell, styles.priceColumn]}>
                            {item.pricePerSquareMeter?.toLocaleString() || 0} ₽
                        </Text>
                        <Text style={[styles.tableCell, styles.priceColumn]}>
                            {item.pricePerTon?.toLocaleString() || 0} ₽
                        </Text>
                        <Text style={[styles.tableCell, styles.measureColumn]}>
                            {item.areaSquareMeters?.toLocaleString() || 0} м²
                        </Text>
                        <Text style={[styles.tableCell, styles.measureColumn]}>
                            {item.weightTons?.toFixed(3) || 0} т
                        </Text>
                        <Text style={[styles.tableCell, styles.dateColumn]}>
                            {item.batchDate ? new Date(item.batchDate).toLocaleDateString() : 'Н/Д'}
                        </Text>
                    </View>
                ))}

                {/* Итоговая строка */}
                <View style={styles.totalTableRow}>
                    <Text style={[styles.totalTableCell, styles.batchColumn, styles.totalText]}>
                        Итого:
                    </Text>
                    <Text style={[styles.totalTableCell, styles.priceColumn, styles.totalText]}>
                        {totalPricePerSqMeter.toLocaleString()} ₽
                    </Text>
                    <Text style={[styles.totalTableCell, styles.priceColumn, styles.totalText]}>
                        {totalPricePerTon.toLocaleString()} ₽
                    </Text>
                    <Text style={[styles.totalTableCell, styles.measureColumn, styles.totalMeasureText]}>
                        {totalArea.toLocaleString()} м²
                    </Text>
                    <Text style={[styles.totalTableCell, styles.measureColumn, styles.totalMeasureText]}>
                        {totalWeight.toFixed(3)} т
                    </Text>
                    <Text style={[styles.totalTableCell, styles.dateColumn]} />
                </View>
            </View>
        );
    };

    // Компонент для отображения одного рулона
    const RollItem = ({ items, rollName }) => {
        return (
            <View style={styles.rollCard}>
                <View style={styles.rollNameContainer}>
                    <Ionicons name="document-text-outline" size={18} color="#3498db" style={styles.rollIcon} />
                    <Text style={styles.rollName}>{rollName}</Text>
                    <View style={styles.rollBadge}>
                        <Text style={styles.rollBadgeText}>
                            {items.length} парт.
                        </Text>
                    </View>
                </View>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                    <RollTable items={items} />
                </ScrollView>
            </View>
        );
    };

    // Рендер элемента секции (производители)
    const renderSectionItem = ({ item, section }) => {
        if (section.type === 'organization') {
            if (item.type === 'manufacturer') {
                const manufacturerKey = `${section.title}_${item.title}`;
                const isCollapsed = collapsedManufacturers[manufacturerKey];
                const isOrgCollapsed = collapsedOrganizations[section.title];
                
                if (isOrgCollapsed) return null;
                
                return (
                    <View style={styles.manufacturerContainer}>
                        <TouchableOpacity 
                            style={styles.manufacturerHeader}
                            onPress={() => toggleManufacturer(manufacturerKey)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.manufacturerTitleContainer}>
                                <Ionicons 
                                    name={isCollapsed ? "chevron-forward" : "chevron-down"} 
                                    size={20} 
                                    color="#3498db" 
                                    style={styles.chevron}
                                />
                                <Ionicons name="business-outline" size={18} color="#34495e" style={styles.manufacturerIcon} />
                                <Text style={styles.manufacturerTitle}>{item.title}</Text>
                            </View>
                            <View style={styles.manufacturerBadge}>
                                <Text style={styles.manufacturerBadgeText}>
                                    {item.data.length} рул.
                                </Text>
                            </View>
                        </TouchableOpacity>
                        
                        {!isCollapsed && item.data.map((rollItem, index) => (
                            <View key={rollItem.title + index}>
                                {rollItem.type === 'roll' && (
                                    <RollItem items={rollItem.data[0]} rollName={rollItem.title} />
                                )}
                            </View>
                        ))}
                    </View>
                );
            }
        }
        return null;
    };

    // Рендер заголовка секции (организации)
    const renderSectionHeader = ({ section }) => {
        if (section.type === 'organization') {
            const isCollapsed = collapsedOrganizations[section.title];
            const totalPositions = section.data.reduce((sum, m) => 
                sum + m.data.reduce((s, r) => s + r.data[0].length, 0), 0
            );
            
            return (
                <TouchableOpacity 
                    style={styles.organizationHeader}
                    onPress={() => toggleOrganization(section.title)}
                    activeOpacity={0.7}
                >
                    <View style={styles.organizationTitleContainer}>
                        <Ionicons 
                            name={isCollapsed ? "chevron-forward" : "chevron-down"} 
                            size={22} 
                            color="#fff" 
                            style={styles.chevron}
                        />
                        <Ionicons name="home-outline" size={20} color="#fff" style={styles.orgIcon} />
                        <Text style={styles.organizationTitle}>{section.title}</Text>
                    </View>
                    <View style={styles.organizationInfo}>
                        <Text style={styles.organizationCount}>
                            {totalPositions} поз.
                        </Text>
                        <Text style={styles.organizationCount}>
                            {section.data.length} произв.
                        </Text>
                    </View>
                </TouchableOpacity>
            );
        }
        return null;
    };

    // Очистка поиска и скрытие клавиатуры
    const clearSearch = () => {
        setSearchQuery('');
        Keyboard.dismiss();
    };

    // Скрытие клавиатуры при нажатии вне поля ввода
    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    useEffect(() => {
        loadProducts();
        
        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, []);

    return (
        <ThemedView style={styles.container}>
            {/* Карусель загрузки */}
            <LoadingCarousel />

            {/* Кнопка обновления в верхнем левом углу */}
            <TouchableOpacity 
                style={[styles.refreshButton, isRefreshing && styles.refreshButtonDisabled]}
                onPress={loadProducts}
                activeOpacity={0.7}
                disabled={isRefreshing}
            >
                <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>

            <KeyboardAvoidingView 
                style={styles.keyboardAvoidingContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                {/* Основной контент */}
                <SectionList
                    sections={sections}
                    renderItem={renderSectionItem}
                    renderSectionHeader={renderSectionHeader}
                    ListHeaderComponent={
                        <>
                            <Text style={styles.heading}>Список рулонов</Text>
                            {searchResultsCount !== null && (
                                <Text style={styles.searchResults}>
                                    Найдено: {searchResultsCount} позиций
                                </Text>
                            )}
                            {sections.length > 0 && (
                                <View style={styles.controlsContainer}>
                                    <TouchableOpacity 
                                        style={styles.controlButton}
                                        onPress={collapseAll}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="contract-outline" size={16} color="#fff" />
                                        <Text style={styles.controlButtonText}>Свернуть все</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.controlButton, styles.expandButton]}
                                        onPress={expandAll}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="expand-outline" size={16} color="#fff" />
                                        <Text style={styles.controlButtonText}>Развернуть все</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </>
                    }
                    keyExtractor={(item, index) => item.title + index}
                    contentContainerStyle={[
                        styles.listContainer,
                        keyboardHeight > 0 && { paddingBottom: 0 }
                    ]}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>
                            {searchQuery ? 'По вашему запросу ничего не найдено' : 'Товары не найдены'}
                        </Text>
                    }
                    stickySectionHeadersEnabled={true}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    onScrollBeginDrag={dismissKeyboard}
                />

                {/* Окно поиска в нижней части */}
                <View style={[
                    styles.searchContainer, 
                    isSearchFocused && styles.searchContainerFocused,
                    keyboardHeight > 0 && { 
                        paddingBottom: Platform.OS === 'ios' ? 10 : 10,
                        marginBottom: 0
                    }
                ]}>
                    <View style={styles.searchInputWrapper}>
                        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                        <TextInput
                            ref={searchInputRef}
                            style={styles.searchInput}
                            placeholder="Поиск по всем параметрам..."
                            placeholderTextColor="#999"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            autoCorrect={false}
                            clearButtonMode="while-editing"
                            returnKeyType="search"
                            onSubmitEditing={dismissKeyboard}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                                <Ionicons name="close-circle" size={20} color="#999" />
                            </TouchableOpacity>
                        )}
                    </View>
                    
                    {isSearchFocused && (
                        <View style={styles.searchHint}>
                            <Text style={styles.searchHintText}>
                                Введите часть названия, производителя или характеристики через пробел
                            </Text>
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>

            {/* Ошибка */}
            {err && (
                <TouchableOpacity 
                    style={[
                        styles.error,
                        keyboardHeight > 0 && { bottom: keyboardHeight + 10 }
                    ]}
                    onPress={() => setError(null)}
                    activeOpacity={0.8}
                >
                    <View style={styles.errorContent}>
                        <Ionicons name="warning" size={20} color={Colors.warning} />
                        <Text style={styles.errorText}>{err}</Text>
                        <Ionicons name="close" size={20} color={Colors.warning} />
                    </View>
                </TouchableOpacity>
            )}
        </ThemedView>
    );
};

export default Rolls;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        marginTop: 30
    },
    keyboardAvoidingContainer: {
        flex: 1,
    },
    refreshButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1000,
        backgroundColor: '#3498db',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    refreshButtonDisabled: {
        backgroundColor: '#95a5a6',
    },
    // Стили для карусели загрузки
    loadingOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 30,
        width: '85%',
        maxWidth: 350,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    carouselContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ebf5fb',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    loadingText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 20,
        textAlign: 'center',
    },
    progressBarContainer: {
        width: '100%',
        height: 6,
        backgroundColor: '#ecf0f1',
        borderRadius: 3,
        marginBottom: 10,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#3498db',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 15,
        fontWeight: '500',
    },
    spinner: {
        marginTop: 5,
    },
    loadingDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#d5dbdb',
    },
    activeDot: {
        backgroundColor: '#3498db',
        width: 24,
        height: 8,
        borderRadius: 4,
    },
    heading: {
        fontWeight: 'bold',
        fontSize: 24,
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 10,
        color: '#333',
    },
    searchResults: {
        textAlign: 'center',
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
        fontStyle: 'italic',
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
        paddingHorizontal: 20,
        gap: 10,
    },
    controlButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3498db',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 5,
    },
    expandButton: {
        backgroundColor: '#27ae60',
    },
    controlButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    organizationHeader: {
        backgroundColor: '#2c3e50',
        padding: 15,
        marginHorizontal: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    organizationTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    chevron: {
        marginRight: 8,
    },
    orgIcon: {
        marginRight: 8,
    },
    organizationTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        textTransform: 'uppercase',
        flex: 1,
    },
    organizationInfo: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 15,
        paddingLeft: 30,
    },
    organizationCount: {
        fontSize: 13,
        color: '#bdc3c7',
    },
    manufacturerContainer: {
        marginHorizontal: 10,
        marginTop: 10,
    },
    manufacturerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingLeft: 5,
        paddingVertical: 5,
    },
    manufacturerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    manufacturerIcon: {
        marginRight: 8,
    },
    manufacturerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#34495e',
    },
    manufacturerBadge: {
        backgroundColor: '#ecf0f1',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    manufacturerBadgeText: {
        fontSize: 12,
        color: '#7f8c8d',
        fontWeight: '500',
    },
    rollCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        marginLeft: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    rollNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
        paddingBottom: 10,
    },
    rollIcon: {
        marginRight: 8,
    },
    rollName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2c3e50',
        flex: 1,
    },
    rollBadge: {
        backgroundColor: '#ebf5fb',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 10,
    },
    rollBadgeText: {
        fontSize: 12,
        color: '#3498db',
        fontWeight: '500',
    },
    // Стили для таблицы
    tableContainer: {
        minWidth: 580,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#34495e',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 5,
        marginBottom: 5,
    },
    tableHeaderCell: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    tableRowEven: {
        backgroundColor: '#fff',
    },
    tableRowOdd: {
        backgroundColor: '#f8f9fa',
    },
    tableCell: {
        fontSize: 12,
        color: '#2c3e50',
        textAlign: 'center',
    },
    batchColumn: {
        flex: 2,
        minWidth: 70,
    },
    priceColumn: {
        flex: 2,
        minWidth: 90,
    },
    measureColumn: {
        flex: 2,
        minWidth: 90,
    },
    dateColumn: {
        flex: 2,
        minWidth: 90,
    },
    totalTableRow: {
        flexDirection: 'row',
        backgroundColor: '#ebf5fb',
        paddingVertical: 12,
        paddingHorizontal: 5,
        borderRadius: 8,
        marginTop: 5,
        borderTopWidth: 2,
        borderTopColor: '#3498db',
    },
    totalTableCell: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    totalText: {
        color: '#2c3e50',
    },
    totalMeasureText: {
        color: '#2980b9',
        fontSize: 13,
    },
    searchContainer: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    searchContainerFocused: {
        paddingBottom: 10,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 25,
        paddingHorizontal: 15,
        height: 45,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 8,
    },
    clearButton: {
        marginLeft: 10,
        padding: 5,
    },
    searchHint: {
        marginTop: 8,
        paddingHorizontal: 15,
    },
    searchHintText: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    error: {
        position: 'absolute',
        bottom: 80,
        left: 10,
        right: 10,
        backgroundColor: '#f5c1c8',
        borderColor: Colors.warning,
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    errorContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    errorText: {
        color: Colors.warning,
        flex: 1,
        marginLeft: 10,
        marginRight: 10,
        fontSize: 14,
        fontWeight: '500',
    },
    listContainer: {
        paddingBottom: 80,
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 16,
        marginTop: 50,
        paddingHorizontal: 20,
    },
});