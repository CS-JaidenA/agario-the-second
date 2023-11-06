const VARIATION    = 0.1;
const DEFAULT_MASS = 1;

const MAX = DEFAULT_MASS + VARIATION;
const MIN = DEFAULT_MASS - VARIATION;

class Pellet {
	x;
	y;

	mass   = Math.random() * (MAX - MIN) + MIN;
	radius = Math.sqrt(this.mass * 100);

	color;

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {string} color
	 */
	constructor(x, y, color) {
		this.x = x;
		this.y = y;

		this.color = color;
	}
}

module.exports = Pellet;
