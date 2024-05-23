import React, {useContext} from 'react';
import {View, StyleSheet, Image, Text} from 'react-native';
import MaxVideoView from './MaxVideoView';
import MinVideoView from './MinVideoView';
import {MinUidConsumer} from './MinUidContext';
import {MaxUidConsumer} from './MaxUidContext';
import styles from './Style';
// import LocalControls from './Controls/LocalControls';
import PropsContext, {role} from './PropsContext';
import placeholderImg from '../../../../constants/extras';
import LinearGradient from 'react-native-linear-gradient';
import {useAppSelector} from '../../../../redux/app/hooks';
import ProfilePicture from '../../../../components/shared-components/ProfilePic';

const PinnedVideo: React.FC = () => {
  const {rtcProps, styleProps, participants, route} = useContext(PropsContext);
  console.log("🚀 ~ file: PinnedVideo.tsx:17 ~ route:", route.params.photo)
  const user = useAppSelector((state: any) => state.user.data);
  const participant = participants.find(p => p._id !== user._id);

  function isS3String(s: string): boolean {
    if (typeof s !== 'string') return false;
    return !s.includes('https://');
  }

  const cameraOffView = (
    myView = true,
    firstName = user.firstName,
    lastName = user.lastName,
  ) => {
    return (
      <View
        style={[
          styles.minView,
          {
            backgroundColor: 'black',
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}>
        <View style={style.nameBox}>
          <Text style={{fontSize: 14, fontWeight: '700', color: 'white'}}>
            {firstName?.slice(0, 1).toUpperCase()}
            {lastName?.slice(0, 1).toUpperCase()}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 15,
            fontWeight: '500',
            color: 'white',
            marginTop: 3,
          }}>
          {myView ? 'You' : firstName}
        </Text>
      </View>
    );
  };

  return (
    <>
      <MaxUidConsumer>
        {maxUsers => {
          if (maxUsers[0].uid === 'local' || !maxUsers[0].video) {
            return (
              <LinearGradient
                colors={['#3b5266', '#0e2646', '#0e2646']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                locations={[0, 0.5, 1]}
                style={style.page}>
                <View style={style.cameraPreview}>
                  <View style={style.callinfo}>
                    <ProfilePicture
                      style={{
                        borderColor: '#D8D8D8',
                        borderWidth: 1,
                        marginTop: 10,
                        // height: 57,
                        // width: 55,
                      }}
                      photo={
                        route.params?.photo
                          ? !isS3String(route.params?.photo)
                            ? route.params?.photo
                            : `https://peacemakers3.s3.us-east-2.amazonaws.com/${route.params?.photo}`
                          : participant?.photo
                          ? participant.photo
                          : participant?.photoUrl
                      }
                      firstName={participant?.firstName}
                      lastName={participant?.lastName}
                      size={55}
                    />
                    {/* <Image style={style.image} source={placeholderImg} /> */}
                    <View style={{paddingHorizontal: 12}}>
                      <Text style={style.name}>
                        {participant?.firstName + ' ' + participant?.lastName}
                      </Text>
                      {maxUsers[0].uid === 'local' ? (
                        <Text style={style.phoneNumber}>connecting...</Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              </LinearGradient>
            );
          }
          return maxUsers[0] ? ( // check if audience & live don't render if uid === local
            <MaxVideoView user={maxUsers[0]} key={maxUsers[0].uid} />
          ) : null;
        }}
      </MaxUidConsumer>

      <View
        style={{
          ...styles.minContainer,
          ...(styleProps?.minViewContainer as Object),
          margin: 12,
        }}>
        <MaxUidConsumer>
          {maxUsers => {
            if (maxUsers[0].uid === 'local') {
              return maxUsers[0].video ? (
                <MinVideoView
                  key={maxUsers[0].uid}
                  user={maxUsers[0]}
                  showOverlay={false}
                />
              ) : (
                cameraOffView()
              );
            }
          }}
        </MaxUidConsumer>
        <MinUidConsumer>
          {minUsers => {
            return minUsers.map(user =>
              rtcProps.role === role.Audience &&
              user.uid === 'local' ? null : user.video ? (
                <MinVideoView key={user.uid} user={user} showOverlay={false} />
              ) : (
                cameraOffView()
              ),
            );
          }}
        </MinUidConsumer>
      </View>
    </>
  );
};

const style = StyleSheet.create({
  secondCamera: {
    width: 134,
    height: 192,
    borderRadius: 12,
    backgroundColor: 'black',
    // alignSelf: 'flex-end',
    // marginRight: 12,
    // marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'absolute',
    // bottom: actionBoxHeight,
    right: 12,
  },
  grpSecondCamera: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',

    width: '45%',
    marginRight: 0,
    marginBottom: '2.5%',

    backgroundColor: 'rgba(242, 242, 242, 0.11)',
    alignSelf: 'auto',
    overflow: 'hidden',
  },
  nameBox: {
    width: 42,
    height: 42,
    borderRadius: 50,
    backgroundColor: '#2791B5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  page: {
    height: '100%',
    width: '100%',
  },
  callinfo: {
    flexDirection: 'row',
    // alignItems: 'center',
    marginTop: 80,
    marginLeft: 25,
  },
  cameraPreview: {
    flex: 1,
    padding: 10,
    paddingHorizontal: 10,
    // width: '100%',
    // height: '100%',
  },
  image: {
    width: 55,
    height: 55,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    marginTop: 10,
  },
  name: {
    fontSize: 30,
    fontWeight: '400',
    color: 'white',
    marginBottom: 5,
    paddingRight: 10,
  },
  phoneNumber: {
    fontSize: 20,
    color: 'white',
    fontWeight: '400',
    marginLeft: 1,
  },
  // video styles >>
  videoView1: {width: '100%', height: '100%'},
  videoView: {width: '100%', height: '100%', borderRadius: 12},
  info: {backgroundColor: '#ffffe0', color: '#0000ff'},
  txtBlfack: {color: 'black'},
});

export default PinnedVideo;
