import React, { useState } from "react";
import { View, Text, FlatList, StatusBar, StyleSheet } from "react-native";
import ItemSelected from "../../components/ItemSelected";
import { Appbar, List } from 'react-native-paper';
import { FAB } from 'react-native-paper';
//import { useNavigation } from '@react-navigation/native';
import { saveData, saveDataLogin } from "../../api/login";
import { SafeAreaView } from "react-native-safe-area-context";
//import * as Sentry from "@sentry/react-native";

const DirectionLanes = ({ navigation, route }) => {
    //const navigation = useNavigation()

    const {
        actives,
        user,
        save,
        email,
        password,
        mode
    } = route.params;
        console.log("🚀 ~ DirectionLanes ~ actives:", actives)

    const [selectedSentido, setSelectedSentido] = useState(null);
    const [selectedLane, setSelectedLane] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);

    const onSelectItem = (item) => {
        console.log("Seleccionado:", item.name);
        setSelectedItem(item);
    };

    const onSelectLane = (sentido, lane) => {
        console.log("Seleccionado:", sentido, "→", lane.name);
    };

    const handleNext = async () => {
        try {
            console.log("Continuar con:", selectedItem);
            let responseLocal = await saveDataLogin({
                response_data: user,
                email: email,
                password: password,
                lane: selectedItem?.id,
                direction: selectedItem?.direction,
                login: false
            })
            console.log("🚀 ~ handleNext ~ responseLocal:", responseLocal)
            let user_ = user;
            //delete user.lanes;

            console.log("🚀 ~ handleNext ~ user:", user)

            await saveData("lane", selectedItem);
            await saveData("user", user);

            navigation.replace('Home', {
                lane: selectedItem,
                user: user_
            });

        } catch (error) {
            console.log("🚀 ~ handleNext ~ error:", error)
            console.error('Error capturado:', error);
            throw new Error("Test Sentry: error de prueba");
        }
    };

    const isNextEnabled = mode === 1 ? selectedItem : (selectedSentido && selectedLane);

    const goBack = () => navigation.goBack();

    // Render para mode 1 - Lista simple
    const renderMode1 = () => (
        <View style={styles.content}>
            <FlatList
                data={actives}
                keyExtractor={(item) => item.id?.toString() || item.name}
                nestedScrollEnabled={true}
                style={styles.flatList}
                contentContainerStyle={styles.flatListContent}
                renderItem={({ item, index }) => {
                    console.log("🚀 ~ item:", item)
                    return (
                        <ItemSelected
                            index={index}
                            icon={item.icon || 'car-select'}
                            name={` ${item.direction} - ${item.name}`}
                            isSelected={selectedItem?.id === item.id}
                            action={() => onSelectItem(item)}
                        />

                    )
                }}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No hay items disponibles</Text>
                }
            />
        </View>
    );

    // Render para mode 2 - Lista anidada (tu implementación original)
    const renderMode2 = () => (
        <View style={styles.content}>
            <FlatList
                ListHeaderComponent={
                    actives.length > 0 && (
                        <List.Subheader style={styles.subheader}>Sentidos</List.Subheader>
                    )
                }
                data={actives}
                keyExtractor={(item) => item.name}
                nestedScrollEnabled={true}
                style={styles.flatList}
                contentContainerStyle={styles.flatListContent}
                renderItem={({ item, index }) => (
                    <ItemSelected
                        index={index}
                        icon={'boom-gate-outline'}
                        name={item?.name}
                        isSelected={selectedSentido?.name === item.name}
                        action={() => {
                            setSelectedSentido(item);
                            setSelectedLane(null);
                        }}
                    />
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No hay sentidos disponibles</Text>
                }
                ListFooterComponent={
                    <View style={styles.lanesSection}>
                        <List.Subheader style={styles.subheader}>Carriles</List.Subheader>

                        <FlatList
                            data={selectedSentido?.lanes ?? []}
                            nestedScrollEnabled={true}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.flatListContent}
                            renderItem={({ item, index }) => (
                                <ItemSelected
                                    index={index}
                                    icon={'car-select'}
                                    name={item.name}
                                    isSelected={selectedLane?.id === item.id}
                                    action={() => {
                                        setSelectedLane(item);
                                        onSelectLane(selectedSentido?.name, item);
                                    }}
                                />
                            )}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>
                                    {selectedSentido ? 'No hay carriles disponibles' : 'Selecciona un sentido primero'}
                                </Text>
                            }
                        />
                    </View>
                }
            />
        </View>
    );



    return (
        <View style={{ flex: 1 }}>
            <StatusBar backgroundColor="#1f87d0ff" barStyle={'light-content'} />
            <Appbar.Header style={styles.header}>
                <Appbar.Action icon={'close'} color="white" onPress={() => goBack()} />
                <Appbar.Content
                    title={mode === 1 ? "Seleccionar carril" : "Seleccionar carril y sentido"}
                    titleStyle={styles.headerTitle}
                />
            </Appbar.Header>
            <SafeAreaView style={styles.container}>
                {mode === 1 ? renderMode1() : renderMode2()}
                {isNextEnabled && (
                    <View style={styles.nextButtonContainer}>
                        <FAB
                            icon="arrow-right"
                            style={{ backgroundColor: '#1f87d0ff' }}
                            color={'white'}
                            label="Continuar"
                            onPress={() => handleNext()}
                        />
                    </View>
                )}

            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        width: '100%',
        height: '100%'
    },
    header: {
        backgroundColor: '#1f87d0ff',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    content: {
        flex: 1,
        paddingHorizontal: 0,
    },
    lanesSection: {
        marginTop: 16,
    },
    subheader: {
        backgroundColor: 'transparent',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        paddingHorizontal: 4,
        paddingVertical: 8,
    },
    flatList: {
        flexGrow: 0,
        maxHeight: '100%',
        paddingBottom: 30
    },
    flatListContent: {
        paddingHorizontal: 8,
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
        fontStyle: 'italic',
        paddingVertical: 20,
    },
    backButton: {
        marginVertical: 20,
        color: "#1976d2",
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        paddingVertical: 12,
    },
    nextButtonContainer: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 22,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
});

export default DirectionLanes;

/*import React, { useState } from "react";
import { View, Text, FlatList, StatusBar, StyleSheet } from "react-native";
import ItemSelected from "../../components/ItemSelected";
import { Appbar, List } from 'react-native-paper';
import { FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { saveDataLogin } from "../../api/login";
//import * as Sentry from "@sentry/react-native";

const DirectionLanes = ({ route, navigation }) => {
    navigation = useNavigation()

    const {
        actives,
        user,
        save,
        email,
        password,
        mode
    } = route.params;

    const [selectedSentido, setSelectedSentido] = useState(null);
    const [selectedLane, setSelectedLane] = useState(null);

    const onSelectLane = (sentido, lane) => {
        console.log("Seleccionado:", sentido, "→", lane.name);
    };

    const handleNext = async () => {
        try {
            console.log("Continuar con:", selectedLane);
            let responseLocal = await saveDataLogin({
                response_data: user,
                email: email,
                password: password,
                lane: selectedLane?.id,
                direction: selectedLane?.direction,
                login: false
            })
            console.log("🚀 ~ handleNext ~ responseLocal:", responseLocal)
            navigation.replace('Home', {
                lane: selectedLane,
                user
            });
        } catch (error) {
            console.log("🚀 ~ handleNext ~ error:", error)
            console.error('Error capturado:', error);
            throw new Error("Test Sentry: error de prueba");
        }
    };

    const isNextEnabled = selectedSentido && selectedLane;

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#1f87d0ff" barStyle={'light-content'} />
            <Appbar.Header style={styles.header}>
                <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
                <Appbar.Content
                    title="Seleccionar carril y sentido"
                    titleStyle={styles.headerTitle}
                />
            </Appbar.Header>

            <View style={styles.content}>
                <FlatList
                    ListHeaderComponent={
                        actives.length > 0 && (
                            <List.Subheader style={styles.subheader}>Sentidos</List.Subheader>
                        )
                    }
                    data={actives}
                    keyExtractor={(item) => item.name}
                    nestedScrollEnabled={true}
                    style={styles.flatList}
                    contentContainerStyle={styles.flatListContent}
                    renderItem={({ item, index }) => (
                        <ItemSelected
                            index={index}
                            icon={'boom-gate-outline'}
                            name={item?.name}
                            isSelected={selectedSentido?.name === item.name}
                            action={() => {
                                setSelectedSentido(item);
                                setSelectedLane(null);
                            }}
                        />
                    )}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No hay sentidos disponibles</Text>
                    }
                    ListFooterComponent={
                        <View style={styles.lanesSection}>
                            <List.Subheader style={styles.subheader}>Carriles</List.Subheader>

                            <FlatList
                                data={selectedSentido?.lanes ?? []}
                                nestedScrollEnabled={true}
                                keyExtractor={(item) => item.id.toString()}
                                //style={styles.flatList}
                                contentContainerStyle={styles.flatListContent}
                                renderItem={({ item, index }) => (
                                    <ItemSelected
                                        index={index}
                                        icon={'car-select'}
                                        name={item.name}
                                        isSelected={selectedLane?.id === item.id}
                                        action={() => {
                                            setSelectedLane(item);
                                            onSelectLane(selectedSentido?.name, item);
                                        }}
                                    />
                                )}
                                ListEmptyComponent={
                                    <Text style={styles.emptyText}>
                                        {selectedSentido ? 'No hay carriles disponibles' : 'Selecciona un sentido primero'}
                                    </Text>
                                }
                            />

                        </View>
                    }
                />


            </View>
            {isNextEnabled && (
                <View style={styles.nextButtonContainer}>
                    <FAB
                        icon="arrow-right"
                        //style={styles.fab}
                        style={{ backgroundColor: '#1f87d0ff' }}
                        color={'white'}
                        label="Continuar"
                        onPress={() => handleNext()}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        backgroundColor: '#1f87d0ff',
        elevation: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    content: {
        flex: 1,
        paddingHorizontal: 0,
    },
    lanesSection: {
        marginTop: 16,
    },
    subheader: {
        backgroundColor: 'transparent',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        paddingHorizontal: 4,
        paddingVertical: 8,
    },
    flatList: {
        flexGrow: 0,
        maxHeight: '100%',
        paddingBottom: 30
    },
    flatListContent: {
        paddingHorizontal: 8,
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
        fontStyle: 'italic',
        paddingVertical: 20,
    },
    backButton: {
        marginVertical: 20,
        color: "#1976d2",
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        paddingVertical: 12,
    },
    nextButtonContainer: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 22,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
});

export default DirectionLanes;*/