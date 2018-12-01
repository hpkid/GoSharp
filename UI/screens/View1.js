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
  Alert,
  AsyncStorage
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import SectionedMultiSelect from '../components/sectioned-multi-select';
// import Icon from 'react-native-vector-icons/MaterialIcons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Constants, Location, Permissions } from 'expo';
import { Ionicons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    paddingHorizontal: 20,
  },
  welcome: {
    fontSize: 25,
    textAlign: 'center',
    marginBottom: 10,
    color: '#f7c744',
  },
  loginScreenButton: {
    marginRight: 40,
    marginLeft: 40,
    marginTop: 20,
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

const tintColor = '#174A87';

export default class View1 extends Component {
  static navigationOptions = {
    header: null,
  };
  constructor() {
    super();
    this.state = {
      selectedItems: [],
      // location address
      userLocation: '',
      userCoords: null,
      userCity: '',
      location: '',
      // coords, pass to next screen
      coords: null,
      errorMessage: null,
      // city string, pass to next screen
      city: '',
      isOriginCurrent: false,
      isOriginDestination: false,
      desLocation: '',
      desCoords: null,
      desCity: '',
    };
  }
  componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage:
          'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this._getLocationAsync();
    }
  }
  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({
      userCoords: {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      },
    });
    await fetch(
      'https://maps.googleapis.com/maps/api/geocode/json?address=' +
        location.coords.latitude +
        ',' +
        location.coords.longitude +
        '&key=' +
        'AIzaSyDYuT4RxWor-_VONOwufrci9yyaWkSrHuQ'
    )
      .then(response => response.json())
      .then(responseJson => {
        let userCity = responseJson.results[0].address_components.filter(
          comp =>
            comp.types.includes('locality') && comp.types.includes('political')
        )[0].short_name;
        let userLocation = responseJson.results[0].formatted_address;
        console.log(
          'user location',
          userCity,
          userLocation,
          this.state.userCoords
        );
        this.setState({ userLocation, userCity });
      });
  };

  onSelectedItemsChange = selectedItems => {
    this.setState({ selectedItems });
  };
  // NOTE: app breaks if user search a location and delete and then search, the previous search result will be used
   handleSearch = async () => {
    const {
      isOriginCurrent,
      isOriginDestination,
      userLocation,
      userCity,
      userCoords,
      location,
      coords,
      city,
      desLocation,
      desCoords,
      desCity,
    } = this.state;
    if (!this.state.isOriginCurrent && !this.state.location) {
      return Alert.alert('Alert', "You didn't enter an origin point");
    }
    if (!this.state.isOriginDestination && !this.state.location) {
      return Alert.alert('Alert', "You didn't enter a destination point");
    }
    const result = {
      origin: {
        city: isOriginCurrent ? userCity : city,
        coords: isOriginCurrent ? userCoords : coords,
      },
      destination: {
        city: isOriginDestination ? userCity : desCity,
        coords: isOriginDestination ? userCoords : desCoords,
      },
    };
    await AsyncStorage.setItem("origin", JSON.stringify(result.origin));
    await AsyncStorage.setItem("destination", JSON.stringify(result.destination))
    // console.log(result);
    this.props.navigation.navigate('View2');
  };

  handleOriginSwitchChange = value => {
    if (!this.state.userCoords) {
      this._getLocationAsync();
    } else {
      this.setState({ isOriginCurrent: value });
    }
  };

  handleDestinationSwitchChange = value => {
    if (!this.state.userCoords) {
      this._getLocationAsync();
    } else {
      this.setState({ isOriginDestination: value });
    }
  };

  render() {
    return (
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="always"
        style={{ backgroundColor: '#203546' }}
        contentContainerStyle={styles.container}>
        <Ionicons
          name="md-arrow-back"
          size={40}
          color="#B3D6C6"
          onPress={() => this.props.navigation.goBack()}
        />
        <Text style={styles.welcome}>Starting point</Text>
        <Text
          style={{
            fontSize: 15,
            textAlign: 'center',
            marginBottom: 10,
            color: '#A8CCC9',
          }}>
          Your location:{' '}
          {this.state.userLocation ||
            'Please provide your location for better experience.'}
        </Text>

        <GooglePlacesAutocomplete
          editable={!this.state.isOriginCurrent}
          placeholder="Search"
          minLength={2} // minimum length of text to search
          autoFocus={false}
          returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
          listViewDisplayed="auto" // true/false/undefined
          fetchDetails={true}
          renderDescription={row => row.description} // custom description render
          onPress={(data, details = null) => {
            // save coords as searched location, city as city from details var
            let coords = {
              lat: details.geometry.location.lat,
              lng: details.geometry.location.lng,
            };
            let city = details.address_components.filter(
              comp =>
                comp.types.includes('locality') &&
                comp.types.includes('political')
            )[0].short_name;
            this.setState({
              coords,
              city,
              location: details.formatted_address,
            });
          }}
          getDefaultValue={() => ''}
          query={{
            // available options: https://developers.google.com/places/web-service/autocomplete
            key: 'AIzaSyDYuT4RxWor-_VONOwufrci9yyaWkSrHuQ',
            language: 'en', // language of the results
            types: ['geocode', 'address', 'cities', 'country', 'locality'], // default: 'geocode'
          }}
          styles={{
            textInputContainer: {
              backgroundColor: 'rgba(0,0,0,0)',
              borderTopWidth: 0,
              borderBottomWidth: 0,
            },
            textInput: {
              marginLeft: 0,
              marginRight: 0,
              height: 38,
              color: '#5d5d5d',
              fontSize: 16,
            },
            predefinedPlacesDescription: {
              color: '#1faadb',
            },
          }}
          currentLocation={false} // Will add a 'Current location' button at the top of the predefined places list
          currentLocationLabel="Current location"
          nearbyPlacesAPI="GooglePlacesSearch" // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
          GoogleReverseGeocodingQuery={
            {
              // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
            }
          }
          GooglePlacesSearchQuery={{
            // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
            rankby: 'distance',
            types: 'food',
          }} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
          debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
        >
          <View
            style={{
              marginTop: 20,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                fontSize: 15,
                textAlign: 'center',
                marginTop: 10,
                marginBottom: 10,
                color: '#A8CCC9',
              }}>
              Origin is your location
            </Text>
            <Switch
              value={this.state.isOriginCurrent}
              onValueChange={this.handleOriginSwitchChange}
            />
          </View>
        </GooglePlacesAutocomplete>
        <GooglePlacesAutocomplete
          editable={!this.state.isOriginDestination}
          placeholder="Search"
          minLength={2} // minimum length of text to search
          autoFocus={false}
          returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
          listViewDisplayed="auto" // true/false/undefined
          fetchDetails={true}
          renderDescription={row => row.description} // custom description render
          onPress={(data, details = null) => {
            // save coords as searched location, city as city from details var
            let desCoords = {
              lat: details.geometry.location.lat,
              lng: details.geometry.location.lng,
            };
            let desCity = details.address_components.filter(
              comp =>
                comp.types.includes('locality') &&
                comp.types.includes('political')
            )[0].short_name;
            this.setState({
              desCoords,
              desCity,
              desLocation: details.formatted_address,
            });
          }}
          getDefaultValue={() => ''}
          query={{
            // available options: https://developers.google.com/places/web-service/autocomplete
            key: 'AIzaSyDYuT4RxWor-_VONOwufrci9yyaWkSrHuQ',
            language: 'en', // language of the results
            types: ['geocode', 'address', 'cities', 'country', 'locality'], // default: 'geocode'
          }}
          styles={{
            textInputContainer: {
              backgroundColor: 'rgba(0,0,0,0)',
              borderTopWidth: 0,
              borderBottomWidth: 0,
            },
            textInput: {
              marginLeft: 0,
              marginRight: 0,
              height: 38,
              color: '#5d5d5d',
              fontSize: 16,
            },
            predefinedPlacesDescription: {
              color: '#1faadb',
            },
          }}
          currentLocation={false} // Will add a 'Current location' button at the top of the predefined places list
          currentLocationLabel="Current location"
          nearbyPlacesAPI="GooglePlacesSearch" // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
          GoogleReverseGeocodingQuery={
            {
              // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
            }
          }
          GooglePlacesSearchQuery={{
            // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
            rankby: 'distance',
            types: 'food',
          }} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
          debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
        >
          <View
            style={{
              marginTop: 20,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                fontSize: 15,
                textAlign: 'center',
                marginTop: 10,
                marginBottom: 10,
                color: '#A8CCC9',
              }}>
              Destination is your location
            </Text>
            <Switch
              value={this.state.isOriginDestination}
              onValueChange={this.handleDestinationSwitchChange}
            />
          </View>
        </GooglePlacesAutocomplete>
        <View
          style={{
            marginTop: 20,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            style={styles.loginScreenButton}
            onPress={this.handleSearch}
            underlayColor="#fff">
            <Text style={styles.loginText}>SEARCH</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    );
  }
}
// <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
//           <TouchableOpacity
//             style={styles.loginScreenButton}
//             onPress={() => this.props.navigation.navigate('View2')}
//             underlayColor='#fff'>
//             <Text style={styles.loginText}>SEARCH</Text>
//           </TouchableOpacity>
//         </View>
