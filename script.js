// setup
const gameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
      }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    }
  };

const game = new Phaser.Game(gameConfig);

// variables
let player;
let cursors;
let spacebar;
let fuelBar;
let asteroids;
let fuels;
let fuelTimer = 100;
let fuelMax = 100;
let lasers;
let score = 0;
let scoreText;
let asteroidSpeed = 100;
let maxAsteroidSpeed = 400;
let timeElapsed = 0;
let gameOver = false;
let spawnTimer;
let scoreTimer;

// asset load
function preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('spaceship', 'assets/spaceship.png');
    this.load.image('fuel', 'assets/fuel.png');
    this.load.image('asteroid', 'assets/asteroid.png');
    this.load.image('bullet', 'assets/bullet.png');
}

// create scene
function create() {
    this.add.image(400, 300, 'background');
    player = this.physics.add.sprite(900, 500, 'spaceship').setScale(0.17);
    player.setCollideWorldBounds(true);
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#FFF' });
    asteroids = this.physics.add.group();
    fuels = this.physics.add.group();
    bullets = this.physics.add.group({
        defaultKey: 'bullet',
        maxSize: 2
    });
    cursors = this.input.keyboard.createCursorKeys();
    spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    fuelBar = this.add.text(620, 16, 'Fuel: 100', { fontSize: '32px', fill: '#FFF' });
    this.physics.add.collider(player, asteroids, playerHitAsteroid, null, this);
    this.physics.add.collider(bullets, asteroids, bulletHitAsteroid, null, this);
    this.physics.add.overlap(player, fuels, collectFuel, null, this);
    spawnTimer = this.time.addEvent({
        delay: 666,
        callback: spawnObjects,
        callbackScope: this,
        loop: true
    });

    scoreTimer = this.time.addEvent({
        delay: 1000,
        callback: () => {
            score += 5;
            scoreText.setText('Score: ' + score);
        },
        callbackScope: this,
        loop: true
    });
    
}

// update scene
function update() {
    if (gameOver) return;

    player.setVelocityX(0);
    if (cursors.left.isDown) {
        player.setVelocityX(-200);
    } else if (cursors.right.isDown) {
        player.setVelocityX(200);}

    if (Phaser.Input.Keyboard.JustDown(spacebar)) {
        shootBullet(this);}

    fuelTimer -= 0.05;
    fuelBar.setText('Fuel: ' + Math.floor(fuelTimer));
    if (fuelTimer <= 0) {
        endGame(this);
        player.setTint(0xff0000);
        fuelBar.setText('Game Over');}

    bullets.children.each((bullet) => {
        if (bullet.y < 0) { 
          bullet.setActive(false);
          bullet.setVisible(false);
        }});

    timeElapsed += 0.009;
    asteroidSpeed = Math.min(maxAsteroidSpeed, 100 + Math.floor(timeElapsed) * 10);
    //console.log(asteroidSpeed);
}

// object spawn
function spawnObjects() {
    let asteroidX = Phaser.Math.Between(50, 750);
    let asteroid = asteroids.create(asteroidX, 0, 'asteroid').setScale(0.25);
    asteroid.setVelocityY(asteroidSpeed);

    if (Phaser.Math.Between(0, 10) > 7.5) {
      let fuelX = Phaser.Math.Between(50, 750);
      let fuel = fuels.create(fuelX, 0, 'fuel').setScale(0.05);
      fuel.setVelocityY(200);
    }
  }

// add fuel
function collectFuel(player, fuel) {
    fuel.disableBody(true, true);
    fuelTimer += 10;

    if (fuelTimer > fuelMax) {
        fuelTimer = fuelMax;
    }
  }
  

function playerHitAsteroid(player, asteroid) {
    endGame(this);
}

// shooting
function shootBullet(scene) {
let bullet = bullets.get()
if (bullet) {
    bullet.setScale(0.02);
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.setPosition(player.x, player.y - 20);
    bullet.setVelocityY(-400);
}}
  
// asteroid hit
function bulletHitAsteroid(bullet, asteroid) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.disableBody(true, true)
    asteroid.setActive(false);
    asteroid.setVisible(false);
    asteroid.disableBody(true, true)
    score += 3;
    scoreText.setText('Score: ' + score);
    asteroid.destroy();
    bullet.destroy();
}

// end game screen
function endGame(scene) {
    scene.physics.pause();
    player.setTint(0xff0000);
    scoreText.setFontSize(48);
    fuelBar.setFontSize(52);
    scoreText.setPosition(400,350);
    fuelBar.setPosition(400,250);
    scoreText.setOrigin(0.5, 0.5);
    fuelBar.setOrigin(0.5, 0.5);
    scoreText.setFill("#ff0101");
    fuelBar.setFill("#ff0101");
    scoreText.setDepth(10);
    fuelBar.setDepth(10);
    fuelBar.setText('Game Over');
    scoreText.setText('Final Score: ' + score);
    gameOver = true;
    spawnTimer.remove();
    scoreTimer.remove();
}