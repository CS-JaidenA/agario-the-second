const VARIATION    = 0.1;
const DEFAULT_MASS = 1;

const MAX = DEFAULT_MASS + VARIATION;
const MIN = DEFAULT_MASS - VARIATION;

/**
 * @typedef  {object} World
 * @property {number} gridboxDimension
 */

class Pellet {
	world;

	mass;
	radius;

	xPosition;
	yPosition;

	color;

	pack() { return {
		radius:    this.radius,
		xPosition: this.xPosition,
		yPosition: this.yPosition,
		color:     this.color,
	} }

	/**
	 * @param {World}  world
	 * @param {number} xPosition
	 * @param {number} yPosition
	 * @param {string} color
	 */
	constructor(world, xPosition, yPosition, color) {
		this.world     = world;
		this.color     = color;

		this.xPosition = xPosition;
		this.yPosition = yPosition;

		this.mass     = Math.random() * (MAX - MIN) + MIN;
		this.radius   = Math.sqrt(this.mass * 100) / this.world.gridboxDimension;
	}

	get diameter() {
		return this.radius * 2;
	}
}

module.exports = Pellet;
