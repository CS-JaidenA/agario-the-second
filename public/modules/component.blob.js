class Blob {
	/**
	 * @namespace
	 * @property {number} pos
	 * @property {number} speed
	 * @property {number} momentum
	 * @property {number} direction
	 */
	x = {
		pos: 0,
		speed: 0,
		momentum: 0,
		direction: 0,
	};

	/**
	 * @namespace
	 * @property {number} pos
	 * @property {number} speed
	 * @property {number} momentum
	 * @property {number} direction
	 */
	y = {
		pos: 0,
		speed: 0,
		momentum: 0,
		direction: 0,
	};

	/** @type {number} */
	#area;

	/** @type {number} */
	#points;

	/** @type {number} */
	#radius;

	get area() {
		return this.#area;
	}

	get points() {
		return this.#points;
	}

	get radius() {
		return this.#radius;
	}

	set points(points) {
		this.#points	= points;

		this.#area		= points * Math.PI * 50;
		this.#radius	= Math.sqrt(this.#area / Math.PI);
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} points
	 * @param {number} xMomentum
	 * @param {number} yMomentum
	 */
	constructor(x, y, points, xMomentum = 0, yMomentum = 0) {
		this.x.pos = x;
		this.y.pos = y;

		this.points = points;

		this.x.momentum = xMomentum;
		this.y.momentum = yMomentum;
	}

	static SPLIT_MOMENTUM	= 35;
	static MIN_BLOB_POINTS	= 25;
}
