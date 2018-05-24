function start() {
  const { Driver, GameContainer, Entity, Input, Time, SetupCanvas } = BDOTJS;
  const { CE, canvas } = SetupCanvas();
  function boundToScreen() {
    const w = CE.width - this.w;
    const h = CE.height - this.h;
    if (this.x < 0) this.x = 0;
    if (this.y < 0) this.y = 0;
    if (this.x > w) this.x = w;
    if (this.y > h) this.y = h;
  }

  class Projectile extends Entity {
    constructor(x, y, w, h, vx, vy) {
      super(x, y, w, h);
      this.vx = vx;
      this.vy = vy;
      this.life = 100;
      this.color = 'red';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= 1;
      if (this.life <= 0) this.shouldDelete = true;
    }
    onCollision(other) {
      if (other.isPlayer) {
        this.shouldDelete = true;
        other.x += this.vx;
        other.y += this.vy;
      }
    }
  }

  class LilThing extends Entity {
    constructor(x, y, w, h, target) {
      super(x, y, w, h);
      this.target = target;
      this.angle = (Math.PI / 4) * (Math.random() - 0.5) * 2;
      this.offset = Math.floor(Math.random() * 100);
      this.startAngle = this.angle;
      this.state = 0;
      this.speed = 5;
      this.lastX = this.x;
      this.lastY = this.y;
    }
    bline() {
      this.state = (this.state + 1) % 3;
      if (this.state === 0) {
        this.angle = this.startAngle;
        this.speed = 4;
      } else if (this.state === 1) {
        this.angle = 0;
        this.speed = 8;
      } else if (this.state === 2) {
        this.angle = 0;
        this.speed = -8;
      }
    }
    update() {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      // const theta = -Math.PI * 0.4;
      let r = Math.sqrt((dx * dx) + (dy * dy));
      // const r = 100;
      // if ((Time.frame + this.offset) % 100 === 0) {
      //   this.shoot(dx / r, dy / r);
      //   this.bline();
      // }
      const theta = this.angle;
      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);
      const mx = (dx * cosTheta) - (dy * sinTheta);
      const my = (dx * sinTheta) + (dy * cosTheta);
      if (r === 0) r = 1;
      const speed = this.speed * Time.deltaTime;
      // var r = 100;
      this.x += (mx / r) * speed;
      this.y += (my / r) * speed;
      if (this.x < 10) this.x += 1;
      if (this.y < 10) this.y += 1;
      boundToScreen.call(this);
    }
    onCollision(other) {
      let dx = other.x - this.x;
      const dy = other.y - this.y;
      let r = Math.sqrt((dx * dx) + (dy * dy));
      if (r === 0) {
        r = 1;
        dx = 1;
      }
      this.x -= dx / r;
      this.y -= dy / r;
      other.x += dx / r;
      other.y += dy / r;
    }
    shoot(vx, vy) {
      const { x, y } = this;
      const speed = 10;
      this.driver.addEntity(new Projectile(x, y, 3, 3, vx * speed, vy * speed));
    }
    // draw(canvas) {
    //   const { x, y, lastX, lastY } = this;
    //   if (Math.random() > 0.5) {
    //     this.lastX = x;
    //     this.lastY = y;
    //   }
    //   canvas.save();
    //   canvas.lineCap = 'round';
    //   canvas.lineWidth = this.w;
    //   canvas.beginPath();
    //   canvas.moveTo(lastX, lastY);
    //   canvas.lineTo(x, y);
    //   canvas.stroke();
    //   canvas.restore();
    // }
  }

  class Player extends Entity {
    constructor(x, y, w, h) {
      super(x, y, w, h);
      this.color = 'red';
      this.isPlayer = true;
    }
    update() {
      const hi = Input.getAxisHorizontal();
      const vi = Input.getAxisVertical();
      this.x += hi * Time.deltaTime * 10;
      this.y += vi * Time.deltaTime * 10;
      boundToScreen.call(this);
    }
  }

  const main = new GameContainer(canvas);
  const player = new Player(100, 100, 10, 10);
  let target = player;
  for (let i = 0; i < 1000; i += 1) {
    const thing = new LilThing(i * 1, (i % 100) * 1, 5, 5, target);
    thing.angle = 0;
    thing.speed = 10 - (Math.random() * 5);
    main.addEntity(thing);
    target = thing;
    // if (Math.random() > 0.9) target = player;
  }
  // main.entities[0].target = main.entities[10];
  main.addEntity(player);

  Driver.setCanvas(canvas);
  Driver.setScene(main);
  Driver.start();
}
window.onload = start;
