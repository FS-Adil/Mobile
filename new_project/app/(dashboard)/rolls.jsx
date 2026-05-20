import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import ThemedView from "../../components/ThemedView";
import { 
    StyleSheet, 
    Text, 
    SectionList, 
    View, 
    TextInput, 
    TouchableOpacity, 
    LayoutAnimation, 
    Platform, 
    UIManager, 
    ActivityIndicator, 
    Modal, 
    KeyboardAvoidingView, 
    Keyboard, 
    ScrollView,
    InteractionManager 
} from "react-native";
import { getProducts } from "../../services/new_api";
import { Colors } from "../../constants/Colors";
import { Ionicons } from '@expo/vector-icons';

// Включаем LayoutAnimation для Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ============ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ============

const normalizeText = (text) => {
    return text?.toString().toLowerCase().replace(/\s+/g, ' ').trim() || '';
};

const getSearchTokens = (query) => {
    return normalizeText(query)
        .split(' ')
        .filter(token => token.length > 0);
};

const containsAllTokens = (text, tokens) => {
    const normalizedText = normalizeText(text);
    return tokens.every(token => normalizedText.includes(token));
};

// Оптимизированная группировка продуктов с использованием Map
const groupProducts = (products) => {
    const grouped = new Map();

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const org = product.organization || 'Без организации';
        const manufacturer = product.manufacturer || 'Без производителя';
        const rollName = product.name || 'Без названия';

        if (!grouped.has(org)) {
            grouped.set(org, new Map());
        }
        const orgMap = grouped.get(org);

        if (!orgMap.has(manufacturer)) {
            orgMap.set(manufacturer, new Map());
        }
        const manufMap = orgMap.get(manufacturer);

        if (!manufMap.has(rollName)) {
            manufMap.set(rollName, []);
        }
        manufMap.get(rollName).push(product);
    }

    // Конвертируем Map в нужную структуру
    const sectionsData = [];
    const orgs = Array.from(grouped.keys()).sort();

    for (let o = 0; o < orgs.length; o++) {
        const org = orgs[o];
        const manufacturers = grouped.get(org);
        const manufacturerData = [];
        const manufKeys = Array.from(manufacturers.keys()).sort();

        for (let m = 0; m < manufKeys.length; m++) {
            const manufacturer = manufKeys[m];
            const rollNames = manufacturers.get(manufacturer);
            const rollData = [];
            const rollKeys = Array.from(rollNames.keys()).sort();

            for (let r = 0; r < rollKeys.length; r++) {
                const rollName = rollKeys[r];
                const items = rollNames.get(rollName);

                rollData.push({
                    title: rollName,
                    data: [items],
                    type: 'roll'
                });
            }

            if (rollData.length > 0) {
                manufacturerData.push({
                    title: manufacturer,
                    data: rollData,
                    type: 'manufacturer',
                    organizationName: org
                });
            }
        }

        if (manufacturerData.length > 0) {
            sectionsData.push({
                title: org,
                data: manufacturerData,
                type: 'organization'
            });
        }
    }

    return sectionsData;
};

// Фильтрация секций для поиска
const filterSections = (sections, query) => {
    if (!query.trim()) return sections;
    
    const tokens = getSearchTokens(query);
    if (tokens.length === 0) return sections;
    
    const filtered = [];
    
    for (let s = 0; s < sections.length; s++) {
        const org = sections[s];
        const filteredManuf = [];
        
        for (let m = 0; m < org.data.length; m++) {
            const manuf = org.data[m];
            const filteredRolls = [];
            
            for (let r = 0; r < manuf.data.length; r++) {
                const roll = manuf.data[r];
                const items = roll.data[0];
                
                let matches = false;
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    const searchableText = [
                        roll.title,
                        manuf.title,
                        org.title,
                        item.name,
                        item.manufacturer,
                        item.organization,
                        item.batch,
                        item.pricePerSquareMeter?.toString(),
                        item.pricePerTon?.toString(),
                        item.areaSquareMeters?.toString(),
                        item.weightTons?.toString(),
                        item.batchDate ? new Date(item.batchDate).toLocaleDateString() : '',
                    ].join(' ');
                    
                    if (containsAllTokens(searchableText, tokens)) {
                        matches = true;
                        break;
                    }
                }
                
                if (matches) {
                    filteredRolls.push(roll);
                }
            }
            
            if (filteredRolls.length > 0) {
                filteredManuf.push({
                    ...manuf,
                    data: filteredRolls
                });
            }
        }
        
        if (filteredManuf.length > 0) {
            filtered.push({
                ...org,
                data: filteredManuf
            });
        }
    }
    
    return filtered;
};

// ============ КОМПОНЕНТ ТАБЛИЦЫ ============

const RollTable = React.memo(({ items }) => {
    const totalArea = useMemo(() => 
        items.reduce((sum, item) => sum + (item.areaSquareMeters || 0), 0), 
        [items]
    );
    const totalWeight = useMemo(() => 
        items.reduce((sum, item) => sum + (item.weightTons || 0), 0), 
        [items]
    );
    const totalPricePerSqMeter = useMemo(() => 
        items.reduce((sum, item) => sum + (item.pricePerSquareMeter || 0), 0), 
        [items]
    );
    const totalPricePerTon = useMemo(() => 
        items.reduce((sum, item) => sum + (item.pricePerTon || 0), 0), 
        [items]
    );

    return (
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={true}
            nestedScrollEnabled={Platform.OS === 'android'}
        >
            <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, styles.batchColumn]}>Партия</Text>
                    <Text style={[styles.tableHeaderCell, styles.priceColumn]}>Цена м²</Text>
                    <Text style={[styles.tableHeaderCell, styles.priceColumn]}>Цена тонна</Text>
                    <Text style={[styles.tableHeaderCell, styles.measureColumn]}>Остаток м²</Text>
                    <Text style={[styles.tableHeaderCell, styles.measureColumn]}>Остаток тонн</Text>
                    <Text style={[styles.tableHeaderCell, styles.dateColumn]}>Дата партии</Text>
                </View>

                {items.map((item, index) => (
                    <View 
                        key={item.id || index} 
                        style={[
                            styles.tableRow,
                            index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd
                        ]}
                    >
                        <Text style={[styles.tableCell, styles.batchColumn]} numberOfLines={1}>
                            {item.batch || 'Н/Д'}
                        </Text>
                        <Text style={[styles.tableCell, styles.priceColumn]} numberOfLines={1}>
                            {item.pricePerSquareMeter?.toLocaleString() || 0} ₽
                        </Text>
                        <Text style={[styles.tableCell, styles.priceColumn]} numberOfLines={1}>
                            {item.pricePerTon?.toLocaleString() || 0} ₽
                        </Text>
                        <Text style={[styles.tableCell, styles.measureColumn]} numberOfLines={1}>
                            {item.areaSquareMeters?.toLocaleString() || 0} м²
                        </Text>
                        <Text style={[styles.tableCell, styles.measureColumn]} numberOfLines={1}>
                            {item.weightTons?.toFixed(3) || 0} т
                        </Text>
                        <Text style={[styles.tableCell, styles.dateColumn]} numberOfLines={1}>
                            {item.batchDate ? new Date(item.batchDate).toLocaleDateString() : 'Н/Д'}
                        </Text>
                    </View>
                ))}

                <View style={styles.totalTableRow}>
                    <Text style={[styles.totalTableCell, styles.batchColumn, styles.totalText]}>
                        Итого:
                    </Text>
                    <Text style={[styles.totalTableCell, styles.priceColumn, styles.totalText]}>
                        {/* {totalPricePerSqMeter.toLocaleString()} ₽ */}
                    </Text>
                    <Text style={[styles.totalTableCell, styles.priceColumn, styles.totalText]}>
                        {/* {totalPricePerTon.toLocaleString()} ₽ */}
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
        </ScrollView>
    );
});

// ============ КОМПОНЕНТ РУЛОНА ============

const RollItem = React.memo(({ items, rollName }) => {
    return (
        <View style={styles.rollCard}>
            <View style={styles.rollNameContainer}>
                <Ionicons name="document-text-outline" size={18} color="#3498db" style={styles.rollIcon} />
                <Text style={styles.rollName} numberOfLines={2}>{rollName}</Text>
                <View style={styles.rollBadge}>
                    <Text style={styles.rollBadgeText}>
                        {items.length} парт.
                    </Text>
                </View>
            </View>
            
            <RollTable items={items} />
        </View>
    );
});

// ============ КОМПОНЕНТ КАРУСЕЛИ ЗАГРУЗКИ ============

const LoadingCarousel = React.memo(({ isRefreshing, loadingProgress }) => {
    const carouselItems = [
        { icon: "server-outline", text: "Подключение к серверу..." },
        { icon: "cloud-download-outline", text: "Загрузка данных..." },
        { icon: "cube-outline", text: "Обработка рулонов..." },
        { icon: "layers-outline", text: "Группировка..." },
        { icon: "checkmark-circle-outline", text: "Завершение..." },
    ];

    const currentStep = Math.floor((loadingProgress / 100) * carouselItems.length);
    const currentItem = carouselItems[Math.min(currentStep, carouselItems.length - 1)];

    if (!isRefreshing) return null;

    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={isRefreshing}
            onRequestClose={() => {}}
            hardwareAccelerated={Platform.OS === 'android'}
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
});

// ============ ГЛАВНЫЙ КОМПОНЕНТ ============

const Rolls = () => {
    const [sections, setSections] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [err, setError] = useState(null);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    
    const [collapsedOrganizations, setCollapsedOrganizations] = useState({});
    const [collapsedManufacturers, setCollapsedManufacturers] = useState({});

    const progressInterval = useRef(null);
    const searchInputRef = useRef(null);
    const allSectionsRef = useRef([]);
    const isMounted = useRef(true);

    // Отслеживание клавиатуры
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            (e) => setKeyboardHeight(e.endCoordinates.height)
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => setKeyboardHeight(0)
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    // Очистка при размонтировании
    useEffect(() => {
        return () => {
            isMounted.current = false;
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, []);

    // Симуляция прогресса загрузки
    const startProgressSimulation = useCallback(() => {
        setLoadingProgress(0);
        let progress = 0;
        
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
        }
        
        progressInterval.current = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) {
                progress = 90;
                if (progressInterval.current) {
                    clearInterval(progressInterval.current);
                }
            }
            if (isMounted.current) {
                setLoadingProgress(Math.min(progress, 90));
            }
        }, 300);
    }, []);

    const completeProgress = useCallback(() => {
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
            progressInterval.current = null;
        }
        if (isMounted.current) {
            setLoadingProgress(100);
            setTimeout(() => {
                if (isMounted.current) {
                    setIsRefreshing(false);
                    setLoadingProgress(0);
                }
            }, 500);
        }
    }, []);

    // Загрузка продуктов
    const loadProducts = useCallback(async () => {
        if (!isMounted.current) return;
        
        setError(null);
        setIsRefreshing(true);
        startProgressSimulation();
        
        try {
            const data = await getProducts();
            
            if (!isMounted.current) return;
            
            // Группируем данные асинхронно для Android
            const groupedData = await new Promise((resolve) => {
                if (Platform.OS === 'android') {
                    requestAnimationFrame(() => {
                        resolve(groupProducts(data));
                    });
                } else {
                    resolve(groupProducts(data));
                }
            });
            
            if (!isMounted.current) return;
            
            allSectionsRef.current = groupedData;
            setSections(groupedData);
            completeProgress();
        } catch (error) {
            console.error('Error loading products:', error);
            if (isMounted.current) {
                completeProgress();
                setError(error.message || 'Ошибка загрузки данных');
            }
        }
    }, [startProgressSimulation, completeProgress]);

    // Загрузка при монтировании
    useEffect(() => {
        const task = InteractionManager.runAfterInteractions(() => {
            loadProducts();
        });
        
        return () => {
            if (task && typeof task.cancel === 'function') {
                task.cancel();
            }
        };
    }, [loadProducts]);

    // Мемоизированные секции с учетом поиска
    const filteredSections = useMemo(() => {
        if (!searchQuery.trim()) return sections;
        return filterSections(sections, searchQuery);
    }, [sections, searchQuery]);

    // Подсчет результатов поиска
    const searchResultsCount = useMemo(() => {
        if (!searchQuery.trim()) return null;
        
        let count = 0;
        for (let s = 0; s < filteredSections.length; s++) {
            for (let m = 0; m < filteredSections[s].data.length; m++) {
                for (let r = 0; r < filteredSections[s].data[m].data.length; r++) {
                    count += filteredSections[s].data[m].data[r].data[0].length;
                }
            }
        }
        return count;
    }, [filteredSections, searchQuery]);

    // Переключение организации с учетом платформы
    const toggleOrganization = useCallback((orgName) => {
        if (Platform.OS === 'android') {
            setCollapsedOrganizations(prev => ({
                ...prev,
                [orgName]: !prev[orgName]
            }));
        } else {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setCollapsedOrganizations(prev => ({
                ...prev,
                [orgName]: !prev[orgName]
            }));
        }
    }, []);

    // Переключение производителя с учетом платформы
    const toggleManufacturer = useCallback((manufacturerKey) => {
        if (Platform.OS === 'android') {
            setCollapsedManufacturers(prev => ({
                ...prev,
                [manufacturerKey]: !prev[manufacturerKey]
            }));
        } else {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setCollapsedManufacturers(prev => ({
                ...prev,
                [manufacturerKey]: !prev[manufacturerKey]
            }));
        }
    }, []);

    // Свернуть все
    const collapseAll = useCallback(() => {
        const currentSections = allSectionsRef.current;
        const newCollapsedOrgs = {};
        const newCollapsedManuf = {};
        
        for (let s = 0; s < currentSections.length; s++) {
            const org = currentSections[s];
            newCollapsedOrgs[org.title] = true;
            for (let m = 0; m < org.data.length; m++) {
                newCollapsedManuf[`${org.title}_${org.data[m].title}`] = true;
            }
        }
        
        if (Platform.OS === 'android') {
            setCollapsedOrganizations(newCollapsedOrgs);
            setCollapsedManufacturers(newCollapsedManuf);
        } else {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setCollapsedOrganizations(newCollapsedOrgs);
            setCollapsedManufacturers(newCollapsedManuf);
        }
    }, []);

    // Развернуть все
    const expandAll = useCallback(() => {
        if (Platform.OS === 'android') {
            setCollapsedOrganizations({});
            setCollapsedManufacturers({});
        } else {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setCollapsedOrganizations({});
            setCollapsedManufacturers({});
        }
    }, []);

    // Очистка поиска
    const clearSearch = useCallback(() => {
        setSearchQuery('');
        Keyboard.dismiss();
    }, []);

    // Рендер элемента секции
    const renderSectionItem = useCallback(({ item, section }) => {
        if (section.type !== 'organization') return null;
        if (item.type !== 'manufacturer') return null;
        
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
                            {item.data.length} номенкл.
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
    }, [collapsedOrganizations, collapsedManufacturers, toggleManufacturer]);

    // Рендер заголовка секции
    const renderSectionHeader = useCallback(({ section }) => {
        if (section.type !== 'organization') return null;
        
        const isCollapsed = collapsedOrganizations[section.title];
        
        let totalPositions = 0;
        for (let m = 0; m < section.data.length; m++) {
            for (let r = 0; r < section.data[m].data.length; r++) {
                totalPositions += section.data[m].data[r].data[0].length;
            }
        }
        
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
                        {totalPositions} рул.
                    </Text>
                    <Text style={styles.organizationCount}>
                        {section.data.length} произв.
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }, [collapsedOrganizations, toggleOrganization]);

    // keyExtractor
    const keyExtractor = useCallback((item, index) => {
        return `${item.type}_${item.title}_${index}`;
    }, []);

    // getItemLayout для оптимизации на Android
    const getItemLayout = useCallback((data, index) => {
        return { length: 100, offset: 100 * index, index };
    }, []);

    return (
        <ThemedView style={styles.container}>
            <LoadingCarousel 
                isRefreshing={isRefreshing} 
                loadingProgress={loadingProgress} 
            />

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
                <SectionList
                    sections={filteredSections}
                    renderItem={renderSectionItem}
                    renderSectionHeader={renderSectionHeader}
                    keyExtractor={keyExtractor}
                    getItemLayout={Platform.OS === 'android' ? getItemLayout : undefined}
                    ListHeaderComponent={
                        <>
                            <Text style={styles.heading}>Список рулонов</Text>
                            {searchResultsCount !== null && (
                                <Text style={styles.searchResults}>
                                    Найдено: {searchResultsCount} позиций
                                </Text>
                            )}
                            {filteredSections.length > 0 && (
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
                    initialNumToRender={Platform.OS === 'android' ? 3 : 5}
                    maxToRenderPerBatch={Platform.OS === 'android' ? 2 : 3}
                    windowSize={Platform.OS === 'android' ? 3 : 5}
                    removeClippedSubviews={Platform.OS === 'android'}
                    disableVirtualization={false}
                    onEndReachedThreshold={0.5}
                    maintainVisibleContentPosition={{
                        minIndexForVisible: 0,
                    }}
                />

                <View style={[
                    styles.searchContainer, 
                    isSearchFocused && styles.searchContainerFocused,
                    keyboardHeight > 0 && { paddingBottom: Platform.OS === 'ios' ? 10 : 5, marginBottom: 0 }
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
                            returnKeyLabel="Поиск"
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

// ============ СТИЛИ ============

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        marginTop: Platform.OS === 'android' ? 25 : 30
    },
    keyboardAvoidingContainer: {
        flex: 1,
    },
    refreshButton: {
        position: 'absolute',
        top: Platform.OS === 'android' ? 10 : 20,
        left: Platform.OS === 'android' ? 10 : 20,
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

export default Rolls;