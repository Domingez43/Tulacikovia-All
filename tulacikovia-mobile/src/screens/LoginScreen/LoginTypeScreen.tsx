import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity, Text } from "react-native";
import ActionButton from "../../components/ActionButton";
import React from "react";
import { AuthPickerComponent } from "../LoginScreen";




//
// 1. Screen of flow, defines how user will register or login
// Options: Email and Password OR Social Login
//

export const LoginTypeScreen = ({navigation}: any) => {
    return (
        <SafeAreaView>
            <AuthPickerComponent 
                headerTitle="Haf, počul som správne?"
                subHeaderTitle="Chceš pomôcť ale nevieš ako?"
                paragraph="Vráť lásku tým ktorí to potrebujú zo všetkých najviac!"
                pickerActions={[
                    <ActionButton action={() => { navigation.push('Auth.EmailLogin') }} title={'Email a heslo'} color={'#80B3FF'}icons={[ require('../../../assets/next.png') ]} imageRatio={0.25} tintImage={'white'}/>,
                    <ActionButton action={() => { navigation.push('Auth.SocialLogin') }} title={'Pokračovať cez'} color={'#80B3FF'} style="OUTLINED" icons={[ require('../../../assets/google_icon.png'), require('../../../assets/fb_icon.png'), ]}/>
                ]}
                subAction={
                    <TouchableOpacity onPress={() => { navigation.push('LoginProblemScreen')}}>
                        <Text style={{ margin: 25, marginBottom: 0, fontFamily: 'GreycliffCF-Bold', fontSize: 17, color: '#80B3FF'}}>Problém s prihlásením?</Text>
                    </TouchableOpacity>
                }/>
        </SafeAreaView>
    )
}
