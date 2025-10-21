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
/*import * as Sentry from "@sentry/react-native";



Sentry.init({
  dsn: 'https://40c078ebe4f7b353b971f818a8a1edf0@o4510053205868544.ingest.de.sentry.io/4510139656306768',
  enableInExpoDevelopment: true, 
  debug: true,
});

if (typeof window !== 'undefined' && window.ErrorUtils) {
  const defaultHandler = window.ErrorUtils.getGlobalHandler && window.ErrorUtils.getGlobalHandler();
  
  window.ErrorUtils.setGlobalHandler((error, isFatal) => {
    Sentry.Native.captureException(error);
    console.error('🔥 Error global capturado:', error);

    // llamar al handler por defecto si existe
    if (defaultHandler) defaultHandler(error, isFatal);
  });
}
*/

export const theme = {
    ...DefaultTheme,
    myOwnProperty: true,
    colors: {
        ...DefaultTheme.colors,
        primary: '#1f87d0ff',
    },
};

function App() {
    const [dbLoaded, setDbLoaded] = useState(false);
    const Stack = createStackNavigator();

    useEffect(() => {
        (async () => {
            try {
                //await _clear_all_bd();
                await useCreateTables();
            } catch (error) {
                console.error('❌ Error en la BD: ', error);
            } finally {
                setDbLoaded(true);
            }
        })();
    }, []);

    if (!dbLoaded) {
        return <ActivityIndicatorLoading size={"large"} />;
    }

    return (
        <PaperProvider theme={theme}>
            <NavigationContainer
                onStateChange={(state) => {
                    //console.log("📍 Estado de navegación:", JSON.stringify(state, null, 2));
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
        </PaperProvider>
    );
}

//export default Sentry.wrap(App);
export default App;
// "projectId": "ddaadbe0-f120-444f-9bdf-d76f1b477f9a"