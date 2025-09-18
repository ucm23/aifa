import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, Image } from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';
import green from '../image/Check-Success.gif';
import red from '../image/Close-Cancel.gif';

export default function LoadingModal({ visible, setVisible, message, setMessage, setIsScanning }) {

    const [type, setType] = useState(null);
    const [count, setCount] = useState(5);

    const image = {
        1: green,
        2: red
    }

    useEffect(() => {
        if (count <= 0) {
            setVisible(false);
            setMessage(null);
            setCount(5);
            setIsScanning(true);
            return;
        }

        const timer = setInterval(() => {
            setCount(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [count]);


    useEffect(() => {
        if (typeof message?.type == 'number') setType(message.type)
    }, [message?.type]);



    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {type ? <>
                        <Text style={styles.title}>{message?.title}</Text>
                        <Image
                            source={image[message?.type]}
                            style={{ width: 200, height: 80 }}
                            resizeMode="contain"
                            loop={false}
                        />
                        <Text style={styles.subtitle}>{message?.message}</Text>
                        <Button
                            mode="contained"
                            onPress={() => {
                                setVisible(false)
                                setMessage(null)
                                setCount(5);
                                setIsScanning(true);
                            }}
                            style={{ marginTop: 20 }}>
                            Aceptar ({count})
                        </Button>
                    </>
                        : <>
                            <Text style={styles.title}>Analizando QR</Text>
                            <ActivityIndicator
                                animating={true}
                                size={60}
                                color="#007bff"
                                style={{ marginVertical: 20 }}
                            />
                            <Text style={styles.subtitle}>Por favor espera un momento mientras validamos</Text>
                        </>
                    }
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        padding: 30,
        backgroundColor: '#fff',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 10,
        elevation: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});
