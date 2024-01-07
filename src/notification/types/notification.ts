export interface NotificationMessage {
  message: string;
  data: any;
}

export interface NotificationJoinRoom {
  userId: number;
}

export enum NotificationType {
  teamInvitation = 'team-invitation',
  foundMatch = 'found-match',
}
