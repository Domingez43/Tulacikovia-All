import { View, Text } from "react-native";
import { Image } from 'expo-image';

export const EmptyListComponent = () => {
    return (
        <View style={{flex: 1, flexDirection: 'column', alignItems: 'center', marginTop: 40, height: '100%', alignContent: 'center', justifyContent: 'center'}}>
            <Text style={{fontFamily: 'GreycliffCF-Heavy', color: 'black', fontSize: 15, marginBottom: 15, textAlign: 'center', marginLeft: 8}}>Neboj nájdený žiaden aktuálny obsah.</Text>
            <Image style={{flex: 1, width: '90%', height: 120}} source={require('../../assets/no_content.png')} contentFit="contain" transition={200} />
        </View>
    )
}