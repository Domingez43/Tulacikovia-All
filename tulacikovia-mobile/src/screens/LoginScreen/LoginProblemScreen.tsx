import { Text, SafeAreaView, TouchableOpacity} from "react-native";
import ActionButton from "../../components/ActionButton";
import { AuthPickerComponent } from "../LoginScreen";

export const LoginProblemScreen = ({ navigation }:any) => {
    return (
        <SafeAreaView>
            <AuthPickerComponent 
                headerTitle="Problém s prihlásením?"
                subHeaderTitle="Zabudol si heslo od svojho účtu?"
                paragraph="Heslo si jednoducho dokážes obnoviť pomocou prvého tlačidla, ak ťa trápi niečo iné použi kontaktný formulár."
                pickerActions={[
                    <ActionButton action={() => { navigation.push('PasswordResetScreen'); } } title={'Zabudol som heslo'} color={'#80B3FF'} />,
                    <ActionButton action={() => { navigation.push(''); } } title={'Kontaktný formulár'} color={'#80B3FF'} style="OUTLINED" />
                ]} subAction={<></>} />
        </SafeAreaView>
    )
}
