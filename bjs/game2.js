function start() {
  const {
    Driver,
    EntityContainer,
    GameContainer,
    Input,
    Time,
    SetupCanvas,
    Player,
    Enemy,
    Projectile,
    ItemObject,
    ItemData,
    ButtonUI,
    DraggableHeldUI,
  } = BDOTJS;
  const { CE, canvas } = SetupCanvas();
  Input.addButton('jump', [87, 38, 32]); // w, up arrow, space bar
  Input.addButton('crouch', [83, 40]); // s and down arrow
  Input.addButton('attack', [74, 90]); // J and Z
  Input.addButton('attack2', [75, 88]); // K and X
  Input.addButton('shoot', [76, 67]); // L and C
  Input.addButton('e', [69]);
  Input.addButton('q', [81]); // drop
  Input.addButton('dash', [16]); // Left Shift, or both shifts actualy
  Input.addButton('inventory', [27]); //tab and esc

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
        entity.vy = 0;
        if (callback) callback();
      }
    }
  }
  const main = new EntityContainer(canvas);
  const game = new GameContainer(canvas);

  main.addEntity(new ButtonUI('Play', () => {
    Driver.setScene(game);
  }, 100, 100, 300, 100));

  const world = new World();
  const player = new Player(world, Projectile, 100, 100, 50, 100);
  Time.setFramedInterval(() => {
    if (Input.getButtonDown('e')) {
      game.addEntity(new Enemy(world, CE.width * Math.random(), 100, 80, 100));
    }
    // for (let i = 0; i < 10; i += 1) {
    //   game.addEntity(new Entity(Math.random() * CE.width, Math.random() * CE.height, 10, 10));
    // }
  }, 1);
  game.addEntity(player);
  for (let x = 0; x < 4; x += 1) {
    const item = new ItemObject(world, new ItemData('Heavy Rock', 3, 5), (x * 200) + 100, CE.height, 30, 30);
    item.data.itemBehaviour = function throwRock(user) {
      user.shoot();
    }
    game.addEntity(item);
  }
  game.addEntity(new Enemy(world, CE.width * Math.random(), 100, 80, 100));

  game.addEntity(new DraggableHeldUI(100, 100, 100, 100));

  Driver.setCanvas(canvas);
  Driver.setScene(main);
  Driver.start();
}
window.onload = start;
