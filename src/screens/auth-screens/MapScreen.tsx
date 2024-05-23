import React, {useState, useEffect} from 'react';
import {View, PermissionsAndroid} from 'react-native';
import MapView, {Marker, Region} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import CustomButton from '../../components/shared-components/CustomButton';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import {COLORS} from '../../constants/colors';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import { GOOGLE_API_KEY } from '../../constants/keys';


interface Props {
  navigation: any;
  route: any;
}

const MapScreen: React.FC<Props> = ({navigation, route}) => {
  const {setFieldValue} = route.params ?? {setFieldValue: null};
  const [initialRegion, setInitialRegion] = useState<Region | undefined>(
    undefined,
  );
  const [selectedLocation, setSelectedLocation] = useState<Region | undefined>(
    undefined,
  );
  const [readableLocation, setReadableLocation] = useState('');
  const [isSelectLocation, setIsSelectLocation] = useState<boolean>(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  Geocoder.init(GOOGLE_API_KEY); // Replace this key with your actual API key

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app requires access to your location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(
          position => {
            const location: Region = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.0121,
            };
            setInitialRegion(location);
            setSelectedLocation(location);
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
    if (
      selectedLocation &&
      selectedLocation.latitude &&
      selectedLocation.longitude
    ) {
      const {latitude, longitude} = selectedLocation;
      convertLocationToReadable(latitude, longitude).then(location => {
        setReadableLocation(location);
      });
    }
  }, [selectedLocation]);

  async function convertLocationToReadable(
    latitude: number,
    longitude: number,
  ) {
    try {
      const response = await Geocoder.from(latitude, longitude);
      const addressComponents = response.results[0].address_components;
      let city = '';
      let country = '';

      for (let component of addressComponents) {
        if (component.types.includes('locality')) {
          city = component.long_name;
        }
        if (component.types.includes('country')) {
          country = component.long_name;
        }
      }

      const readableLocation = `${city}, ${country}`;

      return readableLocation;
    } catch (error) {
      console.log('test', error);
      return '';
    }
  }

  const handleSetLocation = async () => {
    if (selectedLocation) {
      setIsSelectLocation(true);
      try {
        const {latitude, longitude} = selectedLocation;

        const location = await convertLocationToReadable(latitude, longitude);

        setFieldValue('location', location);

        navigation.goBack();
      } catch (error) {
        console.log(error);
      }
      setIsSelectLocation(false);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: '#ffffff'}}>
      <View
        style={{height: '100%', position: 'relative', top: verticalScale(70)}}>
        {initialRegion ? (
          <MapView
            style={{flex: 1}}
            showsUserLocation={true}
            showsMyLocationButton={true}
            followsUserLocation={true}
            showsCompass={true}
            scrollEnabled={true}
            zoomEnabled={true}
            pitchEnabled={true}
            rotateEnabled={true}
            initialRegion={initialRegion}
            region={selectedLocation ?? initialRegion}
            onPress={e => {
              const location: Region = {
                latitude: e.nativeEvent.coordinate.latitude,
                longitude: e.nativeEvent.coordinate.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
              };
              setSelectedLocation(location);
            }}>
            {selectedLocation && (
              <Marker coordinate={selectedLocation} title="Selected Location" />
            )}
          </MapView>
        ) : null}
      </View>
      <Icon
        name="arrow-back-outline"
        color={COLORS.primary400}
        size={24}
        style={{
          position: 'absolute',
          top: verticalScale(20),
          marginLeft: horizontalScale(20),
        }}
        onPress={() => navigation.goBack()}
      />

      <View
        style={{
          borderRadius: moderateScale(12),
          paddingTop: 0,
          position: 'absolute',
          right: verticalScale(10),
          top: verticalScale(10),
          width: '80%',
          zIndex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          gap: horizontalScale(10),
        }}>
        <GooglePlacesAutocomplete
          styles={{
            textInput: {
              height: verticalScale(50),
              color: '#000',
              paddingTop: verticalScale(6),
              borderWidth: moderateScale(1),
              borderColor: COLORS.inActive,
            },
            description: {
              color: '#000',
            },
          }}
          placeholder="Search Location"
          onPress={(data, details = null) => {
            if (details) {
              // 'data' is the selected place, 'details' is the details of the place
              const {lat, lng} = details.geometry.location;
              const location: Region = {
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
              };
              setSelectedLocation(location);
            }
          }}
          query={{
            key: GOOGLE_API_KEY,
            language: 'en',
            types: '(regions)',
          }}
          listViewDisplayed={false}
          fetchDetails={true}
        />
      </View>

      <View
        style={{
          paddingHorizontal: 16,
          position: 'absolute',
          width: '100%',
          bottom: 20,
        }}>
        <CustomButton onPress={handleSetLocation} isDisabled={isSelectLocation}>
          Set Location
        </CustomButton>
      </View>
    </View>
  );
};

export default MapScreen;
