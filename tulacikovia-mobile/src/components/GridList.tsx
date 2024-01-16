import { observer } from "mobx-react";
import { ScrollView, View, Text, ImageBackground } from "react-native";
import { ReactElement } from 'react';
import { Animal } from "../models/AnimalModel";
import { Image } from 'expo-image'
import { TouchableOpacity } from "react-native-gesture-handler";

export interface GridListProps<T> {
    data: T[],
    gridComponent: (itemData: T) => ReactElement,
}

export const GridListComponent = <T,>({data, gridComponent}: GridListProps<T>) => {
    return (
        <ScrollView scrollEnabled={false} contentContainerStyle={{flex: 1, alignItems: 'center'}}>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginLeft: 15, marginRight: 15}}>
                {data?.map(dataItem => gridComponent(dataItem))}
            </View>
        </ScrollView>
    )
}

export const GridList = observer(GridListComponent);



export const AdoptionGridItem = ({image, width, height, title, subTitle, gender, onPress}: { image: string, width: number, height: number, title: string, subTitle: string, gender: 'MALE' | 'FEMALE', onPress: () => void}) => {
    return (
        <TouchableOpacity onPress={onPress}>
            <ImageBackground source={{ uri: image }} style={{width: width, height: height, borderRadius: 20, overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-end', padding: 8}}>
                <View style={{flex: 1, backgroundColor: 'black', opacity: 0.15, width: width, height: height, position: 'absolute'}} />
                <View style={{backgroundColor: 'white', padding: 13, borderRadius: 15, flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View style={{flex: 1}}>
                        <Text style={{fontFamily: 'GreycliffCF-Heavy', fontSize: 19}}>{title}</Text>
                        <Text numberOfLines={1} style={{fontFamily: 'GreycliffCF-ExtraBold', fontSize: 15, color: '#80B3FF'}}>{subTitle}</Text>
                    </View>
                    <Image source={gender == 'MALE' ? require('../../assets/male.png') : require('../../assets/female.png')} style={{width: 20, aspectRatio: 1}} tintColor={'#C4C4C4'}/>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    )
}