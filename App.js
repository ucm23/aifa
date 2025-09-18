import React, { useEffect, useState, Suspense, useContext } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { SQLiteProvider } from 'expo-sqlite';
import { _clear_all_bd, dbName, useCreateTables } from './src/lib/__init_tables__';
import ActivityIndicatorLoading from './src/components/ActivityIndicatorLoading';
import AuthStackScreen from './src/containers/AuthStackScreen';
import { createStackNavigator } from "@react-navigation/stack";
import { Provider } from 'react-redux';
import store from './src/redux/store';
//import { initKnex } from './src/lib/knexConfig';

export const theme = {
    ...DefaultTheme,
    myOwnProperty: true,
    colors: {
        ...DefaultTheme.colors,
        primary: '#1f87d0ff',
    },
};

export default function App() {
    const [dbLoaded, setDbLoaded] = useState(false);
    const Stack = createStackNavigator();

    useEffect(() => {
        (async () => {
            try {
                //await _clear_all_bd();
                //await initKnex()
                await useCreateTables();
            } catch (error) {
                console.error('❌ Error en la BD: ', error);
            } finally {
                setDbLoaded(true);
            }
        })();
    }, []);

    useEffect(() => {
        console.log("🔄 dbLoaded actualizado:", dbLoaded);
    }, [dbLoaded]);

    if (!dbLoaded) {
        return <ActivityIndicatorLoading size={"large"} />;
    }

    return (
        <PaperProvider theme={theme}>
            <Provider store={store}>
                <NavigationContainer
                    onStateChange={(state) => {
                        console.log("📍 Estado de navegación:", JSON.stringify(state, null, 2));
                    }}
                >
                    <Suspense fallback={<ActivityIndicatorLoading />}>
                        <SQLiteProvider databaseName={dbName} useSuspense>
                            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={"Auth"}>
                                <Stack.Screen name="Auth" component={AuthStackScreen} />
                            </Stack.Navigator>
                        </SQLiteProvider>
                    </Suspense>
                </NavigationContainer>
            </Provider>
        </PaperProvider>
    );
}