export interface ChatJoinRoom {
  fromUserId: number;
  toUserId: number;
}

export interface ChatLeaveRoom {
  roomId: string;
}

export interface ChatRoomMessage {
  room: string;
  message: string;
}
