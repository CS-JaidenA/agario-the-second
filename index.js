// express

const express   = require("express");
const app       = express();

// websockets

const server	= require("http").createServer(app);
const WebSocket	= require("ws");
const wss		= new WebSocket.Server({ server });

// miscellaneous setup

const crypto		= require("crypto");

const World			= require("./components.world.js");
const Player		= require("./component.player.js");
const Connection	= require("./connection.js");

/** @type {{string: Connection}} */
const clients = {};

// game setup

const world = new World();

wss.on("connection", ws => {
	// connection

	const uuid = crypto.randomUUID();

	ws.on("message", message => {
		console.log(`[!] Message received: ${message}`);
	});

	ws.on("close", () => {
		console.log("[!] Client disconnection.");
		clients.delete(ws);
	});

	ws.send("hi");
});

app.use(express.static("public"));
server.listen(3000, () => console.log("\n[!] Listening on port 3000.\n"));
