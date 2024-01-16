import { View, Dimensions, TouchableOpacity, Text, KeyboardAvoidingView, ViewStyle, StyleProp} from "react-native";
import React from 'react';
import { Image } from 'expo-image';
import { ScrollView as ScrollViewVertical } from "react-native-gesture-handler";

export interface DataInputProps {
    title: string;
    text: string;
    inputComponents: React.JSX.Element[];
    submitAction: React.JSX.Element;
    header: string,
    closeHandler?: () => void;
    inputStyle?: StyleProp<ViewStyle>;
    progressComponent?: React.JSX.Element;
}

const DataInput = ({title, text, inputComponents, submitAction, closeHandler, inputStyle, header, progressComponent}: DataInputProps) => {
    return (
        <KeyboardAvoidingView behavior="padding">
            <ScrollViewVertical style={{ width: '100%', height: '100%'}} contentContainerStyle={{flexDirection: 'column', paddingBottom: '15%'}} contentInsetAdjustmentBehavior="always" showsVerticalScrollIndicator={false} >
                <View style={{flexDirection: 'row', justifyContent: 'space-around', marginTop: 15, alignItems: 'center', alignContent: 'center', marginLeft: 15, marginRight: 15}}>
                    <View style={{flex: 0.5}} />
                    <Text style={{textAlign: 'center', flex: 1, fontFamily: 'GreycliffCF-Bold', fontSize: 18}}>{header}</Text>
                    <View style={{flex: 0.5, flexDirection: 'column', alignItems: 'flex-end', height: Dimensions.get('window').scale * 12}}>
                        <TouchableOpacity onPress={closeHandler} style={{paddingRight: 10}}>
                            <Image key={'image'}
                                style={{flex: 1, aspectRatio: 1}}
                                source={require('../../../assets/close.png')}
                                contentFit="fill"
                                transition={200} />
                        </TouchableOpacity>
                    </View>
                </View>
                {progressComponent}
                <View style={{margin: 20, marginLeft: 25, marginRight: 25, marginTop: 25, flexDirection: 'column', gap: 10}}>
                    <Text style={{fontFamily: 'GreycliffCF-Heavy', fontSize: 38, lineHeight: 41}}>{title}</Text>
                    <Text style={{fontFamily: 'GreycliffCF-Medium', fontSize: 15, color: '#BDBDBD'}}>{text}</Text>
                </View>
                <View style={{margin: 20, marginTop: 2, marginBottom: 15, ...(inputStyle as ViewStyle)}}>
                    {inputComponents}
                </View>
                <View style={{margin: 17, marginTop: 0}}>
                    {submitAction}
                </View>
            </ScrollViewVertical>
        </KeyboardAvoidingView>
    );
}

export default { DataInput }