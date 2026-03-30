import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SwipeScreen from './screens/SwipeScreen';
import BookmarkScreen from './screens/BookmarkScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Swipe"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Swipe" component={SwipeScreen} />
        <Stack.Screen
          name="Bookmarks"
          component={BookmarkScreen}
          options={{
            headerShown: true,
            title: 'My Saved Papers',
            headerStyle: {
              backgroundColor: '#F7F9FC',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
