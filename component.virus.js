"use strict";

/**
 * @typedef  {object} VirusPackage
 * @property {number} radius
 * @property {number} xPosition
 * @property {number} yPosition
 */

class Virus {
	/** @type {number} */
	mass;

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

	/** @returns {VirusPackage} */
	pack = () => ({
		radius:    this.radius,
		xPosition: this.xPosition,
		yPosition: this.yPosition,
	});

	/**
	 * @param   {number} interval
	 * @returns {undefined}
	 */
	tick = interval => {
		// apply momentum

		this.xPosition += this.xMomentum;
		this.yPosition += this.yMomentum;

		// update momentum

		const scalarXMomentum = Math.abs(this.xMomentum);
		const scalarYMomentum = Math.abs(this.yMomentum);

		if (scalarXMomentum > Virus.resistance)
			this.xMomentum  = Math.sign(this.xMomentum) * (scalarXMomentum - Virus.resistance);
		else this.xMomentum = 0;

		if (scalarYMomentum > Virus.resistance)
			this.yMomentum  = Math.sign(this.yMomentum) * (scalarYMomentum - Virus.resistance);
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

		// check for mass collision (TEMPORARY)

		for (let i = 0; i < this.parent.mass.length; i++) {
			const mass = this.parent.mass[i];

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

				// split virus if applicable

				if (this.mass > Virus.mass * 2) {
					this.mass -= Virus.mass;

					const scalarMassXMomentum = Math.abs(mass.xMomentum);
					const scalarMassYMomentum = Math.abs(mass.yMomentum);

					this.parent.viruses.push(new Virus(
						Math.sign(mass.xMomentum) * (scalarMassXMomentum > scalarMassYMomentum ? 1 : scalarMassXMomentum / scalarMassYMomentum),
						Math.sign(mass.yMomentum) * (scalarMassYMomentum > scalarMassXMomentum ? 1 : scalarMassYMomentum / scalarMassXMomentum),
						this.xPosition, this.yPosition, this.parent
					));
				}

				this.parent.mass.splice(i, 1);
				i--;
			}
		}
	};

	/**
	 * @param {number} xMomentum
	 * @param {number} yMomentum
	 * @param {number} xPosition
	 * @param {number} yPosition
	 * @param {World}  world
	 */
	constructor(xMomentum, yMomentum, xPosition, yPosition, world) {
		this.parent    = world;

		this.mass      = Virus.mass;
		this.radius    = Math.sqrt(Virus.mass * 100) / this.parent.gridboxDimension;

		this.xMomentum = xMomentum;
		this.yMomentum = yMomentum;
		this.xPosition = xPosition;
		this.yPosition = yPosition;
	}

	get diameter() {
		return this.radius * 2;
	}

	/** @type {number} */
	static mass = 125;

	/** @type {number} */
	static momentum = 1;

	/**
	 * @type {number}
	 * Resistance against momentum. Simulates friction or air resistance.
	 */
	static resistance = 0.025;
}

module.exports = Virus;
