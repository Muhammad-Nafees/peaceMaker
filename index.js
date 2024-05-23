/**
 * @format
 */
import { AppRegistry, Platform } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import invokeApp from 'react-native-invoke-app';

import messaging from "@react-native-firebase/messaging";
import Incomingvideocall from './src/utils/incoming-video-call';
import Navigation from './src/utils/appNavigation'
import socketServcies from './src/utils/socketServices';
import RNCallKeep from 'react-native-callkeep';

Incomingvideocall.setupCallKeep();


const handleNotifications = (remoteMessage) => {
    if (Platform.OS === "ios") return;
    const data = remoteMessage;
    let callerInfo;
    let type = 'unknown';
    if (remoteMessage?.data?.info) {
        const dataInfo = JSON.parse(data?.data?.info);
        callerInfo = dataInfo.callerInfo;
        type = dataInfo.type;
    }

    switch (type) {
        case 'CALL_INITIATED':
            const incomingCallAnswer = ({ callUUID }) => {
                console.log("🚀 ~ file: index.js:34 ~ incomingCallAnswer ~ callUUID:", callUUID)
                RNCallKeep.endAllCalls();
                Incomingvideocall.backToForeground();
                setTimeout(() => {
                    Navigation.navigate('CheckBiometric', {
                        isGroup: callerInfo.isGroup ? 1 : 0,
                        recentparams: {
                            chatId: callerInfo.chatId,
                            title: callerInfo.title,
                            fromHome: true,
                            participants: callerInfo?.participants,
                        },
                        handleNotificationClickGoto: "CallingScreen",
                    });

                }, 1000)
                Incomingvideocall.endIncomingcallAnswer(callUUID);
            };

            const endIncomingCall = () => {
                socketServcies.emit('declineCall', callerInfo);
                console.log('Ending incoming call');

                Incomingvideocall.endIncomingcallAnswer();
            };

            Incomingvideocall.configure(incomingCallAnswer, endIncomingCall);
            // Incomingvideocall.endAllCall();
            Incomingvideocall.displayIncomingCall(callerInfo.title);
            // Incomingvideocall.backToForeground();

            break;

        case 'CALL_DECLINED':
            Incomingvideocall.endAllCall();
            break;

        default:
            console.log('Other Notifications: Unknown');
    }
}

const firebaseListener = async (remoteMessage) => handleNotifications(remoteMessage);

messaging().setBackgroundMessageHandler(firebaseListener);

function HeadlessCheck({ isHeadless }) {
    if (isHeadless) {
        // App has been launched in the background by iOS, ignore
        return null;
    }

    return <App />;
}


if (Platform.OS === 'android') {
    // RNCallKeepBackgroundMessagingService
    // RNFirebaseBackgroundMessage
    // RNCallKeepBackgroundMessage

    AppRegistry.registerHeadlessTask(

        'RNFirebaseBackgroundMessage',

        () => { invokeApp() }

    )
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
