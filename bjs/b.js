let BDOTJS = {};
BDOTJS.init = function init() {
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

  const Time = {
    time: 0,
    deltaTime: 0,
    last: Date.now(),
    frame: 0,
    framesPerInterval: 0,
    intervalStart: 0,
    intervalLength: 1000,
    fps: 0,
    timeruuid: 0,
    timeouts: new Map(),
    intervals: new Map(),
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
      const toDelete = [];
      Time.timeouts.forEach((timeout, key) => {
        if (timeout.frames <= 0) {
          timeout.callback();
          toDelete.push(key);
        }
        timeout.frames -= 1;
      });
      toDelete.forEach(key => Time.timeouts.delete(key));
      Time.intervals.forEach((interval) => {
        if (interval.frames <= 0) {
          interval.callback();
          interval.frames = interval.time;
        }
        interval.frames -= 1;
      });
    },
    setFramedTimeout: (callback, frames) => {
      const id = Time.timeruuid;
      Time.timeruuid += 1;
      Time.timeouts.set(id, { callback, frames });
      return id;
    },
    setFramedInterval: (callback, frames) => {
      const id = Time.timeruuid;
      Time.timeruuid += 1;
      Time.intervals.set(id, { callback, frames, time: frames });
      return id;
    },
    clearFramedTimeout: id => Time.timeouts.delete(id),
    clearFramedInterval: id => Time.intervals.delete(id),
  };
  const Input = {
    keys: [],
    buttons: {},
    mouse: { x: 0, y: 0, held: false, down: false, up: false },
    reset: () => {
      Input.mouse.down = false;
      Input.mouse.up = false;
    },
    addButton: (name, keys) => {
      Input.buttons[name] = { keys };
    },
    buttonParse: (b, checkFnct) => {
      const button = Input.buttons[b];
      if (!button) return false;
      for (let i = 0; i < button.keys.length; i += 1) {
        const k = button.keys[i];
        if (checkFnct(k)) return true;
      }
      return false;
    },
    getButton: b => Input.buttonParse(b, Input.getKey),
    getButtonDown: b => Input.buttonParse(b, Input.getKeyDown),
    getButtonUp: b => Input.buttonParse(b, Input.getKeyUp),
    getKey: k => Input.keys[k] > 0,
    getKeyDown: k => Input.keys[k] === Time.frame,
    getKeyUp: k => Input.keys[k] === -Time.frame,
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
    Input.keys[k] = -(Time.frame + 1);
  });
  function mouseMoveEvent(e) {
    const x = e.clientX;
    const y = e.clientY;
    Input.mouse.x = x;
    Input.mouse.y = y;
  }
  window.addEventListener('mousemove', mouseMoveEvent);
  window.addEventListener('mousedown', (e) => {
    mouseMoveEvent(e);
    Input.mouse.held = true;
    Input.mouse.down = true;
    Input.mouse.lastDown = Time.frame;
  });
  window.addEventListener('mouseup', (e) => {
    mouseMoveEvent(e);
    Input.mouse.held = false;
    Input.mouse.up = true;
    Input.mouse.lastUp = Time.frame;
  });

  function collides(a, b) {
    return a.x + a.w >= b.x &&
      a.x <= b.x + b.w &&
      a.y + a.h >= b.y &&
      a.y <= b.y + b.h;
  }

  class Driver {
    setCanvas(canvas) {
      this.canvas = canvas;
    }
    setScene(scene) {
      this.scene = scene;
    }
    start(scene) {
      if (scene) this.setScene(scene);
      Time.last = Date.now();
      this.draw = this.draw.bind(this);
      this.draw();
      setInterval(this.update.bind(this), 1000 / 60);
    }
    clearScreen() {
      const { canvas } = this;
      canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
    }
    update() {
      Time.process();
      this.scene.update();
      Input.reset();
    }
    draw() {
      const { canvas } = this;
      this.clearScreen();
      this.scene.draw(canvas);
      canvas.fillText(Time.fps, 10, 10);
      window.requestAnimationFrame(this.draw);
    }
  }

  class EntityContainer {
    constructor() {
      this.entities = [];
    }
    addEntity(entity) {
      entity.setDriver(this);
      this.entities.push(entity);
    }
    draw(canvas) {
      this.entities.forEach(e => e.draw(canvas));
    }
    update() {
      LoopAndRemove(this.entities, (e) => {
        if (e.update) e.update();
      });
    }
  }

  class PhysicsContainer extends EntityContainer {
    constructor() {
      super();
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
    update() {
      super.update();
      this.handleCollisions();
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
    applyVelocity() {
      let { vy } = this;
      if (this.gravity) {
        vy -= this.gravity * (Time.deltaTime / 2);
      }
      this.x += this.vx * Time.deltaTime;
      this.y += vy * Time.deltaTime;
    }
    applyGravity() {
      this.vy += this.gravity * Time.deltaTime;
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
    Entity,
    Time,
    Input,
    SetupCanvas,
    Driver: new Driver(),
    GameContainer: PhysicsContainer,
  };
  return BJSExports;
};
BDOTJS = BDOTJS.init();
