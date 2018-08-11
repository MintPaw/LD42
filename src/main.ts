let GameScene = {
	key: "game",
	preload: preload,
	create: create,
	update: update
};

let config = {
	type: Phaser.AUTO,
	width: 1280,
	height: 720,
	pixelArt: true,
	disableContextMenu: true,
	antialias: true,
	audio: {
		disableWebAudio: true
	},
	physics: {
		default: "arcade",
		arcade: {
			gravity: {y: 0}
		}
	},
	scene: [GameScene]
};

let abs = Math.abs;
let phaser = new Phaser.Game(config);

let game = {
	player: null,
	gun: null,
	lineGraphic: null,
	hpBar: null,

	bullets: [],
	enemies: [],

	map: null,
	mapLayers: [],

	bulletDelay: 0,
	playerHp: 100,

	lineProgress:<number> 0.1,
	linePosition:<number> 0,

	firstFrame:<boolean> true,
	width:<number> 0,
	height:<number> 0,
	time:<number> 0,
	elapsed:<number> 0,

	mouseX:<number> 0,
	mouseY:<number> 0,
	mouseDown:<boolean> false,
	mouseJustDown:<boolean> false,
	mouseJustUp:<boolean> false,

	keyW: null,
	keyS: null,
	keyA: null,
	keyD: null,
	keyUp: null,
	keyDown: null,
	keyLeft: null,
	keyRight: null,
	keySpace: null,

	// beepSound: null,
}

let scene = null;

function preload() {
	scene = this;

	scene.load.atlas("sprites", "assets/sprites.png", "assets/sprites.json");
	// scene.load.atlas("minimap", "assets/minimap.png", "assets/minimap.json");
	// scene.load.atlas("ui", "assets/ui.png", "assets/ui.json");
	// scene.load.atlas("particles", "assets/particles.png", "assets/particles.json");
	scene.load.image("tileset", "assets/tileset.png");
	scene.load.tilemapTiledJSON("map1", "assets/maps/map1.json");

	scene.load.spritesheet("explosion1", "assets/explosion1.png", { frameWidth: 32, frameHeight: 32, endFrame: 3 });
	scene.load.spritesheet("projectile1", "assets/projectile1.png", { frameWidth: 32, frameHeight: 32, endFrame: 3 });
	scene.load.spritesheet("projectile2", "assets/projectile2.png", { frameWidth: 32, frameHeight: 32, endFrame: 3 });
	scene.load.spritesheet("projectile3", "assets/projectile3.png", { frameWidth: 32, frameHeight: 32, endFrame: 3 });
	scene.load.spritesheet("projectile4", "assets/projectile4.png", { frameWidth: 32, frameHeight: 32, endFrame: 3 });

	function addAudio(name, path, instances=1) {
		scene.load.audio(name, [path], {instances: instances});
	}

	addAudio("beep", "assets/audio/beep.mp3");
}

function create() {
	// game.beepSound = scene.sound.add("beep", { loop: false });

	{ /// Setup inputs
		// scene.input.on("gameobjectdown", gameObjectDown, this);
		// scene.input.on("gameobjectup", gameObjectUp, this);
		// scene.input.on("gameobjectout", gameObjectOut, this);
	}

	{ /// Setup camera
		// scene.cameras.main.startFollow(game.player);
		// scene.cameras.main.roundPixels = true;
	}

	{ /// Setup collision
		// scene.physics.world.addOverlap(game.bulletGroup, game.enemyGroup, bulletVEnemy);
		// scene.physics.world.addOverlap(game.enemyGroup, game.player, enemyVPlayer);
		// scene.physics.world.addOverlap(game.player, game.baseGroup, playerVBase);
		// scene.physics.world.addOverlap(game.player, game.enemyGroup, playerVEnemy);
		// scene.physics.world.addOverlap(game.player, game.moneyGroup, playerVMoney);
		// scene.physics.world.addCollider(game.enemyGroup, game.player, null, playerVEnemyProcess);
		// scene.physics.world.addCollider(game.enemyGroup, game.enemyGroup);
	}
}

function createEnemy(enemyType, xpos, ypos) {
	let enemy;
	let enemyData = {
		type: null,
		hp: 10,
		bulletDelayMax: 0,
		bulletDelay: 0,
		pattern: "none",
		nextPosX: 0,
		nextPosY: 0,
		walkPasueTimeMax: 1,
		walkPasueTime: 0,
		walkSpeed: 3,
	};

	enemyData.type = enemyType;
	if (enemyType == "default") {
		enemy = scene.add.image(0, 0, "sprites", "sprites/enemy");
		enemyData.bulletDelayMax = 1;
		enemyData.walkSpeed = 2;
	} else if (enemyType == "rapid") {
		enemy = scene.add.image(0, 0, "sprites", "sprites/enemy");
		enemyData.bulletDelayMax = 0.25;
		enemyData.walkSpeed = 3;
	} else if (enemyType == "spread") {
		enemy = scene.add.image(0, 0, "sprites", "sprites/enemy");
		enemyData.bulletDelayMax = 3;
		enemyData.walkSpeed = 1;
	} else {
		log("unknown enemy type "+enemyType);
		return null;
	}

	enemy.x = xpos;
	enemy.y = ypos;
	enemy.udata = enemyData;
	game.enemies.push(enemy);

	return enemy;
}

function startLevel(num) {
	if (num == 1) {
		let en;
		en = createEnemy("default", 100, -100);
		en.udata.pattern = "randomWalk";

		en = createEnemy("rapid", 300, -100);
		en.udata.pattern = "randomWalk";

		en = createEnemy("spread", 600, -100);
		en.udata.pattern = "randomWalk";
	}
}

function shootBullet(bulletType, xpos, ypos, deg, friendly) {
	let bullet;

	let bulletData = {
		friendly: friendly,
		rads: degToRad(deg),
		speed: 5,
	};

	if (bulletType == "default") {
		bullet = scene.add.sprite(0, 0, "projectile1").play("projectile1");
	} else {
		log("Unknown bullet type "+bulletType);
	}
	bullet.x = xpos;
	bullet.y = ypos;
	bullet.angle = deg - 90;

	bullet.udata = bulletData;
	game.bullets.push(bullet);

	return bullet;
}

function update(delta) {
	if (game.firstFrame) {
		game.firstFrame = false;

		scene.anims.create({
			key: "explosion1",
			frames: this.anims.generateFrameNumbers("explosion1", { start: 0, end: 3, first: 3 }),
			frameRate: 20,
			repeat: -1
		});

		scene.anims.create({
			key: "projectile1",
			frames: this.anims.generateFrameNumbers("projectile1", { start: 0, end: 3, first: 3 }),
			frameRate: 20,
			repeat: -1
		});

		game.width = phaser.canvas.width;
		game.height = phaser.canvas.height;

		/// Setup inputs
		game.keyW = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
		game.keyS = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
		game.keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
		game.keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
		game.keyUp = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
		game.keyDown = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
		game.keyLeft = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
		game.keyRight = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
		game.keySpace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

		scene.input.on("pointermove", function (pointer) {
			game.mouseX = pointer.x;
			game.mouseY = pointer.y;
		}, this);

		scene.input.on("pointerdown", function (e) {
			game.mouseDown = true;
			game.mouseJustDown = true;
		}, this);

		scene.input.on("pointerup", function (e) {
			game.mouseDown = false;
			game.mouseJustUp = true;
		}, this);

		game.map = scene.make.tilemap({key: "map1"});
		let tiles = game.map.addTilesetImage("default", "tileset");

		game.mapLayers[0] = game.map.createStaticLayer(0, tiles, 0, 0);

		startLevel(1);
	}

	game.time = phaser.loop.time;
	game.elapsed = phaser.loop.delta / 1000; // Probably should be hardcoded to 1/60

	let left = false;
	let right = false;
	let up = false;
	let down = false;
	let space = false;
	if (game.keyW.isDown || game.keyUp.isDown) up = true;
	if (game.keyS.isDown || game.keyDown.isDown) down = true;
	if (game.keyA.isDown || game.keyLeft.isDown) left = true;
	if (game.keyD.isDown || game.keyRight.isDown) right = true;
	if (game.keySpace.isDown) space = true;

	if (space) {
		// game.beepSound.play();
	}

	game.lineProgress += 0.0001;
	game.linePosition = clampMap(game.lineProgress, 0, 1, 0, game.height*0.85);

	if (!game.lineGraphic) {
		game.lineGraphic = scene.add.graphics({lineStyle: {width: 4, color: 0xaa00aa}});
		game.lineGraphic.strokeLineShape(new Phaser.Geom.Line(0, 0, game.width, 0));
	}
	game.lineGraphic.x = 0;
	game.lineGraphic.y = game.linePosition;

	if (!game.player) {
		game.player = scene.physics.add.image(0, 0, "sprites", "sprites/player");
		game.player.x = game.width/2;
		game.player.y = game.height/2;
	}
	let player = game.player;

	let speed = 5;
	if (up) player.y -= speed;
	if (down) player.y += speed;
	if (left) player.x -= speed;
	if (right) player.x += speed;

	if (player.y < game.linePosition + player.height/2) player.y = game.linePosition + player.height/2;
	if (player.y > game.height - player.height/2) player.y = game.height - player.height/2;
	if (player.x < player.width/2) player.x = player.width/2;
	if (player.x > game.width - player.width/2) player.x = game.width - player.width/2;

	let mouseDeg = Math.atan2(game.mouseX - player.x, -(game.mouseY - player.y))*(180/Math.PI) - 90;
	let mouseRad = degToRad(mouseDeg);

	if (!game.gun) {
		game.gun = scene.physics.add.image(0, 0, "sprites", "sprites/gun");
	}
	let gun = game.gun;

	gun.setOrigin(0.5, 0.15);
	gun.x = player.x + player.width*0.25;
	gun.y = player.y;
	gun.angle = mouseDeg - 90;

	game.bulletDelay -= game.elapsed;
	if (game.mouseDown && game.bulletDelay <= 0) {
		game.bulletDelay = 0.25;
		shootBullet("default", gun.x, gun.y, mouseDeg, true);
	}

	if (!game.hpBar) {
		game.hpBar = scene.add.image(0, 0, "sprites", "sprites/hpBar");
	}

	game.hpBar.scaleX = game.playerHp/100;
	game.hpBar.x = game.width/2;
	game.hpBar.y = game.height - game.hpBar.height - 10;

	/// Update bullets
	game.bullets.forEach(function(bullet) {
		bullet.x += Math.cos(bullet.udata.rads) * bullet.udata.speed;
		bullet.y += Math.sin(bullet.udata.rads) * bullet.udata.speed;
		if (
			bullet.x < -100 ||
			bullet.y < -100 ||
			bullet.x > game.width + 100 ||
			bullet.y > game.width + 100
		) {
			bullet.destroy();
		}

		if (bullet.udata.friendly) {
			game.enemies.forEach(function(enemy) {
				let tl = enemy.getTopLeft();
				if (rectContainsPoint(tl.x, tl.y, enemy.width, enemy.height, bullet.x, bullet.y)) {
					enemy.udata.hp -= 1;
					if (enemy.udata.hp <= 0) enemy.destroy();
					bullet.destroy();
				}
			});
		} else {
			let tl = player.getTopLeft();
			if (rectContainsPoint(tl.x, tl.y, player.width, player.height, bullet.x, bullet.y)) {
				game.playerHp -= 1;
				if (game.playerHp <= 0) player.destroy();
				bullet.destroy();
			}
		}
	});

	game.bullets = game.bullets.filter(function(bullet) {
		return bullet.active;
	});

	/// Update enemies
	game.enemies.forEach(function(enemy) {
		enemy.udata.bulletDelay -= game.elapsed;
		if (enemy.udata.bulletDelay <= 0) {
			enemy.udata.bulletDelay = enemy.udata.bulletDelayMax;
			if (enemy.y < enemy.height/2) return; // continue
			if (enemy.udata.type == "default") {
				shootBullet("default", enemy.x, enemy.y, getAngleBetweenCoords(enemy.x, enemy.y, player.x, player.y), false);
			}

			if (enemy.udata.type == "rapid") {
				let bullet = shootBullet("default", enemy.x, enemy.y, getAngleBetweenCoords(enemy.x, enemy.y, player.x, player.y) + rnd(-10, 10), false);
				bullet.udata.speed = 10;
			}

			if (enemy.udata.type == "spread") {
				let shots = 5;
				for (let i = 0; i < shots; i++) {
					let startOff = -30;
					let endOff = 30;
					let angleOff = map(i, 0, shots, startOff, endOff);

					let bullet = shootBullet("default", enemy.x, enemy.y, getAngleBetweenCoords(enemy.x, enemy.y, player.x, player.y) + angleOff, false);
					bullet.udata.speed = 2;
				}
			}
		}

		if (enemy.udata.pattern == "randomWalk") {
			let dist = getDistanceBetweenCoords(enemy.x, enemy.y, enemy.udata.nextPosX, enemy.udata.nextPosY);
			if (enemy.udata.nextPosX == 0 || dist < 10) {
				enemy.udata.walkPasueTime -= game.elapsed;
				if (enemy.udata.walkPasueTime <= 0) {
					enemy.udata.walkPasueTime = enemy.udata.walkPasueTimeMax;
					enemy.udata.nextPosX = rnd(0, game.width);
					enemy.udata.nextPosY = rnd(enemy.height/2, game.linePosition);
				}
			} else {
				let rads = degToRad(getAngleBetweenCoords(enemy.x, enemy.y, enemy.udata.nextPosX, enemy.udata.nextPosY));
				enemy.x += Math.cos(rads) * enemy.udata.walkSpeed;
				enemy.y += Math.sin(rads) * enemy.udata.walkSpeed;
				// enemy.setVelocity(Math.cos(rads) * 100, Math.sin(rads) * 100);
			}
		} else if (enemy.udata.pattern == "none") {
			// None
		}	else {
			log("Unknown pattern "+enemy.udata.pattern);
		}
	});

	game.enemies = game.enemies.filter(function(enemy) {
		return enemy.active;
	});

	{ /// Reset inputs
		game.mouseJustDown = false;
		game.mouseJustUp = false;
	}
}
