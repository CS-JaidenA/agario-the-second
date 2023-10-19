const Blob = require("./component.blob.js");

const SPEED = 40;

class Player {
	/** @type {Blob[]} */
	blobs = [];

	mouse = {
		x: 0,
		y: 0,
	};

	/** @type {string} */
	colour;

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} mass
	 */
	constructor(x, y, mass) {
		this.blobs.push(new Blob(x, y, mass));
		this.colour = "red";
	}
}

module.exports = Player;
