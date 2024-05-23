import {useEffect, useState, useRef} from 'react';
import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import {horizontalScale, verticalScale} from '../../utils/metrics';
import {STYLES} from '../../styles/globalStyles';
import {COLORS} from '../../constants/colors';
import FeatherIcon from 'react-native-vector-icons/Feather';
import {format} from 'date-fns';

const SummaryDateTime = ({
  data,
  time,
  formattedTime,
  setLocation: setRouteLocation,
}: any) => {
  const [isEditableText, setIsEditableText] = useState<boolean>(false);
  const userLocation = data?.location?.includes('undefined')
    ? ''
    : data?.location;
  const [location, setLocation] = useState<string | undefined>(userLocation);
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleInputFocus = () => {
    setIsFocused(true);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
  };

  const handleEditableTextChange = () => {
    setIsEditableText(prevState => !prevState);
  };

  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  }, [isEditableText]);

  useEffect(() => {
    setLocation(userLocation);
  }, [data?.location]);
  return (
    <View style={{gap: 16, marginTop: verticalScale(32)}}>
      <Text
        style={[
          STYLES.dev1__text15,
          {color: COLORS.primary400, fontFamily: 'GeneralSans-Medium'},
        ]}>
        Time & Date
      </Text>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 50}}>
        <Text
          style={[
            STYLES.dev1__text15,
            {color: '#324C51', fontFamily: 'GeneralSans-Regular'},
          ]}>
          Time:
        </Text>
        <Text
          style={[
            STYLES.dev1__text15,
            {color: '#324C51', fontFamily: 'GeneralSans-Medium'},
          ]}>
          {formattedTime
            ? formattedTime
            : format(
                time
                  ? new Date(time)
                  : data?.datetime
                  ? new Date(data?.datetime)
                  : new Date(),
                'h:mm a',
              )}
        </Text>
      </View>
      {userLocation ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: isEditableText ? -verticalScale(14.5) : verticalScale(0),
          }}>
          <Text
            style={[
              STYLES.dev1__text15,
              {color: '#324C51', fontFamily: 'GeneralSans-Regular'},
            ]}>
            Location:
          </Text>
          {isEditableText ? (
            <TextInput
              ref={inputRef}
              value={location}
              onChangeText={(text: string) => {
                setLocation(text);
                if (setRouteLocation) setRouteLocation(text);
              }}
              multiline={true}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              style={[
                STYLES.dev1__text15,
                {
                  color: '#324C51',
                  fontFamily: 'GeneralSans-Medium',
                  paddingLeft: horizontalScale(25),
                  width: horizontalScale(210),
                  paddingTop: horizontalScale(10),
                },
              ]}
            />
          ) : (
            <Text
              style={[
                STYLES.dev1__text15,
                {
                  color: '#324C51',
                  fontFamily: 'GeneralSans-Medium',
                  paddingLeft: horizontalScale(25),
                  width: horizontalScale(210),
                  textAlign: 'left',
                },
              ]}>
              {location}
            </Text>
          )}
          <TouchableOpacity onPress={handleEditableTextChange}>
            <FeatherIcon
              name="edit-3"
              size={18}
              color="#000"
              style={{marginLeft: horizontalScale(50)}}
            />
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

export default SummaryDateTime;
