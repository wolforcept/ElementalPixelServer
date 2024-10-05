
const map = {};
let players = [];
let distanceToCenter = 50;
let nextId = 1;

function getInitialPosition() {
    const x = Math.floor((Math.random() * distanceToCenter) - distanceToCenter / 2);
    const y = Math.floor((Math.random() * distanceToCenter) - distanceToCenter / 2);
    distanceToCenter += distanceToCenter * .05;
    if (distanceToCenter > 1000)
        distanceToCenter = 1000;
    return { x, y };
}

function setPos(x, y, s) {
    map[x + "," + y] = s;
}

const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {

    var command = null;
    var player = getInitialPosition();
    player.id = nextId++;
    players.push(player);

    console.log(`player ${player.id} connected.`);

    function sendUpdate() {
        var world = [];

        for (let dx = -20; dx <= 20; dx++) {
            for (let dy = -20; dy <= 20; dy++) {
                const posId = (player.x + dx) + "," + (player.y + dy);
                // if (map[posId]) console.log(posId, map[posId]);
                world.push(map[posId]);
            }
        }
        ws.send(JSON.stringify({ player, players, world }));
    }

    ws.on('message', (unparsedMessage) => {
        try {
            var message = JSON.parse(unparsedMessage);
            // console.log(message.type);

            switch (message.type) {
                case "init":
                    player.element = message.element;
                    break;

                case "move":
                    command = () => {
                        if (message.dx === -1 || message.dx === 1)
                            player.x += message.dx;
                        if (message.dy === -1 || message.dy === 1)
                            player.y += message.dy;
                    };
                    break;

                case "action1":
                    command = () => {
                        setPos(player.x, player.y, "w");
                    };
                    break;

                case "action2":
                    command = () => {
                        setPos(player.x, player.y, "a");
                    };
                    break;

                case "action3":
                    command = () => {
                        setPos(player.x, player.y, "s");
                    };
                    break;

                case "action4":
                    command = () => {
                        setPos(player.x, player.y, "d");
                    };
                    break;

            }
        } catch (e) {
            console.log(e);
        }
    });

    var interval;
    interval = setInterval(() => {
        if (command) {
            command();
            command = null;
        }
        sendUpdate();
    }, 1000 / 15);

    ws.on('close', () => {
        clearInterval(interval);
        console.log(`player ${player.id} disconnected.`);
        players = players.filter(x => x.id !== player.id);
    });
});

server.listen(443, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});
