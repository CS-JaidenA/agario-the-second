import draw from "./manager@draw.js";
import mouse from "./manager@mouse.js";

/** @type {number} */
const speed = 5;

/** @type {HTMLCanvasElement} */
let cnv;

/** @type {CanvasRenderingContext2D} */
let ctx;

/**
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} context
 * @returns {undefined}
 */
function init(canvas, context) {
	cnv = canvas;
	ctx = context;

	// initialize dependencies with updated information

	draw.init(ctx);
}

class Blob {
	/**
	 * @namespace
	 * @property {number} pos
	 * @property {number} speed
	 * @property {number} momentum
	 * @property {number} direction
	 */
	x = {
		pos: 0,
		speed: 0,
		momentum: 0,
		direction: 0,
	};

	/**
	 * @namespace
	 * @property {number} pos
	 * @property {number} speed
	 * @property {number} momentum
	 * @property {number} direction
	 */
	y = {
		pos: 0,
		speed: 0,
		momentum: 0,
		direction: 0,
	};

	/** @type {number} */
	radius;

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} radius
	 * @param {number} xMomentum
	 * @param {number} yMomentum
	 */
	constructor(x, y, radius, xMomentum = 0, yMomentum = 0) {
		this.x.pos = x;
		this.y.pos = y;

		this.radius = radius;

		this.x.momentum = xMomentum;
		this.y.momentum = yMomentum;
	}

	static MOMENTUM			= 40;
	static MIN_BLOB_SIZE	= 50 ;
}

class Player {
	/** @type {Blob[]} */
	blobs = [];

	/** @type {string} */
	colour;

	/** @type {boolean} */
	spacePressed = false;

	/** @returns {undefined} */
	split() {
		this.blobs.forEach(blob => {
			if (blob.radius / 2 < Blob.MIN_BLOB_SIZE) return;

			blob.radius /= 2;

			this.blobs.push(new Blob(
				blob.x.pos,
				blob.y.pos,
				blob.radius,

				// adjust momentum to have same ratio as speed for correct angle

				blob.x.direction * Math.round(blob.x.speed > blob.y.speed ? Blob.MOMENTUM : blob.x.speed / blob.y.speed * Blob.MOMENTUM),
				blob.y.direction * Math.round(blob.y.speed > blob.x.speed ? Blob.MOMENTUM : blob.y.speed / blob.x.speed * Blob.MOMENTUM),
			));
		});
	}

	/** @returns {undefined} */
	draw() {
		this.blobs.forEach(blob => {
			// calculate mouse coordinates

			const mouseX = mouse.x * cnv.width;
			const mouseY = mouse.y * cnv.height;

			// calculate distance between blob and mouse coordinates

			const distanceX = Math.abs(mouseX - blob.x.pos);
			const distanceY = Math.abs(mouseY - blob.y.pos);

			// speeds are adjusted so that blob x/y coords meet mouse at same time
			// adjust speed only if the blob is not already centered

			if (distanceX > speed + 1 && distanceY > speed + 1) {
				blob.x.speed = distanceX > distanceY ? speed : speed * distanceX / distanceY;
				blob.y.speed = distanceY > distanceX ? speed : speed * distanceY / distanceX;
			} else {
				blob.x.speed = 0;
				blob.y.speed = 0;
			}

			// determine direction

			blob.x.direction = mouseX > blob.x.pos ? 1 : -1;
			blob.y.direction = mouseY > blob.y.pos ? 1 : -1;

			// move blob by speed and add momentum

			blob.x.pos += blob.x.speed * blob.x.direction + blob.x.momentum;
			blob.y.pos += blob.y.speed * blob.y.direction + blob.y.momentum;

			draw.circle(blob.x.pos, blob.y.pos, blob.radius, this.colour);

			// decrease momentum
			// set to 0 if applicable in case momentum was a decimal

			if (blob.x.momentum > -1 && blob.x.momentum < 1)
				blob.x.momentum = 0;
			else blob.x.momentum -= Math.sign(blob.x.momentum); // 1 reverse of x direction

			if (blob.y.momentum > -1 && blob.y.momentum < 1)
				blob.y.momentum = 0;
			else blob.y.momentum -= Math.sign(blob.y.momentum); // 1 reverse of y direction

			// write size

			const size = String(blob.radius);
			const metrics = ctx.measureText(size);

			ctx.font		= "64px Ubuntu";
			ctx.fillStyle	= "white";
			ctx.strokeStyle = "black";

			const textX = blob.x.pos - (metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight) / 2;
			const textY = blob.y.pos + (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) / 2;

			ctx.fillText(size, textX, textY);
			ctx.strokeText(size, textX, textY);
		});
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} radius
	 */
	constructor(x, y, radius, colour) {
		this.blobs.push(new Blob(x, y, radius));
		this.colour = colour;

		addEventListener("keyup", e => {
			if (e.code == "Space") this.spacePressed = false;
		});

		addEventListener("keydown", e => {
			if (this.spacePressed || e.code != "Space") return;
			this.spacePressed = false;
			this.split();
		});
	}
}

export default { init, Player };
