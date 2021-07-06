import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer, StackActionHelpers } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import AuthScreen from './components/Auth';
import Home from './components/Home';
import Conversation from './components/Conversation';
import NewConversation from './components/NewConversation';

const Stack = createStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Auth">
                <Stack.Screen name="Auth" component={AuthScreen} />
                <Stack.Screen name="Home" component={Home} options={({ navigation }) => ({
                    title: 'Conversations',
                    headerRight: () => (
                        <TouchableOpacity onPress={() => navigation.navigate("New Conversation")}>
                            <Ionicons name="add" size={32} style={{ marginRight: 10 }} color="black" />
                        </TouchableOpacity>
                    )
                })} />
                <Stack.Screen name="New Conversation" component={NewConversation} />
                <Stack.Screen name="Conversation" component={Conversation} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8
    }
});
