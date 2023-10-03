class Connection {
	/** @type {WebSocket} */
	ws;

	/** @type {Player} */
	player;

	/**
	 * @param {WebSocket} ws
	 */
	constructor(ws) {
		this.ws = ws;
	}
}

module.exports = Connection;
