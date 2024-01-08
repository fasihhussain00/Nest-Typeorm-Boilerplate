import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from 'src/users/entities/user.entity';
import {
  NotificationJoinRoom,
  NotificationMessage,
  NotificationType,
} from './types/notification';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true, namespace: 'notifications' })
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger: Logger = new Logger(NotificationGateway.name);
  private readonly roomPrefix: string = 'notifications-room';
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Notification Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Notification Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('room')
  joinRoom(
    @MessageBody() data: NotificationJoinRoom,
    @ConnectedSocket() client: Socket,
  ) {
    const { userId } = data;
    const roomId = `${this.roomPrefix}-${userId}`;
    client.join(roomId);
    this.logger.log(`Client ${client.id} joined room ${roomId}`);
    client.emit('joined-room', roomId);
  }

  sendNotification(
    user: User,
    type: NotificationType,
    message: NotificationMessage,
  ) {
    const roomId = `${this.roomPrefix}-${user.id}`;
    this.logger.log(`Sent Notification "${message.message}" to ${roomId}`);
    this.server.to(roomId).emit(`notification`, { type, message });
  }
}
