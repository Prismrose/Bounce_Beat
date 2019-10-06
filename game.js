var gameport = document.getElementById("gameport");

var renderer = PIXI.autoDetectRenderer({width: 600, height: 300, backgroundColor: 0x527db2});
gameport.appendChild(renderer.view);

var stage = new PIXI.Container();

const loader = new PIXI.Loader();

/*class Ball()
{
	constructor(main_anim, _delay, _hit_window)
	{
		this.delay = _delay;
		this.hit_window = _hit_window;

	}
}*/

animations = ['three_ball', 'three_ball_hit'];

for (a = animations.length-1; a != -1; a--)
{
	var url = "images/" + animations[a] + "/" + animations[a]; 
	loader.add(url + ".json");
}

var sprites = [];
loader.load(ready());

function ready() 
{
	for (a = animations.length-1; a != -1; a--)
	{
		var frames = [];
		for (var i=1; i<=35; i++)
		{
			frames.push(PIXI.Texture.fromFrame(url + i + ".png"));
		}

		sprites[a] = new PIXI.AnimatedSprite(frames);
		sprites[a].position.x = 0;
		sprites[a].position.y = 0;
		sprites[a].animationSpeed = 0.35;
	}

}
sprites[0].play();
stage.addChild(sprites[0]);

var t_striker = PIXI.Texture.from("images/striker.png");
var t_hit_idle = PIXI.Texture.from("images/hitbox_idle.png");
var t_hit = PIXI.Texture.from("images/hitbox_hit.png");

var striker = new PIXI.Sprite(t_striker);
striker.anchor.x = 0.5;
striker.anchor.y = 0.5;
const orig_x = 500;
const orig_y = 310;
striker.position.x = orig_x;
striker.position.y = orig_y;
stage.addChild(striker);

function animate()
{
	requestAnimationFrame(animate);
	renderer.render(stage);
}
animate();

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

/* TODO
 * Add functionality to hitting on time
 * Create other two animations
 */
