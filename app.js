#!/usr/bin/env node

// express

const express    = require("express");
const app        = express();

// websockets

const server     = require("http").createServer(app);
const WebSocket  = require("ws");

/** @type {WebSocket.Server} */
const wss        = new WebSocket.Server({ server });

// miscellaneous setup

const World	     = require("./component.world.js");
const crypto     = require("crypto");

// game setup

const world = new World();

wss.on("connection", ws => {
	// save ws

	const uuid = crypto.randomUUID();

	// send world

	world.connect(uuid);

	ws.send(JSON.stringify({
		uuid,
		pack: world.extdpack(),
	}));

	// handle messages

	ws.on("message", message => {
		world.players[uuid].mouse = JSON.parse(message);
	});

	// disconnect from client on close

	ws.on("close", () => world.disconnect(uuid));
});

// game loop

setInterval(() => {
	// tick world

	world.tick();

	// package updated information
	// then send to clients

	const pack = JSON.stringify({ pack: world.pack() });
	wss.clients.forEach(client => client.send(pack));
}, 25);

app.use(express.static("public"));
server.listen(3000, () => console.log("\n[!] Listening on port 3000.\n"));
