"use strict";

const Cell = require("./component.cell.js");

const MAX_CELL_COUNT = 16;

class Player {
	parent;

	name;
	color;

	/** @type {Cell[]} */
	cells = [];


	mouse = {
		xPosition: 0,
		yPosition: 0,
	};

	pack() { return {
		name:  this.name,
		color: this.color,
		cells: this.cells.map(cell => cell.pack()),
	} }

	split() {
		// loop through every cell in a random order and split them
		// stop once all of them have been split or you reach the max cell count

		const startingCellCount       = this.cells.length;
		const unsplittedStartingCells = this.cells.slice(); // copy of the array

		for (let i = 0; i < startingCellCount; i++) {
			// break if there are too many cells

			if (this.cells.length >= MAX_CELL_COUNT)
				break;

			// selection of a random cell

			const index = Math.floor(Math.random() * unsplittedStartingCells.length);
			const cell  = unsplittedStartingCells[index];

			// remove the cell from the array so it can't be selected again next time

			unsplittedStartingCells.splice(index, 1);

			// split the cell if able.

			cell.split();
		}
	}

	/**
	 * @param {number} interval
	 */
	tick(interval) { this.cells.forEach(cell => cell.tick(interval)) }

	eject() {
		this.cells.forEach(cell => cell.eject());
	}

	/**
	 * @param {World } world
	 * @param {string} name
	 * @param {number} mass
	 * @param {number} xPosition
	 * @param {number} yPosition
	 * @param {string} color
	 */
	constructor(world, name, mass, xPosition, yPosition, color) {
		this.parent = world;
		this.name  = name;

		this.cells.push(new Cell(mass, 0, 0, xPosition, yPosition, this));

		this.color = color;
	}
}

module.exports = Player;
