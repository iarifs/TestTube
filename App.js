import React from "react";
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import { createBottomTabNavigator } from "react-navigation-tabs";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  YellowBox
} from "react-native";

import Home from "./components/Home";

import Search from "./components/Search";

const RootStack = createStackNavigator(
  {
    Home: {
      screen: createBottomTabNavigator(
        {
          Home: { screen: Home },
          Search: { screen: Search }
        },
        {
          tabBarPosition: "bottom"
        }
      )
    }
  },
  {
    headerMode: "none",
    navigationOptions: {
      headerVisible: false
    }
  }
);

const App = createAppContainer(RootStack);

export default App;

console.disableYellowBox = true;