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
    ItemRepo,
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

  Input.addButton('slot1', [89]); //Y
  Input.addButton('slot2', [85]); //U
  Input.addButton('slot3', [73]); //I
  Input.addButton('slot4', [79]); //O
  Input.addButton('slot5', [80]); //P

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
  }, CE.width / 3, CE.height * 2 / 5, CE.width / 3, CE.height / 5));

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

  game.addEntity(ItemRepo.HeavyRock(world, 300, CE.height, 30, 30) );
  game.addEntity(ItemRepo.RocketShoes(world, 400, CE.height, 30, 30) );
  game.addEntity(ItemRepo.AntigravityPotion(world, 500, CE.height, 30, 30) );
  game.addEntity(ItemRepo.Nuke(world, 200, CE.height, 30, 30) );

  game.addEntity(new Enemy(world, CE.width * Math.random(), 100, 80, 100));

  //game.addEntity(new DraggableHeldUI(100, 100, 100, 100));

  Driver.setCanvas(canvas);
  Driver.setScene(main);
  Driver.start();
}
window.onload = start;
