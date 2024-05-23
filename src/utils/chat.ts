import {ChatData} from '../interface/types';
import {ApiService} from './ApiService';
import socketServcies from './socketServices';

export const createChat = (
  userId: string,
  participantId: string,
  title?: string,
  group: boolean = false,
) => {
  if (typeof group !== 'boolean' || !userId || !participantId) return;

  let participants = [userId, participantId];
  console.log('--------------------------------------------');

  const chatData: ChatData = {
    chatType: 'one-to-one',
    groupImageUrl: 'def.jpg',
    userId: userId,
    participantIds: participants,
  };
  if (group) {
    chatData['chatType'] = 'group';
    chatData['groupName'] = title;
  }
  socketServcies.emit('createChat', chatData);
};

export const getChatData = async (chatId: string, userId: string) => {
  try {
    const url = `chats?userId=${userId}&chatId=${chatId}`;
    const chat = new ApiService(url, '');
    const chatRes = await chat.Get();

    return chatRes?.data[0];
  } catch (err) {
    console.log('🚀 getChatData ~ err:', err);
  }
};
