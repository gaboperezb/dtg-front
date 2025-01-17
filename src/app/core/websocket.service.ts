import { Injectable } from '@angular/core';
//Grab everything with import 'rxjs/Rx';
import { Observable } from 'rxjs';
import { Socket } from 'ngx-socket-io';
import { AuthService } from './auth.service';


@Injectable({
	providedIn: 'root'
})
export class WebSocketService {

	constructor(private socket: Socket) { }
	loggedIn(user: string) {

		this.socket.emit('login',
			{
				user: user
			});
	}

	joinRoom(room: string) {

		this.socket.emit('room',
			{
				room
			});
	}

	leaveRoom(room: string) {

		this.socket.emit('leave-room',
			{
				room
			});
	}

	emitMessage(chat, message, user) {

	
		this.socket.emit('message',
			{
				chat,
				message,
				user
			});
	}

	emitStartTyping(chat, username, roomsToEmit) {
		this.socket.emit('startTyping',
			{
				chat,
				username,
				roomsToEmit
			});
	}

	emitEndTyping(chat, username, roomsToEmit) {
		this.socket.emit('endTyping',
			{
				chat,
				username,
				roomsToEmit
				
			});
	}

	emitPost(id: any, type: string, user: string, ownUser?: string, ) {
		this.socket.emit('post',
			{
				id: id,
				user: user,
				type: type, //thread o take (para notificaiones)
				ownUser: !!ownUser ? ownUser : null
			});
	}

	connection() {
		this.socket.connect();

	}

	disconnection() {
		this.socket.disconnect();
		
	}


	updateConnection(connection: string, id: string) {

		if (connection == "online") {
			this.socket.emit('updateConnection', id);
		} 

	}

	onConnection() {
		let observable = new Observable(observer => {
			this.socket.on('connect', (reason: any) => {
				
				observer.next(reason);
			});
			return () => {
				this.socket.disconnect();
			};
		})
		return observable;
	}

	onDisconnection() {
		let observable = new Observable(observer => {
			this.socket.on('disconnect', (reason: any) => {
				observer.next(reason);
			});
			return () => {
				this.socket.disconnect();
			};
		})
		return observable;
	}


	onNotifications() {
		let observable = new Observable(observer => {
			this.socket.on('notification', (data: any) => {
				observer.next(data);
			});
			return () => {
				this.socket.disconnect();
			};
		})
		return observable;
	}

	onMessages() {
		let observable = new Observable(observer => {
			this.socket.on('message', (data: any) => {
				observer.next(data);
			
			});
			return () => {
				this.socket.disconnect();
			};
		})
		return observable;
	}

	onStartTyping() {
		let observable = new Observable(observer => {
			this.socket.on('startTyping', (data: any) => {
				observer.next(data);
			});
			return () => {
				this.socket.disconnect();
			};
		})
		return observable;
	}

	onEndTyping() {
		let observable = new Observable(observer => {
			this.socket.on('endTyping', (data: any) => {
				observer.next(data);
			});
			return () => {
				this.socket.disconnect();
			};
		})
		return observable;
	}

	
}


