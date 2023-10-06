const Blob = require("./component.blob.js");

class Player {
	/** @type {Blob[]} */
	blobs = [];

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
