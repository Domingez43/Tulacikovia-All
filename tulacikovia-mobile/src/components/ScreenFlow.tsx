import React, { ReactElement, useImperativeHandle, useState } from "react"
import { View, ViewStyle, StyleProp, ScrollView } from "react-native"

export interface ScreenFlowProps {
    children: ReactElement<any, any>[] | ReactElement<any, any>,
    index: number;
    skipIndexes?: number[];
    style?: StyleProp<ViewStyle>
}

export interface ScreenFlowRef {
    children: ReactElement<any, any>[] | ReactElement<any, any>,
    index: number;
    skipIndexes?: number[];
    style?: StyleProp<ViewStyle>
}
export declare type ScreenFlow = typeof ScreenFlow & ScreenFlowRefs;

export interface ScreenFlowRefs {
    getNumberOfScreens(): number;
    getCurrentScreenIndex(): number;
}

export const ScreenFlow = React.forwardRef<ScreenFlowRefs, ScreenFlowProps>(({children, index, skipIndexes, style}: ScreenFlowProps, ref) => {
    useImperativeHandle(ref, () => ({
      getNumberOfScreens: () => {
        return (Array.isArray(children)) ? children.length : 1;
      },

      getCurrentScreenIndex: () => {
        return index;
      }
    }));
  
    function getValidScreens() {
        return (Array.isArray(children)) ? children.filter((screen: any, screenIndex: number) => skipIndexes!.find(x => x == screenIndex) == undefined ) : children;
    }

    function prepareChildren(){
        const screens = (skipIndexes) ? getValidScreens() : children;
        return screens && Array.isArray(screens) ? screens.filter((screen, screenIndex) => screenIndex == index) : children
    }
    
    return (
        <View style={{width: '100%', height: '100%', ...(style as ViewStyle)}}>
            {prepareChildren()}
        </View>
    )
  })