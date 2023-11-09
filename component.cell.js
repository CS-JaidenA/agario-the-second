"use strict";

const MOMENTUM              = 1;
const STOPPER_RADIUS_PX     = 10;
const MOMENTUM_RESISTANCE   = 0.025;

const MERGE_COOLDOWN_FACTOR = 7/300;
const MIN_MERGE_COOLDOWN_MS = 5000; // TODO: Switch to 30000ms

/**
 * @typedef  {object} World
 * @property {number} width
 * @property {number} height
 * @property {number} gridboxDimension
 */

/**
 * @typedef  {object} Player
 * @property {Cell[]} cells
 * @property {object} mouse
 * @property {number} mouse.xPosition
 * @property {number} mouse.yPosition
 * @property {World } world
 */

class Cell {
	player;

	#mass     = 0;
	radius    = 0;

	xPosition = 0;
	yPosition = 0;

	xMomentum = 0;
	yMomentum = 0;

	xVelocity = 0;
	yVelocity = 0;

	mergeCooldown_ms = MIN_MERGE_COOLDOWN_MS + MERGE_COOLDOWN_FACTOR * this.mass;

	pack() { return {
		mass:      this.mass,
		radius:    this.radius,
		xPosition: this.xPosition,
		yPosition: this.yPosition,
	} }

	/** @returns {Cell} the new cell */
	split() {
		this.mass /= 2;

		return new Cell(this.player, this.mass, this.xPosition, this.yPosition,
			Math.sign(this.xVelocity) * MOMENTUM * (Math.abs(this.xVelocity) > Math.abs(this.yVelocity) ? 1 : Math.abs(this.xVelocity / this.yVelocity)),
			Math.sign(this.yVelocity) * MOMENTUM * (Math.abs(this.yVelocity) > Math.abs(this.xVelocity) ? 1 : Math.abs(this.yVelocity / this.xVelocity)),
		);
	}

	/** @param {number} interval*/
	tick(interval) {
		// mass decay

		this.mass *= 0.998**(interval / 1000);

		// update merge cooldown

		if (this.mergeCooldown_ms > 0)
			this.mergeCooldown_ms -= interval;

		// calculate the slowing factor
		// cells decrease in speed when hovered over by the mouse

		const mouseDistance = Math.max(
			Math.abs(this.player.mouse.xPosition - this.xPosition),
			Math.abs(this.player.mouse.yPosition - this.yPosition),
		);

		// mouseDistance / this.radius gives a value between 0-1 (our factor)
		// zero being in the very center and one being on the very edge of the cell

		// in order to make it easier to come to a complete stop,
		// a stopping zone in the center is used

		// if the mouse is inside the stopper radius then a negative value will be yielded
		// instead make the factor zero using Math.max

		const stopperRadius = STOPPER_RADIUS_PX / this.player.world.gridboxDimension;
		const slowingFactor = mouseDistance < this.radius
			? Math.max((mouseDistance - stopperRadius) / (this.radius - stopperRadius), 0)
			: 1;

		// calculate speed and update cell position accordingly

		const speed = 2.2 * this.mass**-0.439 * slowingFactor;

		const xMouseDistance = Math.abs(this.xPosition - this.player.mouse.xPosition);
		const yMouseDistance = Math.abs(this.yPosition - this.player.mouse.yPosition);
		const hMouseDistance = Math.hypot(xMouseDistance, yMouseDistance);

		// prevent NaN from occuring by protecting against division by zero

		[this.xVelocity, this.yVelocity] = hMouseDistance > 0 ? [
			xMouseDistance / hMouseDistance * speed * (this.player.mouse.xPosition > this.xPosition ? 1 : -1),
			yMouseDistance / hMouseDistance * speed * (this.player.mouse.yPosition > this.yPosition ? 1 : -1),
		] : [0, 0];

		// prevent teleportation back and forth by moving the cell directly to
		// the mouse if the distance between them is less than the velocity

		xMouseDistance < this.xVelocity
			? this.xPosition =  this.player.mouse.xPosition
			: this.xPosition += this.xVelocity;

		yMouseDistance < this.xVelocity
			? this.yPosition =  this.player.mouse.yPosition
			: this.yPosition += this.yVelocity;

		// apply and update momentum

		this.xPosition += this.xMomentum;
		this.yPosition += this.yMomentum;

		const scalarXMomentum = Math.abs(this.xMomentum);
		const scalarYMomentum = Math.abs(this.yMomentum);

		if (scalarXMomentum > MOMENTUM_RESISTANCE)
			this.xMomentum  = Math.sign(this.xMomentum) * (scalarXMomentum - MOMENTUM_RESISTANCE);
		else this.xMomentum = 0;

		if (scalarYMomentum > MOMENTUM_RESISTANCE)
			this.yMomentum  = Math.sign(this.yMomentum) * (scalarYMomentum - MOMENTUM_RESISTANCE);
		else this.yMomentum = 0;

		// collision detection
		// ignore collisions while splitting

		if (this.xMomentum === 0 && this.yMomentum === 0) this.player.cells.forEach(cell => {
			if (cell === this)
				return;

			// return if cell is in a splitting motion

			if (cell.xMomentum !== 0 || cell.yMomentum !== 0)
				return;

			// check if merging conditions are met if both are in a mergeable state

			if (cell.mergeCooldown_ms <= 0 && this.mergeCooldown_ms <= 0) {
				const distance = Math.hypot(
					this.xPosition - cell.xPosition,
					this.yPosition - cell.yPosition,
				);

				const overlapDistance = this.radius + cell.radius;

				if (distance >= overlapDistance)
					return;

				const bigger  = this.mass > cell.mass ? this : cell;
				const smaller = this.mass > cell.mass ? cell : this;

				// overlap percentage:
				// the amount the smaller is being overlapped divided by
				// the diameter of the smaller

				const overlapPercentage = (overlapDistance - distance) / smaller.diameter;

				if (overlapPercentage <= 0.75)
					return;

				bigger.mass += smaller.mass;
				this.player.cells.splice(this.player.cells.indexOf(smaller), 1);

				return;
			}

			const distance = Math.hypot(
				this.xPosition - cell.xPosition,
				this.yPosition - cell.yPosition,
			);

			const overlapDistance = this.radius + cell.radius;

			if (distance >= overlapDistance)
				return;

			// calculate overlap
			// includes closest direction to move this cell outside of other cell

			const xOverlap      = this.xPosition - cell.xPosition;
			const yOverlap      = this.yPosition - cell.yPosition;
			const overlapVector = Math.hypot(xOverlap, yOverlap);
			const overlapAmount = overlapDistance - distance;

			// calculate how far the position needs to change to move the cell outside the other cell
			// prevent NaN from occuring by protecting against division by zero

			const [xCorrection, yCorrection] = overlapVector > 0 ? [
				xOverlap / overlapVector * overlapAmount,
				yOverlap / overlapVector * overlapAmount,
			] : [this.diameter, this.diameter];

			this.xPosition += xCorrection;
			this.yPosition += yCorrection;
		});

		// handle collisions with the world border

		if (this.xPosition < 0)
			[this.xPosition, this.xMomentum] = [0, Math.abs(this.xMomentum)];
		else if (this.xPosition > this.player.world.width)
			[this.xPosition, this.xMomentum] = [this.player.world.width, -Math.abs(this.xMomentum)];

		if (this.yPosition < 0)
			[this.yPosition, this.yMomentum] = [0, Math.abs(this.yMomentum)];
		else if (this.yPosition > this.player.world.height)
			[this.yPosition, this.yMomentum] = [this.player.world.height, -Math.abs(this.yMomentum)];

		// TODO: Replace with better collision detection system
		// check for pellet collision (TEMPORARILY HERE)

		for (let i = 0; i < this.player.world.pellets.length; i++) {
			const pellet = this.player.world.pellets[i];

			const distance = Math.hypot(
				this.xPosition - pellet.xPosition,
				this.yPosition - pellet.yPosition,
			);

			const overlapDistance = this.radius + pellet.radius;

			if (distance >= overlapDistance)
				continue;

			// overlap percentage:
			// the amount in gridboxes the pellet is being overlapped on...
			// the diameter in gridboxes of the pellet

			const overlapPercentage = (overlapDistance - distance) / pellet.diameter;

			if (overlapPercentage >= 0.75) {
				this.mass += pellet.mass;
				this.player.world.pellets.splice(i, 1);
				i--;
			}
		}
	}

	/**
	 * @param {Player} player
	 * @param {number} mass
	 * @param {number} xPosition
	 * @param {number} yPosition
	 * @param {number} xMomentum
	 * @param {number} yMomentum
	 */
	constructor(player, mass, xPosition, yPosition, xMomentum, yMomentum) {
		this.player    = player;
		this.mass      = mass;

		this.xPosition = xPosition;
		this.yPosition = yPosition;

		this.xMomentum = xMomentum;
		this.yMomentum = yMomentum;
	}

	get mass() {
		return this.#mass;
	}

	get diameter() {
		return this.radius * 2;
	}

	/** @param {number} mass */
	set mass(mass) {
		this.#mass  = mass;
		this.radius = Math.sqrt(mass * 100) / this.player.world.gridboxDimension;
	}
}

module.exports = Cell;
