import React, { useState, useRef, useEffect } from 'react';
import { View, Alert, StyleSheet, Text, TouchableOpacity, TextInput, Image } from 'react-native';
import { FAB, Button, TextInput as TextInputPaper } from 'react-native-paper';
import { CameraView, useCameraPermissions } from "expo-camera";
import moment from "moment";
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { logout } from '../api/login';
import aifa from '../image/aifa.png';
import { useAudioPlayer } from 'expo-audio';

const audioSource = require("./assets/beep.mp3");

const register = (str) => {
    const partes = str.trim().split(/\s+/);
    const arreglo = partes.slice(0, 2);
    return {
        name: arreglo[0] || null,
        code: arreglo[1] || null,
    }
}

function contieneNLU(cadena) {
    return /NLU/i.test(cadena);
}

function matchesPattern(cadena) {
    const normalizedStr = cadena.replace(/&lt;/g, '<');
    const pattern = /^M1[A-Z]+\/[A-Z]+\s+[A-Z0-9]+\s+[A-Z0-9]+\s+\d+\s+\d+Y\d+[A-Z]\d+\s+\d+[<>]\d+[A-Z0-9]*\d+[A-Z0-9]+\s+[A-Z0-9]*\s*\d+\s*.*$/;

    if (pattern.test(normalizedStr)) return true;

    const nombreMatch = normalizedStr.match(/^(M1[A-Z]+\/[A-Z]+)/);
    if (!nombreMatch || nombreMatch[1].length <= 25) return false;

    const nombreCompleto = nombreMatch[1];
    const restoCadena = normalizedStr.substring(nombreCompleto.length);
    const ultimos6 = nombreCompleto.slice(-6);
    const nombreRecortado = nombreCompleto.slice(0, -6);

    const nuevaCadena = nombreRecortado + " " + ultimos6 + restoCadena;

    return { string: nuevaCadena, pattern: pattern.test(nuevaCadena) };

}


function extraerAsientoCompleto(cadena) {
    const patronCompleto = /\s\d+Y(\d+)([A-Z]{1,2})\d+/;
    const match = cadena.match(patronCompleto);
    if (match) return match[1] + match[2]
    return null;
}

export default function Home({ navigation, route }) {

    navigation = useNavigation()
    //const isFocused = useIsFocused()
    const player = useAudioPlayer(audioSource);
    const { user } = route.params;

    const [text, setText] = useState('');
    const inputRef = useRef(null);
    const [mode, setMode] = useState(true);
    const [permission, requestPermission] = useCameraPermissions();
    const [isScanning, setIsScanning] = useState(true);

    let lastScannedTime = 0;
    const SCAN_DELAY = 2000;

    const logoutAccount = async () => {
        try {
            let response = await logout({ id: user?.id });
            console.log("~~~~~~~~:", response)
            if (response?.status) navigation.replace('Login');
            else Alert.alert("Error", "No se pudo cerrar sesión");
        } catch (error) {
            console.log("🚀 ~ logoutAccount ~ error:", error)
        }
    }

    useEffect(() => {
        navigation.setOptions({
            headerShown: mode ? true : false,
            headerTitle: () => (
                <View>
                    <Image
                        source={aifa}
                        style={{ width: 180, height: 40, resizeMode: 'cover' }}
                    />
                </View>
            ),
            headerBackTitle: false,
            headerBackVisible: false,
            headerLeft: () => null,
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => logoutAccount()}
                    style={{ marginRight: 15 }}
                >
                    <MaterialCommunityIcons name="logout" size={24} color="black" />
                </TouchableOpacity>
            ),
        });
    }, [navigation, mode]);

    /*useEffect(() => {
        if (isFocused) {
            setIsScanning(true);
        }
    }, [isFocused]);*/

    const handleBarcodeScanned = (result) => {
        const currentTime = Date.now();
        if (currentTime - lastScannedTime < SCAN_DELAY || !isScanning) {
            return;
        }
        lastScannedTime = currentTime;

        if (!isScanning) return;
        if (result?.data || result?.raw) {
            setIsScanning(false);
            player.play();
            console.log("🚀 ~ result:", result, typeof result);
            const data = matchesPattern(result?.data || '');
            const raw = matchesPattern(result?.raw || '');

            if (data.pattern) setText(data?.string);
            else if (raw.pattern) setText(raw?.string);
            else if (data) setText(result?.data);
            else if (raw) setText(result?.raw);
        }
        setTimeout(() => setIsScanning(true), 1000);
    };

    useEffect(() => {
        if (mode) {
            const interval = setInterval(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [mode]);

    function extarctRouting(route) {
        const partes = route.trim().split(/\s+/);
        if (partes.length >= 3) {
            const code = partes[2];
            const origen = code.substring(0, 3);
            const destino = code.substring(3, 6);
            return `${origen}-${destino}`
        }
        return null;
    }

    useEffect(() => {
        if (text.trim() === '') return;
        else {
            const patron = matchesPattern(text);
            const routing = extarctRouting(text)

            if (patron && routing) {
                setText('');
                navigation.navigate('Check', {
                    _text: text,
                    _data: {
                        _routing: routing,
                        _hora: moment().format("YYYY-MM-DD HH:mm:ss"),
                        _asiento: extraerAsientoCompleto(text),
                    },
                    _user: register(text),
                    NLU: contieneNLU(routing),
                    _place: user?.id
                });
            } else {
                console.log("❌ Patrón no reconocido:", text);
                Alert.alert("Código QR inválido", "Patrón no reconocido");
                setText('');
            }
        }
    }, [text]);

    if (!permission) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Solicitando permisos...</Text>
            </View>
        );
    }

    if (!permission?.granted) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <Text style={{ textAlign: "center" }}>
                    Necesitamos permiso para usar la cámara
                </Text>
                <Button onPress={() => requestPermission()}>
                    Dar permiso
                </Button>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style={!mode ? "light" : "dark"} />
            {mode ?
                <>
                    <TextInput
                        ref={inputRef}
                        placeholder="Escanea el código QR"
                        value={text}
                        onChangeText={setText}
                        multiline
                        autoFocus
                        showSoftInputOnFocus={false}
                        style={styles.input}
                    /*underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    outlineColor="transparent"
                    activeOutlineColor="transparent"
                    theme={{
                        colors: {
                            primary: 'transparent',
                            background: 'white',
                        }
                    }}*/
                    />
                    <Text style={styles.instructionText2}>{user?.place}</Text>
                </>
                :
                <>
                    <CameraView
                        style={styles.camera}
                        facing="back"
                        onMountError={() => {
                            Alert.alert("Error", "No se pudo acceder a la cámara");
                            setMode(true); // Cambiar a modo manual
                        }}

                        barcodeScannerSettings={{
                            barcodeTypes: [
                                'aztec', 'ean13', 'ean8', 'qr', 'pdf417', 'upc_e', 'datamatrix', 'code39', 'code93', 'itf14', 'codabar', 'code128', 'upc_a'
                            ]
                            //barcodeTypes: ['aztec', 'qr']
                        }}
                        onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
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
                        <Text style={styles.instructionText}>{user?.place + `\n\n`} Encuadre el código QR dentro de{isScanning ? 'l' : '1'} marco {/*isScanning ? 'YESS' : 'NOOO'*/}</Text>
                    </View>
                </>
            }

            <FAB
                icon={mode ? "camera" : 'keyboard'}
                style={styles.fab}
                color={'white'}
                label={!mode ? "Scanner" : 'Escanear QR'}
                onPress={() => setMode(!mode)}
            />
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageTop: {
        position: 'absolute',
        top: -40,
        left: 0,
        right: 0,
        width: '100%',
        height: 40,
    },
    input: {
        height: '70%',
        width: '100%',
        fontSize: 20,
        padding: 22,
        backgroundColor: 'white',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        borderWidth: 0,
    },
    fab: {
        position: 'absolute',
        margin: 20,
        right: 0,
        left: 0,
        bottom: 15,
        zIndex: 2,
        backgroundColor: '#1f87d0ff',

    },
    camera: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    scanFrame: {
        position: 'absolute',
        width: '90%',
        height: '60%',
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        top: '9%',
        left: '5%',
    },
    cornerTopLeft: {
        position: 'absolute',
        top: -2,
        left: -2,
        width: 50,
        height: 50,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderTopLeftRadius: 12,
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
        borderTopRightRadius: 12,
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
        borderBottomLeftRadius: 12,
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
        borderBottomRightRadius: 12,
    },

    instructionText: {
        position: 'absolute',
        bottom: -100,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 8,
    },
    instructionText2: {
        top: 20,
        textAlign: 'center',
        color: 'gray',
        fontSize: 16,
        fontWeight: '500',
    },
});
