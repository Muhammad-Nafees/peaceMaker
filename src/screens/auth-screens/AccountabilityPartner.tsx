import React, {useState} from 'react';
import {STYLES} from '../../styles/globalStyles';
import {COLORS} from '../../constants/colors';
import CustomButton from '../../components/shared-components/CustomButton';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import {RouteProp, useNavigation} from '@react-navigation/native';
import {AuthStackParamList, User} from '../../interface/types';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/FontAwesome';

import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import Toast from 'react-native-toast-message';
import {useAppDispatch, useAppSelector} from '../../redux/app/hooks';
import {setUserData} from '../../redux/features/user/userSlice';
import {ApiService} from '../../utils/ApiService';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'CompleteProfile'
>;

type AccountabilityPartnerScreenRouteProp = RouteProp<
  Record<string, {buddies: any; prevBuddy: User}>,
  'AccountabilityPartner'
>;

type Props = {
  route: AccountabilityPartnerScreenRouteProp;
};

const RELATIONSHIPS = [
  {_id: 'r1', name: 'Friends'},
  {_id: 'r2', name: 'Kids'},
  {_id: 'r3', name: 'Sibling'},
  {_id: 'r5', name: 'Parent'},
  {_id: 'r6', name: 'Partner'},
  {_id: 'r4', name: 'Husband'},
  {_id: 'r7', name: 'Wife'},
];
interface Buddy {
  buddy: string;
}

const AccountabilityPartners = ({route}: Props) => {
  const {prevBuddy} = route.params;
  const buddies = route.params.buddies.filter(
    (e: User) => e.firstName !== undefined,
  );

  const [isNetwork, setIsNetwork] = useState(false);
  const [network, setNewwork] = useState<any>({
    _id: prevBuddy?._id ? prevBuddy._id : '',
    firstName: prevBuddy?.firstName ? prevBuddy.firstName : '',
    relationship: '',
    isPrimary: true,
  });
  const [isRelationship, setIsRelationship] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(state => state.user.tokens.accessToken);
  const {data: user} = useAppSelector(state => state.user);
  const refreshToken = useAppSelector(state => state.user.tokens.refreshToken);

  // FUNCTIONS

  const handleNameChange = (data: any) => {
    setNewwork((prevState: any) => ({
      ...prevState,
      _id: data._id,
      firstName: data.firstName,
    }));
    setIsNetwork(false);
  };

  const handleRelationChange = (data: any) => {
    setNewwork((prevState: any) => ({
      ...prevState,
      relationship: data,
    }));
    setIsRelationship(false);
  };

  const updateAccountabilityPartner = async () => {
    //creating object for add-network api
    if (network._id != '' && network.relationship) {
      setLoading(true);
      let addBuddiesToNetwork = {
        partner: {
          primary: '',
          relation: '',
        },
        buddies: [] as Buddy[],
      };

      buddies.map((buddy: any) => {
        if (buddy._id == network._id) {
          addBuddiesToNetwork.partner.primary = network._id.toString();
          addBuddiesToNetwork.partner.relation =
            network.relationship.toString();
          // tempBuddies = tempBuddies.concat({
          //   buddyId: network.id.toString(),
          //   relationship: network.relationship.toString(),
          //   isPrimary: true,
          //   firstName: buddy.firstName,
          //   lastName: buddy.lastName,
          // });
        }
        // else {
        addBuddiesToNetwork.buddies.push({buddy: buddy._id.toString()});

        // tempBuddies = tempBuddies.concat({
        //   buddyId: buddy.id.toString(),
        //   relationship: 'friend',
        //   isPrimary: false,
        //   firstName: buddy.firstName,
        //   lastName: buddy.lastName,
        // });
        // }
      });
      console.log(
        '🚀 ~ file: AccountabilityPartner.tsx:148 ~ buddies.map ~ addBuddiesToNetwork:',
        addBuddiesToNetwork,
      );

      //passing object to add-network api
      console.log(addBuddiesToNetwork, 'sss');

      try {
        const userUpdate = new ApiService('user/add-network', accessToken);
        const userUpdateRes = await userUpdate.Post(addBuddiesToNetwork);
        console.log(
          '🚀 ~ file: AccountabilityPartner.tsx:168 ~ updateAccountabilityPartner ~ userUpdateRes:',
          userUpdateRes,
        );
        setLoading(false);

        if (userUpdateRes?.status == 200) {
          if (prevBuddy === undefined) {
            dispatch(
              setUserData({...userUpdateRes?.data, userType: user.userType}),
            );
            navigation.navigate('CompleteProfile');
          } else {
            navigation.goBack();
          }
        } else {
          setLoading(false);
          Toast.show({
            type: 'error',
            text1: 'Process Failed!',
            text2: 'Please Try Again Later.',
          });
        }
      } catch (error) {
        setLoading(false);
        Toast.show({type: 'error', text1: 'Process Failed!'});
      }
    } else if (network.firstName == '') {
      Toast.show({
        type: 'info',
        text1: 'Accountability Partner Name Not Selected!',
        text2: 'Please Select Your Accountability Partner Name',
      });
    } else if (network.relationship == '') {
      Toast.show({
        type: 'info',
        text1: 'Accountability Partner Relation Not Selected!',
        text2: 'Please Select Your Relationship.',
      });
    } else {
      Toast.show({
        type: 'info',
        text1: 'Accountability Partner Not Selected!',
        text2: 'Please Select Your Accountability Partner',
      });
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text
          style={[{fontSize: moderateScale(28)}, {color: COLORS.neutral900}]}>
          Delegate Primary Accountability Partner{' '}
        </Text>
        <View style={{gap: verticalScale(16), marginTop: verticalScale(28)}}>
          <View style={{position: 'relative'}}>
            <TouchableOpacity
              style={styles.innerContainer}
              onPress={() => setIsNetwork(!isNetwork)}>
              <View style={styles.dropdownContainer}>
                <View>
                  <Text
                    style={[STYLES.dev1__text16, {color: COLORS.neutral100}]}>
                    Name of Primary Accountibility Partner{' '}
                  </Text>
                  {network._id == '' ? (
                    ''
                  ) : (
                    <Text
                      style={[
                        STYLES.dev1__text14,
                        {fontWeight: '500', color: COLORS.neutral700},
                      ]}>
                      {network.firstName}
                    </Text>
                  )}
                </View>
              </View>
              <Image
                source={require('../../../assets/icons/chevron.png')}
                alt="icon"
                style={{marginRight: horizontalScale(10)}}
              />
            </TouchableOpacity>
            {isNetwork && (
              <View
                style={{
                  backgroundColor: '#ffffff',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.23,
                  shadowRadius: 2.62,

                  elevation: 4,
                  borderRadius: 8,
                  padding: 12,
                  marginTop: verticalScale(1),
                  // position: 'absolute',
                  width: '100%',
                  top: verticalScale(5),
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 9999,
                  // overflow: 'hidden',
                }}>
                <View style={{}}>
                  <FlatList
                    data={buddies}
                    keyExtractor={item => item._id}
                    renderItem={({item}) => {
                      const buddy = item;
                      return (
                        <View
                          style={{
                            flexDirection: 'column',
                            position: 'relative',
                            paddingVertical: verticalScale(2),
                          }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}>
                            <Text
                              style={[
                                STYLES.dev1__text16,
                                {
                                  fontWeight: '400',
                                  color: '#000000',
                                  paddingVertical: verticalScale(8),
                                  width: '90%',
                                  fontFamily: 'GeneralSans-Medium',
                                },
                              ]}
                              onPress={() => {
                                handleNameChange(buddy);
                              }}>
                              {buddy.firstName}
                            </Text>
                            {network._id == buddy._id && (
                              <Icon
                                name="check"
                                color={'#8EB26F'}
                                size={moderateScale(20)}
                                style={{marginRight: horizontalScale(8)}}
                              />
                            )}
                          </View>
                        </View>
                      );
                    }}
                  />
                </View>
              </View>
            )}
          </View>

          <View style={{position: 'relative', zIndex: -1}}>
            <TouchableOpacity
              style={styles.innerContainer}
              onPress={() => setIsRelationship(!isRelationship)}>
              <View style={styles.dropdownContainer}>
                <Text style={[STYLES.dev1__text16, {color: COLORS.neutral100}]}>
                  {network.relationship == ''
                    ? 'What is your relationship with'
                    : network.relationship}
                </Text>
                <Image
                  source={require('../../../assets/icons/chevron.png')}
                  alt="icon"
                />
              </View>
            </TouchableOpacity>
            {isRelationship && (
              <View
                style={{
                  backgroundColor: '#ffffff',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.22,
                  shadowRadius: 2.22,

                  elevation: 3,
                  borderRadius: 8,
                  padding: 12,
                  marginTop: verticalScale(1),
                }}>
                {RELATIONSHIPS.map((relation: any) => {
                  return (
                    <View
                      style={{
                        flexDirection: 'column',
                        position: 'relative',
                        paddingVertical: verticalScale(2),
                      }}
                      key={relation._id}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                        <Text
                          style={[
                            STYLES.dev1__text16,
                            {
                              fontWeight: '400',
                              color: '#000000',
                              paddingVertical: verticalScale(8),
                              width: '90%',
                              fontFamily: 'GeneralSans-Medium',
                            },
                          ]}
                          onPress={() => {
                            handleRelationChange(relation.name);
                          }}>
                          {relation.name}
                        </Text>
                        {network.relationship == relation.name && (
                          <Icon
                            name="check"
                            color={'#8EB26F'}
                            size={moderateScale(20)}
                            style={{marginRight: horizontalScale(8)}}
                          />
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </View>
      <CustomButton isLoading={loading} onPress={updateAccountabilityPartner}>Save</CustomButton>
    </View>
  );
};

export default AccountabilityPartners;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(20),
    backgroundColor: '#F9FAFA',
    justifyContent: 'space-between',
  },
  innerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    gap: horizontalScale(4),
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    paddingRight: horizontalScale(10),
  },
});
