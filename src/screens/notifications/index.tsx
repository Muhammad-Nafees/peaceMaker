import {useState, useEffect} from 'react';
import {Text, View, Image, TouchableOpacity, FlatList} from 'react-native';
import {STYLES} from '../../styles/globalStyles';
import {COLORS} from '../../constants/colors';
import CustomModal from '../../components/shared-components/CustomModal';
import {ApiService} from '../../utils/ApiService';
import {useAppSelector} from '../../redux/app/hooks';
import {
  Notification,
  NotificationType,
  Participant,
} from '../../interface/types';
import {format} from 'date-fns';
import {useIsFocused} from '@react-navigation/native';
import {createChat} from '../../utils/chat';
import socketServcies from '../../utils/socketServices';
const imageUrl = require('../../../assets/images/daily-state-images/reception-bell.png');

const NotificationScreen = ({navigation, route}: any) => {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const {tokens} = useAppSelector(state => state.user);
  const [allMarkedAsRead, setAllMarkedAsRead] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isFocused = useIsFocused();
  const {data: user} = useAppSelector(state => state.user);

  const handleNotificationPress = (n: Notification) => {
    if (n.type === 'Daily-State-Update-Low')
      createChat(n.receiver, n.sender._id ?? '');
    markAsRead(n.id);
    if (n.type === 'Message-Send') {
      navigation.navigate('Messages');
    }
  };
  const fetchNotifications = async () => {
    try {
      const notification = new ApiService(`notification`, tokens.accessToken);
      const notificationResponse = await notification.Get();
      // Handle the response data here
      setAllNotifications(notificationResponse.data.data);
      setRefreshing(false);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (route.params?.reloadNotifications)
      route.params.reloadNotifications = false;

    setLoading(true);
    fetchNotifications();
  }, [isFocused, route.params?.reloadNotifications]);

  const markAllRead = async () => {
    try {
      const seeAll = new ApiService(
        `notification/seen-all`,
        tokens.accessToken,
      );
      const res = await seeAll.Put({});
      setAllMarkedAsRead(true);
    } catch (error) {
      console.log('🚀 ~ completeChallenge ~ error:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const seeSingle = new ApiService(
        `notification/${id}`,
        tokens.accessToken,
      );
      const res = await seeSingle.Get();

      if (res.status === 200) {
        let arr = [...allNotifications];
        const notificationIndex = arr.findIndex(x => x._id === id);
        arr[notificationIndex].isRead = true;
        setAllNotifications([...arr]);
      }
    } catch (error) {
      console.log('🚀 ~ completeChallenge ~ error:', error);
    }
  };

  const handlePullToRefresh = async () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleCreateChat = (data: any) => {
    const participantName: Participant = data.data?.participants?.find(
      ({userId}: Participant) => userId !== user._id,
    );

    const isGroup =
      data.data.participants && data.data.participants.length > 2
        ? true
        : false;
    const chatTitle =
      participantName?.firstName + ' ' + participantName?.lastName;

    navigation.navigate('ChatMessagesScreen', {
      group: isGroup ? 1 : 0,
      title: chatTitle,
      provider: 0,
      chatId: data.data._id,
      participants: data.data.participants,
      messages: undefined,
      goBack: true,
      profilePic: participantName?.photo
        ? participantName?.photo
        : participantName?.photoUrl,
    });
  };

  useEffect(() => {
    socketServcies.on(`createChat/${user._id}`, handleCreateChat);
    navigation.setOptions({
      headerRight: () => (
        <>
          <TouchableOpacity onPress={markAllRead}>
            <Text
              style={{
                color: COLORS.primary400,
              }}>
              Mark all read
            </Text>
          </TouchableOpacity>
        </>
      ),
    });

    return () => {
      socketServcies.removeListener(`createChat/${user._id}`, handleCreateChat);
    };
  }, []);
  return (
    <View
      style={[
        STYLES.dev1__homeContainer,
        {gap: 0, paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0, backgroundColor: "#f9fafa", flex: 1},
      ]}>

        {
          loading ? null : allNotifications.length ? 
          <FlatList
            data={allNotifications}
            keyExtractor={e => e._id}
            refreshing={refreshing}
            onRefresh={handlePullToRefresh}
            renderItem={({item}) => {
              const notification = item;
              const lowUpdateNotif =
                notification.type === 'Daily-State-Update-Low' &&
                (notification.body.includes('25%') ||
                  notification.body.includes('20%'));
              return (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    gap: 10,
                    backgroundColor:
                      notification.isRead || allMarkedAsRead
                        ? '#f9fafa'
                        : '#eaf3e2',
                    paddingBottom: 20,
                    paddingHorizontal: 16,
                    paddingTop: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: '#e3e3e3',
                  }}
                  key={notification.id}
                  // onPress={() => setIsModalVisible(true)}
                  onPress={() => handleNotificationPress(notification)}>
                  <View
                    style={{
                      backgroundColor: lowUpdateNotif
                        ? '#FD003A1A'
                        : COLORS.primary400,
                      width: 50,
                      height: 50,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 100,
                    }}>
                    {lowUpdateNotif ? (
                      <Image
                        source={require('../../../assets/images/notification/sad1.png')}
                        alt="img"
                        style={{
                          width: lowUpdateNotif ? 30 : 'auto',
                          height: lowUpdateNotif ? 30 : 'auto',
                        }}
                      />
                    ) : (
                      <Image
                        source={require('../../../assets/images/notification/Logo.png')}
                        alt="img"
                      />
                    )}
                    {lowUpdateNotif && (
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '700',
                          color: '#FD003A',
                          letterSpacing: -0.1,
                        }}>
                        SAD
                      </Text>
                    )}
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flex: 1,
                      // backgroundColor: "red"
                    }}>
                    <View style={{flex: 1}}>
                      <View
                        style={{
                          flexDirection: 'row',
                          // flex: 1,
                          justifyContent: 'space-between',
                          // backgroundColor:"blue"
                        }}>
                        <Text
                          style={[
                            STYLES.dev1__text15,
                            {
                              color: COLORS.neutral900,
                              fontFamily: 'GeneralSans-Medium',
                              textTransform: 'capitalize',
                            },
                          ]}>
                          {notification?.title ??
                            notification.type.replace('-', ' ')}
                        </Text>
                        <Text
                          style={[
                            STYLES.dev1__text13,
                            {
                              color: 'rgba(60, 60, 67, 0.6)',
                              fontFamily: 'GeneralSans-Regular',
                              right: 10,
                            },
                          ]}>
                          {format(new Date(notification.createdAt), 'h:mm a')}
                        </Text>
                      </View>
                      <Text
                        style={[
                          STYLES.dev1__text13,
                          {
                            color: 'rgba(60, 60, 67, 0.6)',
                            fontFamily: 'GeneralSans-Regular',
                            paddingTop:5
                            // backgroundColor:"red"
                          },
                        ]}>
                        {!lowUpdateNotif
                          ? notification.body
                          : notification.body.split('.')[0]}
                        .
                        {lowUpdateNotif && (
                          <Text
                            style={[
                              STYLES.dev1__text13,
                              {
                                color: '#2791B5',
                                fontFamily: 'GeneralSans-Regular',
                                fontWeight: '700',
                                textDecorationLine: 'underline',
                              },
                            ]}>
                            {notification.body.split('.')[1].trim()}.
                          </Text>
                        )}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          /> : <View style={{  alignItems: "center", flex: 1, justifyContent:"center"}}>
            <Text style={{color: 'grey'}}>No notifications</Text>
          </View>
        }

      <CustomModal
        visible={isModalVisible}
        close={() => setIsModalVisible(!setIsModalVisible)}
        title="Permission"
        description="Would you like to grant a permission
        to Akiza Kei to notify you whenever
        he presses SOS?"
        color="#000"
        icon="x"
        btnBgColor="#8EB26F"
        onConfirm={() => setIsModalVisible(!setIsModalVisible)}
        rightButton="No"
        leftButton="Yes"
        imageUrl={imageUrl}
      />
    </View>
  );
};

export default NotificationScreen;
