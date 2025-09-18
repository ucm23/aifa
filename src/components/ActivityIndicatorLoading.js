import { View, Text, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

export default function ActivityIndicatorLoading() {
    return (
        <View style={STYLE.CONTAINER}>
            {/*<StatusBar style='dark' backgroundColor={COLOR.PRIMARY} />*/}
            <ActivityIndicator size={'large'} animating={true} color={'#1f87d0ff'} />
            <Text style={STYLE.TEXT}>Espere un momento</Text>
        </View>
    )
}

const STYLE = StyleSheet.create({
    CONTAINER: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    TEXT: { padding: 10, textAlign: 'center' },
});