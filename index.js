const express   = require("express");
const app       = express();

const server	= require("http").createServer(app);
const WebSocket	= require("ws");

const wss		= new WebSocket.Server({ server: server });
const clients   = new Set();

wss.on("connection", ws => {
    console.log("[!] Client connection.");
    clients.add(ws);

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
