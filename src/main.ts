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

	friendlyBulletGroup: null,
	enemyBulletGroup: null,
	enemyGroup: null,

	bulletDelay: 0,

	lineProgress:<number> 0,
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
	// scene.load.image("tilesheet", "assets/tilesheet.png");
	// scene.load.tilemapTiledJSON("map1", "assets/maps/map1.json");

	function addAudio(name, path, instances=1) {
		scene.load.audio(name, [path], {instances: instances});
	}

	addAudio("beep", "assets/audio/beep.mp3");
}

function create() {
	// game.beepSound = scene.sound.add("beep", { loop: false });

	{ /// Setup game and groups
		game.friendlyBulletGroup = scene.physics.add.group();
		game.enemyBulletGroup = scene.physics.add.group();
		game.enemyGroup = scene.physics.add.group();
	}

	{ /// Setup inputs
		// scene.input.on("gameobjectdown", gameObjectDown, this);
		// scene.input.on("gameobjectup", gameObjectUp, this);
		// scene.input.on("gameobjectout", gameObjectOut, this);
	}

	{ /// Setup map
		// game.map = scene.make.tilemap({ key: "map1" });
		// game.mapTiles = game.map.addTilesetImage("tilesheet", "tilesheet");

		// game.mapLayers[0] = game.map.createStaticLayer(0, game.mapTiles, 0, 0);
		// game.mapLayers[1] = game.map.createStaticLayer(1, game.mapTiles, 0, 0);
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
	var enemy;
	var enemyData = {
		type: null,
		bulletDelayMax: 0,
		bulletDelay: 0,
	};

	enemyData.type = enemyType;
	if (enemyType == "stand") {
		enemy = game.enemyGroup.create(0, 0, "sprites", "sprites/enemy");
		enemy.x = xpos;
		enemy.y = ypos;
		enemyData.bulletDelayMax = 0.5;
	} else {
		log("unknown enemy type "+enemyType);
		return null;
	}

	enemy.udata = enemyData;

	return enemy;
}

function startLevel(num) {
	if (num == 1) {
		createEnemy("stand", 200, 200);
	}
}

function shootBullet(bulletType, xpos, ypos, rad, friendly) {
	let bullet;
	let curGroup = friendly ? game.friendlyBulletGroup : game.enemyBulletGroup;

	let bulletData = {
		group: curGroup,
	};

	if (bulletType == "default") {
		bullet = curGroup.create(0, 0, "sprites", "sprites/bullet");
	} else {
		log("Unknown bullet type "+bulletType);
	}
	bullet.x = xpos;
	bullet.y = ypos;
	bullet.setVelocity(Math.cos(rad) * 1000, Math.sin(rad) * 1000);

	bullet.udata = bulletData;

	return bullet;
}

function update(delta) {
	if (game.firstFrame) {
		game.firstFrame = null;

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

	game.lineProgress += 0.001;
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
		shootBullet("default", gun.x, gun.y, mouseRad, true);
	}

	let allBullets = [];
	allBullets.push(...game.enemyBulletGroup.getChildren());
	allBullets.push(...game.friendlyBulletGroup.getChildren());
	allBullets.forEach(function(bullet) {
		if (
			bullet.x < -100 ||
			bullet.y < -100 ||
			bullet.x > game.width + 100 ||
			bullet.y > game.width + 100
		) {
			bullet.destroy();
		}

		if (!bullet.active) bullet.udata.group.remove(bullet);
	});

	game.enemyGroup.getChildren().forEach(function(enemy) {
		if (enemy.udata.type == "stand") {
			enemy.udata.bulletDelay -= game.elapsed;
			if (enemy.udata.bulletDelay <= 0) {
				enemy.udata.bulletDelay = enemy.udata.bulletDelayMax;
				// shootBullet(false,
			}
		}
	});

	{ /// Reset inputs
		game.mouseJustDown = false;
		game.mouseJustUp = false;
	}
}
