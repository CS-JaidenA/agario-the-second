const draw = {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} radius
     * @param {string} colour
     * @returns {undefined}
     */
    circle: (x, y, radius, colour) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);

        ctx.fillStyle = colour;
        ctx.fill();
    }
};
