import {
  TouchableOpacity,
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import {STYLES} from '../../styles/globalStyles';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS} from '../../constants/colors';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import NotifyCard from '../../components/daily-state/NotifyCard';
import {useEffect, useRef, useState} from 'react';
import {ApiService} from '../../utils/ApiService';
import {useAppSelector} from '../../redux/app/hooks';
import {ConversationStarterLocation} from '../../interface/types';
import Toast from 'react-native-toast-message';
import {useIsFocused} from '@react-navigation/native';
import Skeleton from '../../components/shared-components/Skeleton';

const ConversationStarterTriggers = ({navigation, route}: any) => {
  const [switchValue1, setSwitchValue1] = useState<boolean>(true);
  const [switchValue2, setSwitchValue2] = useState<boolean>(true);
  const [switchValue3, setSwitchValue3] = useState<boolean>(false);
  const [loader, setLoader] = useState(false);
  const [switchValue4, setSwitchValue4] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [locations, setLocations] = useState<
    ConversationStarterLocation[] | null
  >([]);

  const inputRef: any = useRef();
  const isFocused = useIsFocused();

  const {tokens} = useAppSelector(state => state.user);

  const handleNavigate = (switchValue: any) => {
    switchValue(true);
    navigation.navigate('ConversationStarterTirggersMap', {
      location: selectedLocation,
      setLocation: setSelectedLocation,
      switchValue,
    });
  };

  const getSavedLocations = async () => {
    try {
      setLoader(true);
      const url = 'conversation/locations';
      const locationReq = new ApiService(url, tokens.accessToken);
      const locationRes = await locationReq.Get();

      if (locationRes?.status === 200 && locationRes?.data)
        setLocations(locationRes.data);
      setLoader(false);
    } catch (error) {
      console.log('🚀 getSavedLocations ~ error:', error);
      setLoader(false);
      Toast.show({
        type: 'error',
        text1: 'Unable to get locations.',
        text2: 'Please Try Again Later.',
      });
    }
  };

  const updateLocationStatus = async (id: string, toggle: boolean) => {
    try {
      const reqOptions = {
        locationId: id,
        toggle: toggle,
      };

      const url = 'conversation/update-location';
      const updateLocReq = new ApiService(url, tokens.accessToken);
      await updateLocReq.Put(reqOptions);
    } catch (err) {
      console.log('~ updateLocationStatus ~ err:', err);
    }
  };

  const setSwitchValue = (val: boolean, loc: ConversationStarterLocation) => {
    if (!locations) return;
    const selectedLocationIndex = locations?.findIndex(
      elem => elem._id === loc._id,
    );

    if (selectedLocationIndex! >= 0) {
      locations[selectedLocationIndex].isActive = val;

      updateLocationStatus(loc._id, val);
      setLocations([...locations]);
    }
  };

  const handleSearchNavigation = (voiceTxt = false) => {
    navigation.navigate('ConversationStarterTirggersMap', {
      location: selectedLocation,
      setLocation: setSelectedLocation,
      switchValue: setSwitchValue4,
      showInp: true,
      voiceTxt: voiceTxt,
    });
  };

  useEffect(() => {
    getSavedLocations();
  }, [isFocused]);

  useEffect(() => {
    if (route.params?.showInp) {
      setTimeout(() => {
        navigation.navigate('ConversationStarterTirggersMap', {
          showInp: true,
        });
        // inputRef.current?.focus();
      }, 50);
    }
  }, []);

  return (
    <View style={[STYLES.dev1__homeContainer, {backgroundColor: '#f9f9fa'}]}>
      <ScrollView>
        <TouchableWithoutFeedback onPress={handleSearchNavigation}>
          <View style={styles.searchContainer}>
            <>
              <TextInput
                editable={false}
                ref={inputRef}
                placeholder="Search"
                style={styles.input}
                placeholderTextColor={'rgba(60, 60, 67, 0.6);'}
              />
              <Icon
                name="search-outline"
                size={20}
                color="rgba(60, 60, 67, 0.6)"
                style={styles.searchIcon}
              />
              <TouchableOpacity
                onPress={() => handleSearchNavigation(true)}
                style={styles.micIcon}>
                <Icon
                  name="mic-outline"
                  size={24}
                  color="rgba(60, 60, 67, 0.6)"
                />
              </TouchableOpacity>
            </>
          </View>
        </TouchableWithoutFeedback>
        <View style={{marginTop: verticalScale(20), gap: 20}}>
          <Text
            style={[
              STYLES.dev1__text16,
              {color: COLORS.neutral900, fontFamily: 'GeneralSans-Medium'},
            ]}>
            Appear every time I’m in
          </Text>
        </View>
        {loader ? (
          <>
            <Skeleton
              style={{marginTop: 20}}
              width={'100%'}
              height={50}
              radius={10}
            />
            <Skeleton
              style={{marginTop: 10}}
              width={'100%'}
              height={50}
              radius={10}
            />
            <Skeleton
              style={{marginTop: 10}}
              width={'100%'}
              height={50}
              radius={10}
            />
          </>
        ) : !locations?.length ? (
          <View style={{width: '100%', alignItems: 'center', paddingTop: 10}}>
            <Text style={{color: 'gray'}}>
              There are currently no locations to display.
            </Text>
          </View>
        ) : (
          <View style={{marginTop: verticalScale(20), gap: 10, padding: 5,}}>
            {locations?.map(l => (
              <TouchableOpacity
                key={l._id}
                style={styles.cardContainer}
                onPress={() => handleNavigate(setSwitchValue)}>
                <NotifyCard
                  content={l.address}
                  switchValue={l.isActive}
                  setSwitchValue={(val: boolean) => setSwitchValue(val, l)}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* <TouchableOpacity
            style={styles.cardContainer}
            onPress={() => handleNavigate(setSwitchValue1)}>
            <NotifyCard
              content="San Francisco Valley, USA (Home)"
              switchValue={switchValue1}
              setSwitchValue={setSwitchValue1}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cardContainer}
            onPress={() => handleNavigate(setSwitchValue2)}>
            <NotifyCard
              content="Valley Han, San Francisco"
              switchValue={switchValue2}
              setSwitchValue={setSwitchValue2}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cardContainer}
            onPress={() => handleNavigate(setSwitchValue3)}>
            <NotifyCard
              content="New York College"
              switchValue={switchValue3}
              setSwitchValue={setSwitchValue3}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cardContainer}
            onPress={() => handleNavigate(setSwitchValue4)}>
            <NotifyCard
              content="Manhattan, New York"
              switchValue={switchValue4}
              setSwitchValue={setSwitchValue4}
            />
          </TouchableOpacity> */}
      </ScrollView>
    </View>
  );
};

export default ConversationStarterTriggers;

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: horizontalScale(33),
    borderRadius: moderateScale(10),
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    position: 'relative',
    marginBottom: horizontalScale(8),
    height: 40,
    justifyContent: 'center',
  },
  input: {
    color: 'black',
    fontSize: moderateScale(15),
    paddingLeft: 5,
  },
  searchIcon: {
    position: 'absolute',
    top: verticalScale(13),
    left: horizontalScale(10),
  },
  micIcon: {
    position: 'absolute',
    top: verticalScale(10),
    right: horizontalScale(10),
  },
  cardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 1,
    borderRadius: 16,
  },
});
