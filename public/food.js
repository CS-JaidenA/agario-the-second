import draw from "./manager@draw.js";
import colours from "./manager@colours.js";

function init(canvas, context) {
	draw.init(context);
}

class Food {
	/** @type {number} */
	x;

	/** @type {number} */
	y;

	/** @type {string} */
	colour;

	draw() {
		draw.circle(this.x, this.y, 5, this.colour);
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {string} colour
	 */
	constructor(x, y, colour) {
		this.x = x;
		this.y = y;

		this.colour = colour;
	}

	static MIN_FOOD_COUNT = 100;
}

export default { init, Food };
