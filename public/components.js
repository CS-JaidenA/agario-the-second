/**
 * @typedef {object} Blob
 * @property {number} x
 * @property {number} y
 * @property {number} radius
 * @property {string} colour
 */

class Blob {
	/** @type {number} */
	x;

	/** @type {number} */
	y;

	/** @type {number} */
	radius;

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} radius
	 */
	constructor(x, y, radius) {
		this.x = x;
		this.y = y;

		this.radius = radius;
	}
}

class Player {
	/** @type {Blob[]} */
	blobs = [];

	/** @type {string} */
	colour;

	split() {
		this.blobs.forEach(blob => {
			blob.radius /= 2;
			this.blobs.push(new Blob(blob.x + 100, blob.y + 100, blob.radius));
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

		addEventListener("keydown", e => {
			if (e.code == "Space") this.split();
		});
	}
}

export default { Player };
