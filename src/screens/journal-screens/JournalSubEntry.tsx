import React, {useEffect, useState} from 'react';
import {Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {IFeeling, IMODALDATA, MODAL_DATA} from '../../../data/data';
import {moderateScale, verticalScale} from '../../utils/metrics';
import {STYLES} from '../../styles/globalStyles';
import {COLORS} from '../../constants/colors';
import JournalEntryHeader from '../../components/journal-entry/JournalEntryHeader';
import Icon from 'react-native-vector-icons/Ionicons';
import DailyStateModal from '../../components/daily-state/DailyStateModal';
import {DailyStateEntry} from '../../interface/types';

interface RouteData {
  params: {name: string; journalEntryData: DailyStateEntry};
}

const JournalSubEntry = ({
  navigation,
  route,
}: {
  navigation: any;
  route: RouteData;
}) => {
  const {name, journalEntryData} = route.params;

  const [data, setData] = useState<IFeeling[] | undefined>();
  const [selectedValues, setSelectedValues] = useState<{[key: string]: string}>(
    {},
  );
  const [modal, setModal] = useState({
    data: [] as IMODALDATA[],
    isModalVisible: false,
    itemId: '', // Track the item ID that opened the modal
  });

  // useEffect(() => {
  //   if (name === 'event oriented') {
  //     setData(EVENT_DATA);
  //   } else {
  //     setData(TRAUMA_DATA);
  //   }
  // }, []);

  useEffect(() => {
    let arr: IFeeling[] = [];
    console.log(
      '🚀 ~ file: JournalSubEntry.tsx:52 ~ useEffect ~ journalEntryData:',
      journalEntryData,
    );
    journalEntryData.feelings.forEach(subFeeling => {
      let answers: {
        _id: string;
        text: string;
        tips: string[];
        tipQuestion: string | null;
      }[] = [];
      subFeeling.answers.forEach(answer => {
        let tips: string[] = [];
        answer.tips.forEach(t => {
          tips.push(t.tip);
        });
        answers.push({
          _id: answer._id,
          text: answer.answer,
          tips: tips,
          tipQuestion: answer.tipQuestion,
        });
      });
      arr.push({
        _id: subFeeling._id,
        name: subFeeling.type.replace('-', ' ').toLowerCase(),
        data: answers,
      });
    });

    setData(arr);
  }, []);

  const handleShowModal = (selectedData: any, itemId: string) => {
    if (
      selectedData?.length &&
      (selectedData[0]?.text?.toLowerCase() === 'none' ||
        selectedData[0]?.text?.toLowerCase() === '')
    ) {
      console.log('log');

      const selectedCategory = data?.find(({_id}) => _id === itemId);
      const isSubCategory = selectedData[0]?.text;
      console.log(
        '🚀 ~ file: JournalSubEntry.tsx:94 ~ handleShowModal ~ isSubCategory:',
        isSubCategory,
      );
      if (!isSubCategory.length) return;
      const subEntryData = selectedCategory?.data?.find(
        e => e.text.toLowerCase() === isSubCategory.toLowerCase(),
      );

      navigation.navigate('JournalEntryDescription', {
        ...route.params,
        category: selectedCategory,
        subCategory: {
          [itemId]: selectedData[0]?.text,
        },
        tipQuestion: subEntryData?.tipQuestion,
      });
      return;
    }
    setModal({
      data: selectedData,
      isModalVisible: true,
      itemId: itemId,
    });
  };

  const handleCloseModal = (id?: string) => {
    // console.log('closing modal');
    // alert("working")
    // console.log(
    //   '🚀 ~ file: JournalSubEntry.tsx:119 ~ handleCloseModal ~ modal.itemId:',
    //   modal.itemId,
    // );
    // console.log("🚀 ~ file: JournalSubEntry.tsx:124 ~ handleCloseModal ~ selectedValues:", selectedValues)
    if(modal.itemId !== Object.keys(selectedValues)[0]) return;

    const selectedCategory = data?.find(({_id}) => _id === modal.itemId);
    const isSubCategory = Object.values(selectedValues).filter(sc => sc !== '');

    const subEntryData = selectedCategory?.data?.find(
      e => e.text.toLowerCase() === isSubCategory[0]?.toLowerCase(),
    );

    if (!isSubCategory.length) return;

    // setModal({data: [], isModalVisible: false, itemId: ''});
    // return;
    navigation.navigate('JournalEntryDescription', {
      ...route.params,
      category: selectedCategory,
      subCategory: selectedValues,
      tipQuestion: subEntryData?.tipQuestion,
    });
    setModal({data: [], isModalVisible: false, itemId: ''});
  };

  const handleCancelModal = () => {
    setModal({data: [], isModalVisible: false, itemId: ''});
  };

  const handleModalSelect = (
    selectedText: string,
    selectedId?: string,
    callback?: any,
  ) => {
    // setSelectedValues(prevSelectedValues => ({
    //   ...prevSelectedValues,
    //   [modal.itemId]: selectedText, // Update the selected value for the specific item
    // }));
    if (selectedText)
      setSelectedValues({
        [modal.itemId]: selectedText, // Update the selected value for the specific item
      });

    // if (callback) callback();
  };

  return (
    <JournalEntryHeader>
      {data?.map((feeling: IFeeling) => {
        const selectedValue = selectedValues[feeling._id] || '';
        return (
          <TouchableOpacity
            key={feeling._id}
            style={styles.cardContainer}
            onPress={() => handleShowModal(feeling?.data, feeling._id)}>
            <Text
              style={[
                STYLES.dev1__text15,
                {color: '#4F4F4F', textTransform: 'capitalize'},
              ]}>
              {selectedValue === '' || selectedValue.toLowerCase() === 'none'
                ? feeling.name
                : selectedValue}
            </Text>
            <Icon
              name="chevron-forward-outline"
              size={24}
              color={COLORS.primary400}
            />
          </TouchableOpacity>
        );
      })}
      <DailyStateModal
        screenName="journalEntry"
        data={modal.data}
        visible={modal.isModalVisible}
        onClose={handleCloseModal}
        onCancel={handleCancelModal}
        setSelectedValue={handleModalSelect}
        selectedValue={Object.values(selectedValues)[0]}
      />
    </JournalEntryHeader>
  );
};

export default JournalSubEntry;

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: verticalScale(10),
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
});
