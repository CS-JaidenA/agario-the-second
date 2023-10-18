const Blob = require("./component.blob.js");

const SPEED = 10;

class Player {
	/** @type {Blob[]} */
	blobs = [];

	/** @type {string} */
	colour;

	update = mouse => {
		console.log(mouse);

		const blob = this.blobs[0];

		console.log(mouse.x, blob.x);

		const distanceX = Math.abs(mouse.x - blob.x);
		const distanceY = Math.abs(mouse.y - blob.y);

		const adjustedSpeedX = distanceX > distanceY ? SPEED : SPEED * distanceX / distanceY;
		const adjustedSpeedY = distanceY > distanceX ? SPEED : SPEED * distanceY / distanceX;

		blob.x += adjustedSpeedX * (mouse.xPercentage > 50 ? 1 : -1);
		blob.y += adjustedSpeedY * (mouse.yPercentage > 50 ? 1 : -1);
	};

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} mass
	 */
	constructor(x, y, mass) {
		this.blobs.push(new Blob(x, y, mass));
		this.colour = "red";
	}
}

module.exports = Player;
