import { useState, useRef, useEffect } from 'react';
import { View, Alert, StyleSheet, Text } from 'react-native';
import * as Updates from 'expo-updates';
import { Appbar } from 'react-native-paper';
import { CameraView, useCameraPermissions } from "expo-camera";
//import { useEffect } from 'react';
//import { Dimensions, Platform } from 'react-native';
//import { Camera } from 'expo-camera'; // OJO: import Camera, no solo CameraView
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { logout } from '../api/login';
import aifa from '../image/aifa.png';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function Home({ route }) {

    const navigation = useNavigation();
    const { user, lane } = route.params;
    //console.log("🚀🚀🚀 ~ Home ~ user:", user, lane)
    const place_id = parseInt(user?.user?.place_id)
    //console.log("🚀 ~ Check ~ place_id:", place_id)

    //const place_id = parseInt(userLocal?.user?.place_id)

    const [isScanning, setIsScanning] = useState(true);
    const [cameraKey, setCameraKey] = useState(0);
    const [changeCarril, setChangeCarril] = useState('');
    const lastScannedTime = useRef(0);
    const isFocused = useIsFocused();

    const [permission, requestPermission] = useCameraPermissions();
    const SCAN_DELAY = 2000;

    useEffect(() => {
        setIsScanning(true)
        //Alert.alert(JSON.stringify(lane, null, 3), JSON.stringify(user, null, 3));
        if ([21, 22, 23, 24, 25, 26, 27, 28, 29].includes(place_id)) {
            //setChangeCarril('[ UP ]');
        }
    }, []);

    useEffect(() => {
        if (isFocused) {
            const timer = setTimeout(() => {
                setCameraKey(prev => prev + 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isFocused]);

    const handleBarcodeScanned = (result) => {
        try {
            console.log("🚀 ~ handleBarcodeScanned ~ result:", result);
            const currentTime = Date.now();
            if (currentTime - lastScannedTime.current < SCAN_DELAY || !isScanning) return;
            lastScannedTime.current = currentTime;
            if (result?.data || result?.raw) {
                setIsScanning(false);
                const longestText = getLongestText(result?.data, result?.raw);
                const isnlu = isNLU(longestText);

                navigation.navigate('Check', {
                    _text: longestText,
                    idCarril: lane?.id,
                    sentido: lane?.direction,
                    lane: lane,
                    user: user,
                    NLU: isnlu,
                    token: user?.token
                });
            }
            setTimeout(() => setIsScanning(true), 1000);
        } catch (error) {
            console.log("🚀 ~ handleBarcodeScanned ~ error:", error)
        }
    };

    const getLongestText = (data, raw) => {
        const text1 = data || "";
        const text2 = raw || "";
        return text1.length >= text2.length ? text1 : text2;
    };

    const isNLU = str => /NLU/i.test(str);

    return (
        <View style={styles.camera}>
            <StatusBar style={'dark'} />
            <Appbar.Header style={{}}>
                <Appbar.Content
                    title={
                        <Text style={{ fontWeight: '900', color: '#01355aff', fontSize: 20 }}>
                            Conect <Text style={{ fontStyle: 'italic' }}>AIFA {changeCarril}</Text> <Text style={{ fontSize: 7 }}>3.0.0</Text>
                        </Text>
                    }
                />
            </Appbar.Header>
            <View style={{ flex: 1, width: '100%', height: '100%', backgroundColor: 'white' }}>
                <CameraView
                    key={cameraKey}
                    style={{ flex: 1, width: '100%', height: '100%', backgroundColor: 'white' }}
                    facing="back"
                    //ratio={'16:9'}
                    onMountError={(error) => {
                        console.log("🚀 ~ Camera error:", error);
                        Alert.alert("Error", "No se pudo acceder a la cámara");
                    }}
                    barcodeScannerSettings={{
                        barcodeTypes: [
                            'aztec', 'ean13', 'ean8', 'qr', 'pdf417', 'upc_e',
                            'datamatrix', 'code39', 'code93', 'itf14', 'codabar',
                            'code128', 'upc_a'
                        ]
                    }}
                    onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
                />

                <View style={styles.scanFrame}>
                    <View style={styles.cornerTopLeft} />
                    <View style={styles.cornerTopRight} />
                    <View style={styles.cornerBottomLeft} />
                    <View style={styles.cornerBottomRight} />
                    <Text style={styles.instructionText}>
                        {`${user?.user?.name ?? ''}\nCarril ${lane?.name ?? ''} - ${lane?.direction ?? ''}\n\nEncuadre el código QR`} {cameraKey}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    camera: {
        flex: 1,
        backgroundColor: 'white'
    },
    scanFrame: {
        position: 'absolute',
        width: '90%',
        height: '48%',
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        top: '5%',
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
        bottom: -125,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: 'white',
        fontSize: 18,
        fontWeight: '500',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 8,
        fontWeight: '900',
    }
});