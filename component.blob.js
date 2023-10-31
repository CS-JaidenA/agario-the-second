'use strict';

class Blob {
	x = {
		speedPx: 0,
		position: 0,
		momentum: 0,
	};

	y = {
		speedPx: 0,
		position: 0,
		momentum: 0,
	};

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
	 * @param {number} x
	 * @param {number} y
	 * @param {number} mass Undefined for spawn mass.
	 */
	constructor(xPosition, yPosition, xMomentum, yMomentum, mass) {
		this.x.position = xPosition;
		this.y.position = yPosition;

		this.x.momentum = xMomentum;
		this.y.momentum = yMomentum;

		this.updateMass(mass);
	}

	static MOMENTUM      = 28;
	static MIN_BLOB_SIZE = 17.5;
}

module.exports = Blob;
