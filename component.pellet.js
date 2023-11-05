class Pellet {
	x;
	y;

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
