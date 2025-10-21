import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

export default function TextInputCustomL(props) {
    return (
        <TextInput
            {...props}
            //keyboardType={props.keyboard_type}
            mode='outlined'
            dense
            //left={<TextInput.Icon size={18} color={'gray'} name={props.icon}/>}
            style={ STYLE.TEXT_INPUT }
            outlineStyle={{ borderRadius: 50 }}
            
            
        />
    )    
}

const STYLE = StyleSheet.create({ 
    TEXT_INPUT: { 
        backgroundColor: 'white', 
        marginTop: 5,
        paddingHorizontal: -5 ,
        borderRadius: 50
    }
});