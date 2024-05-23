import React, {useState, useEffect} from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Animated,
  Dimensions,
  PermissionsAndroid,
  Switch,
  Platform,
} from 'react-native';
import {STYLES} from '../../styles/globalStyles';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS} from '../../constants/colors';
import DailyStateModal from '../../components/daily-state/DailyStateModal';
import {IFeeling, PROBLEMS_DATA, TIMES} from '../../../data/data';
import {BlurView} from '@react-native-community/blur';
import PainChart from '../../components/daily-state/PainChart';
import BodyChart, {Muscle} from '../../components/daily-state/SecondPainChart';
import {ApiService} from '../../utils/ApiService';
import {DailyStateEntry} from '../../interface/types';
import {useAppSelector} from '../../redux/app/hooks';
import {Toast} from 'react-native-toast-message/lib/src/Toast';
import Geolocation from 'react-native-geolocation-service';
import {useSwipe} from '../../utils/Hooks/useSwipeHorizontal';
import Body from 'react-native-body-highlighter';
import SVGComponent from '../../components/daily-state/PainChartSvg';
import {PERMISSIONS, RESULTS, check, request} from 'react-native-permissions';
import BackSVGComponent from '../../components/daily-state/PainChartSvg/back';

interface PainFeeling {
  originalName?: string;
  _id: string;
  name: string;
  data?: {
    _id: string;
    text: string;
    selectedText: string;
    tips: {_id: string; answer: string}[];
  }[];
}

const ALLOWED_BODYPARTS = [
  'Head',
  'Neck',
  'Chest',
  'Knees',
  'Feet',
  'ankles',
  'upper-back',
  'deltoids',
  'calves',
  'shoulders',
  'back',
  'legs',
  // 'hamstring',
  // 'adductors'
];

const PainChartScreen = ({navigation, route}: any) => {
  const [showProblemModal, setShowProblemModal] = useState({
    visible: false,
    index: 0,
  });
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [chartdata, setChartData] = useState<Muscle[]>([]);
  const [isChartBack, setIsChartBack] = useState<boolean>(false);
  const [painFeeling, setPainFeeling] = useState<PainFeeling>();
  const [modalData, setModalData] = useState<any[]>([]);
  const {tokens} = useAppSelector(state => state.user);
  const [userCoordinates, setUserCoordinates] = useState({
    longitude: 0,
    latitude: 0,
  });
  const [address, setAddress] = useState(route.params?.location);
  const [head, setHead] = useState(false);
  const [neck, setNeck] = useState(false);
  const [shoulder, setShoulder] = useState(false);
  const [chest, setChest] = useState(false);
  const [knees, setKnees] = useState(false);
  const [legs, setLegs] = useState(false);
  const [ankles, setAnkles] = useState(false);
  const [feet, setFeet] = useState(false);
  const [back, setBack] = useState(false);

  const {onTouchStart, onTouchEnd} = useSwipe(onSwipeLeft, onSwipeRight);

  function onSwipeLeft() {
    console.log('SWIPE_LEFT');
    setIsChartBack(prevState => !prevState);
  }

  function onSwipeRight() {
    console.log('SWIPE_RIGHT');
    setIsChartBack(prevState => !prevState);
  }

  function capitalizeFirstLetter(str: string) {
    return str?.charAt(0).toUpperCase() + str.slice(1);
  }

  const getCurrentLocation = async (latitude: number, longitude: number) => {
    // var method = 'GET';
    // var url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    // try {
    //   const response = await fetch(url, {
    //     method: method,
    //     headers: {
    //       'content-type': 'application/json',
    //     },
    //   });
    //   const data = await response.json();
    //   setAddress(data.address.city + ',' + data.address.country);
    // } catch (err) {
    //   console.log(err);
    // }
  };

  const getCoordinates = async () => {
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
            getCurrentLocation(
              position.coords.latitude,
              position.coords.longitude,
            );
            setUserCoordinates({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
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

  const handleHideModal = (modalName: string) => {
    modalName == 'time'
      ? setShowTimeModal(false)
      : setShowProblemModal({
          visible: false,
          index: 0,
        });
    selectedProblem == '' || selectedTime == ''
      ? ''
      : navigation.navigate('SummaryScreen', {
          problem: selectedProblem,
          time: selectedTime,
        });
  };

  // useEffect(() => {
  //   navigation.setOptions({
  //     headerRight: () => {
  //       return selectedProblem != '' && selectedTime != '' ? (
  //         <TouchableOpacity
  //           onPress={() =>
  //             navigation.navigate('SummaryScreen', {
  //               problem: selectedProblem,
  //               time: selectedTime,
  //             })
  //           }>
  //           <Text
  //             style={{
  //               color: COLORS.mainGreen,
  //             }}>
  //             Done
  //           </Text>
  //         </TouchableOpacity>
  //       ) : null;
  //     },
  //   });
  // }, [selectedProblem, selectedTime]);

  const getJournalEntryData = async () => {
    try {
      const url = `daily-state/admin?mainType=daily-state`;
      const journalEntry = new ApiService(url, tokens.accessToken);
      const response = await journalEntry.Get();

      if (response?.status === 200) {
        const data: DailyStateEntry[] = response.data;

        let arr: PainFeeling[] = [];
        data.forEach(entry => {
          let answers: {
            _id: string;
            text: string;
            tips: any[];
            selectedText: string;
          }[] = [];
          entry.feelings.forEach(f => {
            answers.push({
              _id: f._id,
              text: f.type,
              tips: f.answers,
              selectedText: '',
            });
          });
          arr.push({
            _id: entry._id,
            name: entry.journalEntryType
              ? entry.journalEntryType.replace('-', ' ').toLowerCase()
              : '',
            originalName: entry.journalEntryType,
            data: answers,
          });
        });

        const painChartData = arr.find(e =>
          e.name.toLowerCase().includes('pain'),
        );

        setPainFeeling(painChartData);
      }
    } catch (err) {}
  };

  useEffect(() => {
    getJournalEntryData();
    getCoordinates();
  }, []);

  const handleDone = () => {
    let arr: any = {...painFeeling};
    const anySelectRemaining = arr.data?.find(
      (d: any) => d.selectedText === '',
    );

    console.log(
      '🚀 ~ file: PainChartScreen.tsx:280 ~ handleDone ~ chartdata:',
      chartdata,
    );
    if (anySelectRemaining && !chartdata.length)
      return Toast.show({
        type: 'info',
        text1: 'Please select all fields.',
      });

    if (!chartdata.length)
      return Toast.show({
        type: 'info',
        text1: 'Please select any body part.',
      });

    if (anySelectRemaining)
      return Toast.show({
        type: 'info',
        text1: 'Please select all fields.',
      });

    // if (!anySelectRemaining && chartdata.length) {
    let customchartdata: Muscle[] = [];
    chartdata.forEach(d => {
      customchartdata.push({
        ...d,
        slug:
          d.slug.toLowerCase() === 'deltoids'
            ? 'shoulders'
            : d.slug.toLowerCase() === 'upper-back'
            ? 'back'
            : d.slug.toLowerCase() === 'calves'
            ? 'legs'
            : d.slug,
      });
    });
    navigation.navigate('SummaryScreen', {
      problem: selectedProblem,
      time: selectedTime,
      allData: arr.data,
      dailyStateValue: route.params.state.value,
      dailyStateName: route.params.state.dailyStateType.toUpperCase(),
      journalEntryName: arr?.originalName,
      chartdata: customchartdata,
      fromChart: true,
      location: address ? address : '',
      coordinates: userCoordinates,
      journalEntryId: route.params.journalEntryId,
      timers: {
        ...route.params.timers,
      },
      manual: {
        ...route.params.manual,
      },
      journal: route.params?.journal,
    });

    setShowProblemModal({
      visible: false,
      index: 0,
    });
    return;
  };

  const handleSubCategorySeletct = () => {
    if (!selectedProblem)
      return setShowProblemModal({
        visible: false,
        index: 0,
      });

    let arr: any = {...painFeeling};
    if (arr.data) {
      arr.data[showProblemModal.index].selectedText = selectedProblem;

      setPainFeeling(arr);
    }

    setSelectedProblem('');

    setShowProblemModal({
      visible: false,
      index: 0,
    });
  };

  useEffect(() => {
    const options = {
      headerRight: () => (
        <TouchableOpacity onPress={handleDone}>
          <Text
            style={{
              color:
                // COLORS.neutral200,
                COLORS.mainGreen,
            }}>
            Next
          </Text>
        </TouchableOpacity>
      ),
    };
    navigation.setOptions(options);
  }, [showProblemModal.visible, painFeeling, chartdata]);

  return (
    <ScrollView style={{flex: 1, backgroundColor: '#F6F7F7'}}>
      <View
        style={[
          STYLES.dev1__homeContainer,
          {gap: 16, alignItems: 'center', paddingHorizontal: 0},
        ]}>
        <View
          style={{
            paddingHorizontal: horizontalScale(16),
            gap: 16,
            alignItems: 'center',
            width: Dimensions.get('screen').width,
          }}>
          {painFeeling?.data?.map((elem, indx) => (
            <TouchableOpacity
              key={elem._id}
              style={styles.cardContainer}
              onPress={() => {
                let temp: any = [];
                elem.tips.forEach(t => {
                  temp.push({
                    id: t._id,
                    text: t.answer,
                  });
                });
                setModalData(temp);
                setShowProblemModal({visible: true, index: indx});
              }}>
              <Text style={[STYLES.dev1__text15, {color: '#4F4F4F'}]}>
                {capitalizeFirstLetter(
                  elem.selectedText ? elem.selectedText : elem.text,
                )}
              </Text>
              <Icon
                name="chevron-forward-outline"
                size={24}
                color={COLORS.primary400}
              />
            </TouchableOpacity>
          ))}
        </View>
        <View
          // onTouchStart={onTouchStart}
          // onTouchEnd={onTouchEnd}
          style={{
            position: 'relative',
            borderBottomColor: '#e8e9e9',
            borderBottomWidth: 1,
            width: '100%',
            alignItems: 'center',
            paddingBottom: 50,
          }}>
          {/* <PainChart /> */}
          {/* <BodyChart
            colors={['#f9e453']}
            data={chartdata}
            scale={2}
            frontOnly={!isChartBack}
            backOnly={isChartBack}
            onMusclePress={e => {
              const isAllowed = ALLOWED_BODYPARTS.find(
                p => p.toLowerCase() === e.slug.toLowerCase(),
              );

              if (!isAllowed) return;
              const alreadyExist = chartdata.find(x => x.slug === e.slug);
              if (alreadyExist) {
                const newChartData = chartdata.filter(el => el.slug !== e.slug);
                setChartData(newChartData);
                return;
              }
              setChartData([...chartdata, {slug: e.slug, intensity: 1}]);
            }}
          /> */}
          {isChartBack ? (
            <BackSVGComponent
              head={head}
              setHead={setHead}
              neck={neck}
              setNeck={setNeck}
              shoulder={shoulder}
              setShoulder={setShoulder}
              chest={chest}
              setChest={setChest}
              knees={knees}
              setKnees={setKnees}
              legs={legs}
              setLegs={setLegs}
              ankles={ankles}
              setAnkles={setAnkles}
              feet={feet}
              setFeet={setFeet}
              back={back}
              setBack={setBack}
              onBodyPartPress={(e: any) => {
                let slug: any = e.slug;

                const isAllowed = ALLOWED_BODYPARTS.find(
                  p => p.toLowerCase() === slug.toLowerCase(),
                );

                if (!isAllowed) return;
                const alreadyExist = chartdata.find(x => x.slug === slug);
                if (alreadyExist) {
                  const newChartData = chartdata.filter(el => el.slug !== slug);
                  setChartData(newChartData);
                  return;
                }
                setChartData([...chartdata, {slug: slug, intensity: 1}]);
              }}
            />
          ) : (
            <SVGComponent
              head={head}
              setHead={setHead}
              neck={neck}
              setNeck={setNeck}
              shoulder={shoulder}
              setShoulder={setShoulder}
              chest={chest}
              setChest={setChest}
              knees={knees}
              setKnees={setKnees}
              legs={legs}
              setLegs={setLegs}
              ankles={ankles}
              setAnkles={setAnkles}
              feet={feet}
              setFeet={setFeet}
              back={back}
              setBack={setBack}
              onBodyPartPress={(e: any) => {
                let slug: any = e.slug;

                const isAllowed = ALLOWED_BODYPARTS.find(
                  p => p.toLowerCase() === slug.toLowerCase(),
                );

                if (!isAllowed) return;
                const alreadyExist = chartdata.find(x => x.slug === slug);
                if (alreadyExist) {
                  const newChartData = chartdata.filter(el => el.slug !== slug);
                  setChartData(newChartData);
                  return;
                }
                setChartData([...chartdata, {slug: slug, intensity: 1}]);
              }}
            />
          )}

          <View style={{height: 30}} />
          <Switch
            value={isChartBack}
            onValueChange={() => setIsChartBack(prevVal => !prevVal)}
          />
          <Text
            style={{
              position: 'absolute',
              bottom: 0,
              left: 20,
              color: COLORS.mainGreen,
              fontSize: 15,
              fontWeight: '900',
              paddingRight: 25,
            }}>
            {chartdata.map(
              ({slug}, i) =>
                // (slug.toLowe.toUpperCase()) +
                (slug.toLowerCase() === 'deltoids'
                  ? 'SHOULDERS'
                  : slug.toLowerCase() === 'upper-back'
                  ? 'BACK'
                  : slug.toLowerCase() === 'calves'
                  ? 'LEGS'
                  : slug.toUpperCase()) +
                '*' +
                (i === chartdata.length - 1 ? '' : ', '),
            )}
          </Text>
        </View>
        <DailyStateModal
          data={modalData}
          visible={showProblemModal.visible}
          onClose={handleSubCategorySeletct}
          onCancel={() => {
            setSelectedProblem('');

            setShowProblemModal({
              visible: false,
              index: 0,
            });
          }}
          selectedValue={
            showProblemModal.visible
              ? painFeeling?.data
                ? painFeeling?.data[showProblemModal.index].selectedText
                : ''
              : ''
          }
          setSelectedValue={setSelectedProblem}
        />
      </View>
    </ScrollView>
  );
};

export default PainChartScreen;

const styles = StyleSheet.create({
  blurred: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  cardContainer: {
    backgroundColor: '#FDFDFD',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: moderateScale(16),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 1,
    width: '100%',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});
