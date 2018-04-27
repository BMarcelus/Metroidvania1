function BDOTJS() {
  const Time = {
    time: 0,
    deltaTime: 0,
    last: Date.now(),
    frame: 0,
    framesPerInterval: 0,
    intervalStart: 0,
    intervalLength: 1000,
    fps: 0,
    process: () => {
      Time.time = Date.now();
      const framesPerMilisecond = 60 / 1000;
      Time.deltaTime = (Time.time - Time.last) * framesPerMilisecond;
      Time.last = Time.time;
      Time.frame += 1;
      Time.framesPerInterval += 1;
      if (Time.time >= Time.intervalStart + Time.intervalLength) {
        Time.fps = Time.framesPerInterval;
        Time.framesPerInterval = 0;
        Time.intervalStart = Time.time;
      }
    },
  };
  const Input = {
    keys: [],
    getKey: k => Input.keys[k] > 0,
    getKeyDown: k => Input.keys[k] === Time.frame,
  };
  window.addEventListener('keydown', (e) => {
    const k = e.keyCode;
    Input.keys[k] = Time.frame + 1;
  });
  window.addEventListener('keyup', (e) => {
    const k = e.keyCode;
    Input.keys[k] = 0;
  });

  function LoopAndRemove(list, callback) {
    for (let i = 0; i < list.length; i += 1) {
      const e = list[i];
      if (e.shouldDelete) {
        list.splice(i, 1);
        i -= 1;
      } else {
        callback(e);
      }
    }
  }

  function collides(a, b) {
    return a.x + a.w >= b.x &&
      a.x <= b.x + b.w &&
      a.y + a.h >= b.y &&
      a.y <= b.y + b.h;
  }

  class Driver {
    constructor(canvas) {
      this.canvas = canvas;
      this.entities = [];
      this.step = this.step.bind(this);
    }
    start() {
      this.step();
      Time.last = Date.now();
    }
    clearScreen() {
      const { canvas } = this;
      canvas.clearRect(0, 0, canvas.width, canvas.height);
    }
    handleCollisions() {
      for (let i = 0; i < this.entities.length - 1; i += 1) {
        const e1 = this.entities[i];
        for (let j = i + 1; j < this.entities.length; j += 1) {
          const e2 = this.entities[j];
          if (collides(e1, e2)) {
            e1.onCollision(e2);
            e2.onCollision(e1);
          }
        }
      }
    }
    step() {
      this.clearScreen();
      Time.process();
      LoopAndRemove(this.entities, (e) => {
        if (e.draw) e.draw(this.canvas);
        if (e.update) e.update();
      });
      this.handleCollisions();
      this.canvas.fillText(Time.fps, 10, 10);
      window.requestAnimationFrame(this.step);
    }
    addEntity(entity) {
      entity.setDriver(this);
      this.entities.push(entity);
    }
  }

  class Entity {
    constructor(x, y, w, h) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.color = 'black';
    }
    setDriver(driver) {
      this.driver = driver;
    }
    draw(canvas) {
      const { x, y, w, h, color } = this;
      canvas.fillStyle = color;
      canvas.fillRect(x, y, w, h);
    }
    onCollision() {
      this.colliding = true;
    }
  }

  const BJSExports = {
    Driver,
    Entity,
    Time,
    Input,
  };
  return BJSExports;
}
BDOTJS.noError = true;
