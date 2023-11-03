'use strict';

const ws = new WebSocket(`${location.protocol === "http:" ? "ws" : "wss"}://${location.host}`);

/** @type {HTMLCanvasElement} */
const cnv = document.getElementById("canvas");
const ctx = cnv.getContext("2d");

const gridboxColour    = "#313131";
const gridboxThickness = 1;

/**
 * @typedef  {Object} Cell
 * @property {number} mass
 * @property {number} radius
 * @property {number} x The position in gridboxes.
 * @property {number} y The position in gridboxes.
 */

/**
 * @typedef  {Object} Player
 * @property {string} colour
 * @property {Cell[]} cells
 */

/**
 * @typedef  {Object}   World
 * @property {number}   width
 * @property {number}   height
 * @property {number}   gridboxDimension
 * @property {Player[]} players
 */

/** @type {World} */
let world = {};
let uuid  = '';

/**
 * @typedef  {Object} Mouse
 * @property {number} x_px
 * @property {number} y_px
 */

/** @type {Mouse} */
const mouse = {};

addEventListener("mousemove", event => {
	mouse.x_px = event.clientX;
	mouse.y_px = event.clientY;
});

class Coordinate {
	x;
	y;

	/**
	 * @param {number} x
	 * @param {number} y
	 */
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

function drawCirc(coord, radius, colour) {
	ctx.beginPath();
	ctx.arc(coord.x, coord.y, radius, 0, 2 * Math.PI);

	ctx.fillStyle = colour;
	ctx.fill();
};

function drawLine(coord1, coord2) {
	ctx.beginPath();
	ctx.moveTo(coord1.x, coord1.y);
	ctx.lineTo(coord2.x, coord2.y);

	ctx.strokeStyle = gridboxColour;
	ctx.lineWidth   = gridboxThickness;
	ctx.stroke();
};

// draw canvas

function update() {
	ctx.clearRect(0, 0, cnv.width, cnv.height);

	const offset = world.gridboxDimension;

	/**
	 * @typedef  {Object} Border
	 * @property {number} top
	 * @property {number} left
	 * @property {number} right
	 * @property {number} bottom
	 */

	/** @type {Border} */
	const border = {
		top   : offset,
		left  : offset,
		right : world.width  * (world.gridboxDimension + gridboxThickness) + offset,
		bottom: world.height * (world.gridboxDimension + gridboxThickness) + offset,
	};

	// vertical gridlines

	for (let i = 0; i <= world.width; i++) {
		const x = i * (world.gridboxDimension + gridboxThickness) + border.left;

		drawLine(new Coordinate(x, border.top), new Coordinate(x, border.bottom));
	}

	// horizontal gridlines

	for (let i = 0; i <= world.height; i++) {
		const y = i * (world.gridboxDimension + gridboxThickness) + border.top;
		drawLine(new Coordinate(border.left, y), new Coordinate(border.right, y));
	}

	// players

	Object.values(world.players).forEach(player => player.cells.forEach(cell => drawCirc(new Coordinate(
		cell.x * world.gridboxDimension + border.left,
		cell.y * world.gridboxDimension + border.top,
	), cell.radius, player.colour)));

	// mouse

	ws.send(JSON.stringify({ type: "mouse", load: {
		x: (mouse.x_px - border.left) / world.gridboxDimension,
		y: (mouse.y_px - border.top ) / world.gridboxDimension,
	}}));
}

ws.addEventListener("message", e => {
	const message = JSON.parse(e.data);

	if (message.uuid)
		uuid = message.uuid;

	if (message.pack) {
		world = { ...world, ...message.pack };
		requestAnimationFrame(update);
	}
});

window.addEventListener("resize", () => {
	cnv.width  = Math.floor(window.innerWidth  * window.devicePixelRatio);
	cnv.height = Math.floor(window.innerHeight * window.devicePixelRatio);
});

window.dispatchEvent(new Event("resize"));

let spacePressed = false;

window.addEventListener("keyup", event => {
	if (event.code === "Space") spacePressed = false;
});

window.addEventListener("keydown", event => {
	if (spacePressed || event.code !== "Space") return;
	spacePressed = true;

	// split

	ws.send(JSON.stringify({ type: "split" }));
});
