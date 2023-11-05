'use strict';

const Cell  = require("./component.cell.js");
const World = require("./component.world.js");

class Player {
	color;

	/** @type {Cell[]} */
	cells = [];

	mouse = {
		x: 0,
		y: 0,
	};

	split() {
		// loop through every cell in a random order and split them
		// stop once all of the cells you started with have been split,
		// or you reach the max cell count. Whichever comes first.

		const startingCellCount       = this.cells.length;
		const unsplittedStartingCells = this.cells.slice(0, startingCellCount);

		for (let i = 0; i < startingCellCount; i++) {
			// break if there are too many cells

			if (this.cells.length >= Player.MAX_CELL_COUNT)
				break;

			// select random cell

			const index = Math.floor(Math.random() * unsplittedStartingCells.length);
			const cell  = unsplittedStartingCells[index];

			// remove cell from unsplitted

			unsplittedStartingCells.splice(index, 1);

			// split cell if able

			if (cell.mass / 2 < Cell.MIN_CELL_SIZE)
				continue;

			cell.updateMass(cell.mass / 2);

			this.cells.push(new Cell(
				cell.x,
				cell.y,
				Math.sign(cell.xVelocity) * (cell.xVelocity > cell.yVelocity ? Cell.MOMENTUM : Math.abs(cell.xVelocity / cell.yVelocity) * Cell.MOMENTUM),
				Math.sign(cell.yVelocity) * (cell.yVelocity > cell.xVelocity ? Cell.MOMENTUM : Math.abs(cell.yVelocity / cell.xVelocity) * Cell.MOMENTUM),
				cell.mass,
			));
		}
	}

	/** @param {World} world */
	tick(world) { this.cells.forEach(cell => cell.tick(world, this)) }

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} mass
	 * @param {string} color
	 */
	constructor(x, y, mass, color) {
		this.cells.push(new Cell(x, y, 0, 0, mass));
		this.color = color;
	}

	static MAX_CELL_COUNT = 16;
}

module.exports = Player;
