import {Platform} from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import uuid from 'react-native-uuid';

class IncomingCall {
  constructor() {
    this.currentCallId = null;
  }

  currentCallId: any = '';

  configure = (incomingcallAnswer: any, endIncomingCall: any) => {
    try {
      // this.setupCallKeep();
      Platform.OS === 'android' && RNCallKeep.setAvailable(true);
      RNCallKeep.addEventListener('answerCall', incomingcallAnswer);
      RNCallKeep.addEventListener('endCall', endIncomingCall);
    } catch (error: any) {
      console.error('initializeCallKeep error:', error?.message);
    }
  };

  //These emthod will setup the call keep.
  setupCallKeep = () => {
    try {
      // Platform.OS === 'android' && RNCallKeep.setAvailable(true);
      const androidOptions: any = {
        alertTitle: 'Permissions required',
        alertDescription:
          'This application needs to access your phone accounts',
        cancelButton: 'Cancel',
        okButton: 'Ok',
        foregroundService: {
          channelId: 'com.softwareAlliance.peaceMaker',
          channelName: 'Foreground service for my app',
          notificationTitle: 'Peacemaker is running on background',
          notificationIcon: 'ic_launcher',
        },
      };
      RNCallKeep.setup({
        ios: {
          appName: 'Peacemaker',
          supportsVideo: false,
          maximumCallGroups: '1',
          maximumCallsPerCallGroup: '1',
        },
        android: androidOptions,
      });
    } catch (error: any) {
      console.error('initializeCallKeep error:', error?.message);
    }
  };

  // Use startCall to ask the system to start a call - Initiate an outgoing call from this point
  startCall = ({handle, localizedCallerName}: any) => {
    // Your normal start call action
    RNCallKeep.startCall(this.getCurrentCallId(), handle, localizedCallerName);
  };

  reportEndCallWithUUID = (callUUID: any, reason: any) => {
    RNCallKeep.reportEndCallWithUUID(callUUID, reason);
  };

  //These method will end the incoming call
  endIncomingcallAnswer = () => {
    RNCallKeep.rejectCall(this.currentCallId);
    this.currentCallId = null;
    this.removeEvents();
  };

  //These method will remove all the event listeners
  removeEvents = () => {
    RNCallKeep.removeEventListener('answerCall');
    RNCallKeep.removeEventListener('endCall');
  };

  //These method will display the incoming call
  displayIncomingCall = (callerName: string | undefined) => {
    Platform.OS === 'android' && RNCallKeep.setAvailable(false);
    RNCallKeep.displayIncomingCall(
      this.getCurrentCallId(),
      'Video Call',
      callerName,
      'number',
      true,
    );
  };

  //Bring the app to foreground
  backToForeground = () => {
    RNCallKeep.backToForeground();
  };

  //Return the ID of current Call
  getCurrentCallId = () => {
    if (!this.currentCallId) {
      this.currentCallId = uuid.v4();
    }
    return this.currentCallId;
  };

  //These Method will end the call
  endAllCall = () => {
    RNCallKeep.endAllCalls();
    this.currentCallId = null;
    this.removeEvents();
  };
}

const Incomingvideocall = new IncomingCall();

export default Incomingvideocall;
