export interface NotificationMessage {
  message: string;
  data: any;
}

export interface NotificationJoinRoom {
  userId: number;
}

export enum NotificationType {
  teamInvitation = 'team-invitation',
  teamInvitationAccept = 'team-invitation-accept',
  teamInvitationReject = 'team-invitation-reject',
  foundMatch = 'found-match',
}
