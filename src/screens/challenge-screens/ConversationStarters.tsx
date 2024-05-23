import React, {useEffect, useState} from 'react';
import {
  TouchableOpacity,
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Text,
} from 'react-native';
import {STYLES} from '../../styles/globalStyles';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS} from '../../constants/colors';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import ConversationStartersCard from '../../components/daily-challenges/ConversationStartersCard';
import {ApiService} from '../../utils/ApiService';
import {useAppSelector} from '../../redux/app/hooks';
import {Toast} from 'react-native-toast-message/lib/src/Toast';
import {
  Category,
  ConversationStarterLocation,
  Location,
} from '../../interface/types';
import {Tarot} from '../../components/journal-entry/Tarot';
import {BlurView} from '@react-native-community/blur';
import {useIsFocused} from '@react-navigation/native';
const familyImage = require('../../../assets/images/daily-challenges/family.png');
const monogamy = require('../../../assets/images/daily-challenges/monogamy.png');
const iceberg = require('../../../assets/images/daily-challenges/iceberg-.png');

const categoriesInfo = {
  family: {
    img: familyImage,
    color: 'rgba(39, 145, 181, 1)',
  },
  monogamy: {
    img: monogamy,
    color: 'rgba(86, 144, 153, 1)',
  },
  iceberg: {
    img: iceberg,
    color: '#A4DAD2',
  },
};

type Question = {
  _id: string;
  name: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
};

const ConversationStarters = ({navigation}: any) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [location, setLocation] = useState<ConversationStarterLocation[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const [lastLocation, setLastLocation] = useState('');

  const {tokens} = useAppSelector(state => state.user);
  const isFocused = useIsFocused();

  // const defaultLocation = location[location.length - 1]?.address
  // ? location[location.length - 1].address
  // : 'Select Location';
  const activeObjects = location.filter(obj => obj.isActive);

  // Find the latest active object based on updatedAt
  const latestActiveObject = activeObjects.reduce((latest, obj) => {
    return new Date(obj.updatedAt) > new Date(latest.updatedAt) ? obj : latest;
  }, activeObjects[0]);

  const defaultLocation = latestActiveObject?.address
    ? latestActiveObject?.address
    : 'Select Location';

  const getCategories = async () => {
    try {
      const url = 'conversation/category';
      const categoriesReq = new ApiService(url, tokens.accessToken);
      const categoriesRes = await categoriesReq.Get();
      console.log(
        '🚀 ~ file: ConversationStarters.tsx:70 ~ getCategories ~ categoriesRes:',
        categoriesRes,
      );

      if (categoriesRes?.status === 200)
        setCategories(categoriesRes.data.categories);
    } catch (error) {
      console.log('🚀 getCategories ~ error:', error);
      Toast.show({
        type: 'error',
        text1: 'Unable to fetch categories.',
        text2: 'Please Try Again Later.',
      });
    }
  };

  const getLocation = async () => {
    try {
      const url = 'conversation/locations';
      const locationReq = new ApiService(url, tokens.accessToken);
      const locationRes = await locationReq.Get();

      if (locationRes?.status === 200 && locationRes?.data)
        setLocation(locationRes.data);
    } catch (error) {
      console.log('🚀 getLocation ~ error:', error);
      Toast.show({
        type: 'error',
        text1: 'Unable to fetch location.',
        text2: 'Please Try Again Later.',
      });
    }
  };

  const getQuestions = async (categoryId: string) => {
    try {
      const url = `conversation/question?categoryId=${categoryId}`;
      const questionsReq = new ApiService(url, tokens.accessToken);
      const questionsRes = await questionsReq.Get();

      console.log(
        '🚀 ~ file: ConversationStarters.tsx:118 ~ getQuestions ~ questionsRes.data:',
        questionsRes.data,
      );
      if (questionsRes?.status === 200 && questionsRes?.data) {
        setQuestions(questionsRes.data?.questions);
        setShowQuestions(true);
      }
    } catch (error) {
      console.log('🚀 getCategories ~ error:', error);
      Toast.show({
        type: 'error',
        text1: 'Unable to fetch Questions.',
        text2: 'Please Try Again Later.',
      });
    }
  };

  const onLastCardSwipe = () => {
    console.log('last card swipe');
    setShowQuestions(false);
  };

  const headerRight = () => {
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('ConversationStarterTiggers', {location})
        }>
        <Icon name="settings-outline" color={COLORS.primary400} size={26} />
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    getCategories();
    navigation.setOptions({
      headerRight: headerRight,
    });
  }, []);

  useEffect(() => {
    if (isFocused) getLocation();
  }, [isFocused]);

  return (
    <>
      <View style={[STYLES.dev1__homeContainer, {backgroundColor: '#fff'}]}>
        
        <ScrollView>
          <TouchableWithoutFeedback
            onPress={() =>
              navigation.navigate('ConversationStarterTirggersMap', {
                // location,
                showInp: true,
              })
            }>
            <View style={styles.searchContainer}>
              <Text style={styles.input}>{defaultLocation}</Text>
              {/* <TextInput
                numberOfLines={2}
                editable={false}
                placeholder={defaultLocation}
                style={styles.input}
                placeholderTextColor={'rgba(60, 60, 67, 0.6);'}
              /> */}
              <Icon
                name="location-outline"
                size={24}
                color={COLORS.mainGreen}
                style={styles.searchIcon}
              />
            </View>
          </TouchableWithoutFeedback>
          <View style={{marginTop: verticalScale(20), gap: 20}}>
            {categories.map(category => {
              let name = 'family';

              if (category.name.toLowerCase().includes('intimacy'))
                name = 'monogamy';
              else if (category.name.toLowerCase().includes('icebreaker'))
                name = 'iceberg';
              return (
                <ConversationStartersCard
                  key={category.id}
                  handlePress={() => getQuestions(category._id)}
                  image={
                    categoriesInfo[name as keyof typeof categoriesInfo].img
                  }
                  text={category.name}
                  backgroundColor={
                    categoriesInfo[name as keyof typeof categoriesInfo].color
                  }
                />
              );
            })}
          </View>
        </ScrollView>
      </View>

      {showQuestions && (
        <>
          <BlurView style={styles.blurView} blurType="light" blurAmount={1} />

          <Tarot
            setTip={() => null}
            addShadow={true}
            style={{backgroundColor: 'transparent', marginTop: -100}}
            tips={questions.map(el => el.name)}
            onLastCardSwipe={onLastCardSwipe}
          />
        </>
      )}
    </>
  );
};

export default ConversationStarters;

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: horizontalScale(33),
    borderRadius: moderateScale(10),
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    position: 'relative',
    marginBottom: horizontalScale(8),
    minHeight: 40,
    justifyContent: 'center',
    paddingVertical: 5,
    // alignItems: "c"
  },
  input: {
    // color: 'black',
    fontSize: moderateScale(15),
    paddingLeft: 5,
    color: 'rgba(60, 60, 67, 0.6)',
    // marginTop: -5
  },
  searchIcon: {
    position: 'absolute',
    top: verticalScale(10),
    left: horizontalScale(10),
  },
  blurView: {
    position: 'absolute',
    top: -verticalScale(40),
    left: 0,
    bottom: 0,
    right: 0,
  },
});
