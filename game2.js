function start() {
  const { Driver, Entity, Input, Time, SetupCanvas } = BDOTJS();
  const { CE, canvas } = SetupCanvas();
  Input.addButton('jump', [87, 38, 32]);
  Input.addButton('crouch', [83, 40]);
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
  class Player extends Entity {
    constructor(...args) {
      super(...args);
      this.vx = 0;
      this.vy = 0;
      this.gravity = 1;
      this.startH = this.h;
    }
    update() {
      const hi = Input.getAxisHorizontal();
      this.x += hi * Time.deltaTime * 10;
      if (Input.getButtonDown('jump')) {
        this.vy = -20;
      }
      if (Input.getButton('crouch')) {
        this.h = this.startH / 2;
      } else {
        this.h = this.startH;
      }
      applyGravity.call(this);
      applyVelocity.call(this);
      boundToScreen.call(this);
    }
  }
  const main = new Driver(canvas);
  const player = new Player(100, 100, 30, 30);
  main.addEntity(player);
  main.start();
}
window.onload = start;
