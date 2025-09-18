import { View, Text, StyleSheet, Image } from 'react-native';
import * as Animatable from 'react-native-animatable';
import babafree from '../image/gifs/babafree.gif';
import qrscan from '../image/gifs/qrscan.gif';
import aifa from '../image/aifa2.png';

const states = {
    0: aifa,
    1: babafree,
    2: qrscan
}

export default function Pager(props) {
    return (
        <View style={STYLES.PAGER}>
            <Animatable.Image easing="ease" animation="fadeInDown" style={STYLES.IMG} source={states[props?.position]} >
            </Animatable.Image>
            <Text style={STYLES.BOLD}>{props?.title}</Text>
            <Text style={STYLES.SUBS}>{props?.description}</Text>
        </View>
    )
}

const STYLES = StyleSheet.create({
    PAGER: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
    BOLD: { fontSize: 20, fontWeight: '600', textAlign: 'center', marginBottom: 10 },
    SUBS: { color: 'gray', textAlign: 'center', fontSize: 15 },
    IMG: { height: 180, resizeMode: 'contain' }
})