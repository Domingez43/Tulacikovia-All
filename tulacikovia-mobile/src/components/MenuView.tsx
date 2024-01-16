import { ReactElement } from 'react'
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { Image } from 'expo-image';

/**
 * ! Menu Manager Interfaces !
 * Defines object that simplify work with a menu and states
 */

export interface MenuContent<T = any, S = any, F extends ContentFilter = any> {
    key: string,
    title: string,
    filters: F;
    onSelect?:  <T = any>(params?: T) => void,
    onDismiss?: <T = any>(params?: T) => void,
    updateData?: <T = any>(params?: T) => void | Promise<void>,
    fetchData?: (params?: T, startOnIndex?: number) => Promise<S>,
    getData?: (params?: T) => S,
    getComponent?: <T = any>(param?: T) => ReactElement,
}

export interface MenuManager {
    menuList: Map<string, MenuContent>,
    menuData: Map<string, any>,
    selectedMenu: string,
}

export class MenuContent<T = any, S = any, F extends ContentFilter = any> implements MenuContent<T, S, F> {
    key: string;
    title: string;
    filters: F;
    onSelect?: <T = any>(params?: T) => void;
    onDismiss?: <T = any>(params?: T) => void;
    updateData?: <T = any>(params?: T) => void | Promise<void>;
    fetchData?: (params?: T, startOnIndex?: number) => Promise<S>;
    getData?: (params?: T) => S;
    getComponent?: <T = any>(params?: T) => ReactElement;

    constructor(key: string, title: string, filters: F, onSelect?: (param?: any) => void, onDismiss?: (param?: any) => void, fetchData?: (params?: T, startOnIndex?: number) => Promise<S>, getData?: (params?: T) => S) {
        this.key = key;
        this.title = title;
        this.onDismiss = onDismiss;
        this.onSelect = onSelect;
        this.fetchData = fetchData;
        this.getData = getData;
        this.filters = filters;
    }

}

export interface ContentFilter<F = any, S = any, P = any> {
    filter: F,
    sortBy: S,
    param?: P,
    sortDirection: number,
    startOnIndex: number,
    updateFilter?: (filter: F) => void,
    updateSortBy?: (sort: S) => void,
    updateSortDirection?: (sortDirection: number) => void,
    updateParam?: (param: P) => void,
}

export class ContentFilter<F = any, S = any, P = any> implements ContentFilter<F, S, P> {
    constructor(filter: F, sortBy: S, sortDirection: number, param?: P) {
        this.filter = filter;
        this.sortBy = sortBy;
        this.sortDirection = sortDirection;
        this.startOnIndex = 0;
        this.param = param;
    }
    updateFilter? = (filter: F) => { this.filter = filter };
    updateSortBy? = (sort: S) => { this.sortBy = sort};
    updateSortDirection? = (sortDirection: number) => { this.sortDirection = sortDirection};
    updateParam? = (param: P) => { this.param = param };
}

export class MenuManager implements MenuManager {
    menuList: Map<string, MenuContent> = new Map();
    menuData: Map<string, any> = new Map();
    selectedMenu: string = '';

    prepare(menus: MenuContent<any,any>[], selectedMenu: string, data?: {key: string, data: any}[]) {
        this.selectedMenu = selectedMenu;
        menus.forEach((menu) => {
            this.menuList.set(menu.key, menu);
            if(data) this.menuData.set(menu.key, data.filter(val => val.key == menu.key)[0]);
        })
        return this;
    }

    init(menus: {key: string, title: string}[], selectedMenu: string, filters: ContentFilter, data?: {key: string, data: any}[]) {
        this.selectedMenu = selectedMenu;
        menus.forEach((pair) => {
            this.menuList.set(pair.key, new MenuContent(pair.key, pair.title, filters));
            if(data) this.menuData.set(pair.key, data.filter(val => val.key == pair.key)[0]);
        })
        return this;
    }

    getData<T>(forMenu: string) {
        var _menuData = this.menuData.get(forMenu);
        if(_menuData == undefined) throw new Error('There are none data for menu with key: ' + forMenu);
        if(!(_menuData as T)) throw new Error('Data retrieved from the menu are not siutable with type passed to method.');
        return _menuData as T;
    }

    getCurrentData<T>() {
        var _menuData = this.menuData.get(this.selectedMenu);
        if(_menuData == undefined) throw new Error('There are none data for menu with key: ' + this.selectedMenu);
        if(!(_menuData as T)) throw new Error('Data retrieved from the menu are not siutable with type passed to method.');
        return _menuData as T;
    }

    getMutable() {
        var _manager = new MenuManager();
        Object.assign(_manager, this);
        return _manager;
    }

    updateData<T>(forKey: string, data: T, callback?: () => void) {
        this.menuData.set(forKey, data);
        if(callback) callback();
        return this;
    }

    mutableUpdate<T = any>(key: keyof MenuManager, data: T, callback?: () => void){
        var _this = this.getMutable();
        (_this[key] as any) = data;
        if(callback) callback();
        return _this
    }
}

/**
 * ! MENU Interfaces !
 * Defines behaviour and structure of the general and specific menus and their controllers
 */

// ! GENRAL Content View and Controller !
export interface ContentControllerProps { 
    currentViewKey: string;
    children: ReactElement<ContentViewProps, any>[] | ReactElement<ContentViewProps, any>;
}

export interface ContentViewProps {
    viewKey: string;
    component: ReactElement<any, any>[] | ReactElement<any, any>;
}

// ! Menu Handler Interfaces !
export interface SliderMenuColoring {
    color?: string,
    selectedColor?: string,
    tintColor?: string,
    selectedTintColor?: string,
}

export interface SliderMenuHandlerProps {
    children: ReactElement<SliderItemProps, any>[] | ReactElement<SliderItemProps, any>,
    selectedItem: string,
    coloring?: SliderMenuColoring
}

export interface SliderItemProps extends SliderMenuColoring {
    icon?: any,
    selectedIcon?: any,
    title: string,
    viewKey: string,
    handle?: (key: string) => void,
    isSelected?: boolean;
    titleHeight?: number,
}

const ContentController = ({children, currentViewKey}: ContentControllerProps) => {
    return ( <>{(Array.isArray(children) ? children.filter((contentView) => contentView.props.viewKey == currentViewKey) : children)}</>)
}

const ContentView = ({viewKey, component}: ContentViewProps) => {
    return ( <>{component}</> );
}

/**
 * ! Image Menu Components !
 * Used as GENERAL menu, the menu is horizontal slider square icon items and their menus names
 * Contain: Menu Handler - Handles selection and operation of the menu selector component
 *          Menu Item    - Operates as item shown by the menu handler
 */

export const Handler = ({ children, selectedItem, coloring}: SliderMenuHandlerProps) => {
    return (
        <ScrollView horizontal={true} style={{width: '100%', marginTop: 10}} contentContainerStyle={{flexDirection:"row", gap: 13, alignItems: 'flex-start', paddingLeft: 20, paddingRight: 20}} showsHorizontalScrollIndicator={false}>
            {(Array.isArray(children)) ? children.map((child) => <child.type key={child.props.viewKey} {...child.props} {...coloring} isSelected={selectedItem == child.props.viewKey} />) : <children.type {...children.props} {...coloring} isSelected={selectedItem == children.props.viewKey} />}
        </ScrollView>
    )
}

export const Item = ({icon, viewKey, title, handle, tintColor = '#C2C2C2', color = '#EAEAEA', selectedColor = '#80B3FF', selectedTintColor = 'white', isSelected, titleHeight = 35, selectedIcon = icon}: SliderItemProps) => {
    return (
        <TouchableOpacity style={{width: Dimensions.get('window').width / 5.8, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 6}} onPress={() => (handle) ? handle(viewKey) : ''}>
            <View style={{ backgroundColor: (isSelected) ? selectedColor : color, padding: 15, borderRadius: 20}}>
                <Image
                    style={styles.image}
                    source={(isSelected) ? selectedIcon : icon}
                    contentFit="cover"
                    transition={200}
                    tintColor={(isSelected) ? selectedTintColor : tintColor}
                />
            </View>
            <View style={{ width: '100%', height: titleHeight, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={styles.title}>{title}</Text>
            </View>
        </TouchableOpacity>
    )
}

/**
 * ! Text Menu Components !
 * Used in Adoption screen, the menu is horizontal slider with Text (menu name) as selectable button
 * Contain: Menu Handler - Handles selection and operation of the menu selector component
 *          Menu Item    - Operates as item shown by the menu handler
 */

export const TextMenuHandler = ({ children, selectedItem, coloring}: SliderMenuHandlerProps) => {
    return (
        <ScrollView horizontal={true} style={{width: '100%'}} contentContainerStyle={{flexDirection:"row", gap: 13, alignItems: 'flex-start', paddingLeft: 20, paddingRight: 20}} showsHorizontalScrollIndicator={false}>
            {(Array.isArray(children)) ? children.map((child) => <child.type key={child.props.viewKey} {...child.props} {...coloring} isSelected={selectedItem == child.props.viewKey} />) : <children.type {...children.props} {...coloring} isSelected={selectedItem == children.props.viewKey} />}
        </ScrollView>  
    );
}

export const TextMenuItem = ({icon, viewKey, title, handle, tintColor = '#C2C2C2', color = '#EAEAEA', selectedColor = '#80B3FF', selectedTintColor = 'white', isSelected, titleHeight = 35, selectedIcon = icon}: SliderItemProps) => {
    return (
        <TouchableOpacity style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 10}} onPress={() => (handle) ? handle(viewKey) : ''}>
            <Text style={{fontFamily: 'GreycliffCF-Heavy', fontSize: 35, marginRight: 10, color: (isSelected) ? selectedColor : color}}>{title}</Text>
        </TouchableOpacity>
    )
}
 
// ! Default export of the module !

export default {ContentView, ContentController, SliderMenu: {Handler, Item}, TextMenu: {Handler: TextMenuHandler, Item: TextMenuItem}}

const styles = StyleSheet.create({
    topPortion: { height: '100%', width: '100%', flexDirection: 'column', justifyContent: 'space-between', marginTop: 25},
    title: { fontFamily: 'GreycliffCF-Bold', fontSize: 15, flexWrap: 'wrap', textAlign: 'center', color: '#C2C2C2'},
    container: { flex: 1 },
    logoWrapper: { margin: 10, flexDirection: 'row', marginLeft: 20, marginTop: 25 },
    logo: { width: '57%', aspectRatio: 5 },
    imageWrapper: {margin: 25, marginTop: 20, marginBottom: 0, flexDirection: 'row', justifyContent: 'center'},
    image: { width: '100%', aspectRatio: 1 },
    subText: {margin: 10, marginLeft: 30, marginRight: 30, marginTop: 35, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', alignSelf: 'stretch'},
    subHeader: {margin: 10, marginLeft: 15, marginRight: 15, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', alignSelf: 'stretch'},
    buttonWrapper: {margin: 20, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', alignContent: 'flex-end'},
    bottomWrapper: {margin: 20, marginTop: 5, marginBottom: 20, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', alignContent: 'flex-end'},
    button: {alignSelf: 'stretch', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#80B3FF', padding: 25, borderRadius: 25, margin: 5},
    buttonText: {fontFamily: 'GreycliffCF-ExtraBold', fontSize: 20, color: 'white'},
});