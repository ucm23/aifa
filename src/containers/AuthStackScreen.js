import React, { useEffect, useState } from 'react';
//import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
//import { MaterialCommunityIcons } from '@expo/vector-icons';
//import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import Home from '../screen/Home';
import Check from '../screen/Check';
import Login from '../screen/login/Login';
import ActivityIndicatorLoading from '../components/ActivityIndicatorLoading';
import { indexInformation, indexInformationById } from '../api/information';
import DirectionLanes from '../screen/login/DirectionLanes';

const Stack = createStackNavigator();

export default function AuthStackScreen() {

    //const [loaderModules, setLoaderModules] = useState(false);
    //const [showOnboarding, setShowOnboarding] = useState(true);

    /*useEffect(() => {
        update_info_app();
    }, []);

    const update_info_app = async () => {
        try {
            indexInformation();
            let data = await indexInformationById();
            console.log("🚀 ~ constupdate_info_app= ~ data:", JSON.stringify(data, null, 3))
            if (data) setShowOnboarding(data?.show_pager);
        } catch (error) {
            console.log("🚀 ~ file: AuthStackScreen.js:28 ~ update_info_app ~ error:", error);
        } finally {
            setLoaderModules(true);
        }
    }*/

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={"Login"}>
            <Stack.Screen name="Login" component={Login} />
            {/*<Stack.Screen name="Onboarding" component={Onboarding} />*/}
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Check" component={Check} />
            <Stack.Screen name="DirectionLanes" component={DirectionLanes} />
        </Stack.Navigator>
    );

}