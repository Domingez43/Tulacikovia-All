import { useState } from "react";
import { View, StyleSheet, NativeSyntheticEvent, TextInputEndEditingEventData, StyleProp, ViewStyle, NativeTouchEvent } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { Image } from "expo-image";

export interface InputFieldProps {
    placeholder?: string;
    isPassword?: boolean;
    onChange?: (e: NativeSyntheticEvent<TextInputEndEditingEventData>) => void;
    onEndEditing?: (e: NativeSyntheticEvent<TextInputEndEditingEventData>) => void;
    value?: string;
    isInputValid?: (test: string) => boolean;
    enabled?: boolean;
    style?: StyleProp<ViewStyle> | undefined;
    multiline?: boolean;
    onSubmit?: (e: NativeSyntheticEvent<TextInputEndEditingEventData>) => void;
    onPress?: (e: NativeSyntheticEvent<NativeTouchEvent>) => void;
    icon?: any;
} 

const InputField = ({onSubmit, placeholder, isPassword = false, onChange, value, onEndEditing, isInputValid, enabled, style = {margin: 5}, multiline = false, onPress, icon}: InputFieldProps) => {
    const [error, setError] = useState(false);

    const styles = StyleSheet.create({
        parentView: {alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', alignContent: 'center', backgroundColor: '#EAEAEA', padding: 25, borderRadius: 25, margin: 5, borderColor: (error) ? '#ff3a30' : '#EAEAEA', borderWidth: 2},
        inputStyle: { width: '100%', fontFamily: 'GreycliffCF-Regular', fontSize: 18, color: (error) ? '#ff3a30' : 'black'}
    });

    return (
        <View style={{...styles.parentView, ...(style as ViewStyle)}}>
            {(icon) ? <Image />: <></>}
            <TextInput 
                onChange={onChange} 
                placeholder={placeholder} 
                secureTextEntry={isPassword} 
                style={styles.inputStyle}
                onEndEditing={(e) => { 
                    if(onEndEditing) onEndEditing(e);
                    if(isInputValid) setError(!isInputValid(e.nativeEvent.text));
                }}
                defaultValue={value}
                editable={enabled}
                multiline={multiline}
                scrollEnabled={false}
                onSubmitEditing={onSubmit}
                onTouchEnd={onPress}/>
        </View>
    )
}

export default InputField;