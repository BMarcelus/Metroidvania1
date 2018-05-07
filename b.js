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
      // const maxDT = framesPerMilisecond * 100;
      Time.deltaTime = (Time.time - Time.last) * framesPerMilisecond;
      // if (Time.deltaTime > maxDT) Time.deltaTime = framesPerMilisecond;
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
    buttons: {},
    addButton: (name, keys) => {
      Input.buttons[name] = { keys };
    },
    getButton: (b) => {
      const button = Input.buttons[b];
      if (!button) return false;
      for (let i = 0; i < button.keys.length; i += 1) {
        const k = button.keys[i];
        if (Input.getKey(k)) return true;
      }
      return false;
    },
    getButtonDown: (b) => {
      const button = Input.buttons[b];
      if (!button) return false;
      for (let i = 0; i < button.keys.length; i += 1) {
        const k = button.keys[i];
        if (Input.getKeyDown(k)) return true;
      }
      return false;
    },
    getKey: k => Input.keys[k] > 0,
    getKeyDown: k => Input.keys[k] === Time.frame,
    getAxisHorizontal: () =>
      ((Input.getKey(68) || Input.getKey(39)) - (Input.getKey(65) || Input.getKey(37))),
    getAxisVertical: () =>
      ((Input.getKey(83) || Input.getKey(40)) - (Input.getKey(87) || Input.getKey(38))),
  };
  window.addEventListener('keydown', (e) => {
    const k = e.keyCode;
    if (Input.keys[k] > 0) return;
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
      this.layerNameMap = {};
      this.layers = [];
      this.layerCollisionMap = [];
      this.addCollisionLayer('default');
      this.setCollisionMap('default', ['default']);
    }
    createCollisionMap(names) {
      return names.map(name => this.layers[this.layerCollisionMap[name]]);
    }
    setCollisionMap(name, names) {
      const index = this.layerNameMap[name];
      this.layerCollisionMap[index] = this.createCollisionMap(names);
    }
    addCollisionLayer(name) {
      this.layerNameMap[name] = this.layers.length;
      this.layers.push([]);
    }
    start() {
      // this.step();
      Time.last = Date.now();
      this.draw = this.draw.bind(this);
      this.draw();
      setInterval(this.update.bind(this), 1000 / 60);
      // setInterval(this.update.bind(this), 0);
    }
    clearScreen() {
      const { canvas } = this;
      canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
    }
    // handleLayerCollisions() {
    //   for (let i = 0; i < this.layerCollisionMap.length; i += 1) {
    //     const map = this.layerCollisionMap[i];
    //   }
    // }
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
    draw() {
      this.clearScreen();
      this.entities.forEach(e => e.draw(this.canvas));
      this.canvas.fillText(Time.fps, 10, 10);
      window.requestAnimationFrame(this.draw);
    }
    update() {
      Time.process();
      LoopAndRemove(this.entities, (e) => {
        if (e.update) e.update();
      });
      this.handleCollisions();
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

  function sizeCanvasToWindow(CE) {
    CE.width = window.innerWidth;
    CE.height = window.innerHeight;
  }

  function SetupCanvas() {
    const CE = document.getElementById('gc');
    const canvas = CE.getContext('2d');
    sizeCanvasToWindow(CE, canvas);
    window.addEventListener('resize', () => {
      sizeCanvasToWindow(CE, canvas);
    });
    return { CE, canvas };
  }

  const BJSExports = {
    Driver,
    Entity,
    Time,
    Input,
    SetupCanvas,
  };
  return BJSExports;
}
BDOTJS.noError = true;
