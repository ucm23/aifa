import React, { useState, useContext, useEffect, } from 'react';
import { Text, View, Image, Alert, StyleSheet } from 'react-native';
import ActivityIndicatorLoading from '../../components/ActivityIndicatorLoading';
import { CameraView, useCameraPermissions } from "expo-camera";
import { StatusBar } from 'expo-status-bar';
import { login, useAuthentificationLogged } from '../../api/login';
import { Button, Switch } from 'react-native-paper';
import { connect, } from "react-redux";

import image from '../../image/gifs/permissions.gif';
import aifa from '../../image/aifa.png';

function flexiblePatternValidation(text) {
    console.log("🚀 ~ flexiblePatternValidation ~ text:", text)
    const regex = /^(\d+)\s*-\s*(\d+)\s*-\s*(\d+)\s*-\s*([A-Za-zÁÉÍÓÚáéíóúñÑ\s]+)$/;
    const match = text.match(regex);

    if (match) {

        const data = {
            id: parseInt(match[2].trim()) - 200,
            dealership: parseInt(match[1].trim()) - 100,
            ciudad: match[4].trim(),
            isValid: true
        };
        console.log("🚀 ~ flexiblePatternValidation ~ data:", JSON.stringify(data, null, 4))
        return data
    }

    return { isValid: false };
}

const Login = ({ navigation, openSession, route }) => {

    //const { username } = route.params;

    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
            headerTitle: "Inicio de sesión",
            headerBackTitle: false,
            headerBackVisible: false,
            headerLeft: () => null,
        });
    }, [navigation]);

    const { get_last_login, login_offline } = useAuthentificationLogged();

    useEffect(() => {
        login_user_loggend()
    }, []);

    const login_user_loggend = async () => {
        setLoaderUserLogged(false)
        try {
            let { data, status } = await get_last_login()
            if (status) {
                let { id, dealership } = data;
                const response = await login_offline({ id, dealership })
                if (response?.status) {
                    openSession('INFO', response?.data)
                    navigation.replace('Home', { user: response?.data });
                }
            } else setLoaderUserLogged(true)
        } catch (error) {
            console.error("login_user_loggend ~ error", error)
        } finally {
            setLoaderUserLogged(true)
        }
    }

    const [loaderUserLogged, setLoaderUserLogged] = useState(false);
    const [bandera, setBandera] = useState(true)
    const [isScanning, setIsScanning] = useState(true);
    const [permission, requestPermission] = useCameraPermissions();

    let lastScannedTime = 0;
    const SCAN_DELAY = 2000;

    const handleBarcodeScanned = (result) => {
        const currentTime = Date.now();

        // Evitar escaneos demasiado rápidos
        if (currentTime - lastScannedTime < SCAN_DELAY || !isScanning) {
            return;
        }

        lastScannedTime = currentTime;
        console.log("🚀 ~ handleBarcodeScanned ~ result:", result);

        setIsScanning(false);

        if (result?.data || result?.raw) {
            const data = flexiblePatternValidation(result?.data || '');
            console.log("🚀 ~ handleBarcodeScanned ~ data:", data)
            const raw = flexiblePatternValidation(result?.raw || '');
            console.log("🚀 ~ handleBarcodeScanned ~ raw:", raw)

            if (data.isValid) {
                const datos = { id: data?.id, dealership: data?.dealership };
                onSubmit(datos);
            } else if (raw.isValid) {
                const datos = { id: raw?.id, dealership: raw?.dealership };
                onSubmit(datos);
            } else {
                console.error("❌ Ambos datos son inválidos");
                Alert.alert("Autenticación fallida", "Verifique el codigo QR, el inicio de sesión no se completó.");
                // Reactivar el escaneo después de un error

            }
        }
        setTimeout(() => setIsScanning(true), 1500);
    };

    async function* mode_loguers(data) {
        yield await login(data);
        yield await login_offline(data);
    };

    const onSubmit = async (data) => {
        //console.log("🚀🚀🚀🚀🚀 ~ onSubmit ~ data:", JSON.stringify(data, null, 5))
        setBandera(false)
        try {
            const get_data = mode_loguers({ ...data })
            let result_data = await get_data.next()
            //if (result_data?.value?.status === 0) Alert.alert('Verificación incorrecta', 'Vuelve a intentarlo / introduzca los datos correctamente.');
            if (result_data?.value?.status === 1) {
                result_data = await get_data.next()
                openSession('INFO', result_data?.value?.data)
                console.log("🚀 ~ onSubmit ~ result_data?.data:", result_data?.value?.data)
                navigation.navigate('Home', { user: result_data?.value?.data });
            }
        } catch (error) {
            console.log("🚀 ~ file: Login.js:89 ~ onSubmit ~ error:", error)
        } finally {
            setBandera(true);
        }
    }

    const [isSwitchOn, setIsSwitchOn] = useState(false);
    const onToggleSwitch = () => setIsSwitchOn(!isSwitchOn);

    if (!permission) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Solicitando permisos...</Text>
            </View>
        );
    }

    if (!permission?.granted) {
        return (
            <View style={{ flex: 1, width: '100%', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 0 }}>
                <Image
                    source={aifa}
                    style={{ width: 200 }}
                    resizeMode="contain"
                />
                <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
                    <Image
                        source={image}
                        style={{ width: 222, height: 222 }}
                        resizeMode="contain"
                        loop={true}
                    />

                    <Text style={{ color: '#1f87d0ff', width: '100%', fontWeight: 'bold', paddingBottom: 15 }}>Paso 1</Text>
                    <Text style={{ fontSize: 30, color: 'black', width: '100%', fontWeight: 'bold' }}>
                        Permiso para usar la cámara
                    </Text>
                    <Text style={{ fontSize: 15, color: 'gray', paddingVertical: 20, width: '100%' }}>
                        Necesitamos acceso a tu cámara para escanear códigos QR y brindarte un servicio más rápido y eficiente.
                    </Text>

                    <View
                        style={{
                            padding: 25,
                            backgroundColor: '#B6B6B680',
                            borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                        }} >
                        <Text>Autorizo usar la cámara</Text>
                        <Switch value={isSwitchOn} onValueChange={onToggleSwitch} />
                    </View>
                </View>
                <Button
                    onPress={() => requestPermission()}
                    mode='contained'
                    disabled={!isSwitchOn}
                    style={{ marginBottom: 20, width: '100%', borderRadius: 10 }}
                >
                    Continuar
                </Button>
            </View>
        );
    }

    return (
        loaderUserLogged ?
            <View style={styles.container}>
                <StatusBar style={'dark'} />
                <CameraView
                    style={styles.camera}
                    facing="back"
                    barcodeScannerSettings={{
                        barcodeTypes: ['qr']
                    }}
                    onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
                    enabled={isScanning}
                />

                <View style={styles.scanFrame}>
                    <Image
                        source={aifa}
                        style={styles.imageTop}
                        resizeMode="contain"
                    />
                    <View style={styles.cornerTopLeft} />
                    <View style={styles.cornerTopRight} />
                    <View style={styles.cornerBottomLeft} />
                    <View style={styles.cornerBottomRight} />
                    <Text style={styles.instructionText}>Encuadre el código QR para {isScanning ? 'I' : '1'}NICIAR SESIÓN</Text>
                </View>
            </View>
            : <ActivityIndicatorLoading label={true} />
    );
};


const mapStateToProps = state => ({
    session: state.info.session
});

const mapDispatchToProps = dispatch => ({
    openSession(type, data) {
        dispatch({ type, data })
    }
});


export default connect(mapStateToProps, mapDispatchToProps)(Login);



const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    camera: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    scanFrame: {
        position: 'absolute',
        width: '90%',
        height: '50%',
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        top: '10%',
        left: '5%',
    },
    imageTop: {
        position: 'absolute',
        bottom: -200,
        left: 0,
        right: 0,
        width: '100%',
        height: 50,
    },
    cornerTopLeft: {
        position: 'absolute',
        top: -2,
        left: -2,
        width: 50,
        height: 50,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderTopLeftRadius: 10,
        borderColor: 'white',
        borderStyle: 'dotted',
    },
    cornerTopRight: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 50,
        height: 50,
        borderTopWidth: 2,
        borderRightWidth: 2,
        borderColor: 'white',
        borderStyle: 'dotted',
        borderTopRightRadius: 10,
    },
    cornerBottomLeft: {
        position: 'absolute',
        bottom: -2,
        left: -2,
        width: 50,
        height: 50,
        borderBottomWidth: 2,
        borderLeftWidth: 2,
        borderColor: 'white',
        borderStyle: 'dotted',
        borderBottomLeftRadius: 10,
    },
    cornerBottomRight: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 50,
        height: 50,
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderColor: 'white',
        borderStyle: 'dotted',
        borderBottomRightRadius: 10,
    },

    instructionText: {
        position: 'absolute',
        bottom: -80,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 12,
        borderRadius: 8,
    },
});
