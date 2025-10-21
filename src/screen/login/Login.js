import React, { useState, useContext, useEffect, useRef, useCallback, } from 'react';
import { Text, View, Image, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActivityIndicatorLoading from '../../components/ActivityIndicatorLoading';
import { CameraView, useCameraPermissions } from "expo-camera";
import { StatusBar } from 'expo-status-bar';
import { getData, login, saveDataLogin, useAuthentificationLogged } from '../../api/login';
import { Button, Switch } from 'react-native-paper';
import { useForm, Controller } from "react-hook-form";
import image from '../../image/gifs/permissions.gif';
import aifa from '../../image/conectaifa.png';
import TextInputCustomL from '../../components/TextInputCustomL';
import { TextInput } from 'react-native-paper';
import * as Updates from 'expo-updates';

/*function flexiblePatternValidation(text) {
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
}*/



const Login = ({ navigation, openSession, route }) => {

    //const { username } = route.params;

    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        checkAndUpdate();
    }, []);

    const checkAndUpdate = async () => {
        setUpdating(false);
        try {
            const update = await Updates.checkForUpdateAsync();

            if (update?.isAvailable) {
                console.log("🔄 Nueva actualización disponible. Descargando...");
                await Updates.fetchUpdateAsync();
                console.log("✅ Actualización descargada. Reiniciando app...");
                setUpdating(true);
                await Updates.reloadAsync();
            } else {
                console.log("🚀 La app ya está actualizada.");
            }
        } catch (error) {
            console.log("⚠️ Error verificando actualizaciones:", error);
        } finally {
            setUpdating(true);
        }
    };

    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
            headerTitle: "Inicio de sesión",
            headerBackTitle: false,
            headerBackVisible: false,
            headerLeft: () => null,
        });
    }, [navigation]);

    const { control, handleSubmit, touched, formState: { errors } } = useForm({
        defaultValues: {
            //email: 'pachuca@aifapass-e.com', password: 'Password6',
            //email: 'penon@aifapass-e.com', password: 'Password66',
            //email: 'santa_ines@aifapass-e.com', password: 'Password31',
            email: '', password: '',
        },
    });

    const { get_last_login, login_offline } = useAuthentificationLogged();

    useEffect(() => {
        login_user_loggend()
    }, []);

    const login_user_loggend = async () => {
        setLoaderUserLogged(false)
        try {
            let { data, status } = await get_last_login()
            switch (status) {
                case 1:
                    let user__ = await getData('user');
                    console.log("🚀 ~ checkFlight ~ user__:", user__)
                    let lane__ = await getData('lane');
                    console.log("🚀 ~ checkFlight ~ lane__:", lane__)
                    navigation.replace('Home', {
                        user: user__,
                        lane: lane__
                    });
                    break;
                case true:
                    let { email, password, id, id_, place_id } = data;
                    const response = await login_offline({ email, password })
                    console.log("🚀 ~ login_user_loggend ~ response:", response?.data)
                    if (response?.status) {
                        //openSession('INFO', response?.data)
                        const lanesArray = JSON.parse(response?.data?.lanes);
                        let lane = lanesArray.find(lane =>
                            lane.direction === response?.data?.direction_active && lane.id.toString() === response?.data?.lane_active
                        );
                        navigation.replace('Home', {
                            user: {
                                ...response?.data,
                                user: {
                                    id: response?.data?.id,
                                    name: response?.data?.name,
                                    place_id
                                }
                            },
                            lane
                        });
                    }
                    break;
                case false:
                    setLoaderUserLogged(true)
                    break;
            }
        } catch (error) {
            console.error("login_user_loggend ~ error", error)
        } finally {
            setLoaderUserLogged(true)
        }
    }

    const [loaderUserLogged, setLoaderUserLogged] = useState(true);
    const [bandera, setBandera] = useState(true)
    //const [isScanning, setIsScanning] = useState(true);
    const [permission, requestPermission] = useCameraPermissions();
    const [verifyCode, setVerifyCode] = useState(false);

    const [eye, setEye] = useState(true)

    //let lastScannedTime = 0;
    //const SCAN_DELAY = 2000;

    /*const handleBarcodeScanned = (result) => {
        const currentTime = Date.now();
        if (currentTime - lastScannedTime < SCAN_DELAY || !isScanning) return;
        lastScannedTime = currentTime;
        setIsScanning(false);
        if (result?.data || result?.raw) {
            const data = flexiblePatternValidation(result?.data || '');
            const raw = flexiblePatternValidation(result?.raw || '');
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
    };*/


    /*async function* mode_loguers(data) {
        yield await login(data);
        //yield await login_offline(data);
    };*/

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const onSubmit = async (data) => {
        console.log("🚀🚀🚀🚀🚀 ~ onSubmit ~ data:", JSON.stringify(data, null, 5))
        setBandera(false)
        if (!validateEmail(data?.email.trim())) {
            Alert.alert('Correo inválido', 'Verifica el formato del correo electrónico.');
            setBandera(true)
            return;
        }
        try {
            let response = await login(data);
            //console.log("🚀 ~ onSubmit ~ response:", response?.data)
            if (response?.status == 1) {
                let responseLocal = await saveDataLogin({
                    response_data: response.data,
                    email: data.email,
                    password: data.password,
                    login: true
                })
                //console.log("🚀 ~ onSubmit ~ responseLocal:", responseLocal)
                let place_id = parseInt(response?.data?.user?.place_id) || 0;
                //console.error("🚀 ~ onSubmit ~ place_id:", place_id)

                // ALEATICA
                if ([11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 31].includes(place_id)) {
                    navigation.navigate('DirectionLanes', {
                        actives: response?.data?.lanes,
                        user: response?.data,
                        save: responseLocal.status,
                        email: data.email,
                        password: data.password,
                        mode: 1
                    });
                    return;
                }

                // IDEAL
                if ([1, 2, 3].includes(place_id)) {
                    /*const grouped = response?.data?.lanes.reduce((acc, lane) => {
                        if (!acc[lane.direction]) {
                            acc[lane.direction] = [];
                        }
                        acc[lane.direction].push(lane);
                        return acc;
                    }, {});
                    const result = Object.entries(grouped).map(([direction, items]) => ({
                        name: direction,
                        lanes: items
                    }));*/
                    navigation.navigate('DirectionLanes', {
                        actives: response?.data?.lanes,
                        user: response?.data,
                        save: responseLocal.status,
                        email: data.email,
                        password: data.password,
                        mode: 1
                    });
                    return;
                }

                // PINFRA
                if ([21, 22, 23, 24, 25, 26, 27, 28, 29].includes(place_id)) {
                    navigation.navigate('DirectionLanes', {
                        actives: response?.data?.lanes,
                        user: response?.data,
                        save: responseLocal.status,
                        email: data.email,
                        password: data.password,
                        mode: 1
                    });
                    return;
                }
                //const grouped = Object.groupBy(response?.data?.lanes, lane => lane.direction);
                //setDirections(grouped)

                //openSession('INFO', result_data?.value?.data)
            } else {
                Alert.alert("Error", "Verifica credenciales")
            }
            /*const get_data = mode_loguers({ ...data })
            let result_data = await get_data.next()
            //if (result_data?.value?.status === 0) Alert.alert('Verificación incorrecta', 'Vuelve a intentarlo / introduzca los datos correctamente.');
            if (result_data?.value?.status === 1) {
                result_data = await get_data.next()
                //openSession('INFO', result_data?.value?.data)
                console.log("🚀 ~ onSubmit ~ result_data?.data:", result_data?.value?.data)
                navigation.navigate('Home', { user: result_data?.value?.data });
            }*/
        } catch (error) {
            console.log("🚀 ~ file: Login.js:89 ~ onSubmit ~ error:", error)
        } finally {
            setBandera(true);
        }
    }

    const [isSwitchOn, setIsSwitchOn] = useState(false);
    const onToggleSwitch = () => setIsSwitchOn(!isSwitchOn);

    if (!updating) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ marginTop: 10, color: 'gray' }}>Verificando actualizaciones...</Text>
            </View>
        );
    }


    if (!permission) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Solicitando permisos...</Text>
            </View>
        );
    }

    if (!permission?.granted) {
        return (
            <SafeAreaView style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, backgroundColor: 'white' }}>
                <Image
                    source={aifa}
                    style={{ height: 120, marginVertical: 30 }}
                    resizeMode="contain"
                />
                <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
                    <Text style={{ color: '#1f87d0ff', width: '100%', fontWeight: 'bold' }}>Paso 1</Text>
                    <Text style={{ fontSize: 26, color: 'black', width: '100%', fontWeight: 'bold' }}>
                        Permiso para usar la cámara
                    </Text>
                    <Text style={{ fontSize: 16, color: 'gray', paddingVertical: 15, width: '100%' }}>
                        Otorga acceso a la cámara para escanear códigos QR's.
                    </Text>
                    <View
                        style={{
                            padding: 10, paddingHorizontal: 20,
                            backgroundColor: '#B6B6B680',
                            borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                        }} >
                        <Text onPress={onToggleSwitch}>Autorizo usar la cámara</Text>
                        <Switch value={isSwitchOn} onValueChange={onToggleSwitch} />
                    </View>
                </View>
                <Button
                    onPress={() => requestPermission()}
                    mode='contained'
                    disabled={!isSwitchOn}
                    style={{ marginBottom: 3, width: '100%', borderRadius: 10 }}
                >
                    Continuar
                </Button>
            </SafeAreaView>
        );
    }

    return (
        !loaderUserLogged ? <ActivityIndicatorLoading label={true} /> :
            <View style={styles.container}>
                <StatusBar style={'dark'} />
                <SafeAreaView style={{ backgroundColor: 'white', flex: 1, padding: 12 }}>
                    <View style={{ alignItems: 'center', }}>
                        <Image
                            source={aifa}
                            style={styles.imageTop}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={{ fontWeight: 'bold', fontSize: 20, color: "#343434ff", textAlign: 'center', marginTop: 5 }}>Iniciar sesión</Text>
                    <Text style={{ color: "#343434ff", textAlign: 'center', }}>Inicia sesión con tus credenciales</Text>
                    <Text style={{ fontSize: 7, textAlign: 'center', paddingBottom: 25 }}>3.0.0</Text>

                    <View>
                        <Text style={{ color: "#343434ff", marginLeft: 10 }}>Correo electrónico</Text>
                        <Controller control={control} name="email"
                            render={({ field: { onChange, value } }) => (
                                <TextInputCustomL
                                    placeholder={'Ingrese correo electrónico'} onChangeText={onChange} value={value}
                                    autoComplete="email"
                                    keyboardType="email-address"
                                    textContentType="emailAddress"
                                    importantForAutofill="yes"
                                />
                            )}
                        />
                        <Text style={{ color: "#343434ff", marginLeft: 10, marginTop: 15 }}>Contraseña</Text>
                        <Controller control={control} name="password"
                            render={({ field: { onChange, value } }) => (
                                <TextInputCustomL
                                    placeholder={'Ingrese la contraseña'} onChangeText={onChange} value={value} secureTextEntry={eye}
                                    autoComplete="password"
                                    textContentType="password"
                                    importantForAutofill="yes"
                                    right={<TextInput.Icon size={18} color={'gray'} icon={eye ? 'eye-outline' : 'eye-off-outline'} onPress={() => setEye(!eye)} />} />
                            )}
                        />
                    </View>

                    <View style={{ paddingTop: 15 }}>
                        <Button
                            loading={!bandera} disabled={!bandera} uppercase={false} onPress={handleSubmit(onSubmit)} mode='contained'
                            style={{ borderRadius: 50, }}
                            labelStyle={{ fontWeight: '400', textAlignVertical: 'center', fontSize: 16 }}
                            compact={false}
                        >
                            {bandera ? 'Iniciar sesión' : 'Comprobando'}
                        </Button>
                    </View>
                </SafeAreaView>
                {/*<CameraView
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
                </View>*/}
            </View>
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


//export default connect(mapStateToProps, mapDispatchToProps)(Login);

export default Login;




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
        width: '100%',
        height: 75,
        marginTop: 45,
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