import { View, Text, StyleSheet, KeyboardAvoidingView } from "react-native";
import { Image } from 'expo-image';
import { ScrollView } from "react-native-gesture-handler";
import React from "react";

//
// GENERAL AUTH COMPONENTS
//

interface AuthPickerScreenProps {
    headerTitle: string;
    subHeaderTitle: string;
    paragraph: string;
    pickerActions: React.JSX.Element[];
    subAction: React.JSX.Element;
    navigation?: any;
}

export const AuthPickerComponent = ({headerTitle, subHeaderTitle, paragraph, pickerActions, subAction}: AuthPickerScreenProps) => {
    return (
        <View style={styles.topPortion}>
            <View>
                <View style={styles.logoWrapper}>
                    <Image
                        style={styles.logo}
                        source={require('../../assets/logo.png')}
                        contentFit="contain"
                        transition={200}
                    />
                </View>
                <Text style={styles.title}>{headerTitle}</Text>
                <View style={styles.imageWrapper}>
                    <Image
                        style={styles.image}
                        source={require('../../assets/thumbnail_login.png')}
                        contentFit="cover"
                        transition={200}
                    />
                </View>
                <View style={styles.subText}>
                    <Text style={{fontFamily: 'GreycliffCF-Heavy', fontSize: 22}}>{subHeaderTitle}</Text>
                    <Text style={{fontFamily: 'GreycliffCF-Regular', fontSize: 22}}>{paragraph}</Text>
                </View>
            </View>
            <View style={styles.buttonWrapper}>
                {pickerActions}
                {subAction}
            </View>
        </View>
    )
}

interface AuthInputComponentProps {
    headerTitle: string;
    subHeaderTitle: string;
    inputComponents: React.JSX.Element[];
    helpAction: React.JSX.Element;
    submitAction: React.JSX.Element;
    subAction: React.JSX.Element;
}

export const AuthInputComponent = ({headerTitle, subHeaderTitle, inputComponents, helpAction, submitAction, subAction}: AuthInputComponentProps) => {

    return (
        <KeyboardAvoidingView behavior="position">
            <ScrollView bounces={false} contentInsetAdjustmentBehavior="always" overScrollMode="always" showsVerticalScrollIndicator={false} scrollEnabled={false} >
                <View style={styles.topPortion}>
                    <View>
                        <View style={styles.logoWrapper}>
                            <Image
                                style={styles.logo}
                                source={require('../../assets/logo.png')}
                                contentFit="contain"
                                transition={200}
                            />
                        </View>
                        <Text style={styles.title}>{headerTitle}</Text>
                        <View style={styles.imageWrapper}>
                            <Image
                                style={styles.image}
                                source={require('../../assets/thumbnail_login.png')}
                                contentFit="cover"
                                transition={200}
                            />
                        </View>
                    </View>
                    <View style={styles.bottomWrapper}>
                        <View style={styles.subHeader}>
                            <Text style={{fontFamily: 'GreycliffCF-Heavy', fontSize: 25}}>{subHeaderTitle}</Text>
                        </View>
                        {inputComponents}
                        {helpAction}
                        {submitAction}
                        {subAction}
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    topPortion: { height: '100%', width: '100%', flexDirection: 'column', justifyContent: 'space-between'},
    title: { fontFamily: 'GreycliffCF-Heavy', fontSize: 48, marginLeft: 30, marginRight: 30, lineHeight: 48 },
    container: { flex: 1 },
    logoWrapper: { margin: 10, flexDirection: 'row', marginLeft: 20, marginTop: 25 },
    logo: { width: '57%', aspectRatio: 5 },
    imageWrapper: {margin: 25, marginTop: 20, marginBottom: 0, flexDirection: 'row', justifyContent: 'center'},
    image: { width: '100%', aspectRatio: 2 },
    subText: {margin: 10, marginLeft: 30, marginRight: 30, marginTop: 35, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', alignSelf: 'stretch'},
    subHeader: {margin: 10, marginLeft: 15, marginRight: 15, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', alignSelf: 'stretch'},
    buttonWrapper: {margin: 20, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', alignContent: 'flex-end'},
    bottomWrapper: {margin: 20, marginTop: 5, marginBottom: 20, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', alignContent: 'flex-end'},
    button: {alignSelf: 'stretch', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#80B3FF', padding: 25, borderRadius: 25, margin: 5},
    buttonText: {fontFamily: 'GreycliffCF-ExtraBold', fontSize: 20, color: 'white'},
});
