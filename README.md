# Off-The-Wall v1.0

Experiment with Matter.js physics engine and Pizzicato audio api. This is my first attempt at using a javascript physics engine to build a little game. The target usage is mobile web browsers, but also works on desktop browsers.

### Game Premise

Off-the-Wall attempts to capture the pure joy and fun of bouncing a superball off the walls of an empty room. The gameplay consists of _grabbing_ the ball and throwing it off one of the four walls and trying to hit as many walls as possible before the ball comes to a stop.

### Usage

The index.html file can directly be loaded in your browser or you can run the little webserver to ease in testing on mobile browsers.


`npm install && node index.js`


With mobile phone on same wifi network as computer, visit http://{computer's-ip}:8080

### Demo
Version 1.0 can be demo'ed at http://thecrunchlab.com/off-the-wall/

### Libraries Used
- [Matter.js](https://github.com/liabru/matter-js)
- [Pizzicato js](https://github.com/alemangui/pizzicato)

### Known Issues
- Collision detection failure
 If you throw the ball too hard, it will pass right through a wall
 
- No sound on iOS

- Debouncing as ball comes to rest
 As the ball is coming to rest, it will strike the floor hundreds of times. Needs better dampening to not register score

### TODOs
- Change wall color after each hit
- New levels (different room shapes, other deflecting objects, different gravity and friction)
- Different ball materials (with different physics properties)
- Enemies to hit (earn bonus points)
- Multiplayer (socket.io connection for players on 2 devices to interact)

