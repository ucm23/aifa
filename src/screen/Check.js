import React, { useState, useRef, useEffect } from 'react';
import { View, Alert, StyleSheet, Text, Image } from 'react-native';
import { TextInput, FAB, Button, ActivityIndicator, ProgressBar, Badge } from 'react-native-paper';
import LoadingModal from '../components/LoadingModal';
import { CameraView, useCameraPermissions } from "expo-camera";
import moment from "moment";
import { checkFlight } from '../api/check_flight';
import { StatusBar } from 'expo-status-bar';

import green from '../image/Check-Success.gif';
import red from '../image/Close-Cancel.gif';
import not from '../image/No-Connection.gif';


function filtrarTexto(cadena) {
    return cadena.replace(/(NLU)|./g, (match) => {
        return match === 'NLU' ? 'NLU' : (match === '-' ? '-' : '*');
    });
}

export default function Check({ navigation, route }) {

    const {
        _text,
        _data,
        _user,
        NLU,
        _place
    } = route.params;

    const image = {
        1: green,
        2: red,
        3: not
    }

    const [count, setCount] = useState(4);
    const [type, setType] = useState(null);

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

        if (NLU) getCheckFlight(_data, _user);
        else {
            setMessage({
                type: 2,
                title: 'El descuento no aplica \n para este vuelo',
                message: '',
                color: '#db2c2cff'
            })
            setType(2)
        }
    }, []);

    useEffect(() => {
        if (count <= 0) {
            goBack();
            return;
        }

        const timer = setInterval(() => {
            setCount(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [count]);

    const [message, setMessage] = useState(null);

    const getCheckFlight = async (data, user) => {
        console.log("🚀 ~ getCheckFlight ~ data:", data)
        try {
            const { fetch, error } = await checkFlight({ data, user, _place });
            console.log("🚀 ~ getCheckFlight ~ response:", fetch)
            if (fetch) {
                setMessage({
                    type: 1,
                    title: 'Código QR válido',
                    message: 'Aplique el descuento correspondiente',
                    color: '#13e266ff'
                })
                setType(1)
            } else {
                setMessage({
                    type: 2,
                    title: 'Código QR inválido',
                    message: 'Datos inválidos o no encontrados',
                    color: '#db2c2cff'
                })
                setType(2)
            }
            if (error) {
                setMessage({
                    type: 3,
                    title: 'Ocurrió un error',
                    message: 'Intenta nuevamente más tarde',
                    color: '#db2c2cff'
                })
                setType(3)
                setCount(3);
            }
        } catch (error) {
            console.log("🚀 ~ getCheckFlight ~ error:", error)
        }
    }

    const goBack = () => {
        navigation.goBack();
    }

    return (
        <View style={styles.container}>
            <StatusBar style={!type ? "light" : "dark"} />
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                backgroundColor: type ? 'white' : '#1f87d0ff'
            }}>
                {type ? <>
                    <Image
                        source={image[message?.type]}
                        style={{ width: 125, height: 125 }}
                        resizeMode="contain"
                        loop={false}
                    />
                    {type == 1 && (
                        <View>
                            <Badge
                                style={{
                                    paddingHorizontal: 15,
                                    fontSize: 14,
                                    backgroundColor: 'transparent',
                                    color: message?.color,
                                    borderColor: message?.color,
                                    borderWidth: 1,
                                }}
                            >
                                {filtrarTexto(_data?._routing)}
                            </Badge>
                        </View>
                    )

                    }
                    <Text style={{ fontSize: 15, padding: 20, color: message?.color, textAlign: 'center' }}>{message?.message}</Text>
                    <Text style={{ fontSize: 25, color: message?.color, textAlign: 'center' }}>{message?.title}</Text>
                    <Button
                        mode="contained"
                        buttonColor={message?.color}
                        compact={false}
                        onPress={() => {
                            goBack();
                        }}
                        style={{ marginTop: 200 }}>
                        {type === 3 ? `Reintentar (${count})` : `Aceptar (${count})`}
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
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#ffffffff',

    },
    subtitle: {
        fontSize: 16,
        color: '#ffffffff',
        textAlign: 'center',
        padding: 20
    },
});
