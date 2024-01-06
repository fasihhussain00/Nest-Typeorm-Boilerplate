import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Cache } from 'cache-manager';
import { ChatJoinRoom, ChatLeaveRoom, ChatRoomMessage } from './types/room';

@WebSocketGateway({ cors: true, namespace: 'chats' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger: Logger = new Logger(ChatGateway.name);
  private readonly roomPrefix: string = 'chats-room-';
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  @WebSocketServer()
  server: Server;

  afterInit() {
    this.logger.log('Initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('room')
  joinRoom(
    @MessageBody() data: ChatJoinRoom,
    @ConnectedSocket() client: Socket,
  ) {
    const { fromUserId, toUserId } = data;
    const roomId = this.roomPrefix + [fromUserId, toUserId].sort().join('-');
    client.join(roomId);
    this.logger.log(`Client ${client.id} joined room ${roomId}`);
    client.emit('joined-room', roomId);
  }

  @SubscribeMessage('leave-room')
  leaveRoom(
    @MessageBody() data: ChatLeaveRoom,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.roomId);
    this.logger.log(`Client ${client.id} left room ${data.roomId}`);
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: ChatRoomMessage,
    @ConnectedSocket() client: Socket,
  ) {
    const { room, message } = data;
    this.server.to(room).emit('message', { sender: client.id, message });
  }
}
