function start() {
  const { Driver, Input, Time, SetupCanvas, Player, Enemy, Projectile } = BDOTJS;
  const { CE, canvas } = SetupCanvas();
  Input.addButton('jump', [87, 38, 32]); // w, up arrow, space bar
  Input.addButton('crouch', [83, 40]); // s and down arrow
  Input.addButton('attack', [74, 90]); // J and Z
  Input.addButton('attack2', [75, 88]); //K and X
  Input.addButton('shoot', [76, 67]); // L and C
  Input.addButton('e', [69]);
  Input.addButton('dash', [16]); // Left Shift, or both shifts actualy
  

  function boundToScreen() {
    const w = CE.width - this.w;
    const h = CE.height - this.h;
    if (this.x < 0) this.x = 0;
    if (this.y < 0) this.y = this.y;
    if (this.x > w) this.x = w;
    if (this.y > h) this.y = h;
  }

  class World {
    constructor() {
      this.floorHeight = CE.height * 0.8;
    }
    groundCollides(entity) {
      if (entity.y + entity.h > this.floorHeight) {
        return { y: this.floorHeight };
      }
      return false;
    }
    boundToFloor(entity, callback) {
      boundToScreen.call(entity);
      const col = this.groundCollides(entity);
      if (col) {
        entity.y = col.y - entity.h;
        if (callback) callback();
      }
    }
  }
  const main = new Driver(canvas);
  const world = new World();
  const player = new Player(world, Projectile, 100, 100, 50, 100);
  Time.setFramedInterval(() => {
    if (Input.getButtonDown('e')) {
      main.addEntity(new Enemy(world, CE.width * Math.random(), 100, 80, 100));
    }
    // for (let i = 0; i < 10; i += 1) {
    //   main.addEntity(new Entity(Math.random() * CE.width, Math.random() * CE.height, 10, 10));
    // }
  }, 1);
  main.addEntity(player);
  main.addEntity(new Enemy(world, CE.width * Math.random(), 100, 80, 100));
  main.start();
}
window.onload = start;
