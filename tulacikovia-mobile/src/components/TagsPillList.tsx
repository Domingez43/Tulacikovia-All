import {ScrollView, View, Text, StyleProp, ViewStyle, TextStyle, Insets} from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Handler } from './MenuView';

export interface TagsPillListProps {
    tags: string[];
    action?: (tag: string) => void;
    onLongPress?: (tag: string, index?: number) => void;
    tagColor?: string;
    tagTextColor?: string;
    style?: StyleProp<ViewStyle> | undefined;
    pillStyle?: StyleProp<ViewStyle> | undefined;
    pillTextStyle?: StyleProp<TextStyle> | undefined;
    scrollable?: boolean;
    insets?: Insets;
}

export const TagsPillList = ({tags, action = () => {}, tagColor = "#80B3FF", tagTextColor = "white", style, pillStyle, pillTextStyle, onLongPress, scrollable = false, insets}: TagsPillListProps) => {
    return (
        <ScrollView horizontal={scrollable} showsHorizontalScrollIndicator={false} contentContainerStyle={{flexDirection: 'row', gap: 8, flexWrap: scrollable ? 'nowrap' : 'wrap', paddingLeft: insets?.left, paddingRight: insets?.right}} style={style} scrollEnabled={scrollable}>
            {tags.map((tag, index) => {
                return <TagPill key={tag} text={tag} color={tagColor} tagTextColor={tagTextColor} pillStyle={pillStyle} pillTextStyle={pillTextStyle} onLongPress={onLongPress} index={index} action={action}/>
            })}
        </ScrollView>
    )
}

export const TagPill = ({text, color, tagTextColor, action, pillStyle, pillTextStyle, onLongPress, index}: any) => {
    return (
        <TouchableOpacity style={{backgroundColor: color, padding: 6, paddingRight: 13, paddingLeft: 13, borderRadius: 50, ...pillStyle}} onPress={() => action(text)} onLongPress={() => onLongPress(text, index)}>
            <Text style={{fontFamily: 'GreycliffCF-ExtraBold', fontSize: 14, color: tagTextColor, ...pillTextStyle}}>{text}</Text>
        </TouchableOpacity>
    )
}