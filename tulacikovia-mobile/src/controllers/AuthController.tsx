import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import { LoginAccountTypeScreen } from '../screens/LoginScreen/LoginAccountTypeScreen';
import { LoginSocialScreen } from '../screens/LoginScreen/LoginSocialScreen';
import { RegisterOrganisationScreen } from '../screens/LoginScreen/RegisterOrganisationScreen';
import { RegisterUserScreen } from '../screens/LoginScreen/RegisterUserScreen';
import { LoginEmailScreen } from '../screens/LoginScreen/LoginEmailScreen';
import { LoginTypeScreen } from '../screens/LoginScreen/LoginTypeScreen';
import { LoginProblemScreen }  from '../screens/LoginScreen/LoginProblemScreen';
import { PasswordResetScreen }  from '../screens/LoginScreen/PasswordResetScreen';


const Stack = createStackNavigator();

const AuthController = () => {
    return (
        <Stack.Navigator screenOptions={{cardStyle: {backgroundColor: '#FFFFFF'}}}>
          <Stack.Screen name="Auth.Welcome" component={WelcomeScreen} options={{headerShown: false}}/>
          <Stack.Screen name="Auth.Login" component={LoginTypeScreen} options={{headerShown: false}}/>
          <Stack.Screen name="Auth.EmailLogin" component={LoginEmailScreen} options={{headerShown: false}}/>
          <Stack.Screen name="Auth.SocialLogin" component={LoginSocialScreen} options={{headerShown: false}}/>
          <Stack.Screen name="Auth.UserType" component={LoginAccountTypeScreen} options={{headerShown: false}}/>
          <Stack.Screen name="Auth.RegisterUser" component={RegisterUserScreen} options={{headerShown: false}}/>
          <Stack.Screen name="Auth.RegisterOrganisation" component={RegisterOrganisationScreen} options={{headerShown: false}}/>
          <Stack.Screen name="LoginProblemScreen" component={LoginProblemScreen} options={{headerShown: false}}/>
          <Stack.Screen name="PasswordResetScreen" component={PasswordResetScreen} options={{headerShown: false}}/>
        </Stack.Navigator>
      );
}

export default AuthController;