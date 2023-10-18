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
	xPercentage: 50,
	yPercentage: 50,
};

// draw canvas

function update() {
	ctx.clearRect(0, 0, cnv.width, cnv.height);

	const mainPlayerBlob = game.pack.players[game.uuid].blobs[0];

	// draw

	draw.grid(mainPlayerBlob);
	draw.circ(cnv.width / 2, cnv.height / 2, mainPlayerBlob.mass, "red");

	// send mouse and loop

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
	mouse.xPercentage = clientX / this.document.documentElement.clientWidth * 100;
	mouse.yPercentage = clientY / this.document.documentElement.clientHeight * 100;

	mouse.x = mouse.xPercentage * cnv.width;
	mouse.y = mouse.yPercentage * cnv.height;
});

window.addEventListener("resize", () => {
	cnv.width  = Math.floor(window.innerWidth  * window.devicePixelRatio);
	cnv.height = Math.floor(window.innerHeight * window.devicePixelRatio);
});

window.dispatchEvent(new Event("resize"));
