const { Driver, Entity, Input, Time, SetupCanvas } = BDOTJS();

function start() {
  const { CE, canvas } = SetupCanvas();
  Input.addButton('jump', [87, 38, 32]);
  Input.addButton('crouch', [83, 40]);
  Input.addButton('a', [74, 90]); // J and Z
  Input.addButton('dash', [16]); // Left Shift, or both shifts actualy
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
    constructor(parent, ...args) {
      super(...args);
      this.parent = parent;
      this.tag = parent.team;
      this.direction = parent.direction;
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
      this.team = 1;
      this.sustainVelocity = false;
      this.canMove = true;
    }
    update() {
      const hi = Input.getAxisHorizontal();
      if (!this.sustainVelocity) {
        this.vx *= 0.6;
      }
      if (this.canMove) {
        this.x += hi * Time.deltaTime * 10;
      }
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
        this.x += this.direction * 20;
        this.attack();
      } else if (Input.getButtonUp('a')) {
        this.x -= this.direction * 20;
      }
      if (Input.getButtonDown('dash')) {
        this.dash(hi, Input.getAxisVertical());
      }
      if (!this.sustainVelocity) {
        applyGravity.call(this);
      }
      applyVelocity.call(this);
      boundToScreen.call(this);
      this.world.boundToFloor(this, this.onGrounded);
    }
    dash(hi, vi) {
      this.sustainVelocity = true;
      // this.canMove = false;
      this.vx = hi * 20;
      this.vy = vi * 20;
      setTimeout(() => {
        this.sustainVelocity = false;
        this.canMove = true;
        this.vy = 0;
      }, 100);
    }
    attack() {
      const s = 74;
      const d = ((this.w + s) / 2) * (1 - (2 * this.flipped));
      let x = this.x + (this.w / 2) + d + this.vx;
      x -= s / 2;
      const y = (this.y + (this.h / 2)) - (s / 2);
      this.driver.addEntity(new HitBox(this, x, y, s, s));
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

    onCollision(col) {
      if (col.tag === 2) {
        if (this.invul) return;
        this.invul = true;
        this.color = '#f00';
        this.canMove = false;
        this.sustainVelocity = true;
        setTimeout(() => { this.color = '#faa'; }, 50);
        this.vx = 10 * col.direction;
        this.vy = -10;
        // this.life -= 1;
        // if (this.life <= 0) {
        //   setTimeout(() => { this.shouldDelete = true; }, 200);
        // } else {
        setTimeout(() => {
          this.color = '#000';
          this.invul = false;
          this.canMove = true;
          this.sustainVelocity = false;
        }, 200);
        // }
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
      applyGravity.call(this);
      applyVelocity.call(this);
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
  setInterval(() => {
    main.addEntity(new Enemy(world, CE.width * Math.random(), 100, 80, 100));
  }, 5000);
  main.addEntity(player);
  main.addEntity(new Enemy(world, CE.width * Math.random(), 100, 80, 100));
  main.start();
}
window.onload = start;
