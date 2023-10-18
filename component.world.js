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

	tick = () => {};

	connect = uuid => { this.players[uuid] = new Player(
		Math.random() * this.width,
		Math.random() * this.height,
		DEFAULT_SPAWN_MASS,
	)};

	disconnect = uuid => { delete this.players[uuid] };

	constructor() { super() }
}

module.exports = World;
