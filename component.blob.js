class Blob {
	/** @type {number} */
	x;

	/** @type {number} */
	y;

	/** @type {number} */
	mass;

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} mass Undefined for spawn mass.
	 */
	constructor(x, y, mass) {
		this.x = x;
		this.y = y;

		this.mass = mass;
	}
}

module.exports = Blob;
