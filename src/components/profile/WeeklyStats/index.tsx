import React from 'react';
import {View, ActivityIndicator} from 'react-native';
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryTheme,
  VictoryScatter,
  VictoryGroup,
} from 'victory-native';
import {STYLES} from '../../../styles/globalStyles';
import {horizontalScale, verticalScale} from '../../../utils/metrics';
import {COLORS} from '../../../constants/colors';
import {useIsFocused} from '@react-navigation/native';
import {useAppSelector} from '../../../redux/app/hooks';
import {ApiService} from '../../../utils/ApiService';
import {formatDate} from '../../../utils/helpers';

type DailyStateChartData = {
  state: number;
  value: number;
};

type DailyState = {
  _id: string;
  dailyStateType: string;
  value: number;
  dateTime: string;
};

type DailyStatesData = {
  dailyStates: DailyState[];
  date: string;
};

const defaultWeekdaysIndexs = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const tempWeeklyData = [
  {
    color: COLORS.spiritual,
    data: [
      {state: 1, value: 0},
      {state: 2, value: 0},
      {state: 3, value: 0},
      {state: 4, value: 0},
      {state: 5, value: 0},
      {state: 6, value: 0},
      {state: 7, value: 0},
    ],
  },
  {
    color: COLORS.mental,
    data: [
      {state: 1, value: 0},
      {state: 2, value: 0},
      {state: 3, value: 0},
      {state: 4, value: 0},
      {state: 5, value: 0},
      {state: 6, value: 0},
      {state: 7, value: 0},
    ],
  },
  {
    color: COLORS.emotional,
    data: [
      {state: 1, value: 0},
      {state: 2, value: 0},
      {state: 3, value: 0},
      {state: 4, value: 0},
      {state: 5, value: 0},
      {state: 6, value: 0},
      {state: 7, value: 0},
    ],
  },
  {
    color: COLORS.social,
    data: [
      {state: 1, value: 0},
      {state: 2, value: 0},
      {state: 3, value: 0},
      {state: 4, value: 0},
      {state: 5, value: 0},
      {state: 6, value: 0},
      {state: 7, value: 0},
    ],
  },
  {
    color: COLORS.physical,
    data: [
      {state: 1, value: 0},
      {state: 2, value: 0},
      {state: 3, value: 0},
      {state: 4, value: 0},
      {state: 5, value: 0},
      {state: 6, value: 0},
      {state: 7, value: 0},
    ],
  },
];

type DailyStatesArray = DailyStatesData[];
type WeeklyChartsData = {data: DailyStateChartData[]; color: string}[];

const WeeklyState = ({
  userId = '',
  fetchCharts = 0,
  selectedRange = [],
  dayNames = [''],
}) => {
  const [weeklyChartData, setWeeklyChartData] =
    React.useState<WeeklyChartsData>([]);
  const [loading, setLoading] = React.useState(false);

  const isFocused = useIsFocused();
  const {tokens} = useAppSelector(state => state.user);

  function getCurrentWeekFirstAndLastDates() {
    const currentDate = new Date();
    const currentDayOfWeek = currentDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const firstDayOfWeek = new Date(currentDate); // Clone the current date
    const lastDayOfWeek = new Date(currentDate); // Clone the current date

    // Calculate the first day of the week (Sunday)
    firstDayOfWeek.setDate(currentDate.getDate() - currentDayOfWeek);

    // Calculate the last day of the week (Saturday)
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);

    // Return the first and last day of the current week
    return {
      firstDayOfWeek,
      lastDayOfWeek,
    };
  }

  function getRecentObjects(arr: DailyState[], property: string): DailyState[] {
    const uniqueValues = new Map();

    arr.forEach(obj => {
      const value = obj[property as keyof DailyState];
      if (
        !uniqueValues.has(value) ||
        obj.dateTime > uniqueValues.get(value).dateTime
      ) {
        uniqueValues.set(value, obj);
      }
    });

    return Array.from(uniqueValues.values());
  };
  
  const addDataAtGivenindex = (
    temp: WeeklyChartsData,
    value: number,
    dateTime: string,
    index: number,
    colorName: string,
    weekdaysIndexs = defaultWeekdaysIndexs,
  ) => {
    const dateString = dateTime;
    const dateObject = new Date(dateString);

    const options: any = {weekday: 'long'}; // 'long' gives you the full day name

    const dayName = new Intl.DateTimeFormat('en-US', options)
      .format(dateObject)
      .toLowerCase();

    const i = weekdaysIndexs[dayName as keyof typeof weekdaysIndexs];

    const exData = [...temp[index]?.data];
    exData[i].value = value;
    // exData[index].state = i;
    temp[index] = {
      color: COLORS[colorName as keyof typeof COLORS],
      data: [...exData],
    };
  };

  function completeDayNames(abbreviatedNames: string[]) {
    const fullDayNames = abbreviatedNames.map(abbrevName => {
      switch (abbrevName.toLowerCase()) {
        case 'sun':
          return 'sunday';
        case 'mon':
          return 'monday';
        case 'tue':
          return 'tuesday';
        case 'wed':
          return 'wednesday';
        case 'thu':
          return 'thursday';
        case 'fri':
          return 'friday';
        case 'sat':
          return 'saturday';
        default:
          return abbrevName; // Return the original if it doesn't match any known abbreviation
      }
    });

    return fullDayNames;
  }

  const getUserDailyState = async (date1?: string, date2?: string) => {
    setWeeklyChartData([]);
    setLoading(true);
    try {
      console.log('Fetching charts --------------------------');

      const {firstDayOfWeek, lastDayOfWeek} = getCurrentWeekFirstAndLastDates();
      const minDate = date1 ? date1 : formatDate(firstDayOfWeek);
      const maxDate = date2 ? date2 : formatDate(lastDayOfWeek);

      const url = `daily-state/weekly/chart?userId=${userId}&minDate=${minDate}&maxDate=${maxDate}`;
      const weeklyStateReq = new ApiService(url, tokens.accessToken);
      const response = await weeklyStateReq.Get();
      console.log(
        '🚀 ~ file: index.tsx:224 ~ getUserDailyState ~ response:',
        response,
      );

      if (response?.status !== 200) return setLoading(false);
      const resData: DailyStatesArray = response.data;

      // let temp: WeeklyChartsData = [...tempWeeklyData];
      let temp: WeeklyChartsData = JSON.parse(JSON.stringify(tempWeeklyData));

      let weekdaysIndexs: any = defaultWeekdaysIndexs;
      if (dayNames.length > 1) {
        completeDayNames(dayNames).forEach((el, i) => {
          weekdaysIndexs[el] = i;
        });
      }

      resData.forEach(elem => {
        const inputArray = elem.dailyStates;
        const filteredArray = getRecentObjects(inputArray, 'dailyStateType');
        filteredArray.forEach(el => {
          const stateType = el.dailyStateType.toLowerCase();
          let stateTypeIndex: number = 0;
          if (stateType === 'spiritual') stateTypeIndex = 0;

          if (stateType === 'mental') stateTypeIndex = 1;

          if (stateType === 'emotional') stateTypeIndex = 2;

          if (stateType === 'social') stateTypeIndex = 3;

          if (stateType === 'physical') stateTypeIndex = 4;

          addDataAtGivenindex(
            temp,
            el.value,
            elem.date,
            stateTypeIndex,
            stateType,
            weekdaysIndexs,
          );
        });
      });
      setWeeklyChartData(temp);
      setLoading(false);
    } catch (err) {
      console.log('🚀~ getUserDailyState ~ err:', err);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isFocused) getUserDailyState();
  }, [isFocused]);

  React.useEffect(() => {
    if (fetchCharts > 0) {
      getUserDailyState(selectedRange[0], selectedRange[1]);
    }
  }, [fetchCharts]);

  return (
    <View>
      {loading ? (
        <ActivityIndicator
          color="#8eb26f"
          size={30}
          style={{paddingVertical: 10}}
        />
      ) : (
        <VictoryChart
          theme={VictoryTheme.material}
          domainPadding={20}
          width={horizontalScale(370)}
          height={verticalScale(420)}
          padding={{
            bottom: verticalScale(59),
            top: verticalScale(3),
            left: horizontalScale(50),
            right: horizontalScale(60),
          }}>
          <VictoryAxis
            tickValues={[1, 2, 3, 4, 5, 6, 7]}
            tickFormat={
              dayNames.length > 1
                ? dayNames
                : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            }
            style={{
              axis: {stroke: 'none'},
              ticks: {stroke: 'none'},
              grid: {
                stroke: 'none',
                strokeDasharray: 'none',
              },
              tickLabels: {
                fill: COLORS.primary400,
              },
            }}
          />
          <VictoryAxis
            dependentAxis
            tickValues={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
            tickFormat={x => `${x}%`}
            style={{
              axis: {stroke: 'none'},
              ticks: {stroke: 'none'},
              grid: {
                stroke: '#EDEDED',
                strokeWidth: '2',
                strokeDasharray: 'none',
              },
              tickLabels: {
                fill: '#8EB26F',
              },
            }}
          />
          <VictoryGroup offset={5}>
            {weeklyChartData.map(e => (
              <VictoryBar
                key={e.color}
                data={e.data}
                x="state"
                y="value"
                barWidth={5}
                style={{
                  data: {fill: e.color},
                }}
              />
            ))}
          </VictoryGroup>
        </VictoryChart>
      )}
    </View>
  );
};

export default WeeklyState;
