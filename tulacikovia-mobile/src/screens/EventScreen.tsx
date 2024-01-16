import { KeyboardAvoidingView, ScrollView, View, StyleSheet, Text, Dimensions, TouchableOpacity, Animated, Easing} from "react-native";
import { Image } from 'expo-image';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useEffect, useRef, useState } from 'react';
import { TagsPillList } from "../components/TagsPillList";
import { ReactElement } from 'react';
import Menu, { SliderMenuColoring } from '../components/MenuView';
import React from 'react';
import { Event, Appeal, AppealFilters, AppealFilterFields, AppealType } from "../models/AppealModel";
import { observer } from 'mobx-react';
import { appealStore, AppealStore } from "../store/AppealStore";
import { userStore } from "../store/UserStore";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { EmptyListComponent } from "../components/EmptyListComponent";
import { plainToInstance } from "class-transformer";

export const EventRootScreen = ({navigation, route}: any) => {
    const [selectedList, setSelectedList] = useState('ACTIVE');
    const { showActionSheetWithOptions } = useActionSheet();
    const [sortType, setSortType] = useState(AppealFilterFields.startDate);
    const [sortDirection, setSortDirection] = useState(1);
    const [filter, setFilter] = useState(AppealFilters.ACTUAL);
    const rotationAnimation = useRef(new Animated.Value(0)).current;

    const menuColoring: SliderMenuColoring = {
        tintColor: '#C2C2C2',
        color: '#EAEAEA',
        selectedColor: '#80B3FF',
        selectedTintColor: 'white'
    }

    useEffect(() => {
        console.log('data fetching')
        fetchEventData();
    }, [filter, sortType, sortDirection])

    function fetchEventData(startOnIndex?: number) {
        Appeal.getList<Event>([AppealFilters.MY_APPEALS, filter], { limit: 5, sort: sortDirection, sortBy: sortType }, userStore.token, startOnIndex).then(data => {
            if(startOnIndex) appealStore.addEvents(data);
            else appealStore.refreshWithData(data);
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

    const handleNewContentType = () => {
        const selectionAction = (selectedIndex?: number) => {
            switch (selectedIndex) {
                case 0:
                    break;
                case 1:
                    navigation.push('Event.Organisation.New', { type: AppealType.EVENT })
                    break;
                case 2:
                    navigation.push('Appeal.Organisation.New', { type: AppealType.APPEAL })
                    break;
            }
        }
        showActionSheetWithOptions({ options: ['Zrušiť', 'Udalosť', 'Výzva'], cancelButtonIndex: 0, title: 'Aký typ obsahu by si rád pridal?'}, selectionAction);
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
                return (value: Event, index: number, array: Event[]) => (new Date(value.endDate) >= new Date() && !value.draft && !value.archived) ? value : undefined;
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
                return (e1: Event, e2: Event) => (new Date(e1.startDate).getTime() > new Date(e2.startDate).getTime()) ? sortDirection :  -1 * sortDirection;
            case AppealFilterFields.endDate:
                return (e1: Event, e2: Event) => (new Date(e1.endDate).getTime() > new Date(e2.endDate).getTime()) ? sortDirection : -1 * sortDirection;
            case AppealFilterFields.type:
                return (e1: Event, e2: Event) => (e1.type > e2.type) ? sortDirection : -1 * sortDirection;
            case AppealFilterFields.createdOn:
                return (e1: Event, e2: Event) => (new Date(e1.createdOn).getTime() > new Date(e2.createdOn).getTime()) ? sortDirection : -1 * sortDirection;
        }
    }

    const getListData = (filter: AppealFilters, sortBy: AppealFilterFields) => {
        return (appealStore.appeals && appealStore.appeals.size > 0) ? [...appealStore.appeals].map(([_, value]) => value as Event).filter(getFilterFunction(filter)!).sort(getSortFunction(sortBy)) : [];
    }

    const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}: any) => {
        const paddingToBottom = 20;
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    };

    return (
        <ScrollView bounces={true} contentInsetAdjustmentBehavior="always" overScrollMode="always" showsVerticalScrollIndicator={false} scrollEnabled={true} style={{backgroundColor: 'white'}} onScroll={({nativeEvent}) => {
            if (isCloseToBottom(nativeEvent)) {
                var data = getListData(filter, sortType);
                if(data.length == 0) return;
                fetchEventData(data.length);
            }
          }} scrollEventThrottle={400}>
            <View style={styles.topPortion}>
                <View>
                    <Text style={styles.title}>Vaše udalosti</Text>
                </View>
                <Menu.SliderMenu.Handler selectedItem={selectedList} coloring={menuColoring}>
                    <Menu.SliderMenu.Item key={"NEW_Event"} viewKey="NEW_Event" icon={require('../../assets/add.png')} title={"Nová Udalosť"} handle={() => { handleNewContentType() }} />
                    <Menu.SliderMenu.Item key={"ACTIVE"} viewKey="ACTIVE" icon={require('../../assets/clock.png')} title={"Aktuálne"} tintColor="white" color="#80B3FF" handle={(key) => { setFilter(AppealFilters.ACTUAL); setSelectedList(key); }}/>
                    <Menu.SliderMenu.Item key={"PAST"} viewKey="PAST" icon={require('../../assets/calendar_desctructive.png')} title={"Už sa konalo"} handle={(key: string) => { setFilter(AppealFilters.PAST_DATE); setSelectedList(key); }}/>
                    <Menu.SliderMenu.Item key={"CONCEPTS"} viewKey="CONCEPTS" icon={require('../../assets/file_edit.png')} title={"Koncepty"} handle={(key: string) => { setFilter(AppealFilters.DRAFTS); setSelectedList(key); }}/>
                    <Menu.SliderMenu.Item key={"ARCHIVE"} viewKey="ARCHIVE" icon={require('../../assets/archive.png')} title={"Archív"} handle={(key: string) => { setFilter(AppealFilters.ARCHIVE); setSelectedList(key); }}/>
                </Menu.SliderMenu.Handler>
            </View>
            <TouchableOpacity style={{flexDirection: 'row', gap: 10, alignItems: 'center', margin: 15, marginBottom: 10, marginLeft: 25}} onPress={() => { setSortDirection(sortDirection * -1); }} onLongPress={() => handleSortField()}>
                <Animated.View style={{transform: [{rotate: (sortDirection != -1) ? '0deg' : '180deg'}]}}>
                    <Image style={{width: 12, aspectRatio: 1, marginTop: 2}} source={require('../../assets/down.png')} contentFit="cover" transition={200} tintColor={'#5C5C5C'} />
                </Animated.View>
                <Text style={{fontFamily: 'GreycliffCF-Bold', color: '#5C5C5C', fontSize: 15}}>{getFieldTranslation(sortType)}</Text>
            </TouchableOpacity>
            <Menu.ContentController currentViewKey={selectedList}>
                <Menu.ContentView key={'ACTIVE'} viewKey={"ACTIVE"} component={(getListData(AppealFilters.ACTUAL, sortType).length != 0) ? <EventList listData={getListData(AppealFilters.ACTUAL, sortType)} navigation={navigation} actions={true}/> : (getListData(AppealFilters.ACTUAL, sortType) != undefined) ? <EmptyListComponent/> : <View />}/>
                <Menu.ContentView key={'PAST'} viewKey={"PAST"} component={(getListData(AppealFilters.PAST_DATE, sortType).length != 0) ? <EventList listData={getListData(AppealFilters.PAST_DATE, sortType)} navigation={navigation} actions={true}/> : (getListData(AppealFilters.PAST_DATE, sortType) != undefined) ? <EmptyListComponent/> : <View />}/>
                <Menu.ContentView key={'CONCEPTS'} viewKey={"CONCEPTS"} component={(getListData(AppealFilters.DRAFTS, sortType).length != 0) ? <EventList listData={getListData(AppealFilters.DRAFTS, sortType)} navigation={navigation} actions={true}/> : (getListData(AppealFilters.DRAFTS, sortType) != undefined) ? <EmptyListComponent/> : <View />}/>
                <Menu.ContentView key={'ARCHIVE'} viewKey={"ARCHIVE"} component={<EventList listData={getListData(AppealFilters.ARCHIVE, sortType)} navigation={navigation} />}/>
            </Menu.ContentController>
        </ScrollView>
    )
}

export const EventScreen = observer(EventRootScreen);

export interface EventListProps {
    listData: Event[];
    navigation?: any;
    actions?: boolean;
    route?: (context: Event) => void;
}

export const EventListComponent = ({listData, navigation, actions = false, route}: EventListProps) => {

    function formatDate(_date: Date) {
        const date = new Date(_date);
        const yyyy = date.getFullYear();
        let mm = date.getMonth() + 1; // Months start at 0!
        let dd = date.getDate();

        return ((dd < 10) ? '0' + dd.toString() : dd) + '.' + ((mm < 10) ? '0' + mm : mm) + '.' + yyyy;
    }

    function handlePressAction(event: Event) {
        if(userStore.userProfile?.type == "ORGANIZATION" && event.type == AppealType.EVENT) navigation.push('Event.Organisation.New', { Event: event })
        else if(userStore.userProfile?.type == "ORGANIZATION" && event.type == AppealType.APPEAL) navigation.push('Appeal.Organisation.New', { appeal: event })
    }

    return (
        <SwipeListView
            data={listData}
            renderItem={ (data, rowMap) => {
                return <ContentListItem date={formatDate(data.item.startDate)} title={data.item.name} image={data.item.images[0]} tags={data.item.tags} onPress={() => route ? route((data.item as Event)) : handlePressAction(data.item as Event)} subTitle={(data.item.type == 'APPEAL' ? 'Výzva' : undefined)} />
            }}
            renderHiddenItem={ actions ? (data, rowMap) => (
                <ContentListActions onSide="RIGHT">
                    <TouchableOpacity style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}} onPress={() => appealStore.archiveEvent(plainToInstance(Event, data.item, { strategy: 'exposeAll'})) }>
                        <View style={{ width: Dimensions.get("window").width * 0.15, padding: 5, borderRadius: 20}}>
                            <Image style={{width: '100%', aspectRatio: 2}} source={require('../../assets/archive.png')} contentFit="contain" transition={200} tintColor={'black'} />
                        </View>
                        <Text style={{fontFamily: 'GreycliffCF-Bold', fontSize: 13}}>Archive</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}} onPress={() => appealStore.removeEvent(plainToInstance(Event, data.item, { strategy: 'exposeAll'})) }>
                        <View style={{ width: Dimensions.get("window").width * 0.15, padding: 5, borderRadius: 20}}>
                            <Image style={{width: '100%', aspectRatio: 2}} source={require('../../assets/bin.png')} contentFit="contain" transition={200} tintColor={'#ff3a30'} />
                        </View>
                        <Text style={{fontFamily: 'GreycliffCF-Bold', fontSize: 13, color: '#ff3a30'}}>Remove</Text>
                    </TouchableOpacity>
                </ContentListActions>
            ) : () => <></>}
            rightOpenValue={actions ? -100 : undefined}
            style={{width: '100%', height: '100%'}}
            scrollEnabled={false}
            useNativeDriver={true}
        />
    )
}

export const EventList = observer(EventListComponent);

export interface ContentListItemProps {
    date: string,
    title: string,
    tags: string[],
    image: any,
    subTitle?: string,
    onPress?: () => void;
}

export const ContentListItem = ({date, title, tags, image, onPress, subTitle}: ContentListItemProps) => {
    
    return (
        <View style={{backgroundColor: 'white'}}>
            <TouchableOpacity style={{margin: 15, marginTop: 0, marginBottom: 10, backgroundColor: 'white', flexDirection: 'row', borderWidth: 1.7, borderRadius: 20, borderColor: '#F3F3F3', overflow: 'hidden'}} onPress={onPress}>
                <View style={{ backgroundColor: '#F3F3F3', flex: 0.6}}>
                <Image
                    style={styles.image}
                    source={image}
                    contentFit="cover"
                    transition={200}
                />
                </View>
                <View style={{ backgroundColor: 'white', flex: 1, paddingTop: 15, paddingBottom: 15, paddingLeft: 5, paddingRight: 5, flexDirection: 'column', gap: 4}}>
                    {subTitle ? <View style={{flexDirection: 'row', marginLeft: 7, gap: 5, alignItems: 'center'}}>
                                    <Text style={{fontFamily: 'GreycliffCF-Heavy', fontSize: 20, marginRight: 5, color: '#80B3FF'}}>{subTitle}</Text>
                                </View>
                              : <View style={{flexDirection: 'row', marginLeft: 7, gap: 5, alignItems: 'center'}}>
                                    <Image style={{width: 17, aspectRatio: 1}} source={require('../../assets/calendar.png')} contentFit="cover" transition={200} tintColor={'#80B3FF'} />
                                    <Text style={{fontFamily: 'GreycliffCF-Heavy', fontSize: 16, marginRight: 5, color: '#80B3FF'}}>{date}</Text>
                                </View>}
                    
                    <Text style={{fontFamily: 'GreycliffCF-Heavy', fontSize: 27, marginLeft: 8, marginRight: 5, marginBottom: 10, lineHeight: 27}} >{title}</Text>
                    <TagsPillList tags={tags} style={{marginLeft: 5, marginRight: 5}}/>
                </View>
            </TouchableOpacity>
        </View>
    )
}

export interface ContentListActionsProps { 
    children: ReactElement<any, any>[] | ReactElement<any, any>,
    onSide: "LEFT" | "RIGHT";
}

export const ContentListActions = ({children, onSide}: ContentListActionsProps) => {
    return (
        <View style={{flexDirection: 'row', width: '100%', height: '100%', justifyContent: (onSide == "LEFT") ? "flex-start" : "flex-end", alignContent: 'center', marginTop: 5, paddingLeft: 33, paddingRight: 33, alignItems: 'center'}}>
            <View style={{flexDirection: 'column', height: '100%', justifyContent: 'space-around', alignItems: 'center', gap: 20, paddingBottom: 20, paddingTop: 20}}>
                {children}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    topPortion: {flexDirection: 'column', justifyContent: 'space-between', marginTop: 25},
    title: { fontFamily: 'GreycliffCF-Heavy', fontSize: 42, marginLeft: 20, marginRight: 20, lineHeight: 48 },
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