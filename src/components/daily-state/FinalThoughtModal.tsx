import React, {
  Modal,
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
  Platform,
} from 'react-native';
import {horizontalScale, verticalScale} from '../../utils/metrics';
import {useState} from 'react';
import {ApiService} from '../../utils/ApiService';

interface Props {
  visible: boolean;
  close: any;
  icon: string;
  title: string;
  description?: string;
  color: string;
  btnBgColor?: string;
  imageUrl?: any;
  leftButton?: string;
  rightButton?: string;
  isButtons?: boolean;
  onConfirm?: () => void;
  accessToken: any;
}

export default function FinalThoughtModal({
  visible = false,
  close,
  title,
  description,
  color,
  btnBgColor,
  imageUrl,
  leftButton,
  accessToken,
}: Props) {
  const [btn1Selected, setBtn1Selected] = useState(true);
  const [btn2Selected, setBtn2Selected] = useState(true);
  const [remarks, setRemarks] = useState('');

  const handleConfirm = async () => {
    try {
      const reqObj = {
        question1: 'Are you happy with your choice?',
        isSatisfied1: `${btn1Selected}`,
        question2: 'Did you achieve your personal goals?',
        isSatisfied2: `${btn2Selected}`,
        remarks: remarks ? remarks : null,
      };
      const req = new ApiService('final-thought', accessToken);
      const res = await req.Post(reqObj);
      console.log('~ handleConfirm ~ res:', res);

      console.log(res);
    } catch (err) {
      console.log('handleConfirm ~ err:', err);
    }
  };
  return (
    <Modal
      statusBarTranslucent
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={close}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -55}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          // width: "100%",
          // marginTop: 20
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalWarnCont}>
              <Image
                resizeMode="stretch"
                style={
                  imageUrl
                    ? {width: 40, height: 40, marginTop: -10}
                    : styles.modalWarnImg
                }
                source={
                  imageUrl
                    ? imageUrl
                    : require('../../../assets/images/warning1.png')
                }
              />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                justifyContent: 'center',
                alignItems: 'center',
                // backgroundColor: 'yellow',
                width: '100%',
              }}>
              <View style={{width: '80%'}}>
                <View style={{height: 77 / 2}} />
                <Text style={[styles.modalText, {color: color}]}>{title}</Text>
                <View
                  style={{
                    borderBottomWidth: 1,
                    paddingBottom: 30,
                    borderBottomColor: '#DADADA',
                    marginTop: 10,
                    width: '100%',
                    paddingHorizontal: 30,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignSelf: 'center',
                    }}>
                    <Image
                      style={{width: 37, height: 37, marginTop: 4}}
                      source={require('../../../assets/images/smileyface.png')}
                    />
                    <View style={{paddingLeft: 10}}>
                      <Text
                        style={[
                          styles.modalText2,
                          {
                            fontFamily: 'GeneralSans-Medium',
                            color: 'black',
                            fontWeight: '500',
                            fontSize: 15,
                          },
                        ]}>
                        Are you happy with your choice?
                      </Text>
                      <View style={{width: '90%'}}>
                        <Text
                          style={[
                            styles.modalText2,
                            {
                              fontFamily: 'GeneralSans-Medium',
                              marginTop: 5,
                            },
                          ]}>
                          {description}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 22,
                    }}>
                    <TouchableOpacity
                      onPress={() => setBtn1Selected(true)}
                      style={[
                        styles.modalBtn,
                        {
                          backgroundColor: btn1Selected ? '#ccf593' : '#eeeeee',
                          width: '45%',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.modalBtnTxt,
                          {color: btn1Selected ? 'black' : '#8E8E8E'},
                        ]}>
                        Yes, I am!
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setBtn1Selected(false)}
                      style={[
                        styles.modalBtn,
                        {
                          backgroundColor: !btn1Selected
                            ? '#ccf593'
                            : '#eeeeee',
                          width: '45%',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.modalBtnTxt,
                          {color: !btn1Selected ? 'black' : '#8E8E8E'},
                        ]}>
                        Nope
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View
                  style={{
                    borderBottomWidth: 1,
                    paddingBottom: 30,
                    borderBottomColor: '#DADADA',
                    marginTop: 10,
                    width: '100%',
                    paddingHorizontal: 30,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignSelf: 'center',
                      width: '100%',
                      flexWrap: 'wrap',
                    }}>
                    <Image
                      style={{width: 37, height: 37, marginTop: 3}}
                      source={require('../../../assets/images/smileyface.png')}
                    />
                    <View style={{paddingLeft: 10, paddingRight: 10, flex: 1}}>
                      <Text
                        style={[
                          styles.modalText2,
                          {
                            fontFamily: 'GeneralSans-Medium',
                            color: 'black',
                            fontWeight: '500',
                            fontSize: 15,
                            flexWrap: 'wrap',
                            paddingRight: 10,
                          },
                        ]}>
                        Did you achieve your personal goals?
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 22,
                    }}>
                    <TouchableOpacity
                      onPress={() => setBtn2Selected(true)}
                      style={[
                        styles.modalBtn,
                        {
                          backgroundColor: btn2Selected ? '#ccf593' : '#eeeeee',
                          width: '45%',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.modalBtnTxt,
                          {color: btn2Selected ? 'black' : '#8E8E8E'},
                        ]}>
                        Yes, I did!
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setBtn2Selected(false)}
                      style={[
                        styles.modalBtn,
                        {
                          backgroundColor: !btn2Selected
                            ? '#ccf593'
                            : '#eeeeee',
                          width: '45%',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.modalBtnTxt,
                          {color: !btn2Selected ? 'black' : '#8E8E8E'},
                        ]}>
                        Nope
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{paddingHorizontal: 20}}>
                  <TextInput
                    onChangeText={setRemarks}
                    placeholder="Remarks (optional)"
                    style={{
                      borderColor: '#E7EAEB',
                      borderWidth: 1,
                      borderRadius: 12,
                      padding: 10,
                      paddingVertical: 15,
                      // width: '100%',
                      // marginHorizontal: 20,
                      marginTop: 24,
                      marginBottom: 5,
                      color: 'black',
                      fontSize: 14,
                    }}
                    placeholderTextColor="#94A5AB"
                  />
                </View>
                <View style={styles.modalBtnContainer}>
                  <TouchableOpacity
                    style={[
                      styles.modalBtn,
                      styles.modalBtn1,
                      {backgroundColor: btnBgColor!},
                    ]}
                    onPress={() => {
                      close();
                      handleConfirm();
                    }}>
                    <Text style={[styles.modalBtnTxt, styles.modalBtnTxt1]}>
                      {leftButton ? leftButton : 'Confirm'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: '100%',
    // height: Dimensions.get("window").height,
    // height: Dimensions.get("window").height,
  },
  modalView: {
    // width: horizontalScale(308),
    // width: 300,
    backgroundColor: 'white',
    borderRadius: 15,
    alignItems: 'center',
    position: 'relative',
    maxHeight: '80%',

    // marginHorizontal: 30,
    // overflow: "scroll"
  },
  modalWarnCont: {
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 7,
    borderColor: 'white',
    marginTop: -32,
    position: 'absolute',
    zIndex: 999,
  },
  modalWarnImg: {
    width: 38,
    height: 32,
  },
  closeModalCont: {
    width: 30,
    height: 30,
    borderRadius: 50,
    position: 'absolute',
    top: 8,
    right: 11,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalText: {
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 24,
    marginVertical: 8,
    fontFamily: 'GeneralSans-Bold',
  },
  modalText2: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400',
    color: '#7B8D95',
  },
  modalBtnContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 25,
  },
  modalBtn: {
    width: '90%',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtn1: {
    backgroundColor: '#FD003A',
    // marginRight: 10,
  },
  modalBtn2: {
    backgroundColor: '#EEEEEE',
    marginLeft: 10,
  },
  modalBtnTxt: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  modalBtnTxt1: {
    color: 'white',
  },
  modalBtnTxt2: {
    color: '#8E8E8E',
  },
});
