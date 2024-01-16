import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ViewStyle, StyleProp, TextStyle, ImageStyle} from "react-native";
import { Image } from 'expo-image';

export interface ActionButton {
    action: (param?: any) => any | void;
    title: string;
    color: string;
    returnTitle?: string;
    style?: "OUTLINED" | "FILLED";
    orientation?: "flex-end" | "flex-start" | 'center' | 'space-between';
    icons?: any[];
    imageRatio?: number;
    tintImage?: string;
    returnAction?: (param?: any) => any | void;
    viewStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    iconStyle?: StyleProp<ImageStyle>;
    iconPosition?: 'LEFT' | 'RIGHT';
    iconSize?: number;
}

const ActionButton = ({action, style = "FILLED", title, orientation = "space-between", icons, imageRatio = (icons && icons?.length > 1) ? 0.22 : 0.315, tintImage = '', returnTitle, returnAction, color = '#80B3FF', viewStyle, textStyle, iconStyle, iconPosition = 'RIGHT', iconSize}: ActionButton) => {
    const styles = StyleSheet.create({
        buttonFilled: { flex: 1, alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', justifyContent: orientation, alignContent: 'center', backgroundColor: color, padding: 25, borderRadius: 25, margin: 5, gap: 12},
        buttonOutlined: {flex: 1, alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', justifyContent: orientation, alignContent: 'center', borderColor: color, borderWidth: 3, padding: 25, paddingBottom: (icons) ? 20 : 25, paddingTop: (icons) ? 20 : 25, borderRadius: 25, margin: 5, color: '#80B3FF'},
        buttonTextOutlined: {fontFamily: 'GreycliffCF-ExtraBold', fontSize: 20, color:  '#80B3FF'},
        buttonText: {fontFamily: 'GreycliffCF-ExtraBold', fontSize: 20, color: 'white'},
        icon: { aspectRatio: 1 },
    });

    const tintColor = (style == 'OUTLINED') ? styles.buttonOutlined.borderColor : styles.buttonText.color;

    const iconComponent = () => {
        return (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignContent: 'center', alignItems: 'center', gap: 7}}>
                {icons?.map((icon) => {
                    return (
                        <Image
                            key={icon}
                            style={{...styles.icon, ...((iconSize) ? { width: iconSize} : {flex: imageRatio}), ...(iconStyle as ImageStyle)}}
                            source={icon}
                            contentFit="cover"
                            transition={200}
                            tintColor={tintImage ?? tintColor}
                        />
                    )
                })}
            </View>
        )
    } 

    return (
        <View style={{width: '100%', flexDirection: 'row', alignItems: 'center', gap: (returnAction ? 10 : 0)}}>
            {returnAction ? (
                <TouchableOpacity style={{flex: 0.30, marginLeft: 10}} onPress={returnAction}>
                    <Text style={{ textAlign: 'center', fontSize: 20,  fontFamily: 'GreycliffCF-ExtraBold', color: '#80B3FF' }}>{returnTitle}</Text>
                </TouchableOpacity>
            ) : <View style={{display: "none"}}/>}
            <TouchableOpacity style={(style == "FILLED") ? {...styles.buttonFilled, ...(viewStyle as ViewStyle)} : {...styles.buttonOutlined, ...(viewStyle as ViewStyle)}} onPress={() => { action(); }}>
                {(iconPosition == 'LEFT') ? iconComponent() : <></>}
                <Text style={(style == "FILLED") ? {...styles.buttonText, ...(textStyle as TextStyle)} : {...styles.buttonTextOutlined, ...(textStyle as TextStyle)} }>{title}</Text>
                {(iconPosition == 'RIGHT') ? iconComponent() : <></>}
            </TouchableOpacity>
        </View>
    )
}



export default ActionButton;