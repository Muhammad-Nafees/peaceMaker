import { horizontalScale } from "../../../../utils/metrics";
import {StyleSheet} from "react-native"

export const tipCardStyle = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalView: {
      width: "100%",
      backgroundColor: 'white',
      borderRadius: 15,
      alignItems: 'center',
      position: 'relative',
      height: "100%",
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
  