#!/usr/bin/env node

/**
 * @typedef  {object} Message
 * @property {number}                 code
 * @property {undefined|string}       uuid
 * @property {undefined|WorldPackage} world
 */

// express

const express    = require("express");
const app        = express();

// websockets

const server     = require("http").createServer(app);
const WebSocket  = require("ws");

const wss        = new WebSocket.Server({ server });

// miscellaneous setup

const codes      = require("./codes.js");
const World	     = require("./component.world.js");
const crypto     = require("crypto");

/** @type {{string: WebSocket}} */
const connections = {};

// game setup

const world = new World();

wss.on("connection", ws => {
	// save ws

	const uuid = crypto.randomUUID();
	connections[uuid] = ws;

	// send world

	world.createPlayer(uuid);
	ws.send(JSON.stringify({
		code:  codes.init,
		uuid:  uuid,
		world: world.pack(),
	}));

	// handle messages

	ws.on("message", message => {
		message = JSON.parse(message);
	});

	// disconnect from client on close

	ws.on("close", () => {
		delete connections[uuid];
		world.disconnect(uuid);
	});
});

app.use(express.static("public"));
server.listen(3000, () => console.log("\n[!] Listening on port 3000.\n"));
