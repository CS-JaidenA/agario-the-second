'use strict';

const World  = require("./component.world.js");
const Player = require("./component.player.js");

class Cell {
	/** x position in gridboxes */
	x = 0;

	/** y position in gridboxes */
	y = 0;

	/** x velocity */
	xVelocity = 0;

	/** y velocity */
	yVelocity = 0;

	/** x momentum in px */
	xMomentum = 0;

	/** y momentum in px */
	yMomentum = 0;

	/** @type {number} */
	mass;

	/** @type {number} */
	radius;

	/** @param {number} mass */
	updateMass(mass) {

		this.mass   = mass;
		this.radius = Math.sqrt(mass * 100);
	}

	/**
	 * @param {World}  world
	 * @param {Player} player
	 */
	tick(world, player) {
		const speed = 0.1;

		// set distance

		const dx = Math.abs(this.x - player.mouse.x);
		const dy = Math.abs(this.y - player.mouse.y);
		const dh = Math.hypot(dx, dy);

		// set velocity

		this.xVelocity = dh !== 0 ? dx / dh * speed * (player.mouse.x < this.x ? -1 : 1) : 0;
		this.yVelocity = dh !== 0 ? dy / dh * speed * (player.mouse.y < this.y ? -1 : 1) : 0;

		// prevent teleporation back and forth by moving the cell directly to the mouse
		// if the distance between them is less than the velocity

		Math.abs(this.x - player.mouse.x) < this.xVelocity
			? this.x = player.mouse.x
			: this.x += this.xVelocity;

		Math.abs(this.y - player.mouse.y) < this.yVelocity
			? this.y = player.mouse.y
			: this.y += this.yVelocity;

		// apply momentum from splitting

		this.x += this.xMomentum / world.gridboxDimension;
		this.y += this.yMomentum / world.gridboxDimension;

		// decrease momentum

		const absXMomentum = Math.abs(this.xMomentum);
		const absYMomentum = Math.abs(this.yMomentum);

		if (absXMomentum >= Cell.RESISTANCE)
			this.xMomentum = Math.sign(this.xMomentum) * (absXMomentum - 1);
		else this.xMomentum = 0;

		if (absYMomentum >= Cell.RESISTANCE)
			this.yMomentum = Math.sign(this.yMomentum) * (absYMomentum - 1);
		else this.yMomentum = 0;

		// prevent moving past world borders

		if (this.x < 0) this.x = 0;
		else if (this.x > world.width) this.x = world.width;

		if (this.y < 0) this.y = 0;
		else if (this.y > world.height) this.y = world.height;
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} xMomentum
	 * @param {number} yMomentum
	 * @param {number} mass
	 */
	constructor(x, y, xMomentum, yMomentum, mass) {
		this.x = x;
		this.x = y;

		this.xMomentum = xMomentum;
		this.yMomentum = yMomentum;

		this.updateMass(mass);
	}

	static MOMENTUM      = 28;
	static RESISTANCE    = 1;
	static MIN_CELL_SIZE = 20;
}

module.exports = Cell;
