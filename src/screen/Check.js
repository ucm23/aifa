import React, { useState, useRef, useEffect } from 'react';
import { View, Alert, StyleSheet, Text, Image } from 'react-native';
import { FAB, Button, ActivityIndicator } from 'react-native-paper';
import { checkFlight } from '../api/check_flight';
import { StatusBar } from 'expo-status-bar';

import { SafeAreaView } from 'react-native-safe-area-context';

import green from '../image/Check-Success.gif';
import red from '../image/Close-Cancel.gif';
import not from '../image/No-Connection.gif';

export default function Check({ navigation, route }) {

    const {
        _text,
        NLU,
        idCarril,
        sentido,
        token,
        lane,
        user
    } = route.params;

    const image = {
        1: green,
        2: red,
        3: red
    }

    const place_id = parseInt(user?.user?.place_id)
    console.log("🚀 ~ Check ~ place_id:", place_id)

    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
            headerTitle: "",
            headerBackTitle: false
        });
    }, [navigation]);

    useEffect(() => {
        console.log("🚀 ~ Check ~ route.params:", route.params)
        console.log("🚀 ~ Check ~ _text:", _text)



        if (NLU) getCheckFlight();
        else {
            setMessage({
                type: 901,
                mensaje: 'No es un código QR emitido por el servicio ConectAIFA QR',
                color: '#db2c2cff'
            })
        }
    }, []);

    const [mensaje, setMessage] = useState(null);

    /*const resultPaint = {
        'Usuario no encontrado': { color: "#db2c2cff", type: 3 },
        'Usuario no tiene una plaza de cobro asignada': { color: "#db2c2cff", type: 3 },
        'No se puede formatear con contenido': { color: "#db2c2cff", type: 3 },
        "Código ya leído": { color: "#ea7712ff", type: 2 },
        "Cruce válido": { color: "#13e266ff", type: 1 },
        "No valido": { color: "#db2c2cff", type: 3 },
        'Error al validar el vuelo': { color: "#ea7712ff", type: 2 },
    }*/

    //const getColor = (mensaje) => resultPaint[mensaje] || { color: "#db2c2cff", type: 3 };

    const resultPaint = {
        0: "#13e266ff",   // Validación correcta y autorizada
        901: "#db2c2cff", // No es código QR emitido por el servicio Conecta AIFA QR
        902: "#db2c2cff", // QR no es válido, los datos contenidos son incorrectos
        903: "#db2c2cff", // QR no encontrado
        904: "#db2c2cff", // El QR ya expiró y no se puede utilizar
        905: "#db2c2cff", // Código QR ya fue registrado en esta plaza para este sentido
        906: "#db2c2cff", // La clase vehicular no corresponde a un automóvil
        907: "#db2c2cff", // Código QR registrado en otro carril/ sentido y aún no transcurre el tiempo de tolerancia
        908: "#db2c2cff", // El QR aun no inicia su vigencia
        909: "#db2c2cff", // El QR fue utilizado en otra plaza con una diferencia de tiempo inconsistente
        404: "#ea7712ff", // Error al validar el vuelo
    }

    const getCheckFlight = async () => {
        try {
            const { fetch, error, status, json } = await checkFlight({
                qr: _text,
                claseVehicular: "",
                plate: "",
                idCarril,
                sentido,
                token
            });
            console.log("🚀 ~ getCheckFlight ~ response:", fetch);
            //Alert.alert('Resuyl: ' + status, JSON.stringify(fetch, null, 4));
            //const { color, type } = getColor(fetch?.mensaje);

            if (status === 200) {
                const codigoRespuesta = fetch?.codigoRespuesta;
                setMessage({
                    type: codigoRespuesta,
                    mensaje: fetch?.mensaje,
                    idQr: fetch?.idQr,
                    color: resultPaint[codigoRespuesta] || "#db2c2cff",

                })
            }
        } catch (error) {
            console.log("🚀 ~ getCheckFlight ~ error:", error)
        }
    }

    const goBack = () => navigation.goBack();

    return (
        <View style={styles.container}>
            <StatusBar style={"dark"} />
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    backgroundColor: typeof mensaje?.type === 'number' ? mensaje?.color : '#1f87d0ff'
                }}>
                    {(typeof mensaje?.type === 'number') ? <>
                        <Image
                            source={image[mensaje?.type]}
                            style={{ width: 125, height: 125 }}
                            resizeMode="contain"
                            loop={false}
                        />
                        {/*type == 1 && (
                        <View>
                            <Badge
                                style={{
                                    paddingHorizontal: 15,
                                    fontSize: 14,
                                    backgroundColor: 'transparent',
                                    color: mensaje?.color,
                                    borderColor: mensaje?.color,
                                    borderWidth: 1,
                                }}
                            >
                                {filtrarTexto(_data?._routing)}
                            </Badge>
                        </View>
                    )*/}
                        <Text style={{ fontSize: 30, color: "white", fontWeight: '900', textAlign: 'center', marginHorizontal: 20 }}>{mensaje?.mensaje}</Text>
                        {mensaje?.idQr &&
                            <Text style={{ fontSize: 25, color: "white", textAlign: 'center', paddingVertical: 20 }}>
                                ID único:
                                <Text style={{ fontWeight: '900' }}> {mensaje?.idQr}</Text>
                            </Text>
                        }

                        <Button
                            mode="contained"
                            buttonColor={'white'}
                            compact={false}
                            onPress={goBack}
                            style={{ marginTop: 150, backgroundColor: 'black' }}>
                            {mensaje?.type !== 1 ? `Reintentar` : `Aceptar`}
                        </Button>
                    </>
                        : <>
                            <ActivityIndicator
                                animating={true}
                                size={60}
                                color="#ffffffff"
                                style={{ marginVertical: 20 }}
                            />
                            <Text style={styles.subtitle}>Por favor espera un momento {"\n"} mientras validamos</Text>
                            <Text style={styles.title}>Analizando {"\n"}código QR</Text>
                        </>
                    }
                </View>
            </SafeAreaView>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#ffffffff',

    },
    subtitle: {
        fontSize: 20,
        color: '#ffffffff',
        textAlign: 'center',
        padding: 20
    },
});
