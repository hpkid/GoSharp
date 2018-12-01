import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Accordion from 'react-native-collapsible/Accordion';
import { Constants } from 'expo';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { AsyncStorage } from 'react-native';
// import { getData } from '../services/helpers';

import d from './d';
import { turku } from './data';

const styles = StyleSheet.create({
  container: {
    paddingTop: Constants.statusBarHeight,
    paddingHorizontal: 20,
  },
  welcome: {
    fontSize: 25,
    textAlign: 'center',
    marginBottom: 50,
    color: '#f7c744',
  },
  header: {
    backgroundColor: '#B3D6C6',
    padding: 10,
  },
  headerText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    padding: 20,
    backgroundColor: '#F7C744',
  },
  loginScreenButton: {
    marginRight: 40,
    marginLeft: 40,
    marginTop: 50,
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 40,
    paddingRight: 40,
    backgroundColor: '#f7c744',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  loginText: {
    color: '#203546',
    textAlign: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
});
// TODO: list 3 routes(least money, least time, medium money-medium time)
const SECTIONS = [
  {
    title: 'First route',
    content: 'Lorem ipsum...',
    totalTime: d.totalTime
  },
  {
    title: 'Second route - Least time',
    content: 'Lorem ipsum...',
  },
  {
    title: 'Third route - Medium Choice',
    content: 'Lorem ipsum...',
  },
];

export default class View2 extends React.Component {
  static navigationOptions = {
    header: null,
  };
  state = {
    activeSections: [],
    shopping_list: []
  };

  async componentWillMount() {
    try {
      const value = await AsyncStorage.getItem('shopping_list');
      console.log(value, this.props.navigation.getParam('origin').city)
      // getData(value, this.props.navigation.getParam('origin').city)
      this.props.navigation.getParam('origin')
      if (value !== null) {
        // We have data!!
        this.setState((state, props) => {
          return { shopping_list: JSON.parse(value) };
        });
      }
    } catch (error) {
      // Error retrieving data
    }
  }
  _renderHeader = section => {
    return (
      <View style={styles.header}>
        <Text style={styles.headerText}>{section.title}</Text>
        <Text style={styles.headerText}>{`${section.totalTime ? Math.round(section.totalTime/60000): 'x'} minutes - y euros`}</Text>
      </View>
    );
  };

  _renderContent = section => {
    return (
      <View style={styles.content}>
        <Text style={styles.headerText}>Total time: {section.totalTime ? Math.round(section.totalTime/60000): 'x'} minutes</Text>
        <Text style={styles.headerText}>Total cost: y euros</Text>
        <Text style={[styles.headerText, { color: '#75B9BE'}]} onPress={() => this.props.navigation.navigate('View3')}>Choose this route</Text>
      </View>
    );
  };

  _updateSections = activeSections => {
    this.setState({ activeSections });
  };

  render() {
    // console.log(this.props.navigation.getParam('origin'), this.props.navigation.getParam('destination'))
    return (
      <ScrollView
        keyboardShouldPersistTaps="always"
        style={{ backgroundColor: '#203546' }}
        contentContainerStyle={styles.container}>
        <Ionicons
          name="md-arrow-back"
          size={40}
          color="#B3D6C6"
          onPress={() => this.props.navigation.goBack()}
        />
        <Text style={styles.welcome}>Suggested Routes</Text>
        <Accordion
          sections={SECTIONS}
          activeSections={this.state.activeSections}
          renderContent={this._renderContent}
          renderHeader={this._renderHeader}
          onChange={this._updateSections}
        />
        <View
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            style={styles.loginScreenButton}
            onPress={() => this.props.navigation.navigate('View3')}
            underlayColor="#fff">
            <Text style={styles.loginText}>NEXT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }
}
