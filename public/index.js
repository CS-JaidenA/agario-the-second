// establish connection

const ws   = new WebSocket("ws://localhost:3000");

const game = {
	/** @type {import("../component.world").WorldPackageExtendedObject} */
	pack: {},
	uuid: '',
	uninitialized: true,
};

ws.addEventListener("message", e => {
	const message = JSON.parse(e.data);

	if (message.uuid)
		game.uuid = message.uuid;

	if (message.pack)
		game.pack = { ...game.pack, ...message.pack };

	if (game.uninitialized) {
		game.uninitialized = false;
		requestAnimationFrame(update);
	}
});

/** @type {HTMLCanvasElement} */
const cnv = document.getElementById("canvas");
const ctx = cnv.getContext("2d");

// scale canvas

window.addEventListener("resize", () => {
	cnv.width  = Math.floor(window.innerWidth  * window.devicePixelRatio);
	cnv.height = Math.floor(window.innerHeight * window.devicePixelRatio);
});

window.dispatchEvent(new Event("resize"));

// draw canvas

function update() {
	ctx.clearRect(0, 0, cnv.width, cnv.height);

	const mainPlayerBlob = game.pack.players[game.uuid].blobs[0];

	draw.grid(mainPlayerBlob);

	// draw player

	draw.circ(cnv.width / 2, cnv.height / 2, mainPlayerBlob.mass, "red");

	// loop

	requestAnimationFrame(update);
}
