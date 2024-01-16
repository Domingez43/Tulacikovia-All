import { ScrollView } from "react-native-gesture-handler"
import { SafeAreaInsetsContext, useSafeAreaFrame } from "react-native-safe-area-context"
import { Dimensions, Insets, Linking, StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native';
import react, { useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { TagsPillList } from "../components/TagsPillList";
import openMap from 'react-native-open-maps';
import ActionButton from "../components/ActionButton";
import { APIClient } from "../apis/ServerRequests";
import { userStore } from "../store/UserStore";
import { plainToInstance } from "class-transformer";
import { Notifications } from "../utils/NotificationUtils";
import { Animal } from "../models/AnimalModel";
import { LocationModel } from "../models/AppealModel";
import qs from 'qs';

export async function sendEmail(to: any, subject: any, body: any, options = {}) {
    const { cc, bcc } = options;

    let url = `mailto:${to}`;

    // Create email link query
    const query = qs.stringify({
        subject: subject,
        body: body,
        cc: cc,
        bcc: bcc
    });

    if (query.length) {
        url += `?${query}`;
    }

    // check if we can use this link
    const canOpen = await Linking.canOpenURL(url);

    if (!canOpen) {
        throw new Error('Provided URL can not be handled');
    }

    return Linking.openURL(url);
}

export const AnimalDetailScreen = ({navigation, route}: any) => {
    const animal: Animal = plainToInstance(Animal, route.params.animal as unknown, { strategy: 'exposeAll'});
    const scrollRef = useRef<ScrollView>(null);
    const [participated, setParcitipated] = useState(false);

    useEffect(() => {
        // var query = APIClient.buildEnpointWithQuery('content/animals/participated', { animal: animal.id})
        // APIClient.apiRequest<{participated: boolean}>(query, { method: 'GET'}, userStore.token).then(result => {
        //     console.log(query);
        //     setParcitipated(result.data?.participated ?? false);
        // });
    })

    const ImageContent = ({image, margin}: any) => {
        return (
            <View style={{backgroundColor: '#EAEAEA', width: Dimensions.get('screen').width - (margin * 2), height: Dimensions.get('window').height * 0.25, borderRadius: 25, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginLeft: 20, marginRight: 20}}>
                {image ? <Image style={{height: '100%', aspectRatio: 2}} source={{uri: image}} contentFit="cover" transition={200} /> : <></>} 
            </View>
        )
    }

    const LocationSection = ({location}: {location: LocationModel}) => {
        return (
            <TouchableOpacity style={{flexDirection: 'row', marginLeft: 20, marginTop: 20, marginRight: 23, alignItems: 'center', justifyContent: 'space-between'}} onPress={() => openMap({ latitude: location.coordinates[1], longitude: location.coordinates[0] })}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                    <Image style={{width: 20, aspectRatio: 1}} source={require('../../assets/Location.png')} contentFit="cover" transition={200} tintColor={'#C2C2C2'} />
                    <Text style={styles.locationTitle}>{location.address}</Text>
                </View>
                <Image style={{width: 15, aspectRatio: 1}} source={require('../../assets/next.png')} contentFit="cover" transition={200} tintColor={'#C2C2C2'} />
            </TouchableOpacity>
        )
    }

    const getStartDateString = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${day}. ${month}, ${hours}:${minutes}`;
    }

    const getEndDateString = (date: Date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${hours}:${minutes}`;
    }

    return (
        <SafeAreaInsetsContext.Consumer>
        {(insets) => (

            <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} scrollEnabled={true} contentContainerStyle={{paddingBottom: insets?.bottom, paddingTop: insets?.top}}>
            {(!animal) ? (<></>)
                    : (<>
                            <View style={styles.topPortion}>
                                <Text style={styles.subTitle}>Adopcie</Text>
                                <Text style={styles.title}>{animal.name}, tuláčik hľadajúci domov</Text>
                            </View>
                            {/* <View>
                                <LocationSection event={animal as Event} />
                            </View> */}
                            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} pagingEnabled={true} contentContainerStyle={{flexDirection: 'row'}} style={{marginTop: 13}}>
                                    {(animal.photos) ? animal.photos.map((image) => <ImageContent image={image} margin={20}/>) : <></>}
                            </ScrollView>
                            <TagsPillList tags={animal.tags} tagColor='black' pillTextStyle={{fontSize: 16, margin: 3}} style={styles.tagPills} scrollable={true} insets={{left: 20, right: 20}}/>
                            <View>
                                <Text style={styles.sectionTitle}>Informácie o zvieratku</Text>
                                <View style={styles.detail}>
                                    <View style={{flexDirection: 'column', flex: 1, justifyContent: 'space-between'}}>
                                        <Text style={{fontSize: 16}}><Text style={{fontFamily: 'GreycliffCF-ExtraBold'}}>Meno: </Text>{animal.name}</Text>
                                        <Text style={{fontSize: 16}}><Text style={{fontFamily: 'GreycliffCF-ExtraBold'}}>Pohlavie: </Text>{Animal.getGenderTranslation(animal.gender)}</Text>
                                        <Text style={{fontSize: 16}}><Text style={{fontFamily: 'GreycliffCF-ExtraBold'}}>Plemeno: </Text>{animal.breed}</Text>
                                    </View>
                                    <View style={{flexDirection: 'column', flex: 1, height: '100%', gap: 5}}>
                                        <Text style={{fontSize: 16}}><Text style={{fontFamily: 'GreycliffCF-ExtraBold'}}>Váha: </Text>{animal.weight} kg</Text>
                                        <Text style={{fontSize: 16}}><Text style={{fontFamily: 'GreycliffCF-ExtraBold'}}>Farba: </Text>{animal.color}</Text>
                                        <Text style={{fontSize: 16}}><Text style={{fontFamily: 'GreycliffCF-ExtraBold'}}>Narodenie: </Text>{`${new Date(animal.birthDate).getFullYear()}-${new Date(animal.birthDate).getUTCMonth()+1}-${new Date(animal.birthDate).getDate()}`}</Text>
                                    </View>
                                </View>
                                
                            </View>
                            <View>
                                <Text style={styles.sectionTitle}>Popis a príbeh zvieratka</Text>
                                <Text style={styles.description}>{animal.description}</Text>
                            </View>
                            <View style={{margin: 15, marginTop: 20}}>
                                <ActionButton action={() => { 
                                    sendEmail('support@example.com', 'Záujem o adopciu zvieratka s menom ' + animal.name, 
                                            'Zdravím,\n volám sa ' 
                                            + userStore.userProfile?.name 
                                            + ', a rád by som prejavil záujem o adopciu zvieratka z vášho útulku ktoré ste pridali k adopcii. \n\nDetaily zvieratka:' 
                                            + '\n\nDruh: ' + Animal.getAnimalTypeTranslation(animal.type) 
                                            + '\nMeno: ' + animal.name 
                                            + '\nPohlavie: ' + Animal.getGenderTranslation(animal.gender)  
                                            + '\nPlemeno: ' + animal.breed  
                                            + '\nDátum narodenia: ' + `${new Date(animal.birthDate).getFullYear()}-${new Date(animal.birthDate).getUTCMonth()+1}-${new Date(animal.birthDate).getDate()}`
                                            + '\nDátum pridania: ' + `${new Date(animal.createdOn).getFullYear()}-${new Date(animal.createdOn).getUTCMonth()+1}-${new Date(animal.createdOn).getDate()}`)
                                }} title={'Mám záujem'} color={participated ? '#ff453a' : '#80B3FF'} orientation="center" returnAction={() => navigation.goBack()} returnTitle="Späť"/>
                            </View>
                        </>)}
            </ScrollView>
        )}
        </SafeAreaInsetsContext.Consumer>
    )
}

const styles = StyleSheet.create({
    detail: {margin: 15, marginTop: 10, marginBottom: 0, backgroundColor: '#EAEAEA', flexDirection: 'row', padding: 17, borderRadius: 18, gap: 5},
    detailTitle: {fontFamily: 'GreycliffCF-Bold', fontSize: 17, marginLeft: 15, marginRight: 20, color: '#AEAEAE'},
    detailDate: {fontFamily: 'GreycliffCF-Bold', fontSize: 17, marginLeft: 15, marginRight: 20},
    topPortion: {flexDirection: 'column', justifyContent: 'space-between', marginTop: 25},
    tagPills: {marginTop: 10},
    locationTitle: { fontFamily: 'GreycliffCF-Bold', fontSize: 17, color: '#C2C2C2'},
    subTitle: { fontFamily: 'GreycliffCF-Heavy', fontSize: 25, marginLeft: 20, marginRight: 20, marginBottom: 5, color: '#80B3FF'},
    sectionTitle: { fontFamily: 'GreycliffCF-ExtraBold', fontSize: 21, marginLeft: 20, marginRight: 20, marginTop: 20},
    description: { fontFamily: 'GreycliffCF-Regular', fontSize: 17 * Dimensions.get('screen').fontScale, marginLeft: 20, marginRight: 20, marginTop: 10, color: '#B3B3B3', textAlign: 'justify'},
    title: { fontFamily: 'GreycliffCF-Heavy', fontSize: 38, marginLeft: 20, marginRight: 20, marginTop: 0, lineHeight: 40 },
    container: { flex: 1 },
    logoWrapper: { margin: 10, flexDirection: 'row', marginLeft: 20, marginTop: 25 },
    logo: { width: '57%', aspectRatio: 5 },
    imageWrapper: {margin: 25, marginTop: 20, marginBottom: 0, flexDirection: 'row', justifyContent: 'center'},
    image: { flex: 1},
    subText: {margin: 10, marginLeft: 30, marginRight: 30, marginTop: 35, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', alignSelf: 'stretch'},
    subHeader: {margin: 10, marginLeft: 15, marginRight: 15, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', alignSelf: 'stretch'},
    buttonWrapper: {margin: 20, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', alignContent: 'flex-end'},
    bottomWrapper: {margin: 20, marginTop: 5, marginBottom: 20, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', alignContent: 'flex-end'},
    button: {alignSelf: 'stretch', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#80B3FF', padding: 25, borderRadius: 25, margin: 5},
    buttonText: {fontFamily: 'GreycliffCF-ExtraBold', fontSize: 20, color: 'white'},
});