'use strict';

const Blob   = require("./component.blob.js");
const Player = require("./component.player.js");

const DEFAULT_WORLD_SIZE    = 40; // 282
const DEFAULT_SPAWN_MASS    = 100;
const DEFAULT_PELLET_COUNT  = 100;
const DEFAULT_GRIDBOX_SIZE  = 40;
const DEFAULT_BLOB_MOMENTUM = 28;
const DEFAULT_MIN_BLOB_SIZE = 50;

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
		DEFAULT_SPAWN_MASS,
		`rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
	)};

	disconnect = uuid => { delete this.players[uuid] };

	constructor() { super() }
}

module.exports = World;
