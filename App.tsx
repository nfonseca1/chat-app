import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Auth } from 'aws-amplify';

import { closeWebSocket } from './lib/socket';
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
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => {
                            Auth.signOut();
                            closeWebSocket();
                            navigation.navigate("Auth");
                        }}>
                            <MaterialIcons name="logout" size={32} style={{ marginLeft: 10, transform: [{ scaleX: -1 }] }} color="red" />
                        </TouchableOpacity>
                    ),
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
