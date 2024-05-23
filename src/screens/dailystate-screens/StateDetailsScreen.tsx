import React, {useEffect, useState} from 'react';
import {ScrollView, Text, View, BackHandler} from 'react-native';
import {STYLES} from '../../styles/globalStyles';
import StateCard from '../../components/daily-state/StateCard';
import {COLORS} from '../../constants/colors';
import HorizontalMeter from '../../components/daily-state/HorizontalMeter';
import {verticalScale} from '../../utils/metrics';
import CustomRoundCard from '../../components/home/CustomRoundCard';
import CustomButton from '../../components/shared-components/CustomButton';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../interface/types';
import {ApiService} from '../../utils/ApiService';
import {useAppSelector} from '../../redux/app/hooks';
import {formatDate} from '../../utils/helpers';
import Navigation from '../../utils/appNavigation';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ConversationStarters'
>;

const StateDetailsScreen = ({route}: any) => {
  const [value, setValue] = React.useState<string>(
    route.params.state?.toString(),
  );

  const {data: user, tokens} = useAppSelector(state => state.user);
  const statename = route.params?.name.toLowerCase();
  const navigation = useNavigation<NavigationProp>();

  const handleUpdate = async () => {
    try {
      const dailyState = new ApiService(
        `daily-state/create`,
        tokens.accessToken,
      );
      const todayDate = formatDate(new Date());
      const reqObj = {
        userId: user._id,
        dailyStateType: route.params?.name,
        value: value,
        dateTime: new Date(),
        date: todayDate,
      };
      const dailyStateRes = await dailyState.Post(reqObj);
      console.log('🚀~ handleUpdate ~ dailyStateRes:', dailyStateRes);

      if (dailyStateRes.status === 200) {
        const isPhysicalLess =
          Number(value) < 25 &&
          route.params?.name?.toLowerCase().includes('physical');
        // navigation.goBack();
        Navigation.navigate('DailyStateScreen', {
          showPhysicalPrompt: isPhysicalLess,
          showFinalThought: !isPhysicalLess, // showing every time but not the time when physical is less than 25
        });
      }
    } catch (error) {
      console.log('🚀 ~ handleUpdate ~ error:', error);
    }
  };

  // useEffect(() => {
  //   const backAction = () => {
  //     Navigation.navigate('DailyStateScreen', {
  //       showPhysicalPrompt: false,
  //       showFinalThought: true,
  //     });
  //     return true;
  //   };

  //   const backHandler = BackHandler.addEventListener(
  //     'hardwareBackPress',
  //     backAction,
  //   );

  //   return () => backHandler?.remove();
  // }, []);

  return (
    <ScrollView style={{backgroundColor: '#F6F7F7'}}>
      <View
        style={[
          STYLES.dev1__homeContainer,
          {alignItems: 'center', justifyContent: 'space-between'},
        ]}>
        <View>
          <StateCard
            name={route.params?.name}
            bgColor={route.params?.bgColor}
            imageurl={route?.params?.imageurl}
          />
        </View>
        <HorizontalMeter
          initialValue={route.params.state}
          // initialValue={90}
          setValue={setValue}
        />
        <View
          style={{
            borderTopColor: COLORS.inActive,
            borderTopWidth: 1,
            width: '100%',
          }}>
          <Text
            style={[
              STYLES.dev1__text18,
              {
                fontFamily: 'GeneralSans-Medium',
                color: COLORS.neutral900,
                paddingTop: verticalScale(30),
              },
            ]}>
            Activities
          </Text>

          <View style={{flexDirection: 'row', gap: 12}}>
            {['spiritual', 'social'].find(e => e === statename) ? null : (
              <CustomRoundCard
                content="Daily Challenges"
                imageUrl={require('../../../assets/images/challenge.png')}
                backgroundColor="#6B9EA6"
                extraStyles={{flex: 0}}
                onPress={() => {
                  Navigation.navigate('DailyChallenges');
                }}
              />
            )}
            <CustomRoundCard
              content="Journal"
              imageUrl={require('../../../assets/images/journal.png')}
              backgroundColor="#559177"
              onPress={() => {
                // Navigation.navigate('Journal', {dailyStateId: '123'});
                Navigation.navigate('JournalEntryScreen');
              }}
              extraStyles={{flex: 0}}
            />
            {statename === 'social' && (
              <CustomRoundCard
                content="Conversations Starters"
                imageUrl={require('../../../assets/images/accountability.png')}
                backgroundColor="#559177"
                onPress={() => navigation.navigate('ConversationStarters')}
                extraStyles={{flex: 0}}
              />
            )}
          </View>
        </View>

        <View style={{width: '100%'}}>
          <CustomButton
            onPress={
              // () => setFinalThought(true)
              handleUpdate
            }>
            Update
          </CustomButton>
        </View>
      </View>
    </ScrollView>
  );
};

export default StateDetailsScreen;
