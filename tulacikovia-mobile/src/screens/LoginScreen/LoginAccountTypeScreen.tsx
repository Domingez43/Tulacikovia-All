import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity, Text } from "react-native";
import ActionButton from "../../components/ActionButton";
import React from "react";
import { userStore } from "../../store/UserStore";
import { UserProfile } from "../../models/UserProfile";
import { AuthPickerComponent } from "../LoginScreen";

//
// 1.x.1 Screen of flow, defines what type of entity is about to register
// Options: User OR Organisation
//

export const LoginAccountTypeScreen = ({navigation, route}: any) => {
    
    function isSocialLogin(): boolean { return (route.params != undefined && route.params.socialLogin != undefined) ? route.params.socialLogin : false }

    return (
        <SafeAreaView>
            <AuthPickerComponent 
                headerTitle="Haf, počul som správne?"
                subHeaderTitle="Povedz nám o sebe viac"
                paragraph="Si jednotlivec ktorý chce pomáhať alebo organizácia ktorá potrebuje pomoc?"
                pickerActions={[
                    <ActionButton action={async () => { 
                        if(isSocialLogin()) {
                            if(!userStore.authProfile || !userStore.token) {
                                console.log('ERROR: authProfile or token missing');
                                return;
                            }
                            var userProfile = await UserProfile.createUserProfile(userStore.authProfile);
                            var result = await userProfile.finishRegistration(userStore.token, isSocialLogin() ? 'social' : 'email');

                            console.log("DATA: " + result);

                            userStore.setUser(userProfile);
                            userStore.state = result.status;
                            userStore.setToken(result.token);

                        } else {
                            navigation.push('Auth.RegisterUser', { socialLogin: isSocialLogin() })}
                        }
                    } title={'Chcem pomáhať'} color={'#80B3FF'} icons={[ require('../../../assets/next.png') ]} imageRatio={0.25} tintImage={'white'} />,
                    <ActionButton action={() => { navigation.push('Auth.RegisterOrganisation', { socialLogin: isSocialLogin() }) }} title={'Hľadáme pomoc'} color={'#80B3FF'} style="OUTLINED" icons={[ require('../../../assets/next.png') ]} imageRatio={0.25} tintImage={'#80B3FF'} />
                ]}
                subAction={
                    <TouchableOpacity onPress={() => { navigation.push('LoginProblemScreen')}}>
                        <Text style={{ margin: 25, marginBottom: 0, fontFamily: 'GreycliffCF-Bold', fontSize: 17, color: '#80B3FF'}}>Problém s prihlásením?</Text>
                    </TouchableOpacity>
                }/>
        </SafeAreaView>
    )
}