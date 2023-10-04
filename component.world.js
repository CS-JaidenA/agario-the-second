const Player = require("./component.player.js");

const DEFAULT_SPAWN_MASS   = 100;
const DEFAULT_PELLET_COUNT = 100;

/**
 * @typedef  {object} WorldPackageObject
 * 
 * @property {Pellet[]}         pellets
 * @property {{string: Player}} players
 */

/**
 * @typedef  {object} WorldPackageExtendedObject
 *
 * @property {number}           width
 * @property {number}           height
 * @property {Pellet[]}         pellets
 * @property {{string: Player}} players
 */

class WorldPackage {
	/** @type {Pellet[]} */
	pellets = [];

	/** @type {{string: Player}} */
	players = {};

	/** @returns {WorldPackageObject} */
	pack = () => ({
		pellets: this.pellets,
		players: this.players, 
	});
}

class WorldPackageExtended extends WorldPackage {
	/** @type {number} */
	width;

	/** @type {number} */
	height;

	/** @returns {WorldPackageExtendedObject} */
	extdpack = () => ({
		width:  this.width,
		height: this.height,
		...this.pack(),
	});
}

class World extends WorldPackageExtended {
	/** @type {number} */
	pelletCount = DEFAULT_PELLET_COUNT;

	connect = uuid => { this.players[uuid] = new Player(
		Math.random() * this.width,
		Math.random() * this.height,
		DEFAULT_SPAWN_MASS,
	)};

	disconnect = uuid => { delete this.players[uuid] };

	constructor() { super() }
}

module.exports = World;
