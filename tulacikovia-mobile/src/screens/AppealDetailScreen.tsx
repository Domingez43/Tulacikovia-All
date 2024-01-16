import { ScrollView } from "react-native-gesture-handler"
import { SafeAreaInsetsContext, useSafeAreaFrame } from "react-native-safe-area-context"
import { Dimensions, Insets, StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native';
import react, { useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { Appeal, AppealType, Event } from "../models/AppealModel";
import { TagsPillList } from "../components/TagsPillList";
import openMap from 'react-native-open-maps';
import ActionButton from "../components/ActionButton";
import { APIClient } from "../apis/ServerRequests";
import { userStore } from "../store/UserStore";
import { plainToInstance } from "class-transformer";
import { Notifications } from "../utils/NotificationUtils";

export const AppealDetailScreen = ({navigation, route}: any) => {
    const appeal: Appeal = plainToInstance(Appeal, route.params.event as unknown, { strategy: 'exposeAll'});
    const scrollRef = useRef<ScrollView>(null);
    const [participated, setParcitipated] = useState(false);

    useEffect(() => {
        var query = APIClient.buildEnpointWithQuery('content/appeals/participated', { appeal: appeal.id})
        APIClient.apiRequest<{participated: boolean}>(query, { method: 'GET'}, userStore.token).then(result => {
            console.log(query);
            setParcitipated(result.data?.participated ?? false);
        });
    })

    function getSubTitle(appeal: Appeal): string {
        switch(appeal.type) {
            case AppealType.APPEAL:
                return "Výzva";
            case AppealType.EVENT:
                return "Udalosť";
            default:
                return "Výzva";
        }
    }

    const ImageContent = ({image, margin}: any) => {
        return (
            <View style={{backgroundColor: '#EAEAEA', width: Dimensions.get('screen').width - (margin * 2), height: Dimensions.get('window').height * 0.25, borderRadius: 25, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginLeft: 20, marginRight: 20}}>
                {image ? <Image style={{height: '100%', aspectRatio: 2}} source={{uri: image}} contentFit="cover" transition={200} /> : <></>} 
            </View>
        )
    }

    const LocationSection = ({event}: {event: Event}) => {
        return (
            <TouchableOpacity style={{flexDirection: 'row', marginLeft: 20, marginTop: 20, marginRight: 23, alignItems: 'center', justifyContent: 'space-between'}} onPress={() => openMap({ latitude: event.location.coordinates[1], longitude: event.location.coordinates[0] })}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                    <Image style={{width: 20, aspectRatio: 1}} source={require('../../assets/Location.png')} contentFit="cover" transition={200} tintColor={'#C2C2C2'} />
                    <Text style={styles.locationTitle}>{event.location.address}</Text>
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
            {(!appeal) ? (<></>)
                    : (<>
                            <View style={styles.topPortion}>
                                <Text style={styles.subTitle}>{getSubTitle(appeal)}</Text>
                                <Text style={styles.title}>{appeal.name}</Text>
                            </View>
                            <View>
                                {(appeal as Event) ? <LocationSection event={appeal as Event} /> : null}
                            </View>
                            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} pagingEnabled={true} contentContainerStyle={{flexDirection: 'row'}} style={{marginTop: 13}}>
                                    {(appeal.images) ? appeal.images.map((image) => <ImageContent image={image} margin={20}/>) : <></>}
                            </ScrollView>
                            <TagsPillList tags={appeal.tags} tagColor='black' pillTextStyle={{fontSize: 16, margin: 3}} style={styles.tagPills} scrollable={true} insets={{left: 20, right: 20}}/>
                            <View>
                                <Text style={styles.sectionTitle}>Detail udalosti</Text>
                                {(appeal as Event) ? (
                                    <View style={styles.detail}>
                                        <View style={{aspectRatio: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', alignContent: 'center', padding: 15, backgroundColor: '#C0D4F2', borderRadius: 14}}>
                                            <Text style={{fontWeight: '800', fontSize: 20, color: '#729FE2'}}>{new Date((appeal as Event).startDate).getDate()}</Text>
                                            <Text style={{fontWeight: '800', fontSize: 16, textTransform: 'uppercase', color: '#729FE2'}}>{new Date((appeal as Event).startDate).toLocaleString('default', { month: 'short' })}</Text>
                                        </View>
                                        <View style={{flexDirection: 'column', justifyContent: 'center', gap: 3 }}>
                                            <Text style={styles.detailTitle}>Dátum a čas konania</Text>
                                            <Text style={styles.detailDate}>{'od ' + getStartDateString(new Date((appeal as Event).startDate)) + ' • do ' + getEndDateString(new Date((appeal as Event).endDate))}</Text>
                                        </View>
                                    </View>
                                ) : null}
                                
                            </View>
                            <View>
                                <Text style={styles.sectionTitle}>O udalosti</Text>
                                <Text style={styles.description}>{appeal.description}</Text>
                            </View>
                            <View style={{margin: 15, marginTop: 30}}>
                                <ActionButton action={() => {
                                    var participation = (participated) ? appeal.unparticipate() : appeal.participate();
                                    participation.then(result => {
                                        if(result) setParcitipated(!participated);
                                        if(result && !participated) Notifications.showMessage('Ďakujeme za vašu účasť!', 'Každou účasťou a záujmom pomáhate naším haukáčom odkázaným na našu a vašu pomoc, týmto vám ďakujeme!', 'SUCCESS');
                                    })
                                }} title={participated ? 'Ohlásiť sa' : 'Zúčasniť sa'} color={participated ? '#ff453a' : '#80B3FF'} orientation="center" returnAction={() => navigation.goBack()} returnTitle="Späť"/>
                            </View>
                        </>)}
            </ScrollView>
        )}
        </SafeAreaInsetsContext.Consumer>
    )
}

const styles = StyleSheet.create({
    detail: {margin: 20, marginTop: 10, marginBottom: 0, backgroundColor: '#EAEAEA', flexDirection: 'row', padding: 10, borderRadius: 18},
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