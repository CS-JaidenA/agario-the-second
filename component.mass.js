"use strict";

/**
 * @typedef  {object} MassPackage
 * @property {number} color
 * @property {number} radius
 * @property {number} xPosition
 * @property {number} yPosition
 */

class Mass {
	/** @type {number} */
	mass;

	/** @type {string} */
	color;

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

	/** @type {World} */
	parent;

	/** @returns {MassPackage} */
	pack = () => ({
		color:     this.color,
		radius:    this.radius,
		xPosition: this.xPosition,
		yPosition: this.yPosition,
	});

	/**
	 * @param   {number} interval
	 * @returns {undefined} */
	tick = interval => {
		// apply momentum

		this.xPosition += this.xMomentum;
		this.yPosition += this.yMomentum;

		// update momentum

		const scalarXMomentum = Math.abs(this.xMomentum);
		const scalarYMomentum = Math.abs(this.yMomentum);

		if (scalarXMomentum > Mass.resistance)
			this.xMomentum  = Math.sign(this.xMomentum) * (scalarXMomentum - Mass.resistance);
		else this.xMomentum = 0;

		if (scalarYMomentum > Mass.resistance)
			this.yMomentum  = Math.sign(this.yMomentum) * (scalarYMomentum - Mass.resistance);
		else this.yMomentum = 0;

		// handle collisions with the world border

		if (this.xPosition < 0)
			[this.xPosition, this.xMomentum] = [0, Math.abs(this.xMomentum)];
		else if (this.xPosition > this.parent.width)
			[this.xPosition, this.xMomentum] = [this.parent.width, -Math.abs(this.xMomentum)];

		if (this.yPosition < 0)
			[this.yPosition, this.yMomentum] = [0, Math.abs(this.yMomentum)];
		else if (this.yPosition > this.parent.height)
			[this.yPosition, this.yMomentum] = [this.parent.height, -Math.abs(this.yMomentum)];
	};

	/**
	 * @param {string} color
	 * @param {number} xMomentum
	 * @param {number} yMomentum
	 * @param {number} xPosition
	 * @param {number} yPosition
	 * @param {World}  world
	 */
	constructor(color, xMomentum, yMomentum, xPosition, yPosition, world) {
		this.parent    = world;

		this.mass      = Mass.mass;
		this.radius    = Mass.radius;

		this.color     = color;
		this.xMomentum = xMomentum;
		this.yMomentum = yMomentum;
		this.xPosition = xPosition;
		this.yPosition = yPosition;
	}

	get diameter() {
		return this.radius * 2;
	}

	/** @type {number} */
	static mass = 20;

	/** @type {number} */
	static radius = 0.85;

	/**
	 * @type {number}
	 * Resistance against momentum. Simulates friction or air resistance.
	 */
	static resistance = 0.025;
}

module.exports = Mass;
