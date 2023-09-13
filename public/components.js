class Entity {
    /** @type {number} */
    x;

    /** @type {number} */
    y;

    /**
     * 
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Player extends Entity {
    /** @type {number} */
    radius;

    /** @type {string} */
    colour;

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} radius 
     * @param {string} colour 
     */
    constructor(x, y, radius, colour) {
        super(x, y);

        this.radius = radius;
        this.colour = colour;
    }
}

export default { Player };
