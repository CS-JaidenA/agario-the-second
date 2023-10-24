const Player = require("./component.player.js");

const DEFAULT_WORLD_SIZE   = 15; // 282
const DEFAULT_SPAWN_MASS   = 100;
const DEFAULT_PELLET_COUNT = 100;

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
			const player = this.players[uuid];
			const blob   = player.blobs[0];

			const slowingRadius = blob.mass / (40 * 10); // 40 = gridbox width
			const mouseDistance = Math.max(Math.abs(player.mouse.x), Math.abs(player.mouse.y));

			const offset = mouseDistance > slowingRadius
				? 1
				: Math.max(mouseDistance * (1 / slowingRadius) - 0.1, 0);

			const speed = blob.mass * 0.2 / 100 * offset;

			const distanceX = Math.abs(player.mouse.x);
			const distanceY = Math.abs(player.mouse.y);

			const adjustedSpeedX = (distanceX > distanceY ? speed : speed * distanceX / distanceY) || 0;
			const adjustedSpeedY = (distanceY > distanceX ? speed : speed * distanceY / distanceX) || 0;

			const angle = Math.atan2(player.mouse.y, player.mouse.x);

			const vectorX = Math.cos(angle);
			const vectorY = Math.sin(angle);

			blob.x += adjustedSpeedX * vectorX;
			blob.y += adjustedSpeedY * vectorY;

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
		`rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
	)};

	disconnect = uuid => { delete this.players[uuid] };

	constructor() { super() }
}

module.exports = World;
