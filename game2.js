function start() {
  const { Driver, Entity, Input, Time, SetupCanvas } = BDOTJS();
  const { CE, canvas } = SetupCanvas();
  Input.addButton('jump', [87, 38, 32]);
  Input.addButton('crouch', [83, 40]);
  Input.addButton('a', [74, 90]); // J and Z
  function boundToScreen() {
    const w = CE.width - this.w;
    const h = CE.height - this.h;
    if (this.x < 0) this.x = 0;
    if (this.y < 0) this.y = 0;
    if (this.x > w) this.x = w;
    if (this.y > h) this.y = h;
  }
  // function applyGravity() {
  //   this.vy += this.gravity * Time.deltaTime;
  // }
  // function applyVelocity() {
  //   let { vy } = this;
  //   if (this.gravity) {
  //     vy += this.gravity * (Time.deltaTime / 2);
  //   }
  //   this.x += this.vx * Time.deltaTime;
  //   this.y += vy * Time.deltaTime;
  // }
  function applyGravity() {
    this.vy += this.gravity;
  }
  function applyVelocity() {
    this.x += this.vx;
    this.y += this.vy;
  }
  class HitBox extends Entity {
    constructor(...args) {
      super(...args);
      this.life = 1;
      this.color = 'red';
    }
    update() {
      if (this.life <= 0) {
        this.shouldDelete = true;
      }
      this.life -= 1;
    }
  }
  class Player extends Entity {
    constructor(world, ...args) {
      super(...args);
      this.world = world;
      this.vx = 0;
      this.vy = 0;
      this.gravity = 1;
      this.startH = this.h;
      this.startW = this.w;
      this.onGrounded = this.onGrounded.bind(this);
      this.flipped = false;
      this.direction = 1;
    }
    update() {
      const hi = Input.getAxisHorizontal();
      this.vx = hi * Time.deltaTime * 10;
      if (hi) {
        this.flipped = hi < 0;
        this.direction = 1 - (2 * this.flipped);
      }
      if (Input.getButtonDown('jump')) {
        this.jump();
      }
      if (Input.getButtonDown('crouch')) {
        this.h = this.startH / 2;
        this.y += this.startH / 2;
      } else if (Input.getButtonUp('crouch')) {
        this.h = this.startH;
        this.y -= this.startH / 2;
      }
      if (Input.getButtonDown('a')) {
        this.x += this.direction * 10;
        this.attack();
      } else if (Input.getButtonUp('a')) {
        this.x -= this.direction * 10;
      }
      applyGravity.call(this);
      applyVelocity.call(this);
      boundToScreen.call(this);
      this.world.boundToFloor(this, this.onGrounded);
    }
    attack() {
      const s = 74;
      const d = ((this.w + s + 20) / 2) * (1 - (2 * this.flipped));
      let x = this.x + (this.w / 2) + d;
      x -= s / 2;
      const y = (this.y + (this.h / 2)) - (s / 2);
      this.driver.addEntity(new HitBox(x, y, s, s));
    }
    jump() {
      if (!this.grounded) return;
      this.vy = -20;
      this.grounded = false;
    }
    onGrounded() {
      this.grounded = true;
      this.vy = 0;
    }
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
      const col = this.groundCollides(entity);
      if (col) {
        entity.y = col.y - entity.h;
        if (callback) callback();
      }
    }
  }
  const main = new Driver(canvas);
  const world = new World();
  const player = new Player(world, 100, 100, 50, 100);
  main.addEntity(player);
  main.start();
}
window.onload = start;
