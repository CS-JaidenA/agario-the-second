const Player	= require("./component.player.js");
const defaults	= require("./defaults.js");

class World {
	/** @type {number} */
	width;

	/** @type {number} */
	height;


	/** @type {{string: Player}} */
	players = {};

	/** @returns {Player} */
	player(uuid) {
		const player = new Player(
			Math.random() * this.width,
			Math.random() * this.height,
			this.spawnMass,
		);

		this.players[uuid] = player;
		return player;
	}

	/** @returns {undefined} */
	disconnect(uuid) { delete this.players[uuid] }

	constructor() {
		this.width		= defaults.WORLD_WIDTH;
		this.height		= defaults.WORLD_HEIGHT;

		this.spawnMass	= defaults.WORLD_SPAWN_MASS;
	}
}

module.exports = World;
