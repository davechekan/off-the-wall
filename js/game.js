/**
* Off-the-Wall game 
* Author: @davechekan 
* Date: 2018-05-28
* https://davechekan.com/offTheWall
* Simple ball bouncing game using Matter.js physics engine
*/

(function () {
  
  /** 
   * World Variables and Constants
   * Data to tweak for fine-tuning gameplay
   * TODO: 
   */
  const GRAVITY = 0.7
  const WALLTHICKNESS = 20;
  const BALLRADIUS = 20;
  const BALLDENSITY = 0.42;
  const BALLFRICTION = 0.01;
  const BALLAIRFRICTION = 0.00001;
  const BALLBOUNCE = 0.75 //restitution
  const BALLCOLOR = "red";
  const WALLHITCOLOR = '#66A2B8';
  const WALLCOLOR = ['#334593'];
  const HITTONEFREQUENCY = 30;
  const MAX_VELOCITY = 100;
 
  let WINDOWHEIGHT = window.innerHeight;
  let WINDOWWIDTH = window.innerWidth;

  // HTML elements
  const canvas = document.getElementById('gameBoard');
  const $currentScore = document.getElementById('current-score');
  const $highScore = document.getElementById('high-score');

  // global game variables
  let currentScore, highScore;
  let engine, world, render, ball;
  let scoringEnabled = false; //don't start scoring until first grab
  let lastCollision = 0; // debounce
  let wallHitCount = [0,0,0,0,0];
  

  /** 
   * Initialization
   * Setup physics engine, default score
   * TODO: handle mobile device orientation change
   */
  function init() {
    // physics engine
    engine = Matter.Engine.create();

    // setup game world 
    world = engine.world;
    world.bounds = {
      min: { x: 0, y: 0 },
      max: { x: WINDOWWIDTH, y: WINDOWHEIGHT }
    };
    world.gravity.y = GRAVITY;

    // setup render
    render = Matter.Render.create({
      element: document.body,
      engine: engine,
      canvas: canvas,
      options: {
        width: WINDOWWIDTH,
        height: WINDOWHEIGHT,
        wireframes: false,
        background: 'transparent'
      }
    });
    Matter.Render.run(render);

    // setup game runner
    let runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // starting values
    updateScore(0);

    //handle device rotation
    window.addEventListener('orientationchange', function () {
      //TODO: DJC
    });
  }

  function startGame() {
    init();
    createWalls();
    createBall();
    registerControls();
    registerEvents();
  }


  /** 
   * Scoring
   * Track points and update score board, handle "turns"
   * TODO: 
   */

  function updateScore(newCurrentScore) {
    currentScore = newCurrentScore;
    $currentScore.innerText = currentScore;

    if (highScore >= 0) {
      highScore = (currentScore >= highScore) ? currentScore : highScore;
    } else {
      highScore = 0;
    }
    $highScore.innerText = highScore;
  }

  function resetTurn(){
    wallHitCount = [0,0,0,0,0];
    scoringEnabled = true; //let the ball drop without scoring before first grab;
    currentScore = 0; // start player's turn
    playGrabTone();
  }


  /** 
   * Entity creation
   * create the ball and walls and add to game
   * TODO: introduce other things for the ball to hit, like enemies, other block types, etc
   */

  function createBall() {
    ball = Matter.Bodies.circle(WINDOWWIDTH / 2, WINDOWHEIGHT / 2, BALLRADIUS, {
      label: 'ball',
      density: BALLDENSITY,
      friction: BALLFRICTION,
      frictionAir: BALLAIRFRICTION,
      restitution: BALLBOUNCE,
      render: {
        fillStyle: BALLCOLOR,
      },
      bounds: {
        min: { x: WALLTHICKNESS, y: WALLTHICKNESS },
        max: { x: WINDOWWIDTH - WALLTHICKNESS, y: WINDOWHEIGHT - WALLTHICKNESS }
      }
    });
    Matter.World.add(world, ball);
  }

  function createWalls() {
    const wallOptions = {
      isStatic: true,
      label: "wall",
      render: {
        fillStyle: WALLCOLOR[0]
      }
    };

    Matter.World.add(engine.world, [
      Matter.Bodies.rectangle(WALLTHICKNESS / 2, (WINDOWHEIGHT / 2), WALLTHICKNESS, WINDOWHEIGHT - (WALLTHICKNESS * 2), wallOptions), //left wall
      Matter.Bodies.rectangle(WINDOWWIDTH - (WALLTHICKNESS / 2), (WINDOWHEIGHT / 2), WALLTHICKNESS, WINDOWHEIGHT - (WALLTHICKNESS * 2), wallOptions), //right wall
      Matter.Bodies.rectangle(WINDOWWIDTH / 2, WINDOWHEIGHT - WALLTHICKNESS / 2, WINDOWWIDTH, WALLTHICKNESS, wallOptions), // floor
      Matter.Bodies.rectangle(WINDOWWIDTH / 2, WALLTHICKNESS / 2, WINDOWWIDTH, WALLTHICKNESS, wallOptions) // ceiling
    ]);
  }


  /** 
   * Entity interactions
   * events for when the ball hits the wall and player grabs ball
   * TODO: introduce other things for the ball to hit, like enemies, other block types, etc
   */
  function wallHit(pair) {
    if (scoringEnabled) {
      const debounce = pair.timeCreated - lastCollision;
      lastCollision = pair.timeCreated;
      if (debounce > 0) {
        // make the sound
        playWallTone();

        // increment wall hit count
        wallHitCount[pair.bodyA.id]++;

         // flash wall color
        pair.bodyA.render.fillStyle = WALLHITCOLOR;
        setTimeout(function () {
          pair.bodyA.render.fillStyle = WALLCOLOR[0]; // TODO: make walls change color after each hit
        }, 100);

        // update score
        currentScore += 1;
        updateScore(currentScore);
      }
    }
  }

  function registerEvents() {
    Matter.Events.on(engine, 'collisionStart', function (event) {
      let pairs = event.pairs;
      pairs.forEach(function (pair) {
        if (pair.bodyB.label === 'ball') {
          switch (pair.bodyA.label) {
            case 'wall':
              wallHit(pair);
              break;
            case 'enemy':
              // TODO (reserve for future functionality)
              break;
          }
        }
      });
    });
  }

  function registerControls() {
    var mouse = Matter.Mouse.create(render.canvas),
      mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 1,
          render: {
            visible: false
          }
        }
      });

    Matter.World.add(world, mouseConstraint);
    Matter.Events.on(mouseConstraint, "startdrag", function () {
      resetTurn();
    });

    render.mouse = mouse;  // keep the mouse in sync with rendering
  }


  /** 
   * Sound experiments with Pizzicato
   * TODO: resolve playback issues on iOS
   */
  function playWallTone() {
    var sound = new Pizzicato.Sound({
      source: 'wave',
      options: {
        type: 'sawtooth',
        frequency: HITTONEFREQUENCY + (currentScore * 6),
        attack: 0.01,
        release: 0.1
      }
    });

    sound.on('play', function () {
      setTimeout(() => {
        sound.stop();
      }, 50);
    })
    sound.play();
  }

  function playGrabTone() {
    var sound = new Pizzicato.Sound({
      source: 'wave',
      options: {
        type: 'sine',
        frequency: 150,
        attack: 0.01,
        release: 0.5,
        volume: 0.5
      }
    });

    var reverb = new Pizzicato.Effects.Reverb({
      time: 1,
      decay: 0.8,
      reverse: true,
      mix: 0.5
    });
    sound.addEffect(reverb);

    sound.on('play', function () {
      setTimeout(() => {
        sound.stop();
      }, 50);
    })
    sound.play();
  }


  //start the game
  startGame();
})();
