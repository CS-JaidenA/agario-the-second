'use strict';

const crypto = require("crypto");

const World  = require("./component.world.js");
const Player = require("./component.player.js");

class Cell {
	/** x position in gridboxes */
	x;

	/** y position in gridboxes */
	y;

	/** x velocity */
	xVelocity = 0;

	/** y velocity */
	yVelocity = 0;

	/** x momentum in px */
	xMomentum;

	/** y momentum in px */
	yMomentum;

	/** @type {number} */
	mass;

	/** @type {number} */
	displayMass;

	/** @type {string} */
	uuid = crypto.randomUUID();

	/** @type {number} */
	radius;

	/** @type {number} */
	displayRadius;

	/** @type {boolean} */
	merging = false;

	/** @type {number | undefined} */
	mergeTimerMs;

	/** @param {number} mass */
	updateMass(mass) {
		this.mass   = mass;
		this.radius = Math.sqrt(mass * 100);
	}

	/** @param {number} displayMass */
	updateDisplayMass(displayMass) {
		this.displayMass   = displayMass;
		this.displayRadius = Math.sqrt(displayMass * 100);
	}

	/**
	 * @param {number} interval
	 * @param {World } world
	 * @param {Player} player
	 */
	tick(interval, world, player) {
		// TODO: if the cell with the undefined merge timer is eaten, then switch whichever has the lowest mergeTimer to be undefined

		// update display mass

		const displayMassUpdateRate = this.mass / 9;

		if (this.displayMass < this.mass) {
			const updatedDisplayMass = this.displayMass + displayMassUpdateRate;
			this.updateDisplayMass(updatedDisplayMass > this.mass ? this.mass : updatedDisplayMass);
		} else {
			const updatedDisplayMass = this.displayMass - displayMassUpdateRate;
			this.updateDisplayMass(updatedDisplayMass < this.mass ? this.mass : updatedDisplayMass);
		}

		// begin merging if applicable

		let merging = false;

		if (this.mergeTimerMs <= 0) {
			merging = true;
			this.merging = true;
		}

		// decrease merge timer if applicable

		if (!merging && this.mergeTimerMs)
			this.mergeTimerMs -= interval;

		// find closest cell if merging

		if (merging) {
			let distance = Infinity;

			player.cells.forEach(cell => {
				if (cell === this) return;

				const dist = Math.hypot(
					this.x - cell.x,
					this.y - cell.y,
				);

				if (dist >= distance)
					return;

				const centerDist = Math.hypot(
					this.x - cell.x,
					this.y - cell.y,
				);

				const nonOverlapDist = (this.radius + cell.radius) / world.gridboxDimension;

				if (centerDist < nonOverlapDist) {
					const bigger  = this.mass > cell.mass ? this : cell;
					const smaller = bigger.uuid === this.uuid ? cell : this;

					// overlap percentage:
					// the amount in gridboxes the smaller is being overlapped on...
					// the diameter in gridboxes of the smaller

					const overlapPercentage = (nonOverlapDist - centerDist) / (smaller.radius / world.gridboxDimension * 2);

					if (overlapPercentage >= 0.75) {
						let mergeTimer;

						if (bigger.mergeTimerMs === undefined || smaller.mergeTimerMs === undefined)
							mergeTimer === undefined;
						else mergeTimer = bigger.mergeTimerMs > smaller.mergeTimerMs ? bigger.mergeTimerMs : smaller.mergeTimerMs;

						bigger.mergeTimerMs = mergeTimer;

						bigger.updateMass(bigger.mass + smaller.mass);
						player.cells.splice(player.cells.indexOf(smaller), 1);

						if (this === smaller)
							return;

						this.merging = false;
					}
				}
			});
		}

		// slow cell speed  on mouse however

		const gridboxRadius = this.radius / world.gridboxDimension;
		const mouseDistance = Math.max(Math.abs(player.mouse.x - this.x), Math.abs(player.mouse.y - this.y));

		// - 0.1 in offset calculation makes innermost tenth of the radius result in a speed of zero
		// this makes it easier to stop a cell completely

		const offset = mouseDistance < gridboxRadius
			? Math.max(mouseDistance * (1 / gridboxRadius) - 0.1, 0)
			: 1;

		/** gridboxes per tick */
		const speed = (this.mass ** -0.45 * world.gridboxDimension) / (1000 / interval) * offset;

		// set distance

		const dx = Math.abs(this.x - player.mouse.x);
		const dy = Math.abs(this.y - player.mouse.y);
		const dh = Math.hypot(dx, dy);

		// set velocity
		// check if dh is 0 to prevent NaN

		this.xVelocity = dh === 0 ? 0 : dx / dh * speed * (player.mouse.x < this.x ? -1 : 1);
		this.yVelocity = dh === 0 ? 0 : dy / dh * speed * (player.mouse.y < this.y ? -1 : 1);

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

		// collision detection
		// ignore collision detection while splitting

		if (this.xMomentum === 0 && this.yMomentum === 0 && this.merging === false) player.cells.forEach(cell => {
			// iterate through siblings

			if (cell === this)
				return;

			if (cell.merging)
				return;

			// ignore cells currently in splitting motion

			if (cell.xMomentum !== 0 || cell.yMomentum !== 0)
				return;

			// ignore merging partners

			const centerDist = Math.hypot(
				this.x - cell.x,
				this.y - cell.y,
			);

			const nonOverlapDist = (this.radius + cell.radius) / world.gridboxDimension;

			if (centerDist >= nonOverlapDist)
				return;

			// calculate overlap
			// includes closest direction to move this cell outside of other cell

			const overlapX = this.x - cell.x;
			const overlapY = this.y - cell.y;
			const overlapH = Math.hypot(overlapX, overlapY);

			// calculate the correction vector to move the cell outside
			// check if overlapH is 0 to prevent NaN

			const correctionX = overlapH === 0 ? 2 * this.radius / world.gridboxDimension : (overlapX / overlapH) * (nonOverlapDist - centerDist);
			const correctionY = overlapH === 0 ? 2 * this.radius / world.gridboxDimension : (overlapY / overlapH) * (nonOverlapDist - centerDist);

			// push this cell outside of other cell gradually instead of teleporting directly out which correctionX/Y would do
			// this should help when splitting and two pieces end up inside each other
			// use correctionX/Y only to prevent jittering when velocityX/Y would move this cell more than directly outside of other cell

			const absVelocityX = Math.abs(this.xVelocity);
			const absVelocityY = Math.abs(this.yVelocity);

			this.x += Math.abs(correctionX) > absVelocityX
				? Math.sign(overlapX) * absVelocityX
				: correctionX;

			this.y += Math.abs(correctionY) > absVelocityY
				? Math.sign(overlapY) * absVelocityY
				: correctionY;
		});

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

		if (this.x < 0) [this.x, this.xMomentum] = [0, 0];
		else if (this.x > world.width) this.x = world.width;

		if (this.y < 0) [this.y, this.yMomentum] = [0, 0];
		else if (this.y > world.height) this.y = world.height;

		// check for pellet collision

		for (let i = 0; i < world.pellets.length; i++) {
			const pellet = world.pellets[i];

			const centerDist = Math.hypot(
				this.x - pellet.x,
				this.y - pellet.y,
			);

			const nonOverlapDist = (this.radius + pellet.radius) / world.gridboxDimension;

			if (centerDist >= nonOverlapDist)
				continue;

			// overlap percentage:
			// the amount in gridboxes the pellet is being overlapped on...
			// the diameter in gridboxes of the pellet

			const overlapPercentage = (nonOverlapDist - centerDist) / (pellet.radius / world.gridboxDimension * 2);

			if (overlapPercentage >= 0.75) {
				this.updateMass(this.mass + pellet.mass);
				world.pellets.splice(i, 1);
				i--;
			}
		}
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} xMomentum
	 * @param {number} yMomentum
	 * @param {number | undefined} mergeTimerMs
	 * @param {number} mass
	 */
	constructor(x, y, xMomentum, yMomentum, mergeTimerMs, mass) {
		this.x = x;
		this.y = y;

		this.xMomentum  = xMomentum;
		this.yMomentum  = yMomentum;
		this.mergeTimerMs = mergeTimerMs;

		this.updateMass(mass);
		this.updateDisplayMass(mass);
	}

	static MOMENTUM      = 30;
	static RESISTANCE    = 1;
	static MIN_CELL_SIZE = 20;
}

module.exports = Cell;
