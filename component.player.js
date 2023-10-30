'use strict';

const Blob  = require("./component.blob.js");
const World = require("./component.world.js");

const SPEED_PX = 5;

class Player {
	/** @type {Blob[]} */
	blobs = [];

	mouse = {
		x: 0,
		y: 0,
	};

	/** @type {string} */
	colour;

	split() { this.blobs.forEach(blob => {
		if (blob.mass / 2 < Blob.MIN_BLOB_SIZE) return;

		blob.updateMass(blob.mass / 2);

		this.blobs.push(new Blob(
			blob.x.position,
			blob.y.position,
			blob.x.speedPx > blob.y.speedPx ? Blob.MOMENTUM : blob.x.speedPx / blob.y.speedPx * Blob.MOMENTUM,
			blob.y.speedPx > blob.x.speedPx ? Blob.MOMENTUM : blob.y.speedPx / blob.x.speedPx * Blob.MOMENTUM,
			blob.mass,
		));
	}) }

	/** @param {World} world */
	tick(world) { this.blobs.forEach(blob => {
		const distanceX = Math.abs(this.mouse.x);
		const distanceY = Math.abs(this.mouse.y);

		if (!distanceX && !distanceY)
			return;

		// speeds are adjusted so that blob x/y coords meet mouse at same time

		blob.x.speedPx = distanceX > distanceY ? SPEED_PX : SPEED_PX * distanceX / distanceY;
		blob.y.speedPx = distanceY > distanceX ? SPEED_PX : SPEED_PX * distanceY / distanceX;

		console.log(1, distanceX, distanceY);

		// add momentum

		blob.x.speedPx += blob.x.momentum;
		blob.y.speedPx += blob.y.momentum;

		console.log(2, blob.x.speedPx, blob.x.momentum);

		// decrease momentum
		// set to 0 if applicable in case momentum was a decimal

		if (blob.x.momentum >= 1)
			blob.x.momentum--;
		else blob.x.momentum = 0;

		if (blob.y.momentum >= 1)
			blob.y.momentum--;
		else blob.y.momentum = 0;

		// calculate vector

		const angle  = Math.atan2(this.mouse.y, this.mouse.x);
		const vector = { x: Math.cos(angle), y: Math.sin(angle) };

		// move blob

		blob.x.position += blob.x.speedPx / world.gridBoxSize / world.width  * vector.x;
		blob.y.position += blob.y.speedPx / world.gridBoxSize / world.height * vector.y;

		console.log(3, blob.x.position, blob.x.speedPx, world.gridBoxSize, world.width, vector.x, '\n');
	}) }

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} mass
	 */
	constructor(x, y, mass, colour) {
		this.blobs.push(new Blob(x, y, mass, 0, 0));
		this.colour = colour;
	}
}

module.exports = Player;
