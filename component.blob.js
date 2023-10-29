class Blob {
	/** @type {number} */
	x;

	/** @type {number} */
	y;

	/** @type {number} */
	mass;

	/** @type {number} */
	radius;

	/** @type {number} */
	xMomentum;

	/** @type {number} */
	yMomentum;

	/** @type {number} */
	prevXDirection = 0;

	/** @type {number} */
	prevYDirection = 0;

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} mass Undefined for spawn mass.
	 */
	constructor(x, y, mass, xMomentum, yMomentum) {
		this.x = x;
		this.y = y;

		this.mass = mass;
		this.radius = Math.sqrt(this.mass * 100);

		this.xMomentum = xMomentum;
		this.yMomentum = yMomentum;
	}
}

module.exports = Blob;
