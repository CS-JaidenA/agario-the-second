'use strict';

const Blob  = require("./component.blob.js");
const World = require("./component.world.js");

class Player {
	/** @type {Blob[]} */
	blobs = [];

	mouse = {
		x: 0,
		y: 0,
	};

	/** @type {string} */
	colour;

	split() {
		// loop through every blob in a random order and split them
		// stop once all of the blobs you started with have been split,
		// or you reach the max blob count. Whichever comes first.

		const startingBlobCount       = this.blobs.length;
		const unsplittedStartingBlobs = this.blobs.slice(0, startingBlobCount);

		for (let i = 0; i < startingBlobCount; i++) {
			// check if there are too many blobs

			if (this.blobs.length >= Player.MAX_BLOB_COUNT)
				break;

			// select random blob

			const index = Math.floor(Math.random() * unsplittedStartingBlobs.length);
			const blob  = unsplittedStartingBlobs[index];

			// remove blob from unsplitted

			unsplittedStartingBlobs.splice(index, 1);

			// split blob if able

			if (blob.mass / 2 < Blob.MIN_BLOB_SIZE)
				continue;

			blob.updateMass(blob.mass / 2);

			this.blobs.push(new Blob(
				blob.x.position,
				blob.y.position,
				Math.sign(this.mouse.x) * (blob.x.speedPx > blob.y.speedPx ? Blob.MOMENTUM : blob.x.speedPx / blob.y.speedPx * Blob.MOMENTUM),
				Math.sign(this.mouse.y) * (blob.y.speedPx > blob.x.speedPx ? Blob.MOMENTUM : blob.y.speedPx / blob.x.speedPx * Blob.MOMENTUM),
				blob.mass,
			));
		}
	}

	/** @param {World} world */
	tick(world) { this.blobs.forEach(blob => {
		const distanceX = Math.abs(this.mouse.x);
		const distanceY = Math.abs(this.mouse.y);

		if (!distanceX && !distanceY)
			return;

		const speedPx = (2 * blob.mass ** -0.45) * world.gridBoxSize;

		// speeds are adjusted so that blob x/y coords meet mouse at same time

		blob.x.speedPx = distanceX > distanceY ? speedPx : speedPx * distanceX / distanceY;
		blob.y.speedPx = distanceY > distanceX ? speedPx : speedPx * distanceY / distanceX;

		// calculate vector

		const angle  = Math.atan2(this.mouse.y, this.mouse.x);
		const vector = { x: Math.cos(angle), y: Math.sin(angle) };

		// move blob

		blob.x.position += (blob.x.speedPx * Math.sign(vector.x) + blob.x.momentum) / world.gridBoxSize * Math.abs(vector.x);
		blob.y.position += (blob.y.speedPx * Math.sign(vector.y) + blob.y.momentum) / world.gridBoxSize * Math.abs(vector.y);

		// decrease momentum
		// set to 0 if applicable in case momentum was a decimal

		if (Math.abs(blob.x.momentum) >= 1)
			blob.x.momentum = Math.sign(blob.x.momentum) * (Math.abs(blob.x.momentum) - 1);
		else blob.x.momentum = 0;

		if (Math.abs(blob.y.momentum) >= 1)
			blob.y.momentum = Math.sign(blob.y.momentum) * (Math.abs(blob.y.momentum) - 1);
		else blob.y.momentum = 0;

		// disallow moving past world borders

		if (blob.x.position <= 0)
			blob.x.position = 0;
		else if (blob.x.position >= world.width)
			blob.x.position = world.width;

		if (blob.y.position <= 0)
			blob.y.position = 0;
		else if (blob.y.position >= world.height)
			blob.y.position = world.height;
	}) }

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} mass
	 */
	constructor(x, y, mass, colour) {
		this.blobs.push(new Blob(x, y, 0, 0, mass));
		this.colour = colour;
	}

	static MAX_BLOB_COUNT = 16;
}

module.exports = Player;
