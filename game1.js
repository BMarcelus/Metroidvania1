// import { Driver, Thing } from './b';
function sizeToWindow(CE, canvas) {
  CE.width = window.innerWidth;
  CE.height = window.innerHeight;
  canvas.width = CE.width;
  canvas.height = CE.height;
}
function start() {
  // this is for exporting from a separate file
  // so that the linter doesn't get mad
  // BDOTJS is specified as a global in the .eslintrc
  // it also helps keep things scope defined to their file
  const { Driver, Entity, Input, Time } = BDOTJS();
  const CE = document.getElementById('gc');
  const canvas = CE.getContext('2d');
  sizeToWindow(CE, canvas);
  window.addEventListener('resize', () => {
    sizeToWindow(CE, canvas);
  });
  function boundToScreen() {
    const w = canvas.width - this.w;
    const h = canvas.height - this.h;
    if (this.x < 0) this.x = 0;
    if (this.y < 0) this.y = 0;
    if (this.x > w) this.x = w;
    if (this.y > h) this.y = h;
  }

  class Player extends Entity {
    constructor(x, y, w, h) {
      super(x, y, w, h);
      this.color = 'red';
    }
    update() {
      const hi = Input.getKey(68) - Input.getKey(65);
      const vi = Input.getKey(83) - Input.getKey(87);
      this.x += hi * Time.deltaTime * 10;
      this.y += vi * Time.deltaTime * 10;
      boundToScreen.call(this);
    }
  }
  class LilThing extends Entity {
    constructor(x, y, w, h, target) {
      super(x, y, w, h);
      this.target = target;
    }
    update() {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const theta = -Math.PI * 0.4;
      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);
      const mx = (dx * cosTheta) - (dy * sinTheta);
      const my = (dx * sinTheta) + (dy * cosTheta);
      let r = Math.sqrt((mx * mx) + (my * my));
      if (r === 0) r = 1;
      const speed = 5 * Time.deltaTime;
      // var r = 100;
      this.x += (mx / r) * speed;
      this.y += (my / r) * speed;
      if (this.x < 10) this.x += 1;
      if (this.y < 10) this.y += 1;
      boundToScreen.call(this);
    }
    onCollision(other) {
      const dx = other.x - this.x;
      const dy = other.y - this.y;
      let r = Math.sqrt((dx * dx) + (dy * dy));
      if (r === 0) r = 1;
      this.x -= dx / r;
      this.y -= dy / r;
      other.x += dx / r;
      other.y += dy / r;
    }
  }
  const main = new Driver(canvas);
  const player = new Player(100, 100, 10, 10);
  for (let i = 0; i < 1000; i += 1) {
    main.addEntity(new LilThing(i * 1, (i % 100) * 1, 5, 5, player));
  }
  main.addEntity(player);
  main.start();
}
window.onload = start;
