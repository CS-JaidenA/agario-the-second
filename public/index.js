const ws = new WebSocket(`${location.protocol === "http:" ? "ws" : "wss"}://${location.host}`);

/** @type {HTMLCanvasElement} */
const cnv = document.getElementById("canvas");
const ctx = cnv.getContext("2d");

const game  = {
	pack: {},
	uuid: '',
	uninitialized: true,
};

const mouse = {
	x: 0,
	y: 0,
};

// draw canvas

function update() {
	ctx.clearRect(0, 0, cnv.width, cnv.height);

	const mainPlayer     = game.pack.players[game.uuid];
	const mainPlayerBlob = mainPlayer.blobs[0];

	// draw

	draw.grid(mainPlayerBlob);

	for (const uuid in game.pack.players) {
		if (uuid === game.uuid) continue;

		const player = game.pack.players[uuid];
		const blob   = player.blobs[0];
		const radius = blob.mass; // TODO: Switch this to radius when added

		const x = cnv.width  / 2 + (blob.x - mainPlayerBlob.x) * 40;

		if (x + radius < 0 || x - radius > cnv.width)
			continue;

		const y = cnv.height / 2 + (blob.y - mainPlayerBlob.y) * 40;

		if (y + radius < 0 || y - radius > cnv.height)
			continue;

		draw.circ(x, y, blob.radius, player.colour);
	}

	// draw player

	draw.circ(cnv.width / 2, cnv.height / 2, mainPlayerBlob.radius, mainPlayer.colour);

	// draw mass

	const mass    = String(mainPlayerBlob.mass);
	const metrics = ctx.measureText(mass);

	const massX   = cnv.width  / 2 - ((metrics.actualBoundingBoxLeft   + metrics.actualBoundingBoxRight  ) / 2);
	const massY   = cnv.height / 2 + ((metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) / 2);

	ctx.font        = "48px Ubuntu";
	ctx.fillStyle   = "white";
	ctx.lineWidth   = 2;
	ctx.strokeStyle = "black";

	ctx.fillText(mass, massX, massY);
	ctx.strokeText(mass, massX, massY);

	// loop

	requestAnimationFrame(update);
}

ws.addEventListener("message", e => {
	const message = JSON.parse(e.data);

	if (message.uuid)
		game.uuid = message.uuid;

	if (message.pack) {
		game.pack = { ...game.pack, ...message.pack };
		ws.send(JSON.stringify({ type: "mouse", load: mouse }));
	}

	if (game.uninitialized) {
		game.uninitialized = false;
		requestAnimationFrame(update);
	}
});

window.addEventListener("mousemove", function({ clientX, clientY }) {
	const largest = Math.max(cnv.width, cnv.height);

	mouse.x = (clientX - cnv.width  / 2) / (largest / 2);
	mouse.y = (clientY - cnv.height / 2) / (largest / 2);
});

window.addEventListener("resize", () => {
	cnv.width  = Math.floor(window.innerWidth  * window.devicePixelRatio);
	cnv.height = Math.floor(window.innerHeight * window.devicePixelRatio);
});

window.dispatchEvent(new Event("resize"));

let spacePressed = false;

window.addEventListener("keyup", e => {
	if (e.code === "Space") spacePressed = false;
});

window.addEventListener("keydown", e => {
	if (this.spacePressed || e.code !== "Space") return;
	this.spacePressed = true;
	// split
});
