import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  LayoutAnimation,
  Image,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import SectionedMultiSelect from './components/sectioned-multi-select';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  createStackNavigator,
  createAppContainer,
} from 'react-navigation';
import View0 from './screens/View0';
import View1 from './screens/View1';
import View2 from './screens/View2';
import View3 from './screens/View3';


const AppNavigator = createStackNavigator(
  {
    View0: View0,
    View1: View1,
    View2: View2,
    View3: View3,
  },
  {
    initialRouteName: 'View0',
  }
);

export default createAppContainer(AppNavigator);
