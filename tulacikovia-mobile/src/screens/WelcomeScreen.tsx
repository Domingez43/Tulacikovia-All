import { observer } from "mobx-react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity} from "react-native";
import { Image } from 'expo-image';
import ActionButton from "../components/ActionButton";
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

const WelcomeScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    
    return (
        <View style={{height: '100%', width: '100%', flexDirection: 'column', justifyContent: 'space-between', paddingTop: insets.top, paddingBottom: insets.bottom}}>
            <View>
                <View style={styles.logoWrapper}>
                    <Image
                        style={styles.logo}
                        source={require('../../assets/logo.png')}
                        contentFit="contain"
                        transition={200}
                    />
                </View>
                <Text style={styles.title}>Chceš pomôcť ale nevieš ako?</Text>
                <View style={styles.imageWrapper}>
                    <Image
                        style={styles.image}
                        source={require('../../assets/banners.png')}
                        contentFit="cover"
                        transition={200}
                    />
                </View>
                <View style={styles.subText}>
                    <Text style={{fontFamily: 'GreycliffCF-Regular', fontSize: 22}}>Vráť lásku tým ktorí to potrebujú zo všetkých najviac!</Text>
                </View>
            </View>
            <View style={styles.buttonWrapper}>
                <ActionButton action={() => { navigation.push('Auth.Login'); }} title={'Pokračovať'} color={'#80B3FF'} orientation="center" returnAction={() => {}} returnTitle="Viac" />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    topPortion: { height: '100%', width: '100%', flexDirection: 'column', justifyContent: 'space-between'},
    title: { fontFamily: 'GreycliffCF-Heavy', fontSize: 48, marginLeft: 30, marginRight: 30, lineHeight: 48 },
    container: { flex: 1 },
    logoWrapper: { margin: 10, flexDirection: 'row', marginLeft: 20, marginTop: 25 },
    logo: { width: '57%', aspectRatio: 5 },
    imageWrapper: {margin: 20, flexDirection: 'row', justifyContent: 'center'},
    image: { width: '100%', aspectRatio: 1 },
    subText: {margin: 20, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', alignSelf: 'stretch'},
    buttonWrapper: {margin: 20, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', alignContent: 'flex-end'},
    button: {alignSelf: 'stretch', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#80B3FF', padding: 25, borderRadius: 25, margin: 5},
    buttonText: {fontFamily: 'GreycliffCF-ExtraBold', fontSize: 20, color: 'white'},
});

export default observer(WelcomeScreen);