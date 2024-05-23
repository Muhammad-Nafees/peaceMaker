import {BlurView} from '@react-native-community/blur';
import React, {useEffect, useState} from 'react';
import {Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {COLORS} from '../../constants/colors';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../utils/metrics';
import {STYLES} from '../../styles/globalStyles';
import CloseIcon from 'react-native-vector-icons/Feather';
import CheckIcon from 'react-native-vector-icons/FontAwesome';

interface Props {
  screenName?: string;
  data: any;
  visible: boolean;
  onClose: () => void;
  onCancel: () => void;
  setSelectedValue: any;
  selectedValue: string;
}

const DailyStateModal = ({
  screenName,
  data,
  visible,
  onClose,
  onCancel,
  setSelectedValue,
  selectedValue: selectedValueD,
}: Props) => {
  const [isCheck, setIsCheck] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [defaultSelectedValue, setDefaultSelectedValue] =
    useState(selectedValueD);

  const handleSelectItem = (id: string, selectedValue: string) => {
    const isValueSelected = selectedItem?.includes(selectedValue);
    if (isValueSelected) {
      setIsCheck(false);
      setSelectedItem(null);
      setDefaultSelectedValue(selectedValueD);
      setSelectedValue('');
    } else {
      setIsCheck(true);
      setDefaultSelectedValue(selectedValue);
      setSelectedItem(selectedValue);
      setSelectedValue(selectedValue);
    }
  };

  useEffect(() => {
    if(visible)setDefaultSelectedValue(selectedValueD);
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <BlurView style={styles.blurView} blurType="dark" blurAmount={1} />

      <View style={styles.modalContainer}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <TouchableOpacity
            onPress={() => {
              setSelectedItem(null);
              onCancel();
            }}>
            <View style={styles.icon}>
              <CloseIcon name="x" color="#7D7D7D99" size={18} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              onClose();
            }}>
            <Text
              style={{
                color: COLORS.mainGreen,
              }}>
              Done
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{paddingVertical: verticalScale(8), width: '100%'}}>
          {data.map((item: any) => {
            return (
              <TouchableOpacity
                key={item._id ? item._id : item.id}
                onPress={() => handleSelectItem(item._id, item.text)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: COLORS.inActive,
                }}>
                <Text
                  style={[
                    STYLES.dev1__text15,
                    {
                      color: '#7B8D95',
                      paddingVertical: verticalScale(14),
                      width: horizontalScale(300),
                    },
                  ]}>
                  {item.text}
                </Text>
                {defaultSelectedValue &&
                defaultSelectedValue?.includes(item.text) ? (
                  <CheckIcon
                    name="check"
                    color={'#8EB26F'}
                    size={moderateScale(20)}
                  />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Modal>
  );
};

export default DailyStateModal;

const styles = StyleSheet.create({
  blurView: {
    position: 'absolute',
    top: -verticalScale(40),
    left: 0,
    bottom: 0,
    right: 0,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 20,
  },
  icon: {
    width: 30,
    height: 30,
    borderRadius: 50,

    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
