import React from 'react';
import {View, Text, ScrollView, Dimensions} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RenderHTML from 'react-native-render-html';

import ScreenTitle from '../../../components/shared-components/ScreenTitle';
import {STYLES} from '../../../styles/globalStyles';
import {verticalScale} from '../../../utils/metrics';
import {COLORS} from '../../../constants/colors';
import {ApiService} from '../../../utils/ApiService';
import {useAppSelector} from '../../../redux/app/hooks';
import Skeleton from '../../../components/shared-components/Skeleton';

export default function PrivacyPolicy() {
  const [privacyPolicyData, setPrivacyPolicyData] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const accessToken = useAppSelector(state => state.user.tokens.accessToken);

  const getPrivacyPolicyData = async () => {
    try {
      setLoading(true);
      const privacyPolicy = new ApiService(`policy/get-policy`, accessToken);
      const privacyPolicyRes = await privacyPolicy.Get();

      if (privacyPolicyRes.status === 200)
        setPrivacyPolicyData(privacyPolicyRes.data.content);
      setLoading(false);
    } catch (error) {
      console.log('🚀 ~ getPrivacyPolicyData ~ error:', error);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    getPrivacyPolicyData();
  }, []);

  return (
    <ScrollView style={{backgroundColor: '#F9FAFA',}}>
      <View
        style={{flex: 1, backgroundColor: '#F9FAFA', paddingHorizontal: 16}}>
        <ScreenTitle
          title="Privacy Policy"
          description="Download as PDF here. To view our previous terms download it here."
        />

        {/* <View
          style={{
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: '#c7c8c8',
            alignItems: 'center',
            paddingBottom: 10,
            marginTop: 18,
          }}>
          <Text
            style={{fontSize: 16, fontWeight: '600', color: '#000', flex: 1}}>
            USA
          </Text>

          <MaterialIcons
            name="keyboard-arrow-down"
            size={25}
            color={'#3C3C43'}
          />
        </View> */}

        <Text
          style={[
            STYLES.dev1__text13,
            {
              fontWeight: '500',
              paddingTop: verticalScale(8),
              color: COLORS.neutral700,
              fontFamily: 'GeneralSans-Medium',
            },
          ]}>
          Effective date: 30 June 2023
        </Text>

        {loading ? (
          <>
            <Skeleton
              style={{marginVertical: 5, marginTop: 15}}
              width={'60%'}
              height={25}
              radius={10}
            />
            <Skeleton
              style={{marginVertical: 5}}
              width={'100%'}
              height={20}
              radius={10}
            />
            <Skeleton
              style={{marginVertical: 5}}
              width={'100%'}
              height={20}
              radius={10}
            />
            <Skeleton
              style={{marginVertical: 5}}
              width={'100%'}
              height={20}
              radius={10}
            />
            <Skeleton
              style={{marginVertical: 5}}
              width={'30%'}
              height={20}
              radius={10}
            />
            <Skeleton
              style={{marginVertical: 5, marginTop: 20}}
              width={'100%'}
              height={20}
              radius={10}
            />
            <Skeleton
              style={{marginVertical: 5}}
              width={'100%'}
              height={20}
              radius={10}
            />
            <Skeleton
              style={{marginVertical: 5}}
              width={'100%'}
              height={20}
              radius={10}
            />
            <Skeleton
              style={{marginVertical: 5}}
              width={'30%'}
              height={20}
              radius={10}
            />
            <Skeleton
              style={{marginVertical: 5, marginTop: 20}}
              width={'100%'}
              height={20}
              radius={10}
            />
            <Skeleton
              style={{marginVertical: 5}}
              width={'100%'}
              height={20}
              radius={10}
            />
            <Skeleton
              style={{marginVertical: 5}}
              width={'100%'}
              height={20}
              radius={10}
            />
            <Skeleton
              style={{marginVertical: 5}}
              width={'30%'}
              height={20}
              radius={10}
            />
          </>
        ) : (
          <RenderHTML
            baseStyle={{color: 'black'}}
            contentWidth={Dimensions.get('screen').width}
            source={{
              html: privacyPolicyData,
            }}
          />
        )}
      </View>
    </ScrollView>
  );
};
