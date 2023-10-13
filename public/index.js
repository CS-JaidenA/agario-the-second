// establish connection

const ws = new WebSocket("ws://localhost:3000");

/** @type {import("../component.world").WorldPackageExtendedObject} */
let pack = {};
let uuid = '';

ws.addEventListener("message", e => {
	const message = JSON.parse(e.data);

	// console.log(100, message.pack, message.uuid);
	// console.log(200, pack);

	if (message.uuid)
		uuid = message.uuid;

	if (message.pack) {
		console.log(100, message.pack);
		pack = { ...pack, ...message.pack };
		requestAnimationFrame(update);
	}

	console.log(300, uuid);
});

/** @type {HTMLCanvasElement} */
const cnv = document.getElementById("canvas");
const ctx = cnv.getContext("2d");

// scale canvas

window.addEventListener("resize", () => {
	cnv.width	= Math.floor(window.innerWidth  * window.devicePixelRatio);
	cnv.height	= Math.floor(window.innerHeight * window.devicePixelRatio);
});

window.dispatchEvent(new Event("resize"));

const draw = {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} radius
     * @param {string} colour
     * @returns {undefined}
     */
    circ: (x, y, radius, colour) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);

        ctx.fillStyle = colour;
        ctx.fill();
    },

	line: (f, s, c, w) => {
		ctx.beginPath();
		ctx.moveTo(f[0], f[1]);
		ctx.lineTo(s[0], s[1]);

		ctx.strokeStyle = c;
		ctx.lineWidth = w;
		ctx.stroke();
	},

	rect: (x, y, w, h, c) => {
		ctx.rect(x, y, w, h);

		ctx.fillStyle = c;
		ctx.fill();
	},
};

// draw canvas

const gridColour     = "#313131";
const gridBoxSize   = 40;
const gridThickness = 1;

function update() {
	ctx.clearRect(0, 0, cnv.width, cnv.height);

	const mainPlayerBlob = pack.players[uuid].blobs[0];

	const gridWidth  = gridBoxSize * pack.width;
	const gridHeight = gridHeight * pack.height;
}

// function update() {
// 	if (!pack) return;

// 	ctx.clearRect(0, 0, cnv.width, cnv.height);

// 	const mainPlayerBlob = pack.players[uuid].blobs[0];

// 	// draw grid

// 	const lineWidth   = 1;
// 	const lineColor   = "#313131";
// 	const gridboxSize = 40;

// 	console.log(10, mainPlayerBlob);

// 	const offsetX = (gridboxSize * pack.width) - (mainPlayerBlob.x / pack.width * cnv.width);

// 	// border lines

// 	const borderX = gridboxSize * pack.width;
// 	const borderY = gridboxSize * pack.height;

// 	draw.line([borderX, 0], [borderX, borderY], lineColor, lineWidth);
// 	draw.line([0, borderY], [borderX, borderY], lineColor, lineWidth);

// 	// vertical lines

// 	for (let i = 1; i < pack.width; i++) {
// 		const x = gridboxSize * i;

// 		draw.line(
// 			[x, 0],
// 			[x, Math.min(cnv.height, gridboxSize * pack.height)],
// 			lineColor,
// 			lineWidth,
// 		);
// 	}

// 	// horizontal lines

// 	for (let i = 1; i < pack.height; i++) {
// 		const y = gridboxSize * i + offsetX;

// 		draw.line(
// 			[0, y],
// 			[Math.min(cnv.width, gridboxSize * pack.width), y],
// 			lineColor,
// 			lineWidth,
// 		);
// 	}

// 	for (const player of Object.values(pack.players)) {
// 		const blob = player.blobs[0];

// 		// console.log(blob.x, blob.y);

// 		// draw.circ(
// 		// 	blob.x * gridboxSize,
// 		// 	blob.y * gridboxSize,
// 		// 	blob.mass,
// 		// 	player.colour,
// 		// );

// 		draw.circ(
// 			cnv.width  / 2,
// 			cnv.height / 2,
// 			blob.mass,
// 			player.colour,
// 		);
// 	}
// }
