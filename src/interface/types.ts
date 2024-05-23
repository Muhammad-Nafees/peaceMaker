export type AuthStackParamList = {
  AccountabilityBuddies: undefined;
  LoginScreen: undefined;
  AccountabilityPartner: any;
  CompleteProfile: undefined;
  HomeScreen: undefined;
  ForgetPassword: undefined;
  RegisterScreen: undefined;
  DashboardScreen: undefined;
  Home: undefined;
  MyScheduleScreen: undefined;
  SOSNotifyScreen: undefined;
  MapScreen: any;
  ChatInfo: undefined;
  ChatMessagesScreen: undefined;
  ChatMedias: undefined;
  CallingScreen: undefined;
  StateDetailsScreen: any;
  DailyStateMap: any;
  PainChartScreen: any;
  JournalSubEntry: any;
  JournalEntryRecords: any;
  JournalEntryDescription: any;
  ConversationStarters: any;
  VerifyScreen: {};
  CreateNewPassword: {};
  // Add other routes here...
};

export type Participant = {
  userId: string;
  status: string;
  _id: string;
  firstName: string;
  lastName: string;
  photo?: string | null;
  photoUrl?: string | null;
  isMuted?: boolean;
};

export type ReceivedBy = {
  userId: string;
  status: string;
  deleted: boolean;
  _id: string;
  createdAt: string;
};

export type Message = {
  body: string;
  sentBy: string;
  receivedBy: ReceivedBy[];
  deleted: boolean;
  _id: string;
  createdAt: string;
  senderId: string;
  firstName: string;
  lastName: string;
  mediaUrls: string[] | null;
  removedUsers: [string];
  groupName: string | undefined;
};

export type LastMessage = Message;

export type Chat = {
  _id: string;
  chatType: string;
  groupName: string | null;
  participants: Participant[];
  totalCount: number;
  unReadCount: number;
  messages: Message[];
  lastMessage: LastMessage;
};

type Coordinates = [number, number];

export interface Location {
  type: string | null;
  coordinates?: Coordinates | [];
}

export interface User {
  location: Location;
  _id: string | null;
  firstName: string | null;
  lastName: string | null;
  dob: string | null;
  email: string | null;
  height: number | null;
  weight: number | null;
  role: string | null;
  isActive: boolean | null;
  fcmToken: string | null;
  partner: {
    primary: User | null;
    relation: string;
  } | null;
  buddies: User[] | [];
  online: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
  __v: number | null;
  isBuddy: boolean;
  photo: string | null;
  goodProgress: boolean;
  badProgress: boolean;
  beNotified: boolean;
  photoUrl: string | null;
  userType: 'manual' | 'social';
}

export type UserNotif = {
  goodProgress: boolean;
  badProgress: boolean;
  beNotified: boolean;
};

export interface Challenge {
  _id: string;
  name: string;
  challenge: number;
  level: number;
  scriptureOrQuote: string;
  instructions: string;
  duration: number;
  points: number;
  notificationReminders: number;
  sequenceOfChallenges: null | number;
  goal: string;
  sponsorOpportunity: null | string;
  createdAt: string;
  updatedAt: string;
  abc: number;
  __v: number;
}

export type StartedChallenge = {
  location: Location;
  _id: string;
  user: string;
  challenge: Challenge;
  status: string;
  points: number;
  completedAt: string | null;
  expireOn: string;
  reminders: {time: string; isActive: boolean}[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  address: string | null;
  customReminder: {date: string; isActive: boolean};
};

export type DailyState = {
  dailyStateType: string;
  value: number;
  date: string;
  dateTime: Date | null;
};

export type Tip = {
  answer: string;
  tips: {tip: string; _id: string}[];
  deleted: boolean;
  _id: string;
};

export type Answer = {
  type: string;
  deleted: boolean;
  _id: string;
  answers: Tip[];
  questions: any[]; // You can replace `any` with an appropriate type if needed
  tipQuestion: string | null;
};

export type DailyStateEntry = {
  _id: string;
  dailyStateType: string;
  journalEntryType?: string;
  minValue: number;
  maxValue: number;
  deleted: boolean;
  feelings: Answer[];
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export interface SelectedQuestion {
  question: string;
  answer: string;
  _id: string;
}

export interface Feeling {
  type: string;
  subType: string;
  selectedQuestions: SelectedQuestion[];
  _id: string;
  skeleton?: string[];
}

export interface JournalEntry {
  location: Location | null;
  tip: string | null;
  feelings: Feeling[];
  deleted: boolean;
  _id: string;
  shortDescription: string;
  description: string | null;
  createdAt: string;
  manualDate: undefined | null | string | Date;
  manualTime: undefined | null | string | Date;
  defaultTime: {
    time: '7:00 AM' | '12:00 AM' | '8:00 AM';
    isEnable: boolean;
    _id: string;
  }[];
  locationAddress: undefined | null | string;
}

export interface JournalEntryRecord {
  dateTime: string;
  dailyStateType: string;
  journalEntries: JournalEntry[];
}

export type NotificationType =
  | 'Message-Send'
  | 'Add-Primary-Partner'
  | 'Daily-State-Update-Low';

export type Notification = {
  _id: string;
  receiver: string;
  sender: User;
  type: NotificationType;
  body: string;
  isRead: boolean;
  createdAt: string;
  title: string;
  id: string;
};

export type Category = {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
};

export interface DefaultTime {
  time: string;
  isEnable: boolean;
  _id: string;
}

export interface DailyStateBeNotified {
  location: Location;
  _id: string;
  userId: string;
  type: null;
  defaultTime: DefaultTime[];
  manualDate: null | string;
  manualTime: null | string;
  locationAddress: string | null;
  createdAt: string;
}

export interface ChatData {
  chatType: 'group' | 'one-to-one';
  groupName?: string;
  groupImageUrl?: string;
  userId: string;
  participantIds: string[];
}

export type ConversationStarterLocation = {
  location: Location;
  _id: string;
  user: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export interface RegisterFormValues {
  firstName: string;
  lastName: string;
  month: string;
  day: string;
  year: string;
  height?: number;
  weight?: number;
  email: string;
  password: string;
  photo?: string;
  fcmToken: string;
  location: string;
}
