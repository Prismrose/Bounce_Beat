var gameport = document.getElementById("gameport");

var renderer = PIXI.autoDetectRenderer({width: 600, height: 300, backgroundColor: 0x527db2});
gameport.appendChild(renderer.view);
var stage = new PIXI.Container();
const loader = new PIXI.Loader();

animations = ['three_ball', 'three_ball_hit'];
frame_data = [30, 5];
var url;

for (a = animations.length-1; a != -1; a--)
{
	url = "images/" + animations[a] + "/" + animations[a]; 
	loader.add(url + ".json");
}

var sprites = [];
loader.load(ready());

function ready() 
{
	var frames = [];
	for (a = animations.length-1; a != -1; a--)
	{
		url = "images/" + animations[a] + "/" + animations[a]; 
		console.log('Building:', url);
		for (var i=1; i<=frame_data[a]; i++)
		{
			frames.push(PIXI.Texture.from(url + i + ".png"));
		}
		sprites[a] = new PIXI.AnimatedSprite(frames);
		sprites[a].position.x = -1000;
		sprites[a].position.y = -1000;
		sprites[a].animationSpeed = 0.35;
		sprites[a].loop = false;
		stage.addChild(sprites[a]);
		frames = [];
	}
	console.log('done.');
}

var t_striker = PIXI.Texture.from("images/striker.png");
var hit_idle = PIXI.Texture.from("images/hitbox_idle.png");
var hit = PIXI.Texture.from("images/hitbox_hit.png");

var striker = new PIXI.Sprite(t_striker);
striker.anchor.x = 0.5;
striker.anchor.y = 0.5;
const orig_x = 500;
const orig_y = 310;
striker.position.x = orig_x;
striker.position.y = orig_y;
stage.addChild(striker);

var hitbox = new PIXI.Sprite(hit_idle);
stage.addChild(hitbox);

function animate()
{
	requestAnimationFrame(animate);
	renderer.render(stage);
	PIXI.timerManager.update();
}
animate();

hit_window = PIXI.timerManager.createTimer(150);
hit_window.on('start', function(elapsed){console.log('start window');});
hit_window.on('end', function(elapsed){console.log('end window');});

class Ball
{
	constructor(main_sprite, _hit_sprite, duration_to_hit)
	{
		this.sprite = main_sprite;
		this.timer = PIXI.timerManager.createTimer(duration_to_hit);
		this.timer.on('start', function(elapsed) {});
		this.timer.on('end', function(elapsed) {
				hit_window.reset();
				hit_window.start();
			});

		this.hit_sprite = _hit_sprite;
		this.spr_holder = main_sprite;
	}
	set_hit()
	{
		this.sprite = this.hit_sprite;
		this.hit_sprite.position.x = 0;
		this.hit_sprite.position.y = 0;
		this.spr_holder.position.x = -1000;
		this.spr_holder.position.y = -1000;
	}
	set_main()
	{
		this.sprite = this.spr_holder;
		this.sprite.position.x = 0;
		this.sprite.position.y = 0;
		this.spr_holder.position.x = 0;
		this.spr_holder.position.y = 0;
		this.hit_sprite.position.x = -1000;
		this.hit_sprite.position.y = -1000;
	}
	play()
	{
		this.timer.reset();
		this.sprite.gotoAndStop(1);
		this.timer.start();
		this.sprite.play();
	}
	play_hit()
	{
		if (this.sprite == this.hit_sprite)
		{
			this.sprite.gotoAndStop(1);
			this.sprite.play();
		}
		else
		{
			console.log("Hit not set properly.");
		}
	}
}

three_ball = new Ball(sprites[0], sprites[1], 1000)

after_hit = PIXI.timerManager.createTimer(500);
after_hit.on('start', function(elapsed) {
	console.log('hey.');
});
after_hit.on('end', function(elapsed) {
	console.log('bye.');
	three_ball.set_main();
	sprites[0].position.x = 0;
	sprites[0].position.y = 0;
	sprites[1].position.x = -1000;
	sprites[1].position.y = -1000;
	three_ball.play();
	hitbox.texture = hit_idle;
	after_hit.reset();
});

//Boolean for key repetition
var keyStayedPressed = true;

//Mapping to keys
function keydownEventHandler(e)
{
	if (!keyStayedPressed) return;
	keyStayedPressed = false

	if (e.keyCode == 83) // S key
	{
		striker.position.y -= 50;
		if (hit_window.isStarted && !hit_window.isEnded)
		{
			hitbox.texture = hit;
			three_ball.set_hit();
			sprites[1].position.x = 0;
			sprites[1].position.y = 0;
			sprites[0].position.x = -1000;
			sprites[0].position.y = -1000;
			three_ball.play_hit();
			after_hit.start();
			hit_window.stop();
			hit_window.reset();
		}

	}
}

//If any of the keys go up, reset player sprite
function keyupEventHandler(e)
{
	keyStayedPressed = true;
	striker.position.x = orig_x;
	striker.position.y = orig_y;
}

//Add listeners
document.addEventListener('keydown', keydownEventHandler);
document.addEventListener('keyup', keyupEventHandler);

wait = PIXI.timerManager.createTimer(4000);
wait.on('end', function(elapsed) {
	three_ball.play();
	sprites[0].position.x = 0;
	sprites[0].position.y = 0;
	sprites[1].position.x = -1000;
	sprites[1].position.y = -1000;
});

wait.start();

/* TODO
 * Create class system to organize balls
 * Add game behavior and incorporate rest of balls
 */
