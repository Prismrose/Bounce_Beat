var gameport = document.getElementById("gameport");

//Setting up game
var renderer = PIXI.autoDetectRenderer({width: 600, height: 300, backgroundColor: 0x527db2});
gameport.appendChild(renderer.view);

//Music
const menu_theme = PIXI.sound.Sound.from('audio/bounce_beat_menu.mp3');
const main_theme = PIXI.sound.Sound.from('audio/bounce_beat.mp3');
menu_theme.loop = true;
main_theme.loop = false;
menu_theme.play();

//Containers
var main = new PIXI.Container();
var menu = new PIXI.Container();
var stage = new PIXI.Container();

//Main menu
var t_menu = PIXI.Texture.from("images/menu.png");
var menu_hover = PIXI.Texture.from("images/menu_hover.png");
var t_click_box = PIXI.Texture.from("images/click_box.png");

var s_menu = new PIXI.Sprite(t_menu);
menu.addChild(s_menu);

var click_box = new PIXI.Sprite(t_click_box);
click_box.position.x = 235;
click_box.position.y = 120;
menu.addChild(click_box);
click_box.interactive = true;

main.addChild(menu);

//Main game
const loader = new PIXI.Loader();

//Setting the animations and frame data, then turning them into sprites
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

//Create striker and hit box, set them onto stage
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
	renderer.render(main);
	PIXI.timerManager.update();
}
animate();

var score = 0;
var t_retry = PIXI.Texture.from("images/retry.png");
var retry = new PIXI.Sprite(t_retry);
retry.position.x  = 220;
retry.position.y = 140;
retry.interactive = true;

let game_over = new PIXI.Text("GAME OVER\nScore:",{fontFamily : 'Arial', fontSize: 28, fill : 0x000000, align : 'center'});

//Hit window Timer
hit_window = PIXI.timerManager.createTimer(150);
hit_window.on('start', function(elapsed){console.log('start window');});
hit_window.on('end', function(elapsed){
	game_over.text = "GAME OVER\nScore: " + score;
	console.log('end window');
	main_theme.stop();
	game_over.x = 200;
	game_over.y = 70;
	stage.addChild(game_over);
	stage.addChild(retry);
});

//Ball class to pack all the important parts together
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
	}
	set_main()
	{
		this.sprite = this.spr_holder;
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

//After hitting the ball, this timer comes on
after_hit = PIXI.timerManager.createTimer(500);
after_hit.on('start', function(elapsed) {});
after_hit.on('end', function(elapsed) {
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
			score += 1;
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

//Start main game & menu functionality
wait = PIXI.timerManager.createTimer(2975);
wait.on('end', function(elapsed) {
	three_ball.play();
	sprites[0].position.x = 0;
	sprites[0].position.y = 0;
	sprites[1].position.x = -1000;
	sprites[1].position.y = -1000;
});


function mouseHandler(e)
{
	if (!wait.isStarted)
	{
		main.removeChild(menu);
		main.addChild(stage);
		wait.start();
		menu_theme.stop();
		main_theme.play();
	}
	else
	{
		stage.removeChild(game_over);
		stage.removeChild(retry);
		score = 0;
		wait.reset();
		wait.start();
		main_theme.play();
	}
}

click_box.on('mousedown',mouseHandler);
click_box.hitArea = new PIXI.Rectangle(0,0,135,65);
click_box.mouseover = function(ev)
{
	s_menu.texture = menu_hover;
}
click_box.mouseout = function(ev)
{
	s_menu.texture = t_menu;
}
retry.on('mousedown', mouseHandler);
