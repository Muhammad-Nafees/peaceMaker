import React, {useEffect, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import {Text} from 'react-native';
import {JOURNALENTRY_RECORDS} from '../../../data/data';
import {STYLES} from '../../styles/globalStyles';
import {moderateScale, verticalScale} from '../../utils/metrics';
import {COLORS} from '../../constants/colors';
import {JournalEntry, JournalEntryRecord} from '../../interface/types';
import {ApiService} from '../../utils/ApiService';
import {useAppSelector} from '../../redux/app/hooks';
import {format} from 'date-fns';

const JournalEntryRecords = ({navigation}: any) => {
  const [allJournalEntries, setAllJournalEntries] = useState<
    (JournalEntry | null)[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);

  const {tokens, data: user} = useAppSelector(state => state.user);

  const renderRecords = ({
    item,
    index,
  }: {
    item: JournalEntry | null;
    index: number;
  }) => {
    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => {
          console.log({
            data: item,
            entryType: item?.feelings[0]?.type,
          });
          // return;
          navigation.navigate('ViewSummaryScreen', {
            data: item,
            entryType: item?.feelings[0]?.type,
          });
        }}>
        <Text
          style={[
            STYLES.dev1__text15,
            {
              fontWeight: '500',
              fontFamily: 'GeneralSans-Medium',
              color: '#000',
            },
          ]}>
          Journal Entry {index + 1}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: verticalScale(10),
          }}>
          <Text
            style={[
              STYLES.dev1__text13,
              {
                fontWeight: '500',
                fontFamily: 'GeneralSans-Medium',
                color: COLORS.mainGreen,
              },
            ]}>
            {item?.manualDate || item?.createdAt
              ? format(
                  new Date(item?.manualDate ?? item?.createdAt),
                  'd MMMM yyyy',
                )
              : null}
          </Text>
          <Text
            style={[
              STYLES.dev1__text13,
              {
                fontWeight: '500',
                fontFamily: 'GeneralSans-Medium',
                color: COLORS.mainGreen,
                textTransform: 'capitalize',
              },
            ]}>
            {item?.feelings ? item?.feelings[0]?.type?.replace('-', ' ') : null}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getAllJournalEntries = async () => {
    setIsLoading(true);
    try {
      const url = `daily-state/journal-entry?userId=${user._id}&page=1&pageSize=100&dailyStateType=common`;
      const journalEntry = new ApiService(url, tokens.accessToken);

      const response = await journalEntry.Get();
      

      if (response?.status === 200) {
        let arr: JournalEntry[] = [];
        response.data.forEach(
          (elem: {dailyStateType: string; journalEntry: JournalEntry}) => {
            if (!elem.journalEntry) return;
            const isLocation = elem.journalEntry?.location?.coordinates?.find(
              l => l !== 0,
            );

            const dateObj = elem.journalEntry?.manualDate
              ? new Date(elem.journalEntry.manualDate + 'T00:00:00')
              : new Date();

            arr.push({
              ...elem.journalEntry,
              location: !isLocation ? null : elem.journalEntry?.location,
              manualDate: dateObj,
            });
          },
        );

        const filteredData = arr.sort(
          (a, b) =>
            new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf(),
        );

        setAllJournalEntries([...filteredData].reverse());
        setIsLoading(false);
      }
    } catch (err) {
      console.log('🚀~ getUserDailyState ~ err:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllJournalEntries();
  }, []);

  return (
    <View style={[STYLES.dev1__homeContainer, {paddingBottom: 0}]}>
      {isLoading ? (
        <ActivityIndicator size="large" style={{marginTop: 20}} />
      ) : (
        <FlatList
        showsVerticalScrollIndicator={false}
          data={allJournalEntries}
          renderItem={renderRecords}
          keyExtractor={(_, i) => i.toString()}
        />
      )}
    </View>
  );
};

export default JournalEntryRecords;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(8),
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 1,
    
  },
});
