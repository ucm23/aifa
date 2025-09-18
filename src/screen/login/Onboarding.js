import React, { useEffect, useState, useRef, } from 'react';
import { StyleSheet, View, } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import PagerView from 'react-native-pager-view';
import { Button } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import Pager from '../../components/Pager.js';
import { updateInformationById } from '../../api/information.js';
//import { updateInformationById } from '../../api/general/information.js';

const Onboarding = ({ navigation, }) => {

    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
            headerTitle: "",
            headerBackTitle: false
        });
    }, [navigation]);

    const [currentPage, setCurrentPage] = useState(0);
    const pagerRef = useRef(null);
    const handlePageChange = ({ nativeEvent }) => setCurrentPage(nativeEvent?.position);
    const handleNextButton = () => pagerRef.current && pagerRef.current.setPage(currentPage + 1);
    //const { updateInformationById } = useAppInformationCreateInit()

    const onPress = async () => {
        try {
            await updateInformationById({ id: 1, show_pager: 0 })
            navigation.navigate("Login")
        } catch (error) {
            console.log("🚀 ~ file: Onboarding.tsx:33 ~ onPress ~ error:", error)
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <StatusBar style='dark' />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 45 }}>
                {Array.from({ length: 3 }).map((_, index) => <View key={index} style={[STYLES.INDICADOR, index === currentPage && STYLES.INDICADOR_ACTIVE,]} />)}
            </View>
            <PagerView style={{ flex: 1, }} onPageSelected={handlePageChange} ref={pagerRef}>
                <Pager
                    position={0}
                    title={'Experimenta AIFA Pass Evolución'}
                    description={'Disfruta de beneficios exclusivos y atención preferencial.\nTodo diseñado para ahorrarte tiempo y esfuerzo.'}
                />
                <Pager
                    position={1}
                    title={'Tu Tiempo es Valioso'}
                    description={'Procesamos tu información en segundos. \nMenos trámites, \nmás eficiencia en cada interacción'}
                />
                <Pager
                    position={2}
                    title={'Escanea y Avanza Rápido'}
                    description={'Olvídate de las filas. \nEscanea el código QR y accede instantáneamente a nuestros servicios \nsin esperas'}
                />
            </PagerView>
            {currentPage !== 2 ?
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', position: 'absolute', bottom: 22, left: 6, right: 6 }}>
                    <Button labelStyle={{ fontWeight: 'bold', }} onPress={onPress}> Omitir </Button>
                    <Button labelStyle={{ fontWeight: 'bold', }} mode='contained' onPress={handleNextButton}> Siguiente </Button>
                </View>
                :
                <Animatable.View easing="ease" animation="fadeInDown" style={{ position: 'absolute', bottom: 22, left: 0, right: 0, paddingHorizontal: 8 }}>
                    <Button mode='contained' uppercase={false} onPress={onPress}> Empezar a escanear </Button>
                </Animatable.View>
            }
        </View>
    );
};

export default Onboarding;

const STYLES = StyleSheet.create({
    INDICADOR: { height: 9, width: 9, backgroundColor: '#83838399', borderRadius: 5, marginHorizontal: 5 },
    INDICADOR_ACTIVE: { backgroundColor: '#1f87d0ff' },
});