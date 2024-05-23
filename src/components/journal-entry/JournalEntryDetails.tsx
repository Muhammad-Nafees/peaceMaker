import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {STYLES} from '../../styles/globalStyles';
import {COLORS} from '../../constants/colors';
import {verticalScale} from '../../utils/metrics';
import {DATA, IFeeling} from '../../../data/data';

interface Feeling {
  name: string;
  _id: string;
}
interface Props {
  selectedFeeling: Feeling;
  onSelectFeeling: (feeling: Feeling) => void;
  data: IFeeling[];
}

const JournalEntryDetails = ({
  selectedFeeling,
  onSelectFeeling,
  data,
}: Props) => {
  const handleSelectFeeling = (feeling: Feeling) => {
    onSelectFeeling(feeling);
  };

  return (
    <View>
      <Text
        style={[
          STYLES.dev1__text16,
          {
            color: COLORS.neutral900,
            opacity: 0.5,
            fontFamily: 'Satoshi-Medium',
          },
        ]}>
        Feeling (Optional):
      </Text>
      <View style={{marginTop: 16}}>
        {data?.map((feeling: IFeeling) => {
          console.log(feeling.name);
          console.log(selectedFeeling);
          return (
            <TouchableOpacity
              style={[
                styles.feelingContainer,
                {
                  borderWidth: 1,
                  backgroundColor:
                    selectedFeeling.name == feeling.name
                      ? '#E9EFF0'
                      : '#ffffff',
                  borderColor:
                    selectedFeeling.name == feeling.name
                      ? COLORS.primary400
                      : 'transparent',
                },
              ]}
              key={feeling._id}
              onPress={() => handleSelectFeeling(feeling)}>
              <Text
                style={[
                  STYLES.dev1__text16,
                  {color: COLORS.neutral900, textTransform: 'capitalize'},
                ]}>
                {feeling.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default JournalEntryDetails;

const styles = StyleSheet.create({
  feelingContainer: {
    padding: 10,
    paddingVertical: verticalScale(24),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 1,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
