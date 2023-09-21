import food from "./food.js";
import colours from "./manager@colours.js";
import components from "./components.js";

food.init(cnv, ctx);
components.init(cnv, ctx);

class World {
	/** @type {Food[]} */
	food = [];

	/** @type {MainPlayer[]} */
	players = [];

	draw() {
		for (let i = 0; i < food.Food.MIN_FOOD_COUNT - this.food.length; i++)
			this.food.push(new food.Food(
				Math.random() * cnv.width,
				Math.random() * cnv.height,
				colours.random()
			));

		this.food.forEach(food => food.draw());
		this.players.forEach(player => player.draw());
	}

	constructor() {
		this.players.push(new components.MainPlayer(
			cnv.width / 2,
			cnv.height / 2,
			100,
			colours.random()
		));
	}
}
