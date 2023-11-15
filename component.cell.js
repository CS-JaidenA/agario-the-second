"use strict";

const Mass   = require("./component.mass.js");

const STOPPER_RADIUS_PX     = 10;

const MERGE_COOLDOWN_FACTOR = 7/300;
const MIN_MERGE_COOLDOWN_MS = 30000;

/**
 * @typedef  {object} CellPackage
 * @property {number} mass
 * @property {number} radius
 * @property {number} xPosition
 * @property {number} yPosition
 */

class Cell {
	/** @type {number} */
	radius;

	/** @type {number} */
	xMomentum;

	/** @type {number} */
	yMomentum;

	/** @type {number} */
	xPosition;

	/** @type {number} */
	yPosition;

	/** @type {number} */
	xVelocity;

	/** @type {number} */
	yVelocity;

	/**
	 * Time in milliseconds until able to merge.
	 * @type {number}
	 */
	cooldown;

	/** @type {number} */
	animatedMass = 0;

	/** @type {number} */
	animatedRadius = 0;

	/** @type {Player} */
	parent;

	/** @type {number} */
	#mass;

	/** @returns {CellPackage} */
	pack = () => ({
		mass:      this.animatedMass,
		radius:    this.animatedRadius,
		xPosition: this.xPosition,
		yPosition: this.yPosition,
	});

	/**
	 * @param   {number} interval
	 * @returns {undefined}
	 */
	tick = interval => {
		// mass decay

		this.mass *= 0.998**(interval / 1000);
		if (this.mass < 10) this.mass = 10;

		// update merge cooldown

		if (this.cooldown > 0)
			this.cooldown -= interval;

		// calculate the slowing factor
		// cells decrease in speed when hovered over by the mouse

		const mouseDistance = Math.max(
			Math.abs(this.parent.mouse.xPosition - this.xPosition),
			Math.abs(this.parent.mouse.yPosition - this.yPosition),
		);

		// mouseDistance / this.radius gives a value between 0-1 (our factor)
		// zero being in the very center and one being on the very edge of the cell

		// in order to make it easier to come to a complete stop,
		// a stopping zone in the center is used

		// if the mouse is inside the stopper radius then a negative value will be yielded
		// instead make the factor zero using Math.max

		const stopperRadius = STOPPER_RADIUS_PX / this.parent.parent.gridboxDimension;
		const slowingFactor = mouseDistance < this.radius
			? Math.max((mouseDistance - stopperRadius) / (this.radius - stopperRadius), 0)
			: 1;

		// calculate speed and update cell position accordingly

		const speed = 2.2 * this.mass**-0.449 * slowingFactor;

		const xMouseDistance = Math.abs(this.xPosition - this.parent.mouse.xPosition);
		const yMouseDistance = Math.abs(this.yPosition - this.parent.mouse.yPosition);
		const hMouseDistance = Math.hypot(xMouseDistance, yMouseDistance);

		// prevent NaN from occuring by protecting against division by zero

		[this.xVelocity, this.yVelocity] = hMouseDistance > 0 ? [
			xMouseDistance / hMouseDistance * speed * (this.parent.mouse.xPosition > this.xPosition ? 1 : -1),
			yMouseDistance / hMouseDistance * speed * (this.parent.mouse.yPosition > this.yPosition ? 1 : -1),
		] : [0, 0];

		// prevent teleportation back and forth by moving the cell directly to
		// the mouse if the distance between them is less than the velocity

		xMouseDistance < this.xVelocity
			? this.xPosition =  this.parent.mouse.xPosition
			: this.xPosition += this.xVelocity;

		yMouseDistance < this.yVelocity
			? this.yPosition =  this.parent.mouse.yPosition
			: this.yPosition += this.yVelocity;

		// apply momentum

		// console.log("c", this.xPosition, this.xMomentum);

		this.xPosition += this.xMomentum;
		this.yPosition += this.yMomentum;

		// console.log("d", this.xPosition, this.xMomentum, this.parent.mouse.xPosition, this.xVelocity, xMouseDistance);

		if (isNaN(this.xPosition))
			process.exit(1);

		// update momentum

		const scalarXMomentum = Math.abs(this.xMomentum);
		const scalarYMomentum = Math.abs(this.yMomentum);

		// console.log("a", this.xMomentum, scalarXMomentum, Cell.resistance);

		if (scalarXMomentum > Cell.resistance)
			this.xMomentum  = Math.sign(this.xMomentum) * (scalarXMomentum - Cell.resistance);
		else this.xMomentum = 0;

		// console.log("b", this.xMomentum);

		if (scalarYMomentum > Cell.resistance)
			this.yMomentum  = Math.sign(this.yMomentum) * (scalarYMomentum - Cell.resistance);
		else this.yMomentum = 0;

		// collision detection
		// ignore collisions while splitting

		if (this.xMomentum === 0 && this.yMomentum === 0) this.parent.cells.forEach(cell => {
			if (cell === this)
				return;

			// return if cell is in a splitting motion

			if (cell.xMomentum !== 0 || cell.yMomentum !== 0)
				return;

			// check if merging conditions are met if both are in a mergeable state

			if (cell.cooldown <= 0 && this.cooldown <= 0 && this.mass + cell.mass <= Cell.maxMass) {
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
				this.parent.cells.splice(this.parent.cells.indexOf(smaller), 1);

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

			if (Math.abs(xCorrection) > Math.abs(this.xVelocity * 2)) {
				this.xPosition += Math.sign(xCorrection) * Math.abs(this.xVelocity * 2);
			} else this.xPosition += xCorrection;

			if (Math.abs(yCorrection) > Math.abs(this.yVelocity * 2)) {
				this.yPosition += Math.sign(yCorrection) * Math.abs(this.yVelocity * 2);
			} else this.yPosition += yCorrection;
		});

		// handle collisions with the world border

		if (this.xPosition < 0)
			[this.xPosition, this.xMomentum] = [0, Math.abs(this.xMomentum)];
		else if (this.xPosition > this.parent.parent.width)
			[this.xPosition, this.xMomentum] = [this.parent.parent.width, -Math.abs(this.xMomentum)];

		if (this.yPosition < 0)
			[this.yPosition, this.yMomentum] = [0, Math.abs(this.yMomentum)];
		else if (this.yPosition > this.parent.parent.height)
			[this.yPosition, this.yMomentum] = [this.parent.parent.height, -Math.abs(this.yMomentum)];

		// TODO: Replace with better collision detection system
		// check for pellet collision (TEMPORARILY HERE)

		for (let i = 0; i < this.parent.parent.pellets.length; i++) {
			const pellet = this.parent.parent.pellets[i];

			const distance = Math.hypot(
				this.xPosition - pellet.xPosition,
				this.yPosition - pellet.yPosition,
			);

			const overlapDistance = this.radius + pellet.radius;

			if (distance >= overlapDistance)
				continue;

			// overlap percentage:
			// the amount in gridboxes the pellet is being overlapped divided by
			// the diameter in gridboxes of the pellet

			const overlapPercentage = (overlapDistance - distance) / pellet.diameter;

			if (overlapPercentage >= 0.75) {
				this.mass += pellet.mass;
				this.parent.parent.pellets.splice(i, 1);
				i--;
			}
		}

		// check for mass collision (TEMPORARY)

		if (this.mass >= 18) for (let i = 0; i < this.parent.parent.mass.length; i++) {
			const mass = this.parent.parent.mass[i];

			const distance = Math.hypot(
				this.xPosition - mass.xPosition,
				this.yPosition - mass.yPosition,
			);

			const overlapDistance = this.radius + mass.radius;

			if (distance >= overlapDistance)
				continue;

			// overlap percentage:
			// the amount in gridboxes the mass is being overlapped divided by
			// the diameter in gridboxes of the mass

			const overlapPercentage = (overlapDistance - distance) / mass.diameter;

			if (overlapPercentage >= 0.75) {
				this.mass += mass.mass;
				this.parent.parent.mass.splice(i, 1);
				i--;
			}
		}

		// check for virus collision (TEMPORARY)

		for (let i = 0; i < this.parent.parent.viruses.length; i++) {
			const virus = this.parent.parent.viruses[i];

			if (this.mass < virus.mass * 1.25)
				continue;

			const distance = Math.hypot(
				this.xPosition - virus.xPosition,
				this.yPosition - virus.yPosition,
			);

			const overlapDistance = this.radius + virus.radius;

			if (distance >= overlapDistance)
				continue;

			// overlap percentage:
			// the amount in gridboxes the mass is being overlapped divided by
			// the diameter in gridboxes of the mass

			const overlapPercentage = (overlapDistance - distance) / virus.diameter;

			if (overlapPercentage >= 0.75) {
				this.mass += virus.mass;
				this.parent.parent.viruses.splice(i, 1);
				i--;

				this.split();
			}
		}

		// check for player collision (TEMPORARY)

		for (const uuid in this.parent.parent.players) {
			/** @type {Player} */
			const player = this.parent.parent.players[uuid];

			if (player === this.parent)
				continue;

			for (let i = 0; i < player.cells.length; i++) {
				const cell = player.cells[i];

				if (this.mass < cell.mass * 1.25)
					continue;

				const distance = Math.hypot(
					this.xPosition - cell.xPosition,
					this.yPosition - cell.yPosition,
				);

				const overlapDistance = this.radius + cell.radius;

				if (distance >= overlapDistance)
					continue;

				// overlap percentage:
				// the amount in gridboxes the mass is being overlapped divided by
				// the diameter in gridboxes of the mass

				const overlapPercentage = (overlapDistance - distance) / cell.diameter;

				if (overlapPercentage >= 0.75) {
					this.mass += cell.mass;
					player.cells.splice(i, 1);
					i--;
				}
			}
		}

		// max mass

		if (this.mass > Cell.maxMass) {
			this.mass = Cell.maxMass;
			this.split();
		}

		// display mass

		const rate = this.mass / 7;

		if (this.animatedMass > this.mass)
			this.animatedMass = this.animatedMass - this.mass > rate ? this.animatedMass - rate : this.mass;
		else if (this.animatedMass < this.mass)
			this.animatedMass = this.mass - this.animatedMass > rate ? this.animatedMass + rate : this.mass;

		this.animatedRadius = Math.sqrt(this.animatedMass * 100) / this.parent.parent.gridboxDimension;
	}

	/** @returns {undefined} */
	eject = () => {
		if (this.mass < Cell.ejectMin)
			return;

		this.mass -= Mass.mass;

		const xVector = this.parent.mouse.xPosition - this.xPosition;
		const yVector = this.parent.mouse.yPosition - this.yPosition;
		const hVector = Math.hypot(xVector, yVector);

		const normalizedDirectionX = xVector / hVector;
		const normalizedDirectionY = yVector / hVector;

		// position othe mass along the edge of the cell

		this.parent.parent.mass.push(new Mass(
			this.parent.color,
			normalizedDirectionX * Cell.momentum,
			normalizedDirectionY * Cell.momentum,
			this.xPosition + normalizedDirectionX * this.radius,
			this.yPosition + normalizedDirectionY * this.radius,
			this.parent.parent
		));
	}

	/** @returns {Cell} */
	split = () => {
		if (this.mass / 2 < Cell.minMass)
			return;

		if (this.parent.cells.length >= 16)
			return;

		this.mass /= 2;

		const scalarXVelocity = Math.abs(this.xVelocity);
		const scalarYVelocity = Math.abs(this.yVelocity);

		this.parent.cells.push(new Cell(this.mass,
			Math.sign(this.xVelocity) * Cell.momentum * (scalarXVelocity > scalarYVelocity ? 1 : scalarXVelocity / scalarYVelocity),
			Math.sign(this.yVelocity) * Cell.momentum * (scalarYVelocity > scalarXVelocity ? 1 : scalarYVelocity / scalarXVelocity),
		this.xPosition, this.yPosition, this.parent));
	}

	/**
	 * @param {number} mass
	 * @param {number} xMomentum
	 * @param {number} yMomentum
	 * @param {number} xPosition
	 * @param {number} yPosition
	 * @param {Player} player
	 */
	constructor(mass, xMomentum, yMomentum, xPosition, yPosition, player) {
		this.parent    = player;

		this.mass      = mass;
		this.xMomentum = xMomentum;
		this.yMomentum = yMomentum;
		this.xPosition = xPosition;
		this.yPosition = yPosition;

		this.cooldown     = MIN_MERGE_COOLDOWN_MS + MERGE_COOLDOWN_FACTOR * this.mass;
		this.animatedMass = this.mass;
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
		this.radius = Math.sqrt(mass * 100) / this.parent.parent.gridboxDimension;
	}

	/** @type {number} */
	static maxMass = 22500;

	/** @type {number} */
	static minMass = 17.5;

	/** @type {number} */
	static ejectMin = 35;

	/** @type {number} */
	static momentum = 1;

	/**
	 * @type {number}
	 * Resistance against momentum. Simulates friction or air resistance.
	 */
	static resistance = 0.025;
}

module.exports = Cell;
