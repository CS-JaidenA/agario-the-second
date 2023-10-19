const Player = require("./component.player.js");

/** Percentage of grid width. */
const DEFAULT_SPEED        = 10;

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

			const blob = player.blobs[0];

			const distanceX = Math.abs(player.mouse.x);
			const distanceY = Math.abs(player.mouse.y);

			const adjustedSpeedX = (distanceX > distanceY ? DEFAULT_SPEED : DEFAULT_SPEED * distanceX / distanceY) || 0;
			const adjustedSpeedY = (distanceY > distanceX ? DEFAULT_SPEED : DEFAULT_SPEED * distanceY / distanceX) || 0;

			blob.x += adjustedSpeedX * Math.sign(player.mouse.x) / 100;
			blob.y += adjustedSpeedY * Math.sign(player.mouse.y) / 100;
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
