import {DynamicColorIOS} from 'react-native';
import { Appearance } from 'react-native'
import {
    DefaultTheme,
    DarkTheme,
    Theme,
  } from '@react-navigation/native';

export const systemTheme = (Appearance.getColorScheme() === 'dark') ? DarkTheme : DefaultTheme;

export class ThemeManager {
  prefferedTheme: Theme;

  constructor (theme: Theme = DarkTheme){
    this.prefferedTheme = theme;
}
  
  getUserTheme(): Theme {
    return this.prefferedTheme
  }

  switchThemes() {
    this.prefferedTheme = (this.prefferedTheme.dark) ? DefaultTheme : DarkTheme;
  }

}

export const customDynamicTextColor = DynamicColorIOS({
  dark: 'blue',
  light: 'red',
});