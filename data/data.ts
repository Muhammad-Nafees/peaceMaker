import {COLORS} from '../src/constants/colors';

export const CHALLENGES = [
  {
    id: 'c1',
    content: 'Daily Challenge 3 (February 1)',
    color: COLORS.red,
  },
  {
    id: 'c2',
    content: 'Daily Challenge 3 (February 1)',
    color: COLORS.neutral300,
  },
  {
    id: 'c3',
    content: 'Daily Challenge 3 (February 1)',
    color: COLORS.neutral300,
  },
];
export const TODAYSCHALLENGES = [
  {
    id: 'c1',
    content: 'Daily Challenge 3 (February 1)',
    color: COLORS.red,
  },
];
export const UPCOMINGCHALLENGES = [
  {
    id: 'c1',
    content: 'Play “I am stronger than you think” (March 10)',
    color: COLORS.neutral300,
  },
  {
    id: 'c2',
    content: 'Build a Habit “Toothbrush 2x a day” (March 23)',
    color: COLORS.neutral300,
  },
];

export const PROBLEMS_DATA = [
  {
    id: 'p1',
    text: 'It may be an itch',
  },
  {
    id: 'p2',
    text: 'I may need a band aid',
  },
  {
    id: 'p3',
    text: 'It’s annoying',
  },
  {
    id: 'p4',
    text: 'This is concerning but I can still work',
  },
  {
    id: 'p5',
    text: 'My work and focus is affected by this pain',
  },
  {
    id: 'p6',
    text: 'I can’t go to work like this and do anything',
  },
  {
    id: 'p7',
    text: 'I can’t stop crying',
  },
  {
    id: 'p8',
    text: 'I can’t move or think, it’s so bad',
  },
  {
    id: 'p9',
    text: 'Soul crushing pain, involuntary vomitting',
  },
  {
    id: 'p10',
    text: 'I prefer if you just remove that part of my body',
  },
];
export const TIMES = [
  {
    id: 'p1',
    text: 'Seconds',
  },
  {
    id: 'p2',
    text: 'Minutes',
  },
  {
    id: 'p3',
    text: 'Hours',
  },
  {
    id: 'p4',
    text: 'Days',
  },
  {
    id: 'p5',
    text: 'Weeks',
  },
  {
    id: 'p6',
    text: 'Months',
  },
  {
    id: 'p7',
    text: 'Years',
  },
];

// journal entries
export interface IFeeling {
  _id: string;
  name: string;
  data?: {
    _id: string;
    text: string;
    tips: string[];
    tipQuestion: string | null;
  }[];
};

export const DATA: IFeeling[] | undefined = [
  {
    _id: 'd',
    name: 'Event Oriented',
  },
  {
    _id: 'dsa',
    name: 'Trauma',
  },
  {
    _id: 'sda',
    name: 'Pain Chart',
  },
];
// journal sub entries
export interface IMODALDATA {
  _id: string | undefined;
  text: string | undefined;
}

export const MODAL_DATA: IMODALDATA[] = [
  {
    _id: 'sdasfdaf',
    text: 'Parent',
  },
  {
    _id: 'dsadasd',
    text: 'Child',
  },
  {
    _id: 'fasasf',
    text: 'Spouse',
  },
  {
    _id: 'fasfag',
    text: 'Close friend',
  },
  {
    _id: 'vxcvxcv',
    text: 'Boy/Girlfriend',
  },
];


export const JOURNALENTRY_RECORDS = [
  {
    id: 'd1',
    title: 'Journal Entry 1',
    data: '12 March 2023',
    type: 'Pain Chart',
  },
  {
    id: 'd2',
    title: 'Journal Entry 2',
    data: '10 Feb 2023',
    type: 'Trauma',
  },
  {
    id: 'd3',
    title: 'Journal Entry 3',
    data: '10 Jan 2023',
    type: 'Evenet Oriented',
  },
];

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

let arr: string[] = [];
Array.from({length: 10}, (_, index) => {
  Array.from({length: 10}, (e, indx) => {
    if(index + 2 === (12) && indx > 0) return;
    arr.push(`${index + 2}'${indx}`);
  });
});

export const heightsInInches = arr;

// export const heightsInInches = Array.from({length: 8}, (_, index) => {
//   return `${index + 1}'0`;
// });

export const heightsInCm = Array.from({length: 349}, (_, index) => 2 + index);
export const weightArrayLbs = Array.from({length: 500}, (_, index) => 1 + index);
export const weightArrayKg = Array.from({length: 186}, (_, index) => 40 + index);

export const DAYS = Array.from({length: 31}, (_, i) => (i + 1).toString());

export const YEARS = Array.from({length: new Date().getFullYear() - 1900 + 1},(_, i) => (1900 + i).toString(),
);