const Player	= require("./component.player.js");
const defaults	= require("./defaults.js");

/**
 * @typedef WorldPackage
 * @property {undefined|number} width   Only if applicable.
 * @property {undefined|number} height  Only if applicable.

 * @property {Pellet[]}         pellets
 * @property {{string: Player}} players
 */

class World {
	/** @type {number} */
	width;

	/** @type {number} */
	height;

	/** @type {Pellet[]} */
	pellets = [];

	/** @type {{string: Player}} */
	players = {};

	/** @type {number} */
	pelletCount;

	/** @returns {WorldPackage} */
	pack = () => ({
		pellets: this.pellets,
		players: this.players,
	});

	/** @returns {WorldPackage} */
	packall = () => ({
		width:   this.width,
		height:  this.height,
		pellets: this.pellets,
		players: this.players,
	});

	/** @returns {undefined} */
	disconnect = () => { delete this.players[uuid] };

	/**
	 * @param {string} uuid 
	 * @returns {undefined}
	 */
	createPlayer = uuid => { this.players[uuid] = new Player(
		Math.random() * this.width,
		Math.random() * this.height,
		100,
	)};

	constructor() {
		// set defaults

		this.width       = 100;
		this.height      = 100;
		this.pelletCount = 100;
	}
}

module.exports = World;
