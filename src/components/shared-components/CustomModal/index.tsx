import {
  Modal,
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {horizontalScale, verticalScale} from '../../../utils/metrics';
import {BlurView} from '@react-native-community/blur';
import {Tarot} from '../../journal-entry/Tarot';

interface Props {
  visible: boolean;
  close: any;
  closeFn?: any;
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
  tarot?: boolean;
  isLoading?: boolean;
  btnTxtColor?: string;
}

export default function CustomModal({
  visible = false,
  close,
  closeFn,
  icon,
  title,
  description,
  color,
  btnBgColor,
  imageUrl,
  leftButton,
  rightButton,
  isButtons = true,
  onConfirm,
  tarot = false,
  isLoading = false,
  btnTxtColor = "white"
}: Props) {
  return (
    <Modal
      statusBarTranslucent
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={close}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalWarnCont}>
            <Image
              resizeMode="contain"
              style={
                imageUrl
                  ? {width: horizontalScale(42), height: verticalScale(42)}
                  : styles.modalWarnImg
              }
              source={
                imageUrl
                  ? imageUrl
                  : require('../../../../assets/images/warning1.png')
              }
            />
          </View>
          <TouchableWithoutFeedback onPress={close}>
            <View style={styles.closeModalCont}>
              <Icon name="x" color="#7D7D7D99" size={18} />
            </View>
          </TouchableWithoutFeedback>
          <Text style={[styles.modalText, {color: color}]}>{title}</Text>

          {description ? (
            <Text
              style={[
                styles.modalText2,
                {
                  textAlign: 'center',
                  fontFamily: 'GeneralSans-Medium',
                  paddingHorizontal: 8,
                },
              ]}>
              {description}
            </Text>
          ) : null}
          {isButtons && (
            <View style={styles.modalBtnContainer}>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  styles.modalBtn1,
                  {backgroundColor: btnBgColor!},
                ]}
                onPress={onConfirm}>
                <Text style={[styles.modalBtnTxt, styles.modalBtnTxt1, {color: btnTxtColor}]}>
                  {isLoading ? (
                    <ActivityIndicator color="#fff" size={22} />
                  ) : leftButton ? (
                    leftButton
                  ) : (
                    'Confirm'
                  )}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={closeFn ? closeFn : close}
                style={[styles.modalBtn, styles.modalBtn2]}>
                <Text style={[styles.modalBtnTxt, styles.modalBtnTxt2]}>
                  {rightButton ? rightButton : 'Cancel'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    width: horizontalScale(308),
    backgroundColor: 'white',
    borderRadius: 15,
    alignItems: 'center',
    position: 'relative',
  },
  modalWarnCont: {
    width: 66 + 10,
    height: 66 + 10,
    borderRadius: 50,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 7,
    borderColor: 'white',
    marginTop: -32,
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
    fontWeight: '500',
    color: '#7B8D95',
  },
  modalBtnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 25,
  },
  modalBtn: {
    width: 116,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtn1: {
    backgroundColor: '#FD003A',
    marginRight: 10,
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
