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
	debugText: null,
	scaleFactor: 3,

	tooltipText: null,
	tooltipShowing:<boolean> false,

	bullets: [],
	enemies: [],
	hpBars: [],
	money: 0,
	ammo: [0, 20, 20, 20, 20],
	currentWeapon: 0,
	timerCount: 0,
	curLevel: 0,
	inShop:<boolean> false,

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
	key1: null,
	key2: null,
	key3: null,
	key4: null,
	key5: null,

	shopBg: null,
	shopButtons: [],
	shopLeave: null,

	mainMusic: null,
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

	function addAudio(name, path, instances=1) {
		scene.load.audio(name, [path], {instances: instances});
	}

	addAudio("mainMusic", "assets/audio/mainMusic.ogg", 1);
	addAudio("menuMusic", "assets/audio/menuMusic.ogg", 1);
	addAudio("shopMusic", "assets/audio/shopMusic.ogg", 1);
	addAudio("soundHurt1", "assets/audio/player_hurt_1.ogg", 3);
	addAudio("soundHurt2", "assets/audio/player_hurt_2.ogg", 3);
	addAudio("soundHurt3", "assets/audio/player_hurt_3.ogg", 3);
	addAudio("soundHurt4", "assets/audio/player_hurt_4.ogg", 3);
	addAudio("soundHurt5", "assets/audio/player_hurt_5.ogg", 3);
	addAudio("soundElectricFire", "assets/audio/electric_fire.ogg", 5);
	addAudio("soundFireFire", "assets/audio/fire_fire.ogg", 5);
	addAudio("soundIceFire", "assets/audio/ice_fire.ogg", 5);
	addAudio("enemyHitFire", "assets/audio/enemy_hit_fire.ogg", 5);
	addAudio("enemyHitElectric", "assets/audio/enemy_hit_electric.ogg", 5);
	addAudio("enemyHitIce", "assets/audio/enemy_hit_ice.ogg", 5);
	addAudio("weaponSwitch", "assets/audio/weapon_switch.ogg", 5);
}

function create() {
	game.mainMusic = scene.sound.add("mainMusic", { loop: true });
	game.mainMusic.play();
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
	if (anim.key == "enemy2Attack") enemy.anims.play("enemy2Idle");
	if (anim.key == "fireEnemyAttack") enemy.anims.play("fireEnemyAttack");

	if (anim.key == "enemy1Death") {
		enemy.destroy();
		game.money += 10;
	}
	if (anim.key == "enemy2Death") {
		enemy.destroy();
		game.money += 10;
	}
	if (anim.key == "fireEnemyDeath") {
		enemy.destroy();
		game.money += 10;
	}
	if (anim.key == "electricEnemyDeath") {
		enemy.destroy();
		game.money += 10;
	}

}

function createEnemy(enemyType, xpos, ypos) {
	let enemy;
	let enemyData = {
		type: enemyType,
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
		fireTicks: 0,
		iceTicks: 0,
	};

	if (enemyType == "default") {
		enemy = scene.add.sprite(0, 0, "enemy1Idle")
		enemy.anims.play("enemy1Idle", true);
		enemyData.bulletDelayMax = 1;
		enemyData.walkSpeed = 2;
	} else if (enemyType == "rapid") {
		enemy = scene.add.sprite(0, 0, "enemy1Idle")
		enemy.anims.play("enemy1Idle", true);
		enemyData.bulletDelayMax = 0.25;
		enemyData.walkSpeed = 3;
	} else if (enemyType == "spread") {
		enemy = scene.add.sprite(0, 0, "enemy1Idle")
		enemy.anims.play("enemy1Idle", true);
		enemyData.bulletDelayMax = 3;
		enemyData.walkSpeed = 1;
	} else if (enemyType == "ice") {
		enemy = scene.add.sprite(0, 0, "enemy2Idle")
		enemy.anims.play("enemy2Idle", true);
		enemyData.bulletDelayMax = 0.5;
		enemyData.walkSpeed = 2;
	} else if (enemyType == "fire") {
		enemy = scene.add.sprite(0, 0, "fireEnemyIdle")
		enemy.anims.play("fireEnemyIdle", true);
		enemyData.bulletDelayMax = 0.5;
		enemyData.walkSpeed = 2;
	} else if (enemyType == "electric") {
		enemy = scene.add.sprite(0, 0, "electricEnemyIdle")
		enemy.anims.play("electricEnemyIdle", true);
		enemyData.bulletDelayMax = 5;
		enemyData.walkSpeed = 2;
	} else {
		log("unknown enemy type "+enemyType);
		return null;
	}

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
	game.curLevel = num;
	if (num == 1) {
		addWaveTimer(1, function() {
			let en = createEnemy("default", game.width*0.1, -100);
			en.udata.pattern = "randomWalk";
		});

		// addWaveTimer(1, function() {
		// 	let en = createEnemy("rapid", game.width*0.3, -100);
		// 	en.udata.pattern = "randomWalk";
		// });

		addWaveTimer(1, function() {
			let en = createEnemy("electric", game.width*0.3, -100);
			en.udata.pattern = "randomWalk";
		});

		addWaveTimer(1, function() {
			let en = createEnemy("spread", game.width*0.5, -100);
			en.udata.pattern = "randomWalk";
		});

		addWaveTimer(1, function() {
			let en = createEnemy("ice", game.width*0.7, -100);
			en.udata.pattern = "randomWalk";
		});

		addWaveTimer(1, function() {
			let en = createEnemy("fire", game.width*0.9, -100);
			en.udata.pattern = "randomWalk";
		});
	}

	if (num == 2) {
		addWaveTimer(1, function() {
			let en = createEnemy("default", game.width*0.1, -100);
			en.udata.pattern = "randomWalk";
		});

		addWaveTimer(1, function() {
			let en = createEnemy("default", game.width*0.3, -100);
			en.udata.pattern = "randomWalk";
		});

		addWaveTimer(1, function() {
			let en = createEnemy("default", game.width*0.5, -100);
			en.udata.pattern = "randomWalk";
		});
	}

	if (num == 3) {
		addWaveTimer(1, function() {
			let en = createEnemy("rapid", game.width*0.1, -100);
			en.udata.pattern = "randomWalk";
		});

		addWaveTimer(1, function() {
			let en = createEnemy("rapid", game.width*0.3, -100);
			en.udata.pattern = "randomWalk";
		});

		addWaveTimer(1, function() {
			let en = createEnemy("rapid", game.width*0.5, -100);
			en.udata.pattern = "randomWalk";
		});
	}
}

function addWaveTimer(time, fn) {
	game.timerCount++;
	scene.time.delayedCall(time * 1000, function() {
		game.timerCount--;
		fn();
	});
}

function shootBullet(bulletType, xpos, ypos, deg, friendly) {
	let bullet;

	let bulletData = {
		type: bulletType,
		friendly: friendly,
		rads: degToRad(deg),
		speed: 5,
		ignoreEnemy: null,
	};

	if (bulletType == "default") {
		bullet = scene.add.sprite(0, 0, "projectile1").play("projectile1");
	} else if (bulletType == "dot") {
		bullet = scene.add.sprite(0, 0, "projectile2").play("projectile2");
	} else if (bulletType == "rocket") {
		bullet = scene.add.sprite(0, 0, "projectile3").play("projectile3");
	} else if (bulletType == "beam") {
		bullet = scene.add.sprite(0, 0, "projectile4").play("projectile4");
	} else if (bulletType == "fire") {
		bullet = scene.add.sprite(0, 0, "fireParticle1").play("fireParticle1");
	} else if (bulletType == "ice") {
		bullet = scene.add.sprite(0, 0, "iceParticle").play("iceParticle");
	} else if (bulletType == "split") {
		bullet = scene.add.sprite(0, 0, "projectile1").play("projectile1");
	} else if (bulletType == "lightning") {
		bullet = scene.add.sprite(0, 0, "electricParticle").play("electricParticle");
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

function bulletHit(unit, bullet) {
	if (unit == game.player) {
		if (unit.udata.hp > 0) {
			let sound = scene.sound.add("soundHurt"+Math.round(rnd(1, 5)), { loop: false });
			sound.play();
		}
	} else {
		if (bullet.udata.type == "fire") {
			let sound = scene.sound.add("enemyHitFire", { loop: false });
			sound.play();
		}
		if (bullet.udata.type == "ice") {
			let sound = scene.sound.add("enemyHitIce", { loop: false });
			sound.play();
		}
		if (bullet.udata.type == "lightning") {
			let sound = scene.sound.add("enemyHitElectric", { loop: false });
			sound.play();
		}
	}

	unit.udata.hp -= 1;
	if (bullet.udata.type == "fire") {
		unit.udata.fireTicks += 60;
	}

	if (bullet.udata.type == "ice") {
		unit.udata.iceTicks += 120;
	}

	if (bullet.udata.type == "split") {
		let angles = [45, 90+45, 180+45, 270+45];
		for (let i = 0; i < angles.length; i++) {
			let bullet = shootBullet("default", unit.x, unit.y, angles[i], true);
			bullet.udata.ignoreEnemy = unit;
		}
	}

	bullet.destroy();
}

function tickEffects(unit) {
	if (unit.udata.fireTicks > 0) {
		unit.udata.fireTicks--;
		unit.udata.hp -= 1/60;
		unit.tint = 0x88FF0000;
	} else if (unit.udata.iceTicks > 0) {
		unit.udata.iceTicks--;
		unit.tint = 0x880000FF;
	} else {
		unit.tint = 0xFFFFFFFF;
	}
}

function showTooltip(text) {
	if (text != game.tooltipText.text) game.tooltipText.setText(text);
	game.tooltipShowing = true;
}

function fireLightning(xpos, ypos, deg, friendly) {
	let endX = xpos + Math.cos(degToRad(deg)) * 500;
	let endY = ypos + Math.sin(degToRad(deg)) * 500;

	let line = scene.add.graphics({lineStyle: {width: 4, color: 0xFFFF00}});
	line.strokeLineShape(new Phaser.Geom.Line(xpos, ypos, endX, endY));
	line.alpha = 0;
	scene.tweens.add({
		targets: line,
		alpha: { value: 1, duration: 1000, ease: "Power1" },
		onComplete: function() {
			line.destroy();
			for (let i = 0; i < 20; i++) {
				scene.time.delayedCall(i * 1/60 * 1000, function() {
					let bullet = shootBullet("lightning", xpos, ypos, deg, friendly);
					bullet.udata.speed = 40;
				});
			}
		}
	});
}

function update(delta) {
	if (game.firstFrame) {
		game.firstFrame = false;

		function createAnimFromSheet(name, frames, repeat=-1, frameRate=10) {
			scene.anims.create({
				key: name,
				frames: frames,
				frameRate: frameRate,
				repeat: repeat,
			});
		}

		function createAnim(name, numFrames, repeat=-1, frameRate=10) {
			scene.anims.create({
				key: name,
				frames: scene.anims.generateFrameNumbers(name, {start: 0, end: numFrames}),
				frameRate: frameRate,
				repeat: repeat,
			});
		}

		createAnimFromSheet("explosion1", [
			{key: "sprites", frame: "sprites/explosion1_0"},
			{key: "sprites", frame: "sprites/explosion1_1"},
			{key: "sprites", frame: "sprites/explosion1_2"},
			{key: "sprites", frame: "sprites/explosion1_3"}
		]);

		createAnimFromSheet("projectile1", [
			{key: "sprites", frame: "sprites/projectile1_0"},
			{key: "sprites", frame: "sprites/projectile1_1"},
			{key: "sprites", frame: "sprites/projectile1_2"},
			{key: "sprites", frame: "sprites/projectile1_3"}
		]);

		createAnimFromSheet("projectile2", [
			{key: "sprites", frame: "sprites/projectile2_0"},
			{key: "sprites", frame: "sprites/projectile2_1"},
			{key: "sprites", frame: "sprites/projectile2_2"},
			{key: "sprites", frame: "sprites/projectile2_3"}
		]);

		createAnimFromSheet("projectile3", [
			{key: "sprites", frame: "sprites/projectile3_0"},
			{key: "sprites", frame: "sprites/projectile3_1"},
			{key: "sprites", frame: "sprites/projectile3_2"},
			{key: "sprites", frame: "sprites/projectile3_3"}
		]);

		createAnimFromSheet("projectile4", [
			{key: "sprites", frame: "sprites/projectile4_0"},
			{key: "sprites", frame: "sprites/projectile4_1"},
			{key: "sprites", frame: "sprites/projectile4_2"},
			{key: "sprites", frame: "sprites/projectile4_3"}
		]);

		createAnimFromSheet("iceParticle", [
			{key: "sprites", frame: "sprites/iceParticle_0"},
			{key: "sprites", frame: "sprites/iceParticle_1"},
			{key: "sprites", frame: "sprites/iceParticle_2"},
			{key: "sprites", frame: "sprites/iceParticle_3"}
		]);

		createAnimFromSheet("fireParticle1", [
			{key: "sprites", frame: "sprites/fireParticle1_0"},
			{key: "sprites", frame: "sprites/fireParticle1_1"},
			{key: "sprites", frame: "sprites/fireParticle1_2"},
			{key: "sprites", frame: "sprites/fireParticle1_3"}
		]);

		createAnimFromSheet("fireParticle2", [
			{key: "sprites", frame: "sprites/fireParticle2_0"},
			{key: "sprites", frame: "sprites/fireParticle2_1"},
			{key: "sprites", frame: "sprites/fireParticle2_2"},
			{key: "sprites", frame: "sprites/fireParticle2_3"}
		]);

		createAnimFromSheet("electricParticle", [
			{key: "sprites", frame: "sprites/electricParticle_0"},
			{key: "sprites", frame: "sprites/electricParticle_1"},
			{key: "sprites", frame: "sprites/electricParticle_2"},
			{key: "sprites", frame: "sprites/electricParticle_3"}
		], -1, 20);

		createAnimFromSheet("iceParticleShatter", [
			{key: "sprites", frame: "sprites/iceParticleShatter_0"},
			{key: "sprites", frame: "sprites/iceParticleShatter_1"},
			{key: "sprites", frame: "sprites/iceParticleShatter_2"},
			{key: "sprites", frame: "sprites/iceParticleShatter_3"}
		]);

		createAnimFromSheet("playerIdle", [
			{key: "sprites", frame: "sprites/playerIdle_0"},
			{key: "sprites", frame: "sprites/playerIdle_1"},
			{key: "sprites", frame: "sprites/playerIdle_2"},
			{key: "sprites", frame: "sprites/playerIdle_3"}
		]);

		createAnimFromSheet("playerDeath", [
			{key: "sprites", frame: "sprites/playerDeath_0"},
			{key: "sprites", frame: "sprites/playerDeath_1"},
			{key: "sprites", frame: "sprites/playerDeath_2"},
			{key: "sprites", frame: "sprites/playerDeath_3"}
		], 0);

		createAnimFromSheet("enemy1Idle", [
			{key: "sprites", frame: "sprites/enemy1Idle_0"},
			{key: "sprites", frame: "sprites/enemy1Idle_1"},
			{key: "sprites", frame: "sprites/enemy1Idle_2"},
			{key: "sprites", frame: "sprites/enemy1Idle_3"}
		]);

		createAnimFromSheet("enemy1Attack", [
			{key: "sprites", frame: "sprites/enemy1Attack_0"},
			{key: "sprites", frame: "sprites/enemy1Attack_1"},
			{key: "sprites", frame: "sprites/enemy1Attack_2"},
			{key: "sprites", frame: "sprites/enemy1Attack_3"}
		], 0, 20);

		createAnimFromSheet("enemy1Death", [
			{key: "sprites", frame: "sprites/enemy1Death_0"},
			{key: "sprites", frame: "sprites/enemy1Death_1"},
			{key: "sprites", frame: "sprites/enemy1Death_2"},
			{key: "sprites", frame: "sprites/enemy1Death_3"}
		], 0);

		createAnimFromSheet("enemy2Idle", [
			{key: "sprites", frame: "sprites/enemy2Idle_0"},
			{key: "sprites", frame: "sprites/enemy2Idle_1"},
			{key: "sprites", frame: "sprites/enemy2Idle_2"},
			{key: "sprites", frame: "sprites/enemy2Idle_3"}
		]);

		createAnimFromSheet("enemy2Attack", [
			{key: "sprites", frame: "sprites/enemy2Attack_0"},
			{key: "sprites", frame: "sprites/enemy2Attack_1"},
			{key: "sprites", frame: "sprites/enemy2Attack_2"},
			{key: "sprites", frame: "sprites/enemy2Attack_3"}
		], 0);

		createAnimFromSheet("enemy2Death", [
			{key: "sprites", frame: "sprites/enemy2Death_0"},
			{key: "sprites", frame: "sprites/enemy2Death_1"},
			{key: "sprites", frame: "sprites/enemy2Death_2"},
			{key: "sprites", frame: "sprites/enemy2Death_3"}
		], 0);

		createAnimFromSheet("fireEnemyIdle", [
			{key: "sprites", frame: "sprites/fireEnemyIdle_0"},
			{key: "sprites", frame: "sprites/fireEnemyIdle_1"},
			{key: "sprites", frame: "sprites/fireEnemyIdle_2"},
			{key: "sprites", frame: "sprites/fireEnemyIdle_3"}
		]);

		createAnimFromSheet("fireEnemyAttack", [
			{key: "sprites", frame: "sprites/fireEnemyAttack_0"},
			{key: "sprites", frame: "sprites/fireEnemyAttack_1"},
			{key: "sprites", frame: "sprites/fireEnemyAttack_2"},
			{key: "sprites", frame: "sprites/fireEnemyAttack_3"}
		], 0);

		createAnimFromSheet("fireEnemyDeath", [
			{key: "sprites", frame: "sprites/fireEnemyDeath_0"},
			{key: "sprites", frame: "sprites/fireEnemyDeath_1"},
			{key: "sprites", frame: "sprites/fireEnemyDeath_2"},
			{key: "sprites", frame: "sprites/fireEnemyDeath_3"}
		], 0);

		createAnimFromSheet("electricEnemyIdle", [
			{key: "sprites", frame: "sprites/electricEnemyIdle_0"},
			{key: "sprites", frame: "sprites/electricEnemyIdle_1"},
			{key: "sprites", frame: "sprites/electricEnemyIdle_2"},
			{key: "sprites", frame: "sprites/electricEnemyIdle_3"}
		]);

		createAnimFromSheet("electricEnemyAttack", [
			{key: "sprites", frame: "sprites/electricEnemyAttack_0"},
			{key: "sprites", frame: "sprites/electricEnemyAttack_1"},
			{key: "sprites", frame: "sprites/electricEnemyAttack_2"},
			{key: "sprites", frame: "sprites/electricEnemyAttack_3"}
		], 0);

		createAnimFromSheet("electricEnemyDeath", [
			{key: "sprites", frame: "sprites/electricEnemyDeath_0"},
			{key: "sprites", frame: "sprites/electricEnemyDeath_1"},
			{key: "sprites", frame: "sprites/electricEnemyDeath_2"},
			{key: "sprites", frame: "sprites/electricEnemyDeath_3"}
		], 0);

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
		game.key1 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
		game.key2 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
		game.key3 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
		game.key4 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
		game.key5 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE);

		scene.input.on("pointermove", function (pointer) {
			game.mouseX = pointer.x/game.scaleFactor;
			game.mouseY = pointer.y/game.scaleFactor;
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

		// game.mapLayers[0].scaleX = game.scaleFactor;
		// game.mapLayers[0].scaleY = game.scaleFactor;
		scene.cameras.main.zoom = game.scaleFactor;
		game.width /= game.scaleFactor;
		game.height /= game.scaleFactor;
		scene.cameras.main.scrollX = -scene.cameras.main.width/game.scaleFactor;
		scene.cameras.main.scrollY = -scene.cameras.main.height/game.scaleFactor;

		game.debugText = scene.add.text(0, 0, "Debug text", {font: "9px Arial"});
		game.debugText.depth = 1;

		game.tooltipText = scene.add.text(0, 0, "Tooltip", {font: "18px Arial"});
		game.tooltipText.depth = 1;

		startLevel(1);
	}

	game.time = phaser.loop.time;
	game.elapsed = phaser.loop.delta / 1000; // Probably should be hardcoded to 1/60

	if (game.inShop) {
		updateShop();
	} else {
		updateGame();
	}

	if (game.tooltipShowing) {
		game.tooltipText.alpha += 0.05;
	} else {
		game.tooltipText.alpha -= 0.05;
	}
	game.tooltipShowing = false;
	game.tooltipText.x = game.mouseX;
	game.tooltipText.y = game.mouseY;
	if (game.tooltipText.x + game.tooltipText.width > game.width) game.tooltipText.x -= game.tooltipText.width;
	if (game.tooltipText.y + game.tooltipText.height > game.height) game.tooltipText.y -= game.tooltipText.height;
	game.tooltipText.alpha = clamp(game.tooltipText.alpha, 0, 1);

	let currentWeaponStr = "";
	if (game.currentWeapon == 0) currentWeaponStr = "Default";
	if (game.currentWeapon == 1) currentWeaponStr = "Fire";
	if (game.currentWeapon == 2) currentWeaponStr = "Ice";
	if (game.currentWeapon == 3) currentWeaponStr = "Split";
	if (game.currentWeapon == 4) currentWeaponStr = "Lightning";
	game.debugText.setText("Weapon: "+currentWeaponStr+"\nAmmo: ["+game.ammo[1]+", "+game.ammo[2]+", "+game.ammo[3]+", "+game.ammo[4]+"]\nEnemies/Timers left: "+game.enemies.length+"/"+game.timerCount+"\nMoney: "+game.money);

	{ /// Reset inputs
		game.mouseJustDown = false;
		game.mouseJustUp = false;
	}
}

function startShop() {
	game.inShop = true;
	game.shopBg = scene.add.image(0, 0, "sprites", "sprites/shopBg");
	game.shopBg.x = game.shopBg.width/2;
	game.shopBg.y = game.shopBg.height/2;

	let buttonDesc = ["Fire ammo + 20", "Ice ammo + 20", "Split ammo + 20", "Lightning ammo + 20"];
	let buttonNames = ["fireAmmo", "iceAmmo", "splitAmmo", "lightningAmmo"];
	let prices = [10, 20, 30, 40];
	let cols = 3;
	let rows = 3;
	let pad = 10;

	for (let y = 0; y < rows; y++) {
		for (let x = 0; x < cols; x++) {
			let btn = scene.add.image(0, 0, "sprites", "sprites/shopButton");
			let index = (x % cols) + (y * cols);
			btn.udata = {
				item: buttonDesc[index],
				name: buttonNames[index],
				price: prices[index],
			};
			let totalW = (btn.width + pad) * cols;
			let totalH = (btn.height + pad) * rows;
			btn.x = x * (btn.width + pad) + (game.width/2 - totalW/2) + btn.width/2;
			btn.y = y * (btn.height + pad) + (game.height/2 - totalH/2) + btn.height/2 + 30;
			game.shopButtons.push(btn);
		}
	}

	game.shopLeave = scene.add.image(0, 0, "sprites", "sprites/shopButton");
	game.shopLeave.x = game.width - game.shopLeave.width/2;
	game.shopLeave.y = game.height - game.shopLeave.height/2;
}

function updateShop() {
	game.shopButtons.forEach(function(btn, i) {
		if (spriteContainsPoint(btn, game.mouseX, game.mouseY)) {
			showTooltip("Buy "+btn.udata.item+"\n$"+btn.udata.price);

			if (game.mouseJustDown) {
				if (game.money >= btn.udata.price) {
					game.money -= btn.udata.price;
					if (btn.udata.name == "fireAmmo") game.ammo[1] += 20;
					if (btn.udata.name == "iceAmmo") game.ammo[2] += 20;
					if (btn.udata.name == "splitAmmo") game.ammo[3] += 20;
					if (btn.udata.name == "lightningAmmo") game.ammo[4] += 20;
				}
			}
		}
	});

	if (spriteContainsPoint(game.shopLeave, game.mouseX, game.mouseY)) {
		showTooltip("Leave the shop");
		if (game.mouseDown) {
			game.shopButtons.forEach(function(btn) {
				btn.destroy();
			});
			game.shopButtons = [];
			game.shopBg.destroy();
			game.shopLeave.destroy();
			game.inShop = false;
			startLevel(game.curLevel+1);
		}
	}
}

function updateGame() {
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

	if (game.key1.isDown && game.currentWeapon != 0) {
		let sound = scene.sound.add("weaponSwitch", { loop: false });
		sound.play();
		game.currentWeapon = 0;
	}
	if (game.key2.isDown && game.currentWeapon != 1) {
		let sound = scene.sound.add("weaponSwitch", { loop: false });
		sound.play();
		game.currentWeapon = 1;
	}
	if (game.key3.isDown && game.currentWeapon != 2) {
		let sound = scene.sound.add("weaponSwitch", { loop: false });
		sound.play();
		game.currentWeapon = 2;
	}
	if (game.key4.isDown && game.currentWeapon != 3) {
		let sound = scene.sound.add("weaponSwitch", { loop: false });
		sound.play();
		game.currentWeapon = 3;
	}
	if (game.key5.isDown && game.currentWeapon != 4) {
		let sound = scene.sound.add("weaponSwitch", { loop: false });
		sound.play();
		game.currentWeapon = 4;
	}

	if (space) {
		game.enemies.forEach(function(enemy) {
			enemy.udata.hp = 0;
		});
	}

	game.lineProgress += 0.0001;
	game.linePosition = clampMap(game.lineProgress, 0, 1, 0, game.height*0.85);

	if (!game.lineGraphic) {
		game.lineGraphic = scene.add.graphics({lineStyle: {width: 4, color: 0xaa00aa}});
		game.lineGraphic.strokeLineShape(new Phaser.Geom.Line(0, 0, game.width, 0));
	}
	game.lineGraphic.x = 0;
	game.lineGraphic.y = game.linePosition;

	/// Player
	if (!game.player) {
		game.player = scene.add.sprite(0, 0, "playerIdle").play("playerIdle");
		game.player.x = game.width/2;
		game.player.y = game.height/2;
		game.player.udata = {
			hp: 100,
			maxHp: 100,
			fireTicks: 0,
			iceTicks: 0,
		};
		game.player.on("animationcomplete", playerAnimCallback);
		createHpBar(game.player);
	}
	let player = game.player;

	let speed = 5;
	speed /= game.scaleFactor;
	if (player.udata.iceTicks > 0) speed /= clampMap(player.udata.iceTicks, 0, 60*5, 1, 5);
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

	if (game.player.udata.hp <= 0) {
		game.gun.destroy();
		player.anims.play("playerDeath", true);
	}

	if (game.mouseX < player.x) player.scaleX = -1;
	if (game.mouseX > player.x) player.scaleX = 1;

	tickEffects(player);

	/// Gun
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
		if (game.currentWeapon != 0 && game.ammo[game.currentWeapon] <= 0) game.currentWeapon = 0;

		if (game.currentWeapon == 0) {
			game.bulletDelay = 0.25;
			let bullet = shootBullet("default", gun.x, gun.y, mouseDeg, true);
			bullet.udata.speed = 10;
			game.ammo[game.currentWeapon]--;

		} else if (game.currentWeapon == 1) {
			let sound = scene.sound.add("soundFireFire", { loop: false });
			sound.play();

			game.bulletDelay = 0.25;
			let bullet = shootBullet("fire", gun.x, gun.y, mouseDeg, true);
			bullet.udata.speed = 20;
			game.ammo[game.currentWeapon]--;
		} else if (game.currentWeapon == 2) {
			let sound = scene.sound.add("soundIceFire", { loop: false });
			sound.play();

			game.bulletDelay = 0.25;
			let bullet = shootBullet("ice", gun.x, gun.y, mouseDeg, true);
			bullet.udata.speed = 10;
			game.ammo[game.currentWeapon]--;
		} else if (game.currentWeapon == 3) {
			game.bulletDelay = 0.25;
			let bullet = shootBullet("split", gun.x, gun.y, mouseDeg, true);
			bullet.udata.speed = 5;
			game.ammo[game.currentWeapon]--;
		} else if (game.currentWeapon == 4) {
			let sound = scene.sound.add("soundElectricFire", { loop: false });
			sound.play();

			game.bulletDelay = 5;
			fireLightning(gun.x, gun.y, mouseDeg, true);
			game.ammo[game.currentWeapon]--;
		}
	}

	/// Update bullets
	game.bullets.forEach(function(bullet) {
		var speed = bullet.udata.speed;
		speed /= game.scaleFactor;
		bullet.x += Math.cos(bullet.udata.rads) * speed;
		bullet.y += Math.sin(bullet.udata.rads) * speed;
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
				if (bullet.udata.ignoreEnemy == enemy) return;
				if (rectContainsPoint(enemy.x - enemy.width/2, enemy.y - enemy.height/2, enemy.width, enemy.height, bullet.x, bullet.y)) {
					bulletHit(enemy, bullet);
				}
			});
		} else {
			if (rectContainsPoint(player.x - player.width/2, player.y - player.height/2, player.width, player.height, bullet.x, bullet.y)) {
				bulletHit(player, bullet);
			}
		}
	});

	game.bullets = game.bullets.filter(function(bullet) {
		return bullet.active;
	});

	/// Update enemies
	game.enemies.forEach(function(enemy) {
		tickEffects(enemy);
		if (enemy.udata.hp <= 0) {
			if (enemy.udata.type == "ice") {
				enemy.anims.play("enemy2Death", true);
			} else if (enemy.udata.type == "fire") {
				enemy.anims.play("fireEnemyDeath", true);
			} else if (enemy.udata.type == "electric") {
				enemy.anims.play("electricEnemyDeath", true);
			} else {
				enemy.anims.play("enemy1Death", true);
			}
			return;
		}

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

			if (enemy.udata.type == "ice") {
				let bullet = shootBullet("ice", enemy.x, enemy.y, getAngleBetweenCoords(enemy.x, enemy.y, player.x, player.y) + rnd(-3, 3), false);
				bullet.udata.speed = 5;
				enemy.anims.play("enemy2Attack");
			}

			if (enemy.udata.type == "fire") {
				let bullet = shootBullet("fire", enemy.x, enemy.y, getAngleBetweenCoords(enemy.x, enemy.y, player.x, player.y) + rnd(-3, 3), false);
				bullet.udata.speed = 10;
				enemy.anims.play("fireEnemyAttack");
			}

			if (enemy.udata.type == "electric") {
				fireLightning(enemy.x, enemy.y, getAngleBetweenCoords(enemy.x, enemy.y, player.x, player.y), false);
				enemy.anims.play("electricEnemyAttack");
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
				let speed = enemy.udata.walkSpeed;
				speed /= game.scaleFactor;
				if (enemy.udata.iceTicks > 0) speed /= clampMap(enemy.udata.iceTicks, 0, 60*5, 1, 5);
				enemy.x += Math.cos(rads) * speed;
				enemy.y += Math.sin(rads) * speed;
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
		hpBar.y = target.y - target.height/2 - hpBar.height/2 - 5;
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

	if (game.enemies.length == 0 && game.timerCount == 0) startShop();
}
