/** @type {number} */
const speed = 4;

class MainPlayer {
	/** @type {Blob[]} */
	blobs = [];

	/** @type {string} */
	colour;

	/** @type {boolean} */
	spacePressed = false;

	/** @returns {undefined} */
	split() {
		this.blobs.forEach(blob => {
			if (blob.points / 2 < Blob.MIN_BLOB_POINTS) return;

			blob.points /= 2;

			this.blobs.push(new Blob(
				blob.x.pos,
				blob.y.pos,

				blob.points,

				// adjust momentum to have same ratio as speed for correct angle

				blob.x.direction * Math.round(blob.x.speed > blob.y.speed ? Blob.SPLIT_MOMENTUM : blob.x.speed / blob.y.speed * Blob.SPLIT_MOMENTUM),
				blob.y.direction * Math.round(blob.y.speed > blob.x.speed ? Blob.SPLIT_MOMENTUM : blob.y.speed / blob.x.speed * Blob.SPLIT_MOMENTUM),
			));
		});
	}

	/** @returns {undefined} */
	draw() {
		this.blobs.forEach(blob => {
			// calculate mouse coordinates

			const mouseX = mouse.x * cnv.width;
			const mouseY = mouse.y * cnv.height;

			// calculate distance between blob and mouse coordinates

			const distanceX = Math.abs(mouseX - blob.x.pos);
			const distanceY = Math.abs(mouseY - blob.y.pos);

			// speeds are adjusted so that blob x/y coords meet mouse at same time
			// adjust speed only if the blob is not already centered

			if (distanceX > speed || distanceY > speed) {
				blob.x.speed = distanceX > distanceY ? speed : speed * distanceX / distanceY;
				blob.y.speed = distanceY > distanceX ? speed : speed * distanceY / distanceX;
			} else {
				blob.x.speed = 0;
				blob.y.speed = 0;
			}

			// determine direction

			blob.x.direction = mouseX > blob.x.pos ? 1 : -1;
			blob.y.direction = mouseY > blob.y.pos ? 1 : -1;

			// determine speed and collisions

			for (const sibling of this.blobs) {
				if (blob === sibling) continue;
				if (blob.x.momentum !== 0 || blob.y.momentum !== 0) continue;
				if (sibling.x.momentum !== 0 || sibling.y.momentum !== 0) continue;

				const blobTopmostPos	= blob.y.pos - blob.radius;
				const blobLeftmostPos	= blob.x.pos - blob.radius;
				const blobRightmostPos	= blob.x.pos + blob.radius;
				const blobBottommostPos	= blob.y.pos + blob.radius;

				const siblingTopmostPos		= sibling.y.pos - sibling.radius;
				const siblingLeftmostPos	= sibling.x.pos - sibling.radius;
				const siblingRightmostPos	= sibling.x.pos + sibling.radius;
				const siblingBottommostPos	= sibling.y.pos + sibling.radius;

				// X collisions
				
				(function() {
					// verify if y is in collision range

					if (// check if blob is above sibling
						blobTopmostPos <= siblingTopmostPos &&
						blobBottommostPos <= siblingTopmostPos
					) return;

					if ( // check if blob is below sibling
						blobTopmostPos >= siblingBottommostPos &&
						blobBottommostPos >= siblingBottommostPos
					) return;

					// apply repulsive force if inside

					if (
						blobLeftmostPos < siblingRightmostPos &&
						blobLeftmostPos > siblingLeftmostPos
					) return blob.x.direction = 1;

					if (
						blobRightmostPos > siblingLeftmostPos &&
						blobRightmostPos < siblingRightmostPos
					) return blob.x.direction = -1;
					
					// adjust speed in case of collision

					if (blob.x.direction === 1) {
						if (
							blobRightmostPos + blob.x.speed > siblingLeftmostPos &&
							blobRightmostPos + blob.x.speed < siblingRightmostPos
						) blob.x.speed = siblingLeftmostPos - blobRightmostPos;
					} else {
						if (
							blobLeftmostPos - blob.x.speed < siblingRightmostPos &&
							blobLeftmostPos - blob.x.speed > siblingLeftmostPos
						) blob.x.speed = blobLeftmostPos - siblingRightmostPos;
					}
				})();

				// y collisions

				(function() {
					// verify if x is in collision range

					if ( //check if blob is left of sibling
						blobLeftmostPos <= siblingLeftmostPos &&
						blobRightmostPos <= siblingLeftmostPos
					) return;

					if ( // check if blob is right of sibling
						blobLeftmostPos >= siblingRightmostPos &&
						blobRightmostPos >= siblingRightmostPos
					) return;

					// apply repulsive force if inside

					if (
						blobTopmostPos > siblingTopmostPos &&
						blobTopmostPos < siblingBottommostPos
					) return blob.y.direction = 1;

					if (
						blobBottommostPos > siblingTopmostPos &&
						blobBottommostPos < siblingBottommostPos
					) return blob.y.direction = -1;

					// adjust speed in case of collision

					if (blob.y.direction === 1) {
						if (
							blobBottommostPos + blob.y.speed > siblingTopmostPos &&
							blobBottommostPos + blob.y.speed < siblingBottommostPos
						) blob.y.speed = siblingTopmostPos - blobBottommostPos;
					} else {
						if (
							blobTopmostPos - blob.y.speed < siblingBottommostPos &&
							blobTopmostPos - blob.y.speed > siblingTopmostPos
						) blob.y.speed = blobTopmostPos - siblingBottommostPos;
					}
				})();
			}

			// move blob by speed and add momentum

			blob.x.pos += blob.x.speed * blob.x.direction + blob.x.momentum;
			blob.y.pos += blob.y.speed * blob.y.direction + blob.y.momentum;

			draw.circle(blob.x.pos, blob.y.pos, blob.radius, this.colour);
			
			// draw square borders
			
			// ctx.strokeStyle = "red";
			// ctx.strokeRect(blob.x.pos - blob.radius, blob.y.pos - blob.radius, blob.radius * 2, blob.radius * 2);

			// decrease momentum
			// set to 0 if applicable in case momentum was a decimal

			if (blob.x.momentum > -1 && blob.x.momentum < 1)
				blob.x.momentum = 0;
			else blob.x.momentum -= Math.sign(blob.x.momentum); // 1 reverse of x direction

			if (blob.y.momentum > -1 && blob.y.momentum < 1)
				blob.y.momentum = 0;
			else blob.y.momentum -= Math.sign(blob.y.momentum); // 1 reverse of y direction

			// write size

			const size = String(blob.points);
			const metrics = ctx.measureText(size);

			ctx.font		= "32px Ubuntu";
			ctx.fillStyle	= "white";
			ctx.strokeStyle = "black";

			const textX = blob.x.pos - (metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight) / 2;
			const textY = blob.y.pos + (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) / 2;

			ctx.fillText(size, textX, textY);
			ctx.strokeText(size, textX, textY);
		});
	}
   
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} points
	 * @param {string} number
	 */
	constructor(x, y, points, colour) {
		this.blobs.push(new Blob(x, y, points));
		this.colour = colour;

		addEventListener("keyup", e => {
			if (e.code == "Space") this.spacePressed = false;
		});

		addEventListener("keydown", e => {
			if (this.spacePressed || e.code != "Space") return;
			this.spacePressed = false;
			this.split();
		});
	}
}
