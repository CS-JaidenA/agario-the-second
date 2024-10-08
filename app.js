#!/usr/bin/env node

'use strict';

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
		message = JSON.parse(message);

		if (message.type === "name")
			return world.players[uuid].name = message.load;

		if (message.type === "mouse")
			return world.players[uuid].mouse = message.load;

		if (message.type === "split")
			return world.players[uuid].split();

		if (message.type === "eject")
			return world.players[uuid].eject();
	});

	// disconnect from client on close

	ws.on("close", () => world.disconnect(uuid));
});

// game loop

const interval = 25;

setInterval(() => {
	// tick world

	world.tick(interval);

	// package updated information
	// then send to clients

	const pack = JSON.stringify({ pack: world.pack() });

	wss.clients.forEach(client => client.send(pack));
}, interval);

app.use(express.static("public"));
server.listen(3000, () => console.log("\n[!] Listening on port 3000.\n"));
