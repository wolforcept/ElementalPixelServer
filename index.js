
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

// WATER EARTH FIRE AIR
const percentages = [0, 0, 0, 0];

setInterval(() => {
    const sums = [0, 0, 0, 0];
    Object.keys(map).forEach(posId => {
        const s = map[posId];
        if (s === "w") sums[0]++;
        if (s === "e") sums[1]++;
        if (s === "f") sums[2]++;
        if (s === "a") sums[3]++;
    });
    const total = sums[0] + sums[1] + sums[2] + sums[3];
    if (total === 0) return;
    percentages[0] = Math.floor(100 * sums[0] / total);
    percentages[1] = Math.floor(100 * sums[1] / total);
    percentages[2] = Math.floor(100 * sums[2] / total);
    percentages[3] = Math.floor(100 * sums[3] / total);
    console.log(`percentages: ` + percentages);
}, 5000);

wss.on('connection', (ws) => {


    var commandAction = null;
    var commandMove = null;
    var player = getInitialPosition();
    player.id = nextId++;
    player.cooldown1 = 0;
    player.cooldown2 = 0;
    player.cooldown3 = 0;
    player.cooldown4 = 0;
    players.push(player);
    var speedModifier = 1;

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
        ws.send(JSON.stringify({ player, players, world, percentages }));
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
                    commandMove = () => {
                        if (message.dx === -1 || message.dx === 1)
                            player.x += message.dx * speedModifier;
                        if (message.dy === -1 || message.dy === 1)
                            player.y += message.dy * speedModifier;
                    };
                    break;

                case "action1":
                    commandAction = (_player) => {
                        const px = _player.x, py = _player.y;
                        if (player.cooldown1 > 0) return;
                        switch (player.element) {

                            case "water": {
                                let interval;
                                let i = 4;
                                player.cooldown1 = 12;
                                interval = setInterval(() => {
                                    let dx = 0, dy = 0;
                                    if (message.dir === "up") dy = -1;
                                    if (message.dir === "down") dy = 1;
                                    if (message.dir === "left") dx = -1;
                                    if (message.dir === "right") dx = 1;
                                    setPos(px + dx * i, py + dy * i, 'w');
                                    i++;
                                    if (i > 12) clearInterval(interval);
                                }, 10);
                            } break;

                            case "earth": {
                                let interval;
                                let i = 0;
                                player.cooldown1 = 10;
                                interval = setInterval(() => {
                                    let dx = 0, dy = 0;
                                    if (message.dir === "up") dx = -1;
                                    if (message.dir === "down") dx = 1;
                                    if (message.dir === "left") dy = -1;
                                    if (message.dir === "right") dy = 1;
                                    setPos(player.x + dx * i, player.y + dy * i, 'e');
                                    setPos(player.x - dx * i, player.y - dy * i, 'e');
                                    i++;
                                    if (i > 10) clearInterval(interval);
                                }, 10);
                            } break;

                            case "fire": {
                                let interval;
                                let i = 4;
                                player.cooldown1 = 12;
                                interval = setInterval(() => {
                                    let dx = 0, dy = 0;
                                    if (message.dir === "up") dy = -1;
                                    if (message.dir === "down") dy = 1;
                                    if (message.dir === "left") dx = -1;
                                    if (message.dir === "right") dx = 1;
                                    setPos(px + dx * i - 1, py + dy * i, 'f');
                                    setPos(px + dx * i + 1, py + dy * i, 'f');
                                    setPos(px + dx * i, py + dy * i - 1, 'f');
                                    setPos(px + dx * i, py + dy * i + 1, 'f');
                                    i++;
                                    if (i > 10) clearInterval(interval);
                                }, 10);
                            } break;

                            case "air": {
                                let interval;
                                let i = 1;
                                player.cooldown1 = 12;
                                interval = setInterval(() => {
                                    let dx = 0, dy = 0;
                                    if (message.dir === "up") dy = -1;
                                    if (message.dir === "down") dy = 1;
                                    if (message.dir === "left") dx = -1;
                                    if (message.dir === "right") dx = 1;

                                    switch (message.dir) {
                                        case "up": {
                                            setPos(px + dx * i * 3 + 1, py + dy * i * 3 + 0, 'a');
                                            setPos(px + dx * i * 3 + 0, py + dy * i * 3 - 1, 'a');
                                            setPos(px + dx * i * 3 - 1, py + dy * i * 3 + 0, 'a');
                                        } break;
                                        case "left": {
                                            setPos(px + dx * i * 3 + 0, py + dy * i * 3 + 1, 'a');
                                            setPos(px + dx * i * 3 - 1, py + dy * i * 3 - 0, 'a');
                                            setPos(px + dx * i * 3 - 0, py + dy * i * 3 - 1, 'a');
                                        } break;
                                        case "down": {
                                            setPos(px + dx * i * 3 + 1, py + dy * i * 3 + 0, 'a');
                                            setPos(px + dx * i * 3 + 0, py + dy * i * 3 + 1, 'a');
                                            setPos(px + dx * i * 3 - 1, py + dy * i * 3 + 0, 'a');
                                        } break;
                                        case "right": {
                                            setPos(px + dx * i * 3 + 0, py + dy * i * 3 + 1, 'a');
                                            setPos(px + dx * i * 3 + 1, py + dy * i * 3 - 0, 'a');
                                            setPos(px + dx * i * 3 - 0, py + dy * i * 3 - 1, 'a');
                                        } break;
                                    }
                                    i++;
                                    if (i > 6) clearInterval(interval);
                                }, 50);
                            } break;

                        }
                    };
                    break;

                case "action2":
                    commandAction = () => {
                        if (player.cooldown2 > 0) return;
                        switch (player.element) {

                            case "fire": {
                                let interval;
                                let i = 4;
                                player.cooldown2 = 90;
                                speedModifier = 2;
                                interval = setInterval(() => {
                                    setPos(player.x, player.y, 'f');
                                    i++;
                                    if (i > 200) {
                                        clearInterval(interval);
                                        speedModifier = 1;
                                    }
                                }, 10);
                            } break;

                            case "earth": {
                                let interval;
                                let i = 4;
                                player.cooldown2 = 160;
                                interval = setInterval(() => {
                                    setPos(player.x - 1, player.y, 'e');
                                    setPos(player.x + 1, player.y, 'e');
                                    setPos(player.x, player.y - 1, 'e');
                                    setPos(player.x, player.y + 1, 'e');
                                    i++;
                                    if (i > 200) {
                                        clearInterval(interval);
                                    }
                                }, 10);
                            } break;

                            case "air": {
                                let interval;
                                let i = 4;
                                player.cooldown2 = 110;
                                interval = setInterval(() => {
                                    setPos(player.x - 6 + Math.floor(Math.random() * 12), player.y - 6 + Math.floor(Math.random() * 12), 'a');
                                    i++;
                                    if (i > 50) clearInterval(interval);
                                }, 50);
                            } break;

                        }


                    };
                    break;

                case "action3":
                    commandAction = () => {
                        if (player.cooldown3 > 0) return;
                        switch (player.element) {

                            case "fire": {
                                let interval;
                                let i = 0;
                                player.cooldown3 = 120;
                                speedModifier = 0;
                                interval = setInterval(() => {
                                    if (i > 40 && i < 45) {
                                        const ii = i - 40;
                                        for (let dx = -ii; dx <= ii; dx++) {
                                            for (let dy = -ii; dy <= ii; dy++) {
                                                setPos(player.x + dx, player.y + dy, 'f');
                                            }
                                        }
                                    }
                                    i++;
                                    if (i > 50) {
                                        speedModifier = 1;
                                        clearInterval(interval);
                                    }
                                }, 10);
                            } break;

                            case "air": {
                                player.cooldown3 = 2;
                                setPos(player.x - 6 + Math.floor(Math.random() * 12), player.y - 6 + Math.floor(Math.random() * 12), 'a');
                            } break;

                        }


                    };
                    break;

                case "action4":
                    commandAction = () => {
                        if (player.cooldown4 > 0) return;
                        setPos(player.x, player.y, "d");
                        player.cooldown4 = 100;
                    };
                    break;

            }
        } catch (e) {
            console.log(e);
        }
    });

    var interval;
    interval = setInterval(() => {
        if (player.cooldown1 > 0) player.cooldown1--;
        if (player.cooldown2 > 0) player.cooldown2--;
        if (player.cooldown3 > 0) player.cooldown3--;
        if (player.cooldown4 > 0) player.cooldown4--;
        if (commandAction) {
            commandAction({ ...player });
            commandAction = null;
        }
        if (commandMove) {
            commandMove();
            commandMove = null;
        }
        sendUpdate();
    }, 1000 / 15);

    ws.on('close', () => {
        clearInterval(interval);
        console.log(`player ${player.id} disconnected.`);
        players = players.filter(x => x.id !== player.id);
    });
});

server.listen(433, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});
