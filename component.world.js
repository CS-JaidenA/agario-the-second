'use strict';

const Mass   = require("./component.mass.js");
const Virus  = require("./component.virus.js");
const Pellet = require("./component.pellet.js");
const Player = require("./component.player.js");

const DEFAULT_WORLD_SIZE    = 150;
const DEFAULT_SPAWN_MASS    = 25;
const DEFAULT_VIRUS_COUNT   = 25;
const DEFAULT_PELLET_COUNT  = 2500;
const DEFAULT_GRIDBOX_SIZE  = 40;

class WorldPackage {
	/** @type {Mass[]} */
	mass = [];

	/** @type {Virus[]} */
	viruses = [];

	/** @type {Pellet[]} */
	pellets = [];

	/** @type {Object<string, Player>} */
	players = {};

	pack() {
		const packedMass = [];

		for (const mass of this.mass)
			packedMass.push(mass.pack());

		const packedViruses = [];

		for (const virus of this.viruses)
			packedViruses.push(virus.pack());

		const packedPlayers = {};

		for (const uuid in this.players)
			packedPlayers[uuid] = this.players[uuid].pack();

		const packedPellets = [];

		for (const pellet of this.pellets)
			packedPellets.push(pellet.pack());

		return {
			mass:    packedMass,
			viruses: packedViruses,
			pellets: packedPellets,
			players: packedPlayers,
		};
	}
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
	virusCount = DEFAULT_VIRUS_COUNT;

	/** @type {number} */
	pelletCount = DEFAULT_PELLET_COUNT;

	tick(interval) {
		Object.values(this.mass).forEach(mass => mass.tick(interval));
		Object.values(this.viruses).forEach(virus => virus.tick(interval));
		Object.values(this.players).forEach(player => player.tick(interval));

		// respawn viruses

		while (this.viruses.length < this.virusCount)
			this.viruses.push(new Virus(0, 0, Math.random() * this.width, Math.random() * this.height, this));

		// respawn pellets

		const pelletsEatenCount = this.pelletCount - this.pellets.length;

		for (let i = 0; i < pelletsEatenCount; i++) this.pellets.push(new Pellet(
			this, Math.random() * this.width, Math.random() * this.height,
			`rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
		));
	}

	connect = uuid => { this.players[uuid] = new Player(
		this,
		uuid.substring(0, 8),
		DEFAULT_SPAWN_MASS,
		Math.random() * this.width,
		Math.random() * this.height,
		`rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`,
	)};

	disconnect = uuid => { delete this.players[uuid] };

	constructor() { super() }
}

module.exports = World;
