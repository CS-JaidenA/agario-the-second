'use strict';

const Player = require("./component.player.js");

const DEFAULT_WORLD_SIZE    = 40; // 282
const DEFAULT_SPAWN_MASS    = 1000; // 100
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
	gridBoxSize = DEFAULT_GRIDBOX_SIZE;

	/** @returns {WorldPackageExtended} */
	extdpack = () => ({
		...this.pack(),
		width:       this.width,
		height:      this.height,
		gridBoxSize: this.gridBoxSize,
	});
}

class World extends WorldPackageExtended {
	/** @type {number} */
	pelletCount = DEFAULT_PELLET_COUNT;

	tick = () => {
		for (const player of Object.values(this.players))
			player.tick(this);
	};

	connect = uuid => { this.players[uuid] = new Player(
		Math.random() * this.width,
		Math.random() * this.height,
		Math.random() * DEFAULT_SPAWN_MASS, // TODO: REVISE THIS
		`rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
	)};

	disconnect = uuid => { delete this.players[uuid] };

	constructor() { super() }
}

module.exports = World;
