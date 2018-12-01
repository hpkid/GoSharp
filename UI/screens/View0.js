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
  Button,
  ImageBackground,
} from 'react-native';
import SectionedMultiSelect from '../components/sectioned-multi-select';
import { AsyncStorage } from 'react-native';
import { LinearGradient, Constants } from 'expo';

const items = [
  {
    name: "Meat",
    id: "meat",
    children: [
      {
        name: "Meat Ball",
        id: "meat_ball"
      },
      {
        name: "Minced Meat",
        id: "minced_meat"
      }
    ]
  },
  {
    name: "Dairy",
    id: "dairy",
    children: [
      {
        name: "Red Milk",
        id: "red_milk"
      },
      {
        name: "Blue Milk",
        id: "blue_milk"
      }
    ]
  },
  {
    name: "Dry Goods",
    id: "dry_goods",
    children: [
      {
        name: "Sugar",
        id: "sugar"
      }
    ]
  },
  {
    name: "Beverages",
    id: "beverages",
    children: [
      {
        name: "Cafe",
        id: "cafe"
      }
    ]
  },
  {
    name: "Personal Care",
    id: "personal_care",
    children: [
      {
        name: "Head & Shoulder",
        id: "headandshoulder"
      },
      {
        name: "Facial Wash",
        id: "facial_wash"
      },
      {
        name: "Baby powder",
        id: "baby_powder"
      }
    ]
  },
  {
    name: "Canned Goods",
    id: "canned_goods",
    children: [
      {
        name: "Sweet Chilli Sauce",
        id: "sweet_chilli_sauce"
      }
    ]
  },
  {
    name: "Bakery",
    id: "bakery",
    children: [

    ]
  },
  {
    name: "Cleaners",
    id: "cleaners",
    children: [

    ]
  },
  {
    name: "Frozen Foods",
    id: "frozen_foods",
    children: [

    ]
  },
  {
    name: "Other",
    id: "other",
    children: [

    ]
  },
  {
    name: "Paper Goods",
    id: "paper_goods",
    children: [

    ]
  },
  {
    name: "Produce",
    id: "produce",
    children: [
      
    ]
  }
];


const styles = StyleSheet.create({
  container: {
    paddingTop: Constants.statusBarHeight + 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 40,
    textAlign: 'center',
    color: '#B3D6C6',
    marginBottom: 100,
  },
  welcome: {
    fontSize: 25,
    textAlign: 'center',
    marginBottom: 0,
    color: '#f7c744',
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

export default class View0 extends Component {
  static navigationOptions = {
    header: null,
  };
  state = {
    selectedItems: [],
  };

  async componentWillMount() {
    try {
      const value = await AsyncStorage.getItem('shopping_list');
      if (value !== null) {
        // We have data!!
        this.setState((state, props) => {
          return { selectedItems: JSON.parse(value) };
        });
      }
    } catch (error) {
      // Error retrieving data
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    if (this.state.selectedItems.length !== prevState.selectedItems.length) {
      try {
        await AsyncStorage.setItem(
          'shopping_list',
          JSON.stringify(this.state.selectedItems)
        );
      } catch (error) {
        // Error saving data
      }
    }
  }

  onSelectedItemsChange = selectedItems => {
    this.setState({ selectedItems });
  };

  render() {
    return (
      <ScrollView
        keyboardShouldPersistTaps="always"
        style={{ backgroundColor: '#203546' }}
        contentContainerStyle={styles.container}>
        <Text style={styles.title}>{'GO #'}</Text>
        <Text style={styles.welcome}>YOUR SHOPPING LIST</Text>
        <SectionedMultiSelect
          items={items}
          uniqueKey="id"
          subKey="children"
          selectText="Pick something...."
          showDropDowns={true}
          readOnlyHeadings={true}
          onSelectedItemsChange={this.onSelectedItemsChange}
          selectedItems={this.state.selectedItems}
          showRemoveAll
          colors={{
            selectToggleTextColor: '#A8CCC9',
            chipColor: '#A8CCC9',
            primary: '#f7c744'
          }}
        />
        <View
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            style={styles.loginScreenButton}
            onPress={() => this.props.navigation.navigate('View1')}
            underlayColor="#f7c744">
            <Text style={styles.loginText}>NEXT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }
}
