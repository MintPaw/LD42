let Vector2 = Phaser.Math.Vector2;
let Rect = Phaser.Geom.Rectangle;
let log = console.log;

function scaleSpriteToSize(spr, newWidth, newHeight, keepRatio) {
	if (keepRatio === undefined) keepRatio = true;

	if (keepRatio) {
		let rx = newWidth / spr.width;
		let ry = newHeight / spr.height;
		let scale = Math.min(rx, ry);
		spr.scaleX = scale;
		spr.scaleY = scale;

	} else {
		spr.scaleX = newWidth/spr.width;
		spr.scaleY = newHeight/spr.height;
	}
}

function rnd(min, max) {
	return Math.random() * (max - min) + min;
}

function rndBool() {
	return Math.random() > 0.5;
}

function getAngleBetweenCoords(x1, y1, x2, y2) {
	let angle = Math.atan2(y2 - y1, x2 - x1);
	angle = angle * (180/Math.PI);
	return angle;
}

function getDistanceBetweenCoords(x1, y1, x2, y2) {
	let a = x1 - x2;
	let b = y1 - y2;
	return Math.sqrt(a*a + b*b);
}

function getDistanceBetween(spr1, spr2) {
	return spr1.getCenter().distance(spr2.getCenter());
}

function degToRad(deg) {
	return deg * 0.0174533;
}

function radToDeg(rad) {
	return rad * 57.2958;
}

function lerp(perc, min, max) {
	return min + (max - min) * perc;
}

function clamp(value, min, max) {
	if (value < min) return min;
	if (value > max) return max;
	return value;
}

function norm(value, min, max) {
	return (value-min)/(max-min);
}

function map(value, sourceMin, sourceMax, destMin, destMax) {
	let perc = norm(value, sourceMin, sourceMax);
	return lerp(perc, destMin, destMax);
}

function clampMap(value, sourceMin, sourceMax, destMin, destMax) {
	let perc = norm(value, sourceMin, sourceMax);
	perc = clamp(perc, 0, 1);
	return lerp(perc, destMin, destMax);
}

function rectContainsPoint(rx, ry, rw, rh, px, py) {
	return px >= rx && px <= rx+(rw-1) && py >= ry && py <= ry+(rh-1);
}

function spriteContainsPoint(sprite, px, py) {
	let rx = sprite.x - sprite.width/2;
	let ry = sprite.y - sprite.height/2;
	let rw = sprite.width;
	let rh = sprite.height;
	return rectContainsPoint(rx, ry, rw, rh, px, py);
}
