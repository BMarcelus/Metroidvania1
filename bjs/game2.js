function start() {
  const { Driver, Entity, Input, Time, SetupCanvas, Player, HitBox } = BDOTJS;
  const { CE, canvas } = SetupCanvas();
  Input.addButton('jump', [87, 38, 32]);
  Input.addButton('crouch', [83, 40]);
  Input.addButton('attack', [74, 90]); // J and Z
  Input.addButton('shoot', [75]);
  Input.addButton('e', [69]);
  Input.addButton('dash', [16]); // Left Shift, or both shifts actualy
  function boundToScreen() {
    const w = CE.width - this.w;
    const h = CE.height - this.h;
    if (this.x < 0) this.x = 0;
    if (this.y < 0) this.y = 0;
    if (this.x > w) this.x = w;
    if (this.y > h) this.y = h;
  }

  class Projectile extends Entity {
    constructor(vx, vy, speed, damage, ...args) {
      super(...args);
      this.vx = vx * speed;
      this.vy = vy * speed;
      this.speed = speed;
      this.damage = damage;
      this.tag = 1;
      this.direction = vx;
    }
    update() {
      this.applyVelocity();
    }

    onCollision(col) {
      if (col.team === 2) {
        this.shouldDelete = true;
      }
    }
  }

  class Enemy extends Entity {
    constructor(world, ...args) {
      super(...args);
      this.world = world;
      this.vx = 0;
      this.vy = 0;
      this.gravity = 1;
      this.color = 'blue';
      this.life = 3;
      this.mx = 0;
      this.team = 2;
      this.flipped = false;
      this.direction = 1;
      this.onGrounded = this.onGrounded.bind(this);
    }
    update() {
      if (Math.random() > 0.95) {
        if (Math.random() > 0.5) {
          this.mx = 1;
        } else {
          this.mx = -1;
        }
      }
      if (Math.random() > 0.95) {
        this.mx = 0;
      }
      this.x += this.mx * 3;
      if (Time.frame % 60 === 0) this.attack();
      if (this.mx) {
        this.flipped = this.mx < 0;
        this.direction = 1 - (2 * this.flipped);
      }
      this.applyGravity();
      this.applyVelocity();
      boundToScreen.call(this);
      this.world.boundToFloor(this, this.onGrounded);
    }
    onCollision(col) {
      if (col.tag === 1) {
        if (this.invul) return;
        this.invul = true;
        this.color = '#0ff';
        setTimeout(() => { this.color = '#2af'; }, 50);
        this.vx = 10 * col.direction;
        this.vy = -10;
        this.life -= 1;
        if (this.life <= 0) {
          setTimeout(() => { this.shouldDelete = true; }, 200);
        } else {
          setTimeout(() => { this.color = 'blue'; this.invul = false; }, 200);
        }
      }
    }
    attack() {
      const s = 74;
      const d = ((this.w + s) / 2) * (1 - (2 * this.flipped));
      let x = this.x + (this.w / 2) + d + this.vx;
      x -= s / 2;
      const y = (this.y + (this.h / 2)) - (s / 2);
      this.driver.addEntity(new HitBox(this, x, y, s, s));
    }
    onGrounded() {
      this.grounded = true;
      this.vx = 0;
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
      boundToScreen.call(this);
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
