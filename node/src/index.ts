import http from 'http';
import socket from 'socket.io';
import _ from 'lodash';
import { AuthenticationRequest, Authentication } from './authentication.class';

const server = http.createServer();
const io = socket(server);

io.on('connection', client => {
    (client as any).mikudos = {
        provider: 'socketio',
        headers: client.handshake.headers,
        address: client.conn.remoteAddress
    };
    // console.log('TCL: mikudos', (client as any).mikudos);
    // console.log('TCL: client conneted nsp', client.nsp);
    // console.log('TCL: client conneted id', client.id);
    // console.log('TCL: client conneted handshake', client.handshake);
    // console.log('TCL: client conneted request', client.request);
    client.on('message', data => {
        console.log('TCL: client', client);
        // request message
        console.log('TCL: data', data);
    });
    client.on('authentication', async (data: AuthenticationRequest) => {
        client.emit(
            'authentication',
            await new Authentication().authenticate(data)
        );
        client.handshake.headers.authentication = 'test token';
        client.join('authenticated', () => {
            let rooms = Object.keys(client.rooms);
            console.log(rooms); // [ <socket.id>, 'room 237' ]
        });
    });
    client.on('event', data => {
        console.log('TCL: data', data);
        /* … */
    });
    client.once('disconnect', () => {
        console.log('TCL: client disconnect');
        console.log('rooms', client.rooms);
        client.leaveAll();
        /* … */
    });
});
server.listen(3000);
console.log('socket.io server started at port: 3000');