#!/usr/bin/env node

/**
 * @typedef {object} message
 * @property {number} code
 * @property {any}    body
 */

// express

const express    = require("express");
const app        = express();

// websockets

const server     = require("http").createServer(app);
const WebSocket  = require("ws");

const wss        = new WebSocket.Server({ server });

// miscellaneous setup

const crypto     = require("crypto");

const codes      = require("./codes.js");
const World	     = require("./component.world.js");
const Connection = require("./connection.js");

/** @type {{string: Connection}} */
const connections = {};

// game setup

const world = new World();

wss.on("connection", ws => {
	// send world

	ws.send(JSON.stringify({
		code: codes.WORLD,
		body: world,
	}));

	// send player

	const uuid   = crypto.randomUUID();
	const player = world.player(uuid);

	ws.send(JSON.stringify({
		code: codes.PLAYER,
		body: player,
	}));

	// save websocket

	connections[uuid] = ws;

	// handle messages

	ws.on("message", message => {
		message = JSON.parse(message);

		switch (message.code) {
			case codes.MOUSE:
				break;
		}
	});

	// remove client on close

	ws.on("close", () => {
		world.disconnect(uuid);
		delete connections[uuid];
	});
});

app.use(express.static("public"));
server.listen(3000, () => console.log("\n[!] Listening on port 3000.\n"));
