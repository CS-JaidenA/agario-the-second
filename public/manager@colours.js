const colours = [
    "red", "orange", "yellow", "green", "blue", "purple",
];

/**
 * @returns {string}
 */
function random() {
    return colours[(Math.floor(Math.random() * colours.length))];
}

export default { random };
