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

function circ(x, y, radius, colour) {
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI);

	ctx.fillStyle = colour;
	ctx.fill();
}

function line(x1, y1, x2, y2, colour, thickness) {
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);

	ctx.strokeStyle = colour;
	ctx.lineWidth   = thickness;
	ctx.stroke();
}

function rect(x, y, width, height, colour) {
	ctx.rect(x, y, width, height);

	ctx.fillStyle = colour;
	ctx.fill();
}

// draw canvas

const gridBox = {
	style: ["#313131", 1],
	size:  40,
};

function update() {
	ctx.clearRect(0, 0, cnv.width, cnv.height);

	const mainPlayerBlob = game.pack.players[game.uuid].blobs[0];

	const x = {
		border: game.pack.height * gridBox.size,
		offset: cnv.width  / 2 - mainPlayerBlob.x * gridBox.size,
	};

	const y = {
		border: game.pack.height * gridBox.size,
		offset: cnv.height / 2 - mainPlayerBlob.y * gridBox.size,
	};

	// draw grid border

	const grid = {
		bottom: y.offset + game.pack.height * gridBox.size,
		right:  x.offset + game.pack.width  * gridBox.size,
		left:   x.offset,
		top:    y.offset,
	};

	line(grid.left,  grid.top,    grid.left,  grid.bottom, ...gridBox.style);
	line(grid.left,  grid.top,    grid.right, grid.top,    ...gridBox.style);
	line(grid.right, grid.top,    grid.right, grid.bottom, ...gridBox.style);
	line(grid.left,  grid.bottom, grid.right, grid.bottom, ...gridBox.style);

	// draw horizontal grid lines

	for (let i = 1; i < game.pack.height; i++) {
		const y = grid.top + gridBox.size * i;
		line(grid.left, y, grid.right, y, ...gridBox.style);
	}

	// draw vertical grid lines

	for (let i = 1; i < game.pack.width; i++) {
		const x = grid.left + gridBox.size * i;
		line(x, grid.top, x, grid.bottom, ...gridBox.style);
	}

	// draw player

	circ(cnv.width / 2, cnv.height / 2, mainPlayerBlob.mass, "red");

	// loop

	requestAnimationFrame(update);
}
