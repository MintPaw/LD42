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

	bullets: [],
	enemies: [],
	hpBars: [],

	map: null,
	mapLayers: [],

	bulletDelay: 0,

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
	scene.load.spritesheet("playerIdle", "assets/playerIdle.png", { frameWidth: 32, frameHeight: 32, endFrame: 3 });
	scene.load.spritesheet("playerWalk", "assets/playerWalk.png", { frameWidth: 32, frameHeight: 32, endFrame: 3 });
	scene.load.spritesheet("playerDeath", "assets/playerDeath.png", { frameWidth: 32, frameHeight: 32, endFrame: 3 });
	scene.load.spritesheet("enemy1Idle", "assets/enemy1Idle.png", { frameWidth: 32, frameHeight: 32, endFrame: 3 });
	scene.load.spritesheet("enemy1Attack", "assets/enemy1Attack.png", { frameWidth: 32, frameHeight: 32, endFrame: 3 });
	scene.load.spritesheet("enemy1Death", "assets/enemy1Death.png", { frameWidth: 32, frameHeight: 32, endFrame: 3 });

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

function createHpBar(target) {
	let hpBarBg = scene.add.image(0, 0, "sprites", "sprites/hpBarBg");
	let hpBar = scene.add.image(0, 0, "sprites", "sprites/hpBar");

	hpBar.udata = {
		target: target,
		bg: hpBarBg,
	};

	game.hpBars.push(hpBar);
}

function playerAnimCallback(anim) {
	if (anim.key == "playerDeath") game.player.destroy();
}

function enemyAnimCallback(enemy, anim) {
	if (anim.key == "enemy1Attack") enemy.anims.play("enemy1Idle");
	if (anim.key == "enemy1Death") enemy.destroy();
}

function createEnemy(enemyType, xpos, ypos) {
	let enemy;
	let enemyData = {
		type: null,
		hp: 10,
		maxHp: 10,
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
		enemy = scene.add.sprite(0, 0, "enemy1Idle")
		enemyData.bulletDelayMax = 1;
		enemyData.walkSpeed = 2;
	} else if (enemyType == "rapid") {
		enemy = scene.add.sprite(0, 0, "enemy1Idle")
		enemyData.bulletDelayMax = 0.25;
		enemyData.walkSpeed = 3;
	} else if (enemyType == "spread") {
		enemy = scene.add.sprite(0, 0, "enemy1Idle")
		enemyData.bulletDelayMax = 3;
		enemyData.walkSpeed = 1;
	} else {
		log("unknown enemy type "+enemyType);
		return null;
	}

	enemy.anims.play("enemy1Idle", true);
	enemy.on("animationcomplete", function(anim) {
		enemyAnimCallback(enemy, anim);
	});

	enemy.x = xpos;
	enemy.y = ypos;
	enemy.udata = enemyData;
	game.enemies.push(enemy);

	createHpBar(enemy);
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
	} else if (bulletType == "dot") {
		bullet = scene.add.sprite(0, 0, "projectile2").play("projectile2");
	} else if (bulletType == "rocket") {
		bullet = scene.add.sprite(0, 0, "projectile3").play("projectile3");
	} else if (bulletType == "beam") {
		bullet = scene.add.sprite(0, 0, "projectile4").play("projectile4");
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

		function createAnim(name, numFrames, repeat=-1, frameRate=3) {
			scene.anims.create({
				key: name,
				frames: scene.anims.generateFrameNumbers(name, {start: 0, end: numFrames}),
				frameRate: frameRate,
				repeat: repeat,
			});
		}

		createAnim("explosion1", 3);
		createAnim("projectile1", 3);
		createAnim("projectile2", 3);
		createAnim("projectile3", 3);
		createAnim("projectile4", 3);
		createAnim("playerIdle", 3);
		createAnim("playerWalk", 3);
		createAnim("playerDeath", 3, 0);
		createAnim("enemy1Idle", 3);
		createAnim("enemy1Attack", 3, 0);
		createAnim("enemy1Death", 3, 0);

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
		game.player = scene.add.sprite(0, 0, "playerIdle").play("playerIdle");
		game.player.x = game.width/2;
		game.player.y = game.height/2;
		game.player.udata = {
			hp: 100,
			maxHp: 100,
		};
		game.player.on("animationcomplete", playerAnimCallback);
		createHpBar(game.player);
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

	if (player.udata.hp > 0) {
		if (up || down || left || right) {
			player.anims.play("playerWalk", true);
		} else {
			player.anims.play("playerIdle", true);
		}
	}

	if (game.mouseX < player.x) player.scaleX = -1;
	if (game.mouseX > player.x) player.scaleX = 1;

	let mouseDeg = Math.atan2(game.mouseX - player.x, -(game.mouseY - player.y))*(180/Math.PI) - 90;
	let mouseRad = degToRad(mouseDeg);

	if (!game.gun) {
		game.gun = scene.add.image(0, 0, "sprites", "sprites/playerArm");
	}
	let gun = game.gun;

	gun.setOrigin(0.5, 0.3);
	gun.x = player.x;
	gun.y = player.y;
	gun.angle = mouseDeg - 90;

	game.bulletDelay -= game.elapsed;
	if (game.mouseDown && game.bulletDelay <= 0 && gun.active) {
		game.bulletDelay = 0.25;
		let bullet = shootBullet("default", gun.x, gun.y, mouseDeg, true);
		bullet.udata.speed = 20;
	}

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
					if (enemy.udata.hp <= 0) enemy.anims.play("enemy1Death", true);
					bullet.destroy();
				}
			});
		} else {
			let tl = player.getTopLeft();
			if (rectContainsPoint(tl.x, tl.y, player.width, player.height, bullet.x, bullet.y)) {
				game.player.udata.hp -= 1;
				if (game.player.udata.hp <= 0) {
					gun.destroy();
					player.anims.play("playerDeath", true);
				}
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
				shootBullet("beam", enemy.x, enemy.y, getAngleBetweenCoords(enemy.x, enemy.y, player.x, player.y), false);
				enemy.anims.play("enemy1Attack");
			}

			if (enemy.udata.type == "rapid") {
				let bullet = shootBullet("dot", enemy.x, enemy.y, getAngleBetweenCoords(enemy.x, enemy.y, player.x, player.y) + rnd(-10, 10), false);
				bullet.udata.speed = 10;
				enemy.anims.play("enemy1Attack");
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
				enemy.anims.play("enemy1Attack");
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

	/// Update hp bars
	game.hpBars.forEach(function(hpBar) {
		let target = hpBar.udata.target;
		hpBar.x = target.x;
		hpBar.y = target.y - target.height/2 - 20;
		hpBar.udata.bg.x = hpBar.x;
		hpBar.udata.bg.y = hpBar.y;

		hpBar.scaleX = target.udata.hp/target.udata.maxHp;
		if (target.udata.hp <= 0) {
			hpBar.udata.bg.destroy();
			hpBar.destroy();
		}
	});

	game.hpBars = game.hpBars.filter(function(hpBar) {
		return hpBar.active;
	});


	{ /// Reset inputs
		game.mouseJustDown = false;
		game.mouseJustUp = false;
	}
}
