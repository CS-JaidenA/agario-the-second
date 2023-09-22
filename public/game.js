class World {
	/** @type {Food[]} */
	food = [];

	/** @type {MainPlayer[]} */
	players = [];

	draw() {
		for (let i = 0; i < Food.MIN_FOOD_COUNT - this.food.length; i++)
			this.food.push(new Food(
				Math.random() * cnv.width,
				Math.random() * cnv.height,
				colour.random()
			));

		this.food.forEach(food => food.draw());
		this.players.forEach(player => player.draw());
	}

	constructor() {
		this.players.push(new MainPlayer(
			cnv.width / 2,
			cnv.height / 2,
			100,
			colour.random()
		));
	}
}
