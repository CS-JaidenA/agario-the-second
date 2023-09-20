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
	#area;

	/** @type {number} */
	#points;

	/** @type {number} */
	#radius;

	get area() {
		return this.#area;
	}

	get points() {
		return this.#points;
	}

	get radius() {
		return this.#radius;
	}

	set points(points) {
		this.#points	= points;

		this.#area		= points * Math.PI * 50;
		this.#radius	= Math.sqrt(this.#area / Math.PI);
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} points
	 * @param {number} xMomentum
	 * @param {number} yMomentum
	 */
	constructor(x, y, points, xMomentum = 0, yMomentum = 0) {
		this.x.pos = x;
		this.y.pos = y;

		this.points = points;

		this.x.momentum = xMomentum;
		this.y.momentum = yMomentum;
	}

	static SPLIT_MOMENTUM	= 35;
	static MIN_BLOB_POINTS	= 25;
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
			if (blob.points / 2 < Blob.MIN_BLOB_POINTS) return;

			blob.points /= 2;

			this.blobs.push(new Blob(
				blob.x.pos,
				blob.y.pos,

				blob.points,

				// adjust momentum to have same ratio as speed for correct angle

				blob.x.direction * Math.round(blob.x.speed > blob.y.speed ? Blob.SPLIT_MOMENTUM : blob.x.speed / blob.y.speed * Blob.SPLIT_MOMENTUM),
				blob.y.direction * Math.round(blob.y.speed > blob.x.speed ? Blob.SPLIT_MOMENTUM : blob.y.speed / blob.x.speed * Blob.SPLIT_MOMENTUM),
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

			if (distanceX > speed || distanceY > speed) {
				blob.x.speed = distanceX > distanceY ? speed : speed * distanceX / distanceY;
				blob.y.speed = distanceY > distanceX ? speed : speed * distanceY / distanceX;
			} else {
				blob.x.speed = 0;
				blob.y.speed = 0;
			}

			// determine direction

			blob.x.direction = mouseX > blob.x.pos ? 1 : -1;
			blob.y.direction = mouseY > blob.y.pos ? 1 : -1;

			// determine speed and collisions

			// for (const sibling of this.blobs) {
			// 	if (blob === sibling) continue;

			// 	const blobTopmostPos	= blob.y.pos - blob.radius;
			// 	const blobLeftmostPos	= blob.x.pos - blob.radius;
			// 	const blobRightmostPos	= blob.x.pos + blob.radius;
			// 	const blobBottommostPos	= blob.y.pos + blob.radius;

			// 	const siblingTopmostPos		= sibling.y.pos - sibling.radius;
			// 	const siblingLeftmostPos	= sibling.x.pos - sibling.radius;
			// 	const siblingRightmostPos	= sibling.x.pos + sibling.radius;
			// 	const siblingBottommostPos	= sibling.y.pos + sibling.radius;

			// 	blob.x.freeze = (
			// 		// x collision

			// 		blobLeftmostPos < siblingRightmostPos &&
			// 		blobRightmostPos > siblingLeftmostPos && (

			// 		// check if y is in collision range

			// 		blobTopmostPos < siblingBottommostPos ||
			// 		blobBottommostPos > siblingTopmostPos ) &&

			// 		// make sure they're not moving in the same direction

			// 		((blob.x.direction !== sibling.x.direction) || (sibling.x.speed === 0))
			// 	);

			// 	blob.y.freeze = (
			// 		// y collision

			// 		blobTopmostPos < siblingBottommostPos &&
			// 		blobBottommostPos > siblingTopmostPos && (

			// 		// check if x is in collision range

			// 		blobLeftmostPos < siblingRightmostPos ||
			// 		blobRightmostPos > siblingLeftmostPos ) &&

			// 		// make sure they're not moving in the same direction

			// 		((blob.y.direction !== sibling.y.direction) || (sibling.y.speed === 0))
			// 	);
			// }

			for (const sibling of this.blobs) {
				if (blob === sibling) continue;
				if (blob.x.momentum !== 0 || blob.y.momentum !== 0) continue;
				if (sibling.x.momentum !== 0 || sibling.y.momentum !== 0) continue;

				const blobTopmostPos	= blob.y.pos - blob.radius;
				const blobLeftmostPos	= blob.x.pos - blob.radius;
				const blobRightmostPos	= blob.x.pos + blob.radius;
				const blobBottommostPos	= blob.y.pos + blob.radius;

				const siblingTopmostPos		= sibling.y.pos - sibling.radius;
				const siblingLeftmostPos	= sibling.x.pos - sibling.radius;
				const siblingRightmostPos	= sibling.x.pos + sibling.radius;
				const siblingBottommostPos	= sibling.y.pos + sibling.radius;

				// X collisions
				
				(function() {
					// verify if y is in collision range

					if (// check if blob is above sibling
						blobTopmostPos < siblingTopmostPos &&
						blobBottommostPos < siblingTopmostPos
					) return;

					if ( // check if blob is below sibling
						blobTopmostPos > siblingBottommostPos &&
						blobBottommostPos > siblingBottommostPos
					) return;

					// apply repulsive force if inside

					if (
						blobRightmostPos > siblingLeftmostPos &&
						blobRightmostPos < siblingRightmostPos
					) return blob.x.direction = -1;
					else if (
						blobLeftmostPos < siblingRightmostPos &&
						blobLeftmostPos > siblingLeftmostPos
					) return blob.x.direction = 1;

					// adjust speed in case of collision

					if (blob.x.direction === 1)
						 if (
							blobRightmostPos + blob.x.speed > siblingLeftmostPos &&
							blobRightmostPos + blob.x.speed < siblingRightmostPos
						) blob.x.speed = siblingLeftmostPos - blobRightmostPos;
					// else if (
					// 		blobLeftmostPos - blob.x.speed < siblingRightmostPos &&
					// 		blobLeftmostPos - blob.x.speed > siblingLeftmostPos
					// 	) blob.x.speed = blobLeftmostPos - siblingRightmostPos;
				})();

				// y collisions

				// (function() {
				// 	// verify if x is in collision range

				// 	if (blobLeftmostPos > siblingRightmostPos) return;
				// 	if (blobRightmostPos < siblingLeftmostPos) return;

				// 	// adjust speed in case of collision

				// 	if (blob.y.direction === 1)
				// 		 if (blobBottommostPos + blob.y.speed > siblingTopmostPos)
				// 		 	blob.y.speed = siblingTopmostPos - blobBottommostPos;
				// 	else if (blobTopmostPos - blob.y.speed < siblingBottommostPos)
				// 			blob.y.speed = blobTopmostPos - siblingBottommostPos;
				// })();
			}

			// move blob by speed and add momentum

			blob.x.pos += blob.x.speed * blob.x.direction + blob.x.momentum;
			blob.y.pos += blob.y.speed * blob.y.direction + blob.y.momentum;

			draw.circle(blob.x.pos, blob.y.pos, blob.radius, this.colour);
			
			ctx.strokeStyle = "red";
			ctx.strokeRect(blob.x.pos - blob.radius, blob.y.pos - blob.radius, blob.radius * 2, blob.radius * 2);

			// decrease momentum
			// set to 0 if applicable in case momentum was a decimal

			if (blob.x.momentum > -1 && blob.x.momentum < 1)
				blob.x.momentum = 0;
			else blob.x.momentum -= Math.sign(blob.x.momentum); // 1 reverse of x direction

			if (blob.y.momentum > -1 && blob.y.momentum < 1)
				blob.y.momentum = 0;
			else blob.y.momentum -= Math.sign(blob.y.momentum); // 1 reverse of y direction

			// write size

			const size = String(blob.points);
			const metrics = ctx.measureText(size);

			ctx.font		= "32px Ubuntu";
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
	 * @param {number} points
	 */
	constructor(x, y, points, colour) {
		this.blobs.push(new Blob(x, y, points));
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
