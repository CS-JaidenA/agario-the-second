'use strict';

const ws = new WebSocket(`${location.protocol === "http:" ? "ws" : "wss"}://${location.host}`);

/** @type {HTMLCanvasElement} */
const cnv = document.getElementById("canvas");
const ctx = cnv.getContext("2d");

const gridBox = {
	size:  40,
	style: ["#313131", 1],
};

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

	const player = game.pack.players[game.uuid];

	const bounds = (function() {
		let bottommost = -Infinity;
		let rightmost  = -Infinity;
		let leftmost   = +Infinity;
		let topmost    = +Infinity;

		player.blobs.forEach(blob => {
			const x = blob.x.position * game.pack.gridBoxSize;
			const y = blob.y.position * game.pack.gridBoxSize;

			const bottom = y + blob.radius;
			const right  = x + blob.radius;
			const left   = x - blob.radius;
			const top    = y - blob.radius;

			if (bottom > bottommost) bottommost = bottom;
			if (right  > rightmost ) rightmost  = right;
			if (left   < leftmost  ) leftmost   = left;
			if (top    < topmost   ) topmost    = top;
		});

		return {
			x: (leftmost + rightmost) / 2,
			y: (topmost + bottommost) / 2,
			width: rightmost - leftmost,
			height: bottommost - topmost,
		};
	})();

	const scaleFactor = (function() {
		return 1 - Math.max(bounds.width, bounds.height) / 1000;
	})();

	// draw

	draw.grid(bounds, scaleFactor);

	for (const uuid in game.pack.players) {
		if (uuid === game.uuid) continue;

		const player = game.pack.players[uuid];
		const blob   = player.blobs[0];
		const radius = blob.radius;

		const x = cnv.width  / 2 + (blob.x.position - bounds.x / game.pack.gridBoxSize) * 40;

		if (x + radius < 0 || x - radius > cnv.width)
			continue;

		const y = cnv.height / 2 + (blob.y.position - bounds.y / game.pack.gridBoxSize) * 40;

		if (y + radius < 0 || y - radius > cnv.height)
			continue;

		draw.circ(x, y, scaleFactor * blob.radius, player.colour);
	}

	// draw player

	ctx.font        = "48px Ubuntu";
	ctx.fillStyle   = "white";
	ctx.lineWidth   = 2;
	ctx.strokeStyle = "black";

	player.blobs.forEach(blob => {
		const x = cnv.width  / 2 + (blob.x.position - bounds.x / game.pack.gridBoxSize) * 40;
		const y = cnv.height / 2 + (blob.y.position - bounds.y / game.pack.gridBoxSize) * 40;

		draw.circ(x, y, scaleFactor * blob.radius, player.colour);

		// draw mass

		const mass    = String(Math.round(blob.mass));
		const metrics = ctx.measureText(mass);

		const massX   = x - ((metrics.actualBoundingBoxLeft   + metrics.actualBoundingBoxRight  ) / 2);
		const massY   = y + ((metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) / 2);

		ctx.fillText(mass, massX, massY);
		ctx.strokeText(mass, massX, massY);
	});

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

window.addEventListener("keyup", event => {
	if (event.code === "Space") spacePressed = false;
});

window.addEventListener("keydown", event => {
	if (spacePressed || event.code !== "Space") return;
	spacePressed = true;

	// split

	ws.send(JSON.stringify({ type: "split" }));
});
