const ws = new WebSocket("ws://localhost:3000");

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

	const mainPlayerBlob = game.pack.players[game.uuid].blobs[0];

	// draw

	draw.grid(mainPlayerBlob);
	draw.circ(cnv.width / 2, cnv.height / 2, mainPlayerBlob.mass, "red");

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
