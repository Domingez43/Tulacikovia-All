import { useEffect, useRef, useState } from "react";
import { SafeAreaView, View, Text, Dimensions, Platform, TouchableOpacity } from "react-native"
import MapView, { Marker } from 'react-native-maps'
import * as Location from 'expo-location';
import { userStore } from "../store/UserStore";
import { observe } from "mobx";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { appealStore } from "../store/AppealStore";
import { Appeal, AppealContentType, AppealFilterFields, AppealFilters, AppealModel, AppealType, Event } from "../models/AppealModel";
import { observer } from "mobx-react";
import { ScrollView } from "react-native-gesture-handler";
import { Image } from 'expo-image';
import { TagsPillList } from "../components/TagsPillList";

export const MapScreenRoot = ({navigation, route}: any) => {
    const mapRef = useRef<any>(null);
    const scrollRef = useRef<any>(null);
    const CARD_SPACING = 7;
    const CARD_WIDTH = (Dimensions.get('window').width - CARD_SPACING) * 0.75;
    const SPACING_FOR_CARD_INSET = 10
    const [contentTypeFilter, setContentTypeFilter] = useState<AppealContentType | undefined>(undefined);
    const [typeFilter, setTypeFilter] = useState<AppealType | undefined>(undefined);
    const [content, setContent] = useState<AppealModel[]>([]);

    useEffect(() => {
        console.log(contentTypeFilter, typeFilter);
    }, [contentTypeFilter, typeFilter])

    useEffect(() => {
        fetchRegionData(userStore?.location?.longitude ?? 21.25808, userStore?.location?.latitude ?? 48.71395, 10000);
    },[])

    const _onMomentumScrollEnd = ({ nativeEvent }: any) => {
        // the current offset, {x: number, y: number} 
        const position = nativeEvent.contentOffset; 
        // page index 
        const index = Math.abs(Math.round(nativeEvent.contentOffset.x / CARD_WIDTH));
        
        if((content && content.length > 0)) {
            var appeal = content[index];
            if(appeal == undefined) {
                console.log('Appeal is undefined...');
                return;
            }
            mapRef.current.animateToRegion({
                longitude: appeal.location.coordinates[0],
                latitude: appeal.location.coordinates[1],
                latitudeDelta: 0.03,
                longitudeDelta: 0.02
            })
        }
    }

    async function fetchRegionData(lon: number, lat: number, radius: number) {
        var exclude = content.map(value => value.id).join(';')

        var filters = [AppealFilters.ACTUAL, AppealFilters.IN_LOCATION];
        if (content.length > 0) filters.push(AppealFilters.EXCLUDE)
        if (contentTypeFilter) filters.push(AppealFilters.CONTENT_TYPE);
        if (typeFilter) filters.push(AppealFilters.TYPE);

        Appeal.getList<Event>(filters, { limit: 30, sort: -1, sortBy: AppealFilterFields.endDate }, userStore.token, 0, ['lon:'+lon,'lat:'+lat,'limit:'+radius,'exclude:'+exclude, ...((typeFilter) ? ['type:'+typeFilter] : []), ...((contentTypeFilter) ? ['content_type:'+contentTypeFilter] : [])]).then(data => {
            if(data.length > 0) setContent([...content, ...data])
        });
    }

    function setTagFilter(tag: string) {
        switch(tag){
            case 'Zbierky':
                setContentTypeFilter(AppealContentType.DONATION);
                break;
            case 'Adopcie':
                setContentTypeFilter(AppealContentType.ADOPTION);
                break;
            case 'Venčenie':
                setContentTypeFilter(AppealContentType.WALK);
                break;
            case 'Udalosti':
                setTypeFilter(AppealType.EVENT);
                setContentTypeFilter(undefined);
                break;
            case 'Výzvy':
                setTypeFilter(AppealType.APPEAL);
                setContentTypeFilter(undefined);
                break;
        }
    }

    const AppealComponent = ({appeal}: {appeal: AppealModel}) => {

        return (
            <TouchableOpacity style={{flex: 1, backgroundColor: 'white', width: CARD_WIDTH, margin: CARD_SPACING, borderRadius: 20, overflow: 'hidden'}} onPress={() => {if(userStore.userProfile?.type == "USER") navigation.push('Maps.User.Detail', { event: appeal })}}>
                <Image style={{width: CARD_WIDTH, height: Dimensions.get('window').height * 0.13}} source={{uri: appeal.images[0]}} contentFit="cover" transition={200}/>
                <View style={{position: 'absolute', width: CARD_WIDTH, height: Dimensions.get('window').height * 0.13, backgroundColor: 'black', opacity: 0.3}} />
                <View style={{position: 'absolute', width: CARD_WIDTH, height: Dimensions.get('window').height * 0.13, flexDirection: 'row', alignItems: 'flex-end'}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 10, margin: 10}}>
                        <View style={{aspectRatio: 1, width: 55, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', alignContent: 'center', padding: 10, backgroundColor: 'white', borderRadius: 12}}>
                            <Text style={{fontWeight: '800', fontSize: 20, color: 'black'}}>{new Date((appeal as Event).startDate).getDate()}</Text>
                            <Text style={{fontWeight: '800', fontSize: 16, textTransform: 'uppercase', color: 'black'}}>{new Date((appeal as Event).startDate).toLocaleString('default', { month: 'short' })}</Text>
                        </View>
                        <Text numberOfLines={2} style={{ fontFamily: 'GreycliffCF-Heavy', color: 'white', fontSize: 22, width: CARD_WIDTH - 85, lineHeight: 24}}>{appeal.name}</Text>
                    </View>
                </View>
                <View style={{margin: 10, flexDirection: 'column', gap: 3, paddingLeft: 3, paddingBottom: 5}}>
                    <View style={{flexDirection: 'row', gap: 5, marginRight: 25}}>
                        <Image style={{width: 17, aspectRatio: 1}} source={require('../../assets/calendar.png')} contentFit="cover" transition={200} tintColor={'black'} />
                        <Text numberOfLines={1} style={{fontFamily: 'GreycliffCF-Heavy', color: 'black'}}>{appeal.location.address}</Text>
                    </View>
                    <Text numberOfLines={2} style={{fontFamily: 'GreycliffCF-Regular', color: 'grey', fontSize: 15}}>{appeal.description}</Text>
                </View>
            </TouchableOpacity>
        )
    }
    
    return (
        <SafeAreaInsetsContext.Consumer>
            {(insets) => (
                <View style={{flex: 1}}>
                    <MapView 
                        ref={mapRef}
                        style={{flex: 1}} 
                        initialRegion={{
                            latitude: userStore?.location?.latitude ?? 48.71395,
                            longitude: userStore?.location?.longitude ?? 21.25808,
                            latitudeDelta: 0.09,
                            longitudeDelta: 0.03
                        }}
                        region={{
                            latitude: userStore?.location?.latitude ?? 48.71395,
                            longitude: userStore?.location?.longitude ?? 21.25808,
                            latitudeDelta: 0.09,
                            longitudeDelta: 0.03
                        }}
                        onRegionChangeComplete={(region, details) => {
                            fetchRegionData(region.longitude, region.latitude, region.latitudeDelta * 55522)
                        }}>
                            {(content && content.length > 0) ? content.filter((value) => contentTypeFilter ? value.contentType == contentTypeFilter : true).filter((value) => typeFilter ? value.type == typeFilter : true).map((value, index) => <Marker coordinate={{latitude: (value as Event).location.coordinates[1], longitude: (value as Event).location.coordinates[0]}} onPress={() => {
                                scrollRef.current.scrollTo({x: ((index) * CARD_WIDTH - (2 * CARD_SPACING) + (-16 + ((index) * 13))) - 13.5, y: 0 , animated: true});
                            }}></Marker>) : <></>}
                    </MapView>
                    <View style={{position: 'absolute', top: insets?.top}}>
                        <TagsPillList tags={['Udalosti', 'Výzvy', 'Zbierky', 'Adopcie', 'Venčenie']} 
                            tagColor='white' 
                            tagTextColor="black" 
                            pillTextStyle={{fontSize: 18, margin: 5}} 
                            style={{marginTop: 10}} 
                            scrollable={true} 
                            insets={{left: 15, right: 15}} 
                            action={(tag) => setTagFilter(tag)}/>
                    </View>
                    <ScrollView ref={scrollRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{position: 'absolute', bottom: 1, width: '100%'}} contentContainerStyle={{flexDirection: 'row', paddingHorizontal: Platform.OS === 'android' ? SPACING_FOR_CARD_INSET : 0, marginBottom: 5}} decelerationRate={0} snapToInterval={CARD_WIDTH + (2* CARD_SPACING)} snapToAlignment="center" contentInset={{left: SPACING_FOR_CARD_INSET, bottom: 0, top: 0, right: SPACING_FOR_CARD_INSET}} onMomentumScrollEnd={_onMomentumScrollEnd}>
                        {(content && content.length > 0) ? content.filter((value) => contentTypeFilter ? value.contentType == contentTypeFilter : true).filter((value) => typeFilter ? value.type == typeFilter : true).map((value) => <AppealComponent appeal={value} />) : <></>}
                    </ScrollView>
                </View>
            )}
        </SafeAreaInsetsContext.Consumer>
    )
}

export const MapScreen = observer(MapScreenRoot);