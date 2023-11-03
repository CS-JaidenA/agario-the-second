'use strict';

const Player = require("./component.player.js");

const DEFAULT_WORLD_SIZE    = 20; // 200 or 282?
const DEFAULT_SPAWN_MASS    = 100; // 100
const DEFAULT_PELLET_COUNT  = 100;
const DEFAULT_GRIDBOX_SIZE  = 40;

class WorldPackage {
	/** @type {Pellet[]} */
	pellets = [];

	/** @type {Object<string, Player>} */
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

	/** @type {number} */
	gridboxDimension = DEFAULT_GRIDBOX_SIZE;

	/** @returns {WorldPackageExtended} */
	extdpack = () => ({
		...this.pack(),
		width:            this.width,
		height:           this.height,
		gridboxDimension: this.gridboxDimension,
	});
}

class World extends WorldPackageExtended {
	/** @type {number} */
	pelletCount = DEFAULT_PELLET_COUNT;

	tick() { Object.values(this.players).forEach(player => player.tick(this)) }

	connect = uuid => { this.players[uuid] = new Player(
		Math.random() * this.width,
		Math.random() * this.height,
		DEFAULT_SPAWN_MASS,
		`rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
	)};

	disconnect = uuid => { delete this.players[uuid] };

	constructor() { super() }
}

module.exports = World;
