import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  Text,
} from 'react-native';
import MaxVideoView from './MaxVideoView';
import MinUidContext from './MinUidContext';
import MaxUidContext from './MaxUidContext';
import PropsContext, {role} from './PropsContext';
import LinearGradient from 'react-native-linear-gradient';
import {useAppSelector} from '../../../../redux/app/hooks';
import {UidInterface} from './RtcContext';

const layout = (len: number, isDesktop: boolean = true) => {
  console.log('layout');
  const rows = Math.round(Math.sqrt(len));
  const cols = Math.ceil(len / rows);
  let [r, c] = isDesktop ? [rows, cols] : [cols, rows];
  return {
    matrix:
      len > 0
        ? [
            ...Array(r - 1)
              .fill(null)
              .map(() => Array(c).fill('X')),
            Array(len - (r - 1) * c).fill('X'),
          ]
        : [],
    dims: {r, c},
  };
};

const GridVideo: React.FC = () => {
  console.log('re render grid');
  const max = useContext(MaxUidContext);
  const min = useContext(MinUidContext);
  const {rtcProps, styleProps} = useContext(PropsContext);
  const user = useAppSelector((state: any) => state.user.data);

  const users =
    rtcProps.role === role.Audience
      ? [...max, ...min].filter(user => user.uid !== 'local')
      : [...max, ...min];
  let onLayout = (e: any) => {
    setDim([
      e.nativeEvent.layout.width,
      e.nativeEvent.layout.height,
      e.nativeEvent.layout.width > e.nativeEvent.layout.height,
    ]);
  };
  const [dim, setDim]: [
    [number, number, boolean],
    Dispatch<SetStateAction<[number, number, boolean]>>,
  ] = useState([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);
  const isDesktop = dim[0] > dim[1] + 100;
  let {matrix, dims} = useMemo(
    () => layout(users.length, isDesktop),
    [users.length, isDesktop],
  );

  const cameraOffView = (e: UidInterface) => {
    const firstName =
      e.uid === 'local'
        ? user.firstName
        : e.name?.split(' ')[0] ?? 'Participant';
    const lastName =
      e.uid === 'local'
        ? user.lastName
        : e.name?.split(' ')[1] ?? 'Participant';
    return (
      <>
        <>
          <View style={[style.nameBox, {width: 47, height: 47}]}>
            <Text style={{fontSize: 14, fontWeight: '700', color: 'white'}}>
              {`${firstName?.slice(0, 1).toUpperCase()}${lastName
                ?.slice(0, 1)
                .toUpperCase()}`}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '500',
              color: 'white',
              marginTop: 5,
              textTransform: 'capitalize',
            }}>
            {e.uid === 'local' ? 'You' : firstName}
          </Text>
        </>
      </>
    );
  };

  return (
    <LinearGradient
      colors={['#3b5266', '#0e2646', '#0e2646']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      locations={[0, 0.5, 1]}
      style={{height: '100%'}}>
      <View style={[style.full]} onLayout={onLayout}>
        <FlatList
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{
            justifyContent: 'space-around',
            flexWrap: 'wrap',
          }}
          horizontal={false}
          numColumns={2}
          data={matrix}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({item, index}) => {
            const r = item;
            const ridx = index;
            return (
              <>
                {r.map((c, cidx) => (
                  <>
                    <View
                      key={cidx}
                      style={[
                        style.grpSecondCamera,
                        {
                          height:
                            (Dimensions.get('window').height - 320) /
                            (matrix.length <= 2
                              ? 2
                              : Math.round(matrix.length / 2)),
                        },
                      ]}>
                      {!users[ridx * dims.c + cidx].video ? (
                        cameraOffView(users[ridx * dims.c + cidx])
                      ) : rtcProps.role === role.Audience &&
                        users[ridx * dims.c + cidx].uid === 'local' ? null : (
                        <MaxVideoView
                          user={users[ridx * dims.c + cidx]}
                          key={users[ridx * dims.c + cidx].uid}
                        />
                      )}
                    </View>
                  </>
                ))}
              </>
            );
          }}
        />
      </View>
    </LinearGradient>
  );
};

const style = StyleSheet.create({
  full: {
    flex: 1,
    height: 300,
    marginTop: 60,

    // flexDirection: 'row',
    // flexWrap: 'wrap',
    // columnGap: 15,
    paddingBottom: 233 - 100,
    // height: "100%",
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
    width: '45%',
    height: '50%',
    backgroundColor: 'red',
    borderWidth: 1,
  },
  gridVideoContainerInner: {
    // borderColor: '#fff',
    // borderWidth:2,
    flex: 1,
    margin: 1,
  },
  col: {
    // flex: 1,
    marginHorizontal: 'auto',
    width: '100%',
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
});

export default GridVideo;
