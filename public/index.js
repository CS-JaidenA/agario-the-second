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

		const x = cnv.width  / 2 + (blob.x - mainPlayerBlob.x) * 40;
		const y = cnv.height / 2 + (blob.y - mainPlayerBlob.y) * 40;

		draw.circ(x, y, blob.mass, player.colour);
	}

	draw.circ(cnv.width / 2, cnv.height / 2, mainPlayerBlob.mass, mainPlayer.colour);

	// loop

	requestAnimationFrame(update);
}

ws.addEventListener("message", e => {
	const message = JSON.parse(e.data);

	if (message.uuid)
		game.uuid = message.uuid;

	if (message.pack) {
		game.pack = { ...game.pack, ...message.pack };
		ws.send(JSON.stringify(mouse));
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
