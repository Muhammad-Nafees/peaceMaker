import React, {Ref, useEffect, useRef, useState} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  PermissionsAndroid,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import {STYLES} from '../../styles/globalStyles';
import {COLORS} from '../../constants/colors';
import CloseIcon from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import CheckIcon from 'react-native-vector-icons/FontAwesome';

import MapView, {Region, Marker} from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from 'react-native-google-places-autocomplete';
import LocationPinIcon from '../../../assets/icons/LocationPinIcon';
import {enableMapSet} from 'immer';
import {ApiService} from '../../utils/ApiService';
import {useAppSelector} from '../../redux/app/hooks';
import Voice, {
  SpeechErrorEvent,
  SpeechRecognizedEvent,
} from '@react-native-voice/voice';
import {GOOGLE_API_KEY} from '../../constants/keys';
import {PERMISSIONS, RESULTS, check, request} from 'react-native-permissions';
import Mapbox from '@rnmapbox/maps';
import {CameraRef} from '@rnmapbox/maps/lib/typescript/components/Camera';
import {useRoute} from '@react-navigation/native';

// voiceTxt
// enableLatestRenderer();
const DailyStateMap = ({route, navigation}: any) => {
  const [initialRegion, setInitialRegion] = useState<Region | undefined>(
    undefined,
  );
  const {name: routeName} = useRoute();
  const [userCurrentLocation, setUserCurrentLocation] = useState<
    Region | undefined
  >(undefined);
  const [userSelectedLocation, setUserSelectedLocation] = useState<
    Region | undefined
  >(undefined);
  const [currentLocation, setCurrentLocation] = useState('');
  const [homeLocation, setHomeLocation] = useState('');
  const [selectedLocationText, setSelectedLocationText] = useState({
    place: '',
    city: '',
    country: '',
    currentLocation: '',
    homeLocation: '',
  });
  const [markerCoordinate, setMarkerCoordinate] = useState<Region | undefined>(
    undefined,
  );

  const [centerCoordinate, setCenterCoordinate] = useState<any>([
    initialRegion?.longitude,
    initialRegion?.latitude,
  ]);
  const [gApiKeyErr, seGApiKeyErr] = useState(false);

  const [location, setLocation] = useState<string>('');

  const [isCurrent, setIsCurrent] = useState(false);
  const [isHome, setIsHome] = useState(false);
  const [isSelected, setIsSelected] = useState(true);

  const [speaking, setSpeaking] = useState(false);
  const [searchTxt, setSearchTxt] = useState('');
  const camera: React.Ref<CameraRef> | undefined = React.useRef(null);

  useEffect(() => {
    Voice.onSpeechStart = onSpeechStartHandler;
    Voice.onSpeechEnd = onSpeechEndHandler;
    Voice.onSpeechResults = onSpeechResultsHandler;

    Voice.onSpeechRecognized = onSpeechRecognized;
    Voice.onSpeechError = onSpeechError;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechRecognized = (e: SpeechRecognizedEvent) => {
    setSpeaking(false);
    console.log('onSpeechRecognized: ', e);
  };

  const onSpeechError = (e: SpeechErrorEvent) => {
    console.log('onSpeechError: ', JSON.stringify(e.error));
  };

  const onSpeechStartHandler = (e: any) => {
    console.log('Voice Started: ' + e);
  };

  const onSpeechEndHandler = (e: any) => {
    console.log('Voice Ended: ' + e);
  };
  const onSpeechResultsHandler = async (e: any) => {
    setSpeaking(false);
    console.log('Voice Result: ' + e.value);
    setSearchTxt(prevDescription => prevDescription + ' ' + e.value[0]);
    await Voice.stop();
  };

  useEffect(() => {
    if (route.params?.voiceTxt && searchTxt) {
      // inputRef?.current.getAddressText('Your search query here');
      inputRef?.current.focus();
    }
  }, [searchTxt]);

  const speak = async () => {
    // const tts = new Tts();
    try {
      if (!speaking) {
        console.log('speaking');
        await Voice.start('en-US');
      } else {
        console.log('stop speaking');
        await Voice.stop();
      }
      setSpeaking(prevState => !prevState);
    } catch (e) {
      console.error(e);
    }
  };

  const inputRef: Ref<GooglePlacesAutocompleteRef> | undefined = useRef(null);
  const {tokens} = useAppSelector(state => state.user);

  console.log(location);

  const headerLeft = () => (
    <TouchableOpacity
      style={{flexDirection: 'row', alignItems: 'center', gap: 2}}
      onPress={() => {
        if (route?.params?.setSwitchValue3 && !route.params?.showInp) {
          route?.params?.setSwitchValue3(false);
          route.params.setLocation('');
        }
        navigation.goBack();
      }}>
      <CloseIcon
        name="chevron-back-outline"
        size={24}
        color={COLORS.mainGreen}
      />
      <Text
        style={{
          color: COLORS.mainGreen,
        }}>
        Back
      </Text>
    </TouchableOpacity>
  );

  const saveConversationStartersLocation = async () => {
    try {
      const lat = userSelectedLocation?.latitude
        ? userSelectedLocation?.latitude
        : userCurrentLocation?.latitude;
      const lng = userSelectedLocation?.longitude
        ? userSelectedLocation?.longitude
        : userCurrentLocation?.longitude;
      const reqOptions = {
        location: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        isActive: true,
        address: location,
      };
      const url = 'conversation/add-location';
      const addLocReq = new ApiService(url, tokens.accessToken);
      const res = await addLocReq.Post(reqOptions);
      console.log(
        '🚀 ~ file: DailyStateMap.tsx:108 ~ saveConversationStartersLocation ~ res:',
        res,
      );

      if (res?.status === 200) {
        navigation.goBack();
      }
    } catch (err) {
      console.log('~ updateLocationStatus ~ err:', err);
    }
  };

  const handleSelectPress = async () => {
    if (!route?.params?.showInp) {
      route.params.setLocation(location);
      navigation.goBack();
      if (route.params?.setFieldValue) {
        route.params?.setFieldValue('location', location);
      }
      return;
    }

    saveConversationStartersLocation();
  };

  const headerRight = () => {
    return (
      location != '' && (
        <TouchableOpacity onPress={handleSelectPress}>
          <Text
            style={{
              color: COLORS.mainGreen,
            }}>
            Select
          </Text>
        </TouchableOpacity>
      )
    );
  };

  const title =
    routeName == 'DailyStateAuthMap' || routeName == 'DailyStateMap'
      ? ''
      : 'Conversation Starter Trigger';

  useEffect(() => {
    navigation.setOptions({
      headerLeft: headerLeft,
      headerRight: headerRight,
      headerTitle:
        location != ''
          ? title.length * 5 > Dimensions.get('window').width - 250
            ? title.slice(0, 22) + '...'
            : title
          : title,
    });
  }, [location]);

  Geocoder.init(GOOGLE_API_KEY);

  const checkIfLocationAvailable = () => {
    const NO_LOCATION_PROVIDER_AVAILABLE = 2;

    Geolocation.getCurrentPosition(
      position => {
        // location available
        requestLocationPermission();
      },
      error => {
        if (error.code === NO_LOCATION_PROVIDER_AVAILABLE) {
          //Show alert or something here that GPS need to turned on.

          const location: Region = {
            // Example coordinates for a location in the US (New York City)
            latitude: 40.7128, // Latitude for New York City
            longitude: -74.006, // Longitude for New York City
            latitudeDelta: 0.015, // You can adjust the deltas as needed
            longitudeDelta: 0.0121, // You can adjust the deltas as needed
          };
          setInitialRegion(location);
          setUserCurrentLocation(location);
          setMarkerCoordinate(location);
        }
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );
  };

  useEffect(() => {
    checkIfLocationAvailable();
  }, []);

  const requestLocationPermission = async () => {
    try {
      let granted;
      if (Platform.OS === 'ios') {
        const permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

        const permissionStatus = await check(permission);

        if (permissionStatus === RESULTS.GRANTED) {
          granted = permissionStatus;
        }

        const requestStatus = await request(permission);

        granted = requestStatus;
      } else {
        granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app requires access to your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
      }
      if (
        granted === PermissionsAndroid.RESULTS.GRANTED ||
        granted === RESULTS.GRANTED
      ) {
        Geolocation.getCurrentPosition(
          position => {
            const location: Region = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.0121,
            };
            setInitialRegion(location);
            setUserCurrentLocation(location);
            setMarkerCoordinate(location);
          },
          error => {
            console.warn(error.message);
          },
          {enableHighAccuracy: true, timeout: 20000, maximumAge: 2000},
        );
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    if (initialRegion && initialRegion.latitude && initialRegion.longitude) {
      const {latitude, longitude} = initialRegion;

      convertLocationToReadable(latitude, longitude).then(
        ([currentLocation, homeLocation, place, city, country]) => {
          setCurrentLocation(currentLocation);
          setHomeLocation(homeLocation);
          // setSelectedLocationText({place, city, country});
        },
      );
    }
  }, [initialRegion]);

  async function convertLocationToReadable(
    latitude: number,
    longitude: number,
  ) {
    try {
      const response = await Geocoder.from(latitude, longitude);
      console.log(
        '🚀 ~ file: DailyStateMap.tsx:288 ~ DailyStateMap ~ response:',
        response,
      );
      const addressComponents = response.results[0].address_components;

      let fullAddress = '';
      let city = '';
      let country = '';

      for (let component of addressComponents) {
        fullAddress += `${component.long_name}, `;

        if (component.types.includes('locality')) {
          city = component.long_name;
        }

        if (component.types.includes('country')) {
          country = component.long_name;
        }
      }

      const place = addressComponents[0].long_name;
      const homeLocation = `${city}, ${country}`;
      const currentLocation = fullAddress?.slice(0, -2);

      return [currentLocation, homeLocation, place, city, country];
    } catch (error) {
      console.log(
        '🚀 ~ file: DailyStateMap.tsx:188 ~ DailyStateMap ~ error:',
        error,
      );
      seGApiKeyErr(error?.status === 'REQUEST_DENIED');
      return ['', '', '', '', ''];
    }
  }

  const handleMapPress = async (event: any) => {
    const location: Region = {
      latitude: event.nativeEvent.coordinate.latitude,
      longitude: event.nativeEvent.coordinate.longitude,
      latitudeDelta: 0.015,
      longitudeDelta: 0.0121,
    };
    setUserSelectedLocation(location);

    try {
      // alert("Please select location")
      const [currentLocation, homeLocation, place, city, country] =
        await convertLocationToReadable(location.latitude, location.longitude);
      setSelectedLocationText({
        place: 'fromMap',
        city,
        country,
        homeLocation,
        currentLocation,
      });
      // setLocation(`${city},${country}`);
      setLocation(currentLocation);
      setMarkerCoordinate(location);
      setIsSelected(true);
      setIsCurrent(false);
      setIsHome(false);
    } catch (error) {
      console.log(error);
      setSelectedLocationText({
        place: '',
        city: '',
        country: '',
        homeLocation: '',
        currentLocation: '',
      });
      setMarkerCoordinate(location);
    }
  };
  if (markerCoordinate && selectedLocationText.place) {
    // route?.params?.setLocation(selectedLocationText.city);
  }

  const goToLocation = async (userSelectedLocation: any, type: string) => {
    try {
      const [currentLocation, homeLocation, place, city, country] =
        await convertLocationToReadable(
          userSelectedLocation?.latitude,
          userSelectedLocation.longitude,
        );
      if (type == 'selected') {
        setSelectedLocationText({
          place,
          city,
          country,
          homeLocation,
          currentLocation,
        });
        setMarkerCoordinate(userSelectedLocation);
        setUserCurrentLocation(userSelectedLocation);
        setUserSelectedLocation(userSelectedLocation);
        setLocation(`${city},${country}`);
      } else if (type == 'home') {
        setMarkerCoordinate(userSelectedLocation);
        setUserCurrentLocation(userSelectedLocation);
        setHomeLocation(homeLocation);
        setLocation(homeLocation);
      } else {
        setMarkerCoordinate(userSelectedLocation);
        setUserCurrentLocation(userSelectedLocation);
        setCurrentLocation(currentLocation);
        setLocation(currentLocation);
      }
    } catch (error) {
      console.log(error);
      setSelectedLocationText({
        place: '',
        city: '',
        country: '',
        homeLocation: '',
        currentLocation: '',
      });
      // setMarkerCoordinate(location);
    }
  };

  const getCurrentLocation = async () => {
    // if (!initialRegion) return;
    // const {latitude, longitude} = initialRegion;
    // var method = 'GET';
    // var url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    // try {
    //   const response = await fetch(url, {
    //     method: method,
    //     headers: {
    //       'content-type': 'application/json',
    //     },
    //   });
    //   const {address, display_name} = await response.json();
    //   console.log("🚀 ~ file: DailyStateMap.tsx:395 ~ getCurrentLocation ~ display_name:", display_name)
    //   console.log("🚀 ~ file: DailyStateMap.tsx:395 ~ getCurrentLocation ~ address:", address)
    //   setCurrentLocation(display_name);
    //   setHomeLocation(address.town ? (address.town + ',') : ' ' + address.country);
    // } catch (err) {
    //   console.log(err);
    // }
  };

  useEffect(() => {
    getCurrentLocation();
  }, [initialRegion]);

  useEffect(() => {
    if (route.params?.showInp) {
      if (route.params?.voiceTxt) speak();
      else
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
    }
  }, []);

  return (
    <View
      style={[
        STYLES.dev1__homeContainer,
        {
          paddingHorizontal: 0,
          flex: 1,
          backgroundColor: '#F6F7F7',
          paddingBottom: 0,
        },
      ]}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 10,
          paddingHorizontal: 15,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.inActive,
          marginBottom: 10,
        }}>
        <TouchableOpacity
          style={{flexDirection: 'row', alignItems: 'center', gap: 2}}
          onPress={() => {
            if (route?.params?.setSwitchValue3 && !route.params?.showInp) {
              route?.params?.setSwitchValue3(false);
              route.params.setLocation('');
            }
            navigation.goBack();
          }}>
          {title !== '' ? (
            <Feather name="arrow-left" size={24} color={COLORS.primary400} />
          ) : (
            <>
              <CloseIcon
                name="chevron-back-outline"
                size={24}
                color={COLORS.mainGreen}
              />
              <Text
                style={{
                  color: COLORS.mainGreen,
                }}>
                Back
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{flex: 1, paddingHorizontal: 2, alignItems: 'center'}}>
          <Text
            style={{
              color: 'black',
              fontWeight: '500',
              fontSize: 17,
              overflow: 'hidden',
              // textOverflow: 'ellipsis',
            }}
            numberOfLines={1}
            ellipsizeMode="tail">
            {title}
          </Text>
        </View>

        <TouchableOpacity
          onPress={location != '' ? handleSelectPress : () => null}>
          <Text
            style={{
              color: COLORS.mainGreen,
            }}>
            {location != '' ? 'Select' : '       '}
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          borderRadius: moderateScale(12),
          paddingTop: 0,
          // position: 'absolute',
          // right: 0,
          // left: 0,
          // top: 10,
          zIndex: 1,
          // justifyContent: 'space-between',
          backgroundColor: 'rgba(118, 118, 128, 0.12);',
          // gap: horizontalScale(10),
          marginHorizontal: horizontalScale(16),
          flexDirection: 'row',
          alignItems: 'center',
          height: 40,
          // paddingHorizontal: 10,
        }}>
        <Icon
          name="search"
          color="#818286"
          size={20}
          // style={{position: 'absolute', left: 10, top: 9}}
          style={{paddingLeft: 10}}
        />
        <GooglePlacesAutocomplete
          styles={{
            textInput: {
              height: '100%',
              color: '#000',
              // paddingTop: verticalScale(13),
              borderColor: COLORS.inActive,
              backgroundColor: 'transparent',
              // paddingLeft: horizontalScale(36),
              // borderRightColor: 'red',
              marginTop: -1,
            },
            description: {
              color: '#000',
            },
            listView: {
              // backgroundColor: "red",
              // padding: 10,
              position: 'absolute',
              top: verticalScale(40) + 2,
              left: -25,
              width:
                Dimensions.get('window').width -
                (10 + horizontalScale(16) + 15),
              // marginLeft: -20
            },
          }}
          textInputProps={{
            placeholderTextColor: 'rgba(60, 60, 67, 0.6)',
            value: searchTxt,
            onChangeText: setSearchTxt,
          }}
          ref={inputRef}
          placeholder="Search"
          onPress={async (data, details = null) => {
            if (details) {
              // 'data' is the selected place, 'details' is the details of the place
              const {lat, lng} = details.geometry.location;
              const location: Region = {
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
              };

              try {
                const [currentLocation, homeLocation, place, city, country] =
                  await convertLocationToReadable(lat, lng);

                // camera.current?.setCamera({
                //   centerCoordinate: [lng, lat],
                // });

                camera?.current?.flyTo([lng, lat]);
                // camera.current?.zoomTo(20);
                // camera?.current?.moveTo([lng, lat]);
                setCenterCoordinate([lng, lat]);
                setSelectedLocationText({
                  place,
                  city,
                  country,
                  homeLocation,
                  currentLocation,
                });
                setMarkerCoordinate(location);
                setUserCurrentLocation(location);
                setUserSelectedLocation(location);
                // setLocation(`${city},${country}`);
                setLocation(data.description);
              } catch (error) {
                console.log(error);
                setSelectedLocationText({
                  place: '',
                  city: '',
                  country: '',
                  homeLocation: '',
                  currentLocation: '',
                });
                setMarkerCoordinate(location);
              }
            }
          }}
          query={{
            key: GOOGLE_API_KEY,
            language: 'en',
            // types: '(cities)',
          }}
          listViewDisplayed={false}
          fetchDetails={true}
        />
        <TouchableOpacity
          onPress={speak}
          // style={{position: 'absolute', right: 10, top: 8, zIndex: 99999}}
          style={{paddingRight: 10}}>
          <Icon
            name="mic"
            color={speaking ? COLORS.mainGreen : '#818286'}
            size={22}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => {
          if (currentLocation !== '') {
            // setUserSelectedLocation(undefined);
            if (initialRegion)
              camera?.current?.flyTo([
                initialRegion?.longitude,
                initialRegion?.latitude,
              ]);

            setLocation(currentLocation);
            // goToLocation(initialRegion, 'current');
            setIsCurrent(true), setIsHome(false), setIsSelected(false);
          }
        }}
        style={[
          styles.location,
          {
            // marginTop: verticalScale(50),
          },
        ]}>
        <View
          style={{
            width: horizontalScale(47),
            height: verticalScale(47),
            borderRadius: moderateScale(23.5),
            backgroundColor: '#F0F0F0',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 4,
          }}>
          <Icon name="navigate" size={24} color="#B8B8B8" />
        </View>
        <View>
          <Text
            style={[
              STYLES.dev1__text13,
              {color: '#7B8D95', fontFamily: 'GeneralSans-Medium'},
            ]}>
            Current Location{' '}
          </Text>
          <Text
            style={[
              STYLES.dev1__text13,
              {
                color: '#7B8D95',
                fontFamily: 'GeneralSans-Medium',
                marginTop: verticalScale(3),
                width: horizontalScale(230),
              },
            ]}>
            {currentLocation == '' ? 'Loading...' : currentLocation}
          </Text>
        </View>
        {isCurrent && (
          <CheckIcon
            name="check"
            color={'#8EB26F'}
            size={moderateScale(20)}
            style={{position: 'absolute', right: horizontalScale(30)}}
          />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.location,
          {
            borderTopWidth: 0,
            marginVertical: 0,
            paddingVertical: 0,
            paddingBottom: verticalScale(8),
          },
        ]}
        onPress={() => {
          if (homeLocation !== '') {
            // setUserSelectedLocation(undefined);
            if (initialRegion)
              camera?.current?.flyTo([
                initialRegion?.longitude,
                initialRegion?.latitude,
              ]);
            setIsHome(true), setIsCurrent(false), setIsSelected(false);
            // goToLocation(initialRegion, 'home');
            setLocation(homeLocation);
          }
        }}>
        <View
          style={{
            width: horizontalScale(47),
            height: verticalScale(47),
            borderRadius: moderateScale(23.5),
            backgroundColor: '#F0F0F0',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 4,
          }}>
          <Icon name="home-outline" size={24} color="#B8B8B8" />
        </View>
        <View>
          <Text
            style={[
              STYLES.dev1__text13,
              {color: '#7B8D95', fontFamily: 'GeneralSans-Medium'},
            ]}>
            Home{' '}
          </Text>
          <Text
            style={[
              STYLES.dev1__text13,
              {
                color: '#7B8D95',
                fontFamily: 'GeneralSans-Medium',
                marginTop: verticalScale(3),
                paddingRight: horizontalScale(40),
              },
            ]}>
            {homeLocation == '' ? 'Loading...' : homeLocation}
          </Text>
        </View>
        {isHome && (
          <CheckIcon
            name="check"
            color={'#8EB26F'}
            size={moderateScale(20)}
            style={{position: 'absolute', right: horizontalScale(30)}}
          />
        )}
      </TouchableOpacity>

      {selectedLocationText.city && (
        <TouchableOpacity
          style={[styles.location, {borderTopWidth: 0, marginVertical: 0}]}
          onPress={() => {
            // setUserSelectedLocation(undefined);

            setIsHome(false), setIsCurrent(false), setIsSelected(true);
            if (userSelectedLocation)
              camera?.current?.flyTo([
                userSelectedLocation?.longitude,
                userSelectedLocation?.latitude,
              ]);
            setLocation(
              selectedLocationText.place === 'fromMap'
                ? selectedLocationText.currentLocation
                : `${selectedLocationText.city},${selectedLocationText.country}`,
            );
            // goToLocation(userSelectedLocation, 'selected');
          }}>
          <View
            style={{
              width: horizontalScale(47),
              height: verticalScale(47),
              borderRadius: moderateScale(23.5),
              backgroundColor: '#F0F0F0',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              gap: 4,
            }}>
            {/* <Icon name="pin-outline" size={24} color="#B8B8B8" /> */}
            <LocationPinIcon />
          </View>
          <View>
            <Text
              style={[
                STYLES.dev1__text13,
                {
                  color: '#7B8D95',
                  fontFamily: 'GeneralSans-Medium',
                  paddingRight: horizontalScale(60),
                },
              ]}>
              {!selectedLocationText.city
                ? 'Loading...'
                : selectedLocationText.city}
            </Text>
            <Text
              style={[
                STYLES.dev1__text13,
                {
                  color: '#7B8D95',
                  fontFamily: 'GeneralSans-Medium',
                  marginTop: verticalScale(3),
                  paddingRight: horizontalScale(100),
                },
              ]}>
              {selectedLocationText.place === 'fromMap'
                ? !selectedLocationText.currentLocation
                  ? 'Loading...'
                  : selectedLocationText.currentLocation
                : !selectedLocationText.city && !selectedLocationText.country
                ? 'Loading...'
                : selectedLocationText.city +
                  ', ' +
                  selectedLocationText.country}
            </Text>
          </View>
          {isSelected && (
            <CheckIcon
              name="check"
              color={'#8EB26F'}
              size={moderateScale(20)}
              style={{position: 'absolute', right: horizontalScale(30)}}
            />
          )}
        </TouchableOpacity>
      )}

      {
        <View
          style={{
            flex: 1,
            paddingTop: 100,
            backgroundColor: 'white',
          }}>
          {initialRegion && userCurrentLocation ? (
            true ? (
              <Mapbox.MapView
                attributionEnabled={false}
                logoEnabled={false}
                compassEnabled={false}
                scaleBarEnabled={false}
                testID={'show-click-map-view'}
                onPress={(val: any) =>
                  handleMapPress({
                    nativeEvent: {
                      coordinate: {
                        latitude: val.geometry.coordinates[1],
                        longitude: val.geometry.coordinates[0],
                      },
                    },
                  })
                }
                style={{flex: 1, backgroundColor: 'white'}}>
                <Mapbox.UserLocation />

                {userSelectedLocation ? (
                  <Mapbox.PointAnnotation
                    key="key1"
                    id="id1"
                    title="Test"
                    coordinate={[
                      userSelectedLocation?.longitude,
                      userSelectedLocation?.latitude,
                    ]}></Mapbox.PointAnnotation>
                ) : null}

                {/* <Mapbox.MarkerView
                  coordinate={[
                    initialRegion?.longitude,
                    initialRegion?.latitude,
                  ]}
                /> */}

                <Mapbox.Camera
                  allowUpdates
                  ref={camera}
                  zoomLevel={13}
                  // followZoomLevel={13}
                  // followUserLocation
                  centerCoordinate={[
                    initialRegion?.longitude,
                    initialRegion?.latitude,
                  ]}
                />
              </Mapbox.MapView>
            ) : (
              <MapView
                style={{
                  flex: 1,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
                followsUserLocation={true}
                showsCompass={true}
                scrollEnabled={true}
                zoomEnabled={true}
                pitchEnabled={true}
                rotateEnabled={true}
                initialRegion={initialRegion}
                region={userCurrentLocation ?? initialRegion}
                onPress={handleMapPress}>
                {markerCoordinate && <Marker coordinate={markerCoordinate} />}
              </MapView>
            )
          ) : null}
        </View>
      }
    </View>
  );
};

export default DailyStateMap;

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: horizontalScale(8),
    borderRadius: moderateScale(10),
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    color: 'black',
    fontSize: moderateScale(17),
    width: '100%',
  },
  location: {
    marginVertical: verticalScale(8),
    borderTopWidth: 1,
    borderTopColor: COLORS.inActive,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inActive,
    paddingVertical: verticalScale(8),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: horizontalScale(16),
  },
});
