import { ScrollView, View, StyleSheet, Text, TouchableOpacity, Animated} from "react-native";
import { Image } from 'expo-image';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useEffect, useState } from 'react';
import Menu, { SliderMenuColoring } from '../components/MenuView';
import React from 'react';
import { Appeal, AppealContentType, AppealFilterFields, AppealFilters, Event } from "../models/AppealModel";
import { observer } from 'mobx-react';
import { appealStore, AppealStore } from "../store/AppealStore";
import { userStore } from "../store/UserStore";
import { ContentListItem } from "./EventScreen";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { AnimalFilters } from "../models/AnimalModel";

export const AppealUserScreenRoot = ({navigation, route}: any) => {
    const [selectedList, setSelectedList] = useState('EVENTS');
    const [sortType, setSortType] = useState(AppealFilterFields.startDate);
    const [sortDirection, setSortDirection] = useState(-1);
    const [filter, setFilter] = useState(AppealFilters.ACTUAL);
    const [fetchFilters, setFetchFilters] = useState({filters: [AppealFilters.ACTUAL], params: []});
    const { showActionSheetWithOptions } = useActionSheet();

    const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}: any) => {
        const paddingToBottom = 20;
        return layoutMeasurement.height + contentOffset.y >=
          contentSize.height - paddingToBottom;
    };

    useEffect(() => {
        fetchData();
    }, [sortDirection, sortType, fetchFilters])
    
    function fetchData(startOnIndex?: number) {
        Appeal.getList<Event>([filter, ...fetchFilters.filters], { limit: 5, sort: sortDirection, sortBy: sortType }, userStore.token, startOnIndex ?? 0, fetchFilters.params).then(data => {
            if(startOnIndex) appealStore.addEvents(data);
            else appealStore.refreshWithData(data);
            console.log('PRESERVED: ' + JSON.stringify(appealStore.appeals));
       });
    }

    const handleSortField = () => {
        const selectionAction = (selectedIndex?: number) => {
            switch (selectedIndex) {
                case 0:
                    break;
                case 1:
                    setSortType(AppealFilterFields.startDate);
                    break;
                case 2:
                    setSortType(AppealFilterFields.endDate);
                    break;
                case 3:
                    setSortType(AppealFilterFields.createdOn);
                    break;
                case 4:
                    setSortType(AppealFilterFields.type);
                    break;
            }
        }
        showActionSheetWithOptions({ options: ['Zrušiť', 'Dátum konania', 'Dátum ukončenia', 'Dátum pridania', 'Typ výzvy'], cancelButtonIndex: 0, title: 'Zoradiť list podľa parametru'}, selectionAction);
    }

    const getFieldTranslation = (field: AppealFilterFields) => { 
        switch(field) {
            case AppealFilterFields.createdOn:
                return 'Dátum pridania';
            case AppealFilterFields.startDate:
                return 'Dátum konania';
            case AppealFilterFields.endDate:
                return 'Dátum ukončenia';
            case AppealFilterFields.type:
                return 'Typ výzvy';
        }
    }

    function getFilterFunction(filter: AppealFilters) {
        switch(filter) {
            case AppealFilters.ACTUAL:
                return (value: Event, index: number, array: Event[]) => new Date(value.endDate) >= new Date() && !JSON.parse(value.draft.toString()) && !JSON.parse(value.archived?.toString() ?? 'false');
            case AppealFilters.PAST_DATE:
                return (value: Event, index: number, array: Event[]) => new Date(value.endDate) < new Date() && !value.draft && !value.archived;
            case AppealFilters.DRAFTS:
                return (value: Event, index: number, array: Event[]) => value.draft && !value.archived;
            case AppealFilters.ARCHIVE:
                return (value: Event, index: number, array: Event[]) => value.archived;
        }
    }

    function getSortFunction(sort: AppealFilterFields) {
        switch(sort) {
            case AppealFilterFields.startDate:
                return (e1: Event, e2: Event) => (new Date(e1.startDate).getTime() > new Date(e2.startDate).getTime()) ? sortDirection :   -1 * sortDirection;
            case AppealFilterFields.endDate:
                return (e1: Event, e2: Event) => (new Date(e1.endDate).getTime() > new Date(e2.endDate).getTime()) ? sortDirection :  -1 * sortDirection;
            case AppealFilterFields.type:
                return (e1: Event, e2: Event) => (e1.type > e2.type) ? -1 * sortDirection : sortDirection;
            case AppealFilterFields.createdOn:
                return (e1: Event, e2: Event) => (new Date(e1.createdOn).getTime() > new Date(e2.createdOn).getTime()) ? sortDirection :  -1 * sortDirection;
        }
    }

    const getListData = (filter: AppealFilters, sortBy: AppealFilterFields) => {
        return (appealStore.appeals && appealStore.appeals.size > 0) ? [...appealStore.appeals].map(([_, value]) => value as Event).filter(getFilterFunction(filter)!).sort(getSortFunction(sortBy)) : [];
    }

    const menuColoring: SliderMenuColoring = {
        tintColor: '#C2C2C2',
        color: '#EAEAEA',
        selectedColor: '#80B3FF',
        selectedTintColor: 'white'
    }

    return (
        <ScrollView bounces={true} contentInsetAdjustmentBehavior="always" overScrollMode="always" showsVerticalScrollIndicator={false} scrollEnabled={true} style={{backgroundColor: 'white'}} onScroll={({nativeEvent}) => {
            if (isCloseToBottom(nativeEvent)) { 
                var data = getListData(filter, sortType);
                if(data.length == 0) return;
                fetchData(data.length);
            }
          }} scrollEventThrottle={400}>
            <View style={styles.topPortion}>
                <View>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 20, marginRight: 20, gap: 5, marginBottom: 5}}>
                        <Image style={{width: 21, aspectRatio: 1}} source={require('../../assets/Location.png')} contentFit="cover" transition={200} tintColor={'#80B3FF'} />
                        <Text style={styles.locationTitle}>{userStore?.location?.city ?? 'Hľadanie polohy'}</Text>
                    </View>
                    <Text style={styles.title}>Aktuálne výzvy vo vašom okolí</Text>
                </View>
                <Menu.SliderMenu.Handler selectedItem={selectedList} coloring={menuColoring}>
                    <Menu.SliderMenu.Item key={"EVENTS"} viewKey="EVENTS" icon={require('../../assets/callendar_outline.png')} selectedIcon={require('../../assets/calendar.png')} title={"Udalosti"} handle={(key: string) => {
                        setSelectedList(key);
                        setFetchFilters({filters: [AppealFilters.ACTUAL], params: []});
                    }} titleHeight={20}/>
                    <Menu.SliderMenu.Item key={"ADOPTIONS"} viewKey="ADOPTIONS" icon={require('../../assets/heart_outline.png')} selectedIcon={require('../../assets/heart.png')} title={"Adopcie"} tintColor="white" color="#80B3FF" handle={(key) => { 
                        setSelectedList(key);
                        setFetchFilters({filters: [AppealFilters.CONTENT_TYPE], params: ['content_type:'+AppealContentType.ADOPTION] as never[]});
                    }} titleHeight={20}/>
                    <Menu.SliderMenu.Item key={"WALKS"} viewKey="WALKS" icon={require('../../assets/dog_outline.png')} selectedIcon={require('../../assets/dog.png')} title={"Venčenie"} handle={(key: string) => {
                        setSelectedList(key);
                        setFetchFilters({filters: [AppealFilters.CONTENT_TYPE], params: ['content_type:'+AppealContentType.WALK] as never[]});
                    }} titleHeight={20}/>
                    <Menu.SliderMenu.Item key={"DONATIONS"} viewKey="DONATIONS" icon={require('../../assets/bowl_outline.png')} selectedIcon={require('../../assets/bowl.png')} title={"Zbierky"} titleHeight={20} handle={(key: string) => {
                        setSelectedList(key)
                        setFetchFilters({filters: [AppealFilters.CONTENT_TYPE], params: ['content_type:'+AppealContentType.DONATION] as never[]});
                    }} />
                    <Menu.SliderMenu.Item key={"SHELTERS"} viewKey="SHELTERS" icon={require('../../assets/house_outline.png')} selectedIcon={require('../../assets/house.png')} title={"Útulky"} handle={(key) => setSelectedList(key)} titleHeight={20} />
                </Menu.SliderMenu.Handler>
            </View>
            <TouchableOpacity style={{flexDirection: 'row', gap: 10, alignItems: 'center', margin: 15, marginBottom: 15, marginLeft: 25}} onPress={() => {
                    setSortDirection(sortDirection * -1)
                }} onLongPress={() => handleSortField()}>
                <Animated.View style={{transform: [{rotate: (sortDirection == -1) ? '0deg' : '180deg'}]}}>
                    <Image style={{width: 12, aspectRatio: 1, marginTop: 2}} source={require('../../assets/down.png')} contentFit="cover" transition={200} tintColor={'#5C5C5C'} />
                </Animated.View>
                <Text style={{fontFamily: 'GreycliffCF-Bold', color: '#5C5C5C', fontSize: 15}}>{getFieldTranslation(sortType)}</Text>
            </TouchableOpacity>
            <Menu.ContentController currentViewKey={selectedList}>
                <Menu.ContentView key={'EVENTS'} viewKey={"EVENTS"} component={<EventList listData={getListData(AppealFilters.ACTUAL, sortType)} navigation={navigation} />}/>
                <Menu.ContentView key={'WALKS'} viewKey={"WALKS"} component={<EventList listData={getListData(AppealFilters.ACTUAL, sortType)} navigation={navigation} />}/>
                <Menu.ContentView key={'DONATIONS'} viewKey={"DONATIONS"} component={<EventList listData={getListData(AppealFilters.ACTUAL, sortType)} navigation={navigation} />}/>
                <Menu.ContentView key={'CONCEPTS'} viewKey={"CONCEPTS"} component={<EventList listData={(appealStore.appeals && appealStore.appeals.size > 0) ? [...appealStore.appeals].map(([_, value]) => value as Event).filter((appeal) => appeal.draft) : []} navigation={navigation} />}/>
            </Menu.ContentController>
        </ScrollView>
    )
}

export const AppealUserScreen = observer(AppealUserScreenRoot);

export interface EventListProps {
    listData: Event[];
    navigation?: any;
}

export const EventListComponent = ({listData, navigation}: EventListProps) => {

    function formatDate(_date: Date) {
        const date = new Date(_date);
        const yyyy = date.getFullYear();
        let mm = date.getMonth() + 1; // Months start at 0!
        let dd = date.getDate();

        return ((dd < 10) ? '0' + dd.toString() : dd) + '.' + ((mm < 10) ? '0' + mm : mm) + '.' + yyyy;
    }

    function handlePressAction(event: Event) {
        console.log(event.images);
        // if(userStore.userProfile?.type == "ORGANIZATION") navigation.push('Event.Organisation.New', { Event: Event })
        if(userStore.userProfile?.type == "USER") navigation.push('Home.User.Detail', { event: event })
    }

    return (
        <SwipeListView
            data={listData}
            renderItem={ (data, rowMap) => (
                <ContentListItem date={formatDate(data.item.startDate)} title={data.item.name} image={data.item.images[0]} tags={data.item.tags} onPress={() => handlePressAction(data.item as Event)} />
            )}

            style={{width: '100%', height: '100%'}}
            scrollEnabled={false}
            useNativeDriver={true}
        />
    )
}

export const EventList = observer(EventListComponent);

const styles = StyleSheet.create({
    locationTitle: {fontFamily: 'GreycliffCF-Heavy', fontSize: 27, lineHeight: 30, color: '#80B3FF' },
    topPortion: {flexDirection: 'column', justifyContent: 'space-between', marginTop: 25},
    title: { fontFamily: 'GreycliffCF-Heavy', fontSize: 42, marginLeft: 20, marginRight: 20, lineHeight: 46 },
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