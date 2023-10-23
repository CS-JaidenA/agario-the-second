const Player = require("./component.player.js");

const DEFAULT_WORLD_SIZE   = 15; // 282
const DEFAULT_SPAWN_MASS   = 100;
const DEFAULT_PELLET_COUNT = 100;

class WorldPackage {
	/** @type {Pellet[]} */
	pellets = [];

	/** @type {{string: Player}} */
	players = {};

	/** @returns {WorldPackage} */
	pack = () => ({
		pellets: this.pellets,
		players: this.players,
	});
}

class WorldPackageExtended extends WorldPackage {
	/** @type {number} */
	width  = DEFAULT_WORLD_SIZE;

	/** @type {number} */
	height = DEFAULT_WORLD_SIZE;

	/** @returns {WorldPackageExtended} */
	extdpack = () => ({
		...this.pack(),
		width:  this.width,
		height: this.height,
	});
}

class World extends WorldPackageExtended {
	/** @type {number} */
	pelletCount = DEFAULT_PELLET_COUNT;

	tick = () => {
		for (const uuid in this.players) {
			/** @type {Player} */
			const player = this.players[uuid];

			const stopRadius = 0.025;

			if (player.mouse.x < stopRadius && player.mouse.x > -stopRadius &&
				player.mouse.y < stopRadius && player.mouse.y > -stopRadius)
				return;

			const slowDownRadius = 0.1;

			const dist   = Math.max(Math.abs(player.mouse.x), Math.abs(player.mouse.y));
			const offset = dist > slowDownRadius
				? 1
				: dist * (1 / slowDownRadius);

			const blob = player.blobs[0];

			const speed = (8 / (blob.mass * 10) + 0.12) * offset;

			const distanceX = Math.abs(player.mouse.x);
			const distanceY = Math.abs(player.mouse.y);

			const adjustedSpeedX = (distanceX > distanceY ? speed : speed * distanceX / distanceY) || 0;
			const adjustedSpeedY = (distanceY > distanceX ? speed : speed * distanceY / distanceX) || 0;

			blob.x += adjustedSpeedX * Math.sign(player.mouse.x);
			blob.y += adjustedSpeedY * Math.sign(player.mouse.y);

			if (blob.x <= 0)
				blob.x = 0;
			else if (blob.x >= this.width)
				blob.x = this.width;

			if (blob.y <= 0)
				blob.y = 0;
			else if (blob.y >= this.height)
				blob.y = this.height;
		}
	};

	connect = uuid => { this.players[uuid] = new Player(
		Math.random() * this.width,
		Math.random() * this.height,
		DEFAULT_SPAWN_MASS,
	)};

	disconnect = uuid => { delete this.players[uuid] };

	constructor() { super() }
}

module.exports = World;
