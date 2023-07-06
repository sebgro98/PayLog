import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import Calendar from './Calendar';
import MonthlyDetails from './MonthlyDetails';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function App() {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Calendar">
                <Stack.Screen
                    name="Calendar"
                    component={Calendar}
                    initialParams={{ currentMonth, setCurrentMonth }}
                />
                <Stack.Screen
                    name="MonthlyDetails"
                    component={MonthlyDetails}
                />
            </Stack.Navigator>
            <StatusBar style="auto" />
        </NavigationContainer>
    );
}




const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
