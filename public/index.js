"use strict";

const ws = new WebSocket(`${location.protocol === "http:" ? "ws" : "wss"}://${location.host}`);

/** @type {HTMLCanvasElement} */
const cnv = document.getElementById("canvas");
const ctx = cnv.getContext("2d");

const leaderboard = document.getElementById("leaderboard");
const score       = document.getElementById("score");

const gridboxColour    = "#313131";
const gridboxThickness = 1;

/**
 * @typedef  {object} CellPackage
 * @property {number} mass
 * @property {number} radius
 * @property {number} xPosition
 * @property {number} yPosition
 */

/**
 * @typedef  {object} MassPackage
 * @property {number} color
 * @property {number} radius
 * @property {number} xPosition
 * @property {number} yPosition
 */

/**
 * @typedef  {object} VirusPackage
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
 * @property {CellPackage[]} cells
 */

/**
 * @typedef  {Object}   World
 * @property {MassPackage[]} mass
 * @property {number}   width
 * @property {number}   height
 * @property {number}   gridboxDimension
 * @property {Virus[]}  viruses
 * @property {Pellet[]} pellets
 * @property {Object.<string, Player>} players
 */

/** @type {World} */
let world     = {};
let mainuuid  = '';
let gridboxDimension = 0;
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

let prevViewportSize;

function update() {
	ctx.clearRect(0, 0, cnv.width, cnv.height);

	const mainPlayer = world.players[mainuuid];

	const bounds = (function() {
		let topmost    = +Infinity;
		let leftmost   = +Infinity;
		let rightmost  = -Infinity;
		let bottommost = -Infinity;

		mainPlayer.cells.forEach(cell => {
			let top    = cell.yPosition - cell.radius;
			let left   = cell.xPosition - cell.radius;
			let right  = cell.xPosition + cell.radius;
			let bottom = cell.yPosition + cell.radius;

			if (top < topmost)
				topmost = top;

			if (left < leftmost)
				leftmost = left;

			if (right > rightmost)
				rightmost = right;

			if (bottom > bottommost)
				bottommost = bottom;
		});

		return {
			x:      (leftmost + rightmost) / 2,
			y:      (topmost + bottommost) / 2,
			top:    topmost,
			left:   leftmost,
			right:  rightmost,
			bottom: bottommost,
		};
	})();

	const newViewportSize = 60 + Math.max(bounds.right - bounds.left, bounds.bottom - bounds.top);

	// smooth viewport size change

	const viewportRate = Math.abs(prevViewportSize - newViewportSize) / 10;

	const viewportSize = prevViewportSize
		? prevViewportSize > newViewportSize
			? (prevViewportSize - newViewportSize < viewportRate)
				? newViewportSize
				: prevViewportSize - viewportRate
			: (newViewportSize - prevViewportSize < viewportRate)
				? newViewportSize
				: prevViewportSize + viewportRate
		: newViewportSize;

	prevViewportSize = viewportSize;

	const [viewportWidth, viewportHeight] = cnv.width > cnv.height
		? [viewportSize, viewportSize * cnv.height / cnv.width]
		: [viewportSize * cnv.width / cnv.height, viewportSize];

	const xViewportOffset = cnv.width  / 2 - bounds.x * gridboxDimension;
	const yViewportOffset = cnv.height / 2 - bounds.y * gridboxDimension;

	const [xOffset, yOffset] = cnv.width > cnv.height
		? [xViewportOffset, (viewportSize - viewportHeight) / 2 + yViewportOffset]
		: [(viewportSize - viewportWidth) / 2 + xViewportOffset, yViewportOffset];

	gridboxDimension = cnv.width > cnv.height
		? cnv.width  / viewportWidth
		: cnv.height / viewportHeight;

	const border = { top: yOffset, left: xOffset,
		right : world.width  * gridboxDimension + xOffset,
		bottom: world.height * gridboxDimension + yOffset,
	};

	// gridlines

	// vertical
	for (let i = 0; i <= world.width; i++) {
		const x = i * gridboxDimension + border.left;

		// dont render if outside of viewport
		if (x < 0) continue;
		if (x > cnv.width) break;

		drawLine(new Coordinate(x, border.top), new Coordinate(x, border.bottom));
	}

	// horizontal
	for (let i = 0; i <= world.height; i++) {
		const y = i * gridboxDimension + border.top;

		// dont render if outside of viewport
		if (y < 0) continue;
		if (y > cnv.height) break;

		drawLine(new Coordinate(border.left, y), new Coordinate(border.right, y));
	}

	// pellets

	world.pellets.forEach(pellet => {
		const x = pellet.xPosition * gridboxDimension + border.left;

		if (x < 0 || x > cnv.width)
			return;

		const y = pellet.yPosition * gridboxDimension + border.top;

		if (y < 0 || y > cnv.height)
			return;

		drawCirc(new Coordinate(x, y), pellet.radius * gridboxDimension, pellet.color);
	});

	// mass

	world.mass.forEach(mass => {
		const radius_px = mass.radius * gridboxDimension;

		const x = mass.xPosition * gridboxDimension + border.left;

		if (x + radius_px < 0 || x - radius_px > cnv.width)
			return;

		const y = mass.yPosition * gridboxDimension + border.top;

		if (y + radius_px < 0 || y - radius_px > cnv.height)
			return;

		const coordinate  = new Coordinate(x, y);

		// draw circles

		drawCirc(coordinate, radius_px, `rgb(${mass.color.slice(4, -1).split(", ").map(value => value * 0.6).join(", ")})`); // outside
		drawCirc(coordinate, radius_px - radius_px * 0.2, mass.color); // inside
	});

	// cells

	// organize cells and viruses from smallest to largest
	// to draw bigger cells over smaller cells

	const circles = world.viruses;

	for (const uuid in world.players) {
		const player = world.players[uuid];

		player.uuid = uuid;
		player.cells.map(cell => cell.player = player);
		circles.push(...player.cells);
	}

	// keep track of scores for score and leaderboard

	/** @type {Object} */
	const scores = {};

	circles.sort((circleA, circleB) => circleA.radius - circleB.radius).forEach(circle => {
		const borderWidth = 5; // total border width

		// cell
		if (Object.hasOwn(circle, "player")) {
			ctx.strokeStyle = "black";
			ctx.fillStyle   = "white";
			ctx.lineWidth   = 3.5;

			Object.hasOwn(scores, circle.player.uuid)
				? scores[circle.player.uuid].score += circle.mass
				: scores[circle.player.uuid] = { player: circle.player, score: circle.mass };

			const borderColor = `rgb(${circle.player.color.slice(4, -1).split(", ").map(value => value * 0.6).join(", ")})`;

			const radius_px = circle.radius * gridboxDimension;

			const x = circle.xPosition * gridboxDimension + border.left;

			if (x + radius_px < 0 || x - radius_px > cnv.width)
				return;

			const y = circle.yPosition * gridboxDimension + border.top;

			if (y + radius_px < 0 || y - radius_px > cnv.height)
				return;

			const coordinate = new Coordinate(x, y);

			// draw circles

			drawCirc(coordinate, radius_px + borderWidth, borderColor);
			drawCirc(coordinate, radius_px, circle.player.color);

			// draw name

			ctx.font = "32px Ubuntu";
			const nameWidth = ctx.measureText(circle.player.name).width;
			ctx.font = `${Math.max(18, nameWidth < radius_px * 2 ? 32 : 32 * radius_px * 2 / nameWidth)}px Ubuntu`;

			const nameMetrics = ctx.measureText(circle.player.name);

			const nameX = coordinate.x - nameMetrics.width / 2;
			const nameY = coordinate.y + (nameMetrics.fontBoundingBoxAscent + nameMetrics.fontBoundingBoxDescent) / 2 - (function() {
				if (circle.player.uuid !== mainuuid)
					return 0;

				const lineWidth = ctx.lineWidth;
				const font      = ctx.font;

				// mass

				const mass = String(Math.floor(circle.mass));

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

			ctx.strokeText(circle.player.name, nameX, nameY);
			ctx.fillText(circle.player.name, nameX, nameY);

			return;
		}

		// virus

		const radius_px = circle.radius * gridboxDimension;

		const x = circle.xPosition * gridboxDimension + border.left;

		if (x + radius_px < 0 || x - radius_px > cnv.width)
			return;

		const y = circle.yPosition * gridboxDimension + border.top;

		if (y + radius_px < 0 || y - radius_px > cnv.height)
			return;

		const coordinate  = new Coordinate(x, y);

		// draw circles

		drawCirc(coordinate, radius_px, "rgb(31, 153, 31)"); // outside
		drawCirc(coordinate, radius_px - borderWidth, "#33FF33"); // inside
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
		xPosition: (mouse.x_px - border.left) / gridboxDimension,
		yPosition: (mouse.y_px - border.top ) / gridboxDimension,
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

let wPressed     = false;
let spacePressed = false;

window.addEventListener("keyup", event => {
	if (event.code === "KeyW") wPressed = false;
	else if (event.code === "Space") spacePressed = false;
});

window.addEventListener("keydown", event => {
	if (event.code === "KeyW") {
		if (wPressed) return;

		wPressed = true;
		ws.send(JSON.stringify({ type: "eject" }));
	}
	else if (event.code === "Space") {
		if (spacePressed) return;

		spacePressed = true;
		ws.send(JSON.stringify({ type: "split" }));
	}
});
