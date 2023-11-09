'use strict';

const ws = new WebSocket(`${location.protocol === "http:" ? "ws" : "wss"}://${location.host}`);

/** @type {HTMLCanvasElement} */
const cnv = document.getElementById("canvas");
const ctx = cnv.getContext("2d");

const leaderboard = document.getElementById("leaderboard");
const score       = document.getElementById("score");

const gridboxColour    = "#313131";
const gridboxThickness = 1;

/**
 * @typedef  {Object} Cell
 * @property {number} mass
 * @property {number} radius
 * @property {number} xPosition
 * @property {number} yPosition
 */

/**
 * @typedef  {Object} Pellet
 * @property {string} color
 * @property {number} radius
 * @property {number} xPosition
 * @property {number} yPosition
 */

/**
 * @typedef  {Object} Player
 * @property {string} name
 * @property {string} color
 * @property {Cell[]} cells
 */

/**
 * @typedef  {Object}   World
 * @property {number}   width
 * @property {number}   height
 * @property {number}   gridboxDimension
 * @property {Pellet[]} pellets
 * @property {Object.<string, Player>} players
 */

/** @type {World} */
let world     = {};
let mainuuid  = '';

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
	const fillStyle = ctx.fillStyle;

	ctx.beginPath();
	ctx.arc(coord.x, coord.y, radius, 0, 2 * Math.PI);

	ctx.fillStyle = colour;
	ctx.fill();

	ctx.fillStyle = fillStyle;
};

function drawLine(coord1, coord2) {
	const strokeStyle = ctx.strokeStyle;
	const lineWidth   = ctx.lineWidth;

	ctx.beginPath();
	ctx.moveTo(coord1.x, coord1.y);
	ctx.lineTo(coord2.x, coord2.y);

	ctx.strokeStyle = gridboxColour;
	ctx.lineWidth   = gridboxThickness;
	ctx.stroke();

	ctx.strokeStyle = strokeStyle;
	ctx.lineWidth   = lineWidth;
};

// draw canvas

function update() {
	ctx.clearRect(0, 0, cnv.width, cnv.height);

	const offset = world.gridboxDimension;
	const border = { top: offset, left: offset,
		right : world.width  * (world.gridboxDimension + gridboxThickness) + offset,
		bottom: world.height * (world.gridboxDimension + gridboxThickness) + offset,
	};

	// gridlines

	// vertical
	for (let i = 0; i <= world.width; i++) {
		const x = i * (world.gridboxDimension + gridboxThickness) + border.left;

		// dont render if outside of viewport
		if (x < 0 || x > cnv.width)
			return;

		drawLine(new Coordinate(x, border.top), new Coordinate(x, border.bottom));
	}

	// horizontal
	for (let i = 0; i <= world.height; i++) {
		const y = i * (world.gridboxDimension + gridboxThickness) + border.top;

		// dont render if outside of viewport
		if (y < 0 || y > cnv.height)
			return;

		drawLine(new Coordinate(border.left, y), new Coordinate(border.right, y));
	}

	// pellets

	world.pellets.forEach(pellet => drawCirc(new Coordinate(
		pellet.xPosition * world.gridboxDimension + border.left,
		pellet.yPosition * world.gridboxDimension + border.top,
		pellet.radius, pellet.color,
	), pellet.radius * world.gridboxDimension, pellet.color));

	// cells

	// organize cells from smallest to largest
	// to draw bigger cells over smaller cells

	const cells = [];

	for (const uuid in world.players) {
		const player = world.players[uuid];

		player.uuid = uuid;
		player.cells.map(cell => cell.player = player);
		cells.push(...player.cells);
	}

	// keep track of scores for score and leaderboard

	/** @type {Object} */
	const scores = {};

	ctx.strokeStyle = "black";
	ctx.fillStyle   = "white";
	ctx.lineWidth   = 3.5;

	// sort by actual mass -- not animated mass
	cells.sort((cellA, cellB) => cellA.mass - cellB.mass).forEach(cell => {
		Object.hasOwn(scores, cell.player.uuid)
			? scores[cell.player.uuid].score += cell.mass
			: scores[cell.player.uuid] = { player: cell.player, score: cell.mass };

		const borderWidth = 5; // total border width
		const borderColor = `rgb(${cell.player.color.slice(4, -1).split(", ").map(value => value * 0.6).join(", ")})`;

		const coordinate  = new Coordinate(
			cell.xPosition * world.gridboxDimension + border.left,
			cell.yPosition * world.gridboxDimension + border.top,
		);

		// draw circles

		const radius_px = cell.radius * world.gridboxDimension;

		drawCirc(coordinate, radius_px + borderWidth, borderColor);
		drawCirc(coordinate, radius_px, cell.player.color);

		// draw name

		ctx.font = "32px Ubuntu";
		const nameWidth = ctx.measureText(cell.player.name).width;
		ctx.font = `${Math.max(18, nameWidth < radius_px * 2 ? 32 : 32 * radius_px * 2 / nameWidth)}px Ubuntu`;

		const nameMetrics = ctx.measureText(cell.player.name);

		const nameX = coordinate.x - nameMetrics.width / 2;
		const nameY = coordinate.y + (nameMetrics.fontBoundingBoxAscent + nameMetrics.fontBoundingBoxDescent) / 2 - (function() {
			if (cell.player.uuid !== mainuuid)
				return 0;

			const lineWidth = ctx.lineWidth;
			const font      = ctx.font;

			// mass

			const mass = String(Math.floor(cell.mass));

			ctx.lineWidth = 2;
			ctx.font      = "18px Ubuntu";

			const massMetrics = ctx.measureText(mass);
			const massHeight  = massMetrics.fontBoundingBoxAscent - massMetrics.fontBoundingBoxDescent;
			const nameHeight  = nameMetrics.fontBoundingBoxAscent - nameMetrics.fontBoundingBoxDescent;

			const offset  = (nameHeight + massHeight) / 2;
			const massX   = coordinate.x - massMetrics.width / 2;
			const massY   = coordinate.y + (massMetrics.fontBoundingBoxAscent + massMetrics.fontBoundingBoxDescent) / 2 + offset;

			ctx.strokeText(mass, massX, massY);
			ctx.fillText(mass, massX, massY);

			ctx.lineWidth = lineWidth;
			ctx.font      = font;

			return offset;
		})();

		ctx.strokeText(cell.player.name, nameX, nameY);
		ctx.fillText(cell.player.name, nameX, nameY);
	});

	// score

	score.innerHTML = Math.floor(scores[mainuuid].score);

	// leaderboard

	const topTenPlayers = Object.values(scores)
		.sort((a, b) => b.score - a.score)
		.slice(0, 10);

	let innerHtml = '';

	for (let i = 0; i < topTenPlayers.length; i++) {
		const player = topTenPlayers[i].player;
		innerHtml += `<div ${player.uuid === mainuuid ? 'class="highlight"' : ''}>${i + 1}. ${player.name}</div>\n`;
	}

	leaderboard.innerHTML = innerHtml;

	// mouse

	ws.send(JSON.stringify({ type: "mouse", load: {
		xPosition: (mouse.x_px - border.left) / world.gridboxDimension,
		yPosition: (mouse.y_px - border.top ) / world.gridboxDimension,
	}}));
}

ws.addEventListener("message", e => {
	const message = JSON.parse(e.data);

	if (message.uuid)
		mainuuid = message.uuid;

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
