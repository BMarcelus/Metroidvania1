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

  const Images = {};

  function LoadImage(src) {
    const mappedImage = Images[src];
    if (mappedImage) return mappedImage;
    const image = new Image();
    image.src = `./images/${src}.png`;
    image.alt = src;
    Image[src] = image;
    return image;
  }
  const framesPerMilisecond = 60 / 1000;

  const Time = {
    time: 0,
    deltaTime: 0,
    last: Date.now(),
    frame: 0,
    framesPerInterval: 0,
    drawsPerInterval: 0,
    intervalStart: 0,
    intervalLength: 1000,
    fps: 0,
    dps: 0,
    timeruuid: 0,
    timeouts: new Map(),
    intervals: new Map(),
    timeScale: 1,
    process: () => {
      Time.time = Date.now();
      Time.deltaTime = (Time.time - Time.last) * framesPerMilisecond;
      Time.deltaTime *= Time.timeScale;
      Time.last = Time.time;
      Time.frame += 1;
      Time.framesPerInterval += 1;
      if (Time.time >= Time.intervalStart + Time.intervalLength) {
        Time.fps = Time.framesPerInterval;
        Time.dps = Time.drawsPerInterval;
        Time.framesPerInterval = 0;
        Time.drawsPerInterval = 0;
        Time.intervalStart = Time.time;
      }
      let toDelete = [];
      Time.timeouts.forEach((timeout, key) => {
        if (timeout.frames <= 0) {
          timeout.callback(-timeout.frames);
          toDelete.push(key);
        }
        timeout.frames -= Time.deltaTime;
      });
      toDelete.forEach(key => Time.timeouts.delete(key));
      toDelete = [];
      Time.intervals.forEach((interval, key) => {
        if (interval.frames <= 0) {
          interval.callback();
          interval.frames = interval.time;
          if (interval.length) {
            interval.length -= 1;
            if (interval.length === 0) {
              toDelete.push(key);
            }
          }
        }
        interval.frames -= 1;
      });
      toDelete.forEach(key => Time.intervals.delete(key));
    },
    setFramedTimeout: (callback, frames) => {
      const id = Time.timeruuid;
      Time.timeruuid += 1;
      Time.timeouts.set(id, { callback, frames });
      return id;
    },
    setFramedInterval: (callback, frames, length) => {
      const id = Time.timeruuid;
      Time.timeruuid += 1;
      Time.intervals.set(id, { callback, frames, time: frames, length });
      return id;
    },
    clearFramedTimeout: id => Time.timeouts.delete(id),
    clearFramedInterval: id => Time.intervals.delete(id),
  };
  const Input = {
    keys: [],
    buttons: {},
    mouse: { x: 0, y: 0, held: false, down: false, up: false, mouse: true },
    reset: () => {
      Input.mouse.down = false;
      Input.mouse.up = false;
    },
    clear: () => {
      for (let i = 0; i < 255; i += 1) {
        Input.keys[i] = 0;
      }
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
    // if (!e.metaKey) {
    //   e.preventDefault();
    // }
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
    constructor() {
      this.update = this.update.bind(this);
      this.draw = this.draw.bind(this);
      this.paused = true;
      window.addEventListener('blur', this.pause.bind(this));
      window.addEventListener('focus', this.resume.bind(this));
    }
    setCanvas(canvas) {
      this.canvas = canvas;
    }
    setScene(scene) {
      this.scene = scene;
    }
    getScene() {
      return this.scene;
    }
    getCanvas() {
      return this.canvas;
    }
    start(scene) {
      if (scene) this.setScene(scene);
      Time.last = Date.now();
      this.paused = false;
      this.draw();
      this.updateInterval = setInterval(this.update, 1000 / 60);
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
      if (this.paused) return;
      Time.drawsPerInterval += 1;
      const { canvas } = this;
      this.clearScreen();
      this.scene.draw(canvas);
      canvas.font = '40px Impact';
      canvas.fillText(Time.dps, 20, 40);
      window.requestAnimationFrame(this.draw);
    }
    pause() {
      if (!this.paused) {
        clearInterval(this.updateInterval);
        this.paused = true;
        Input.clear();
      }
    }
    resume() {
      if (this.paused) {
        this.start();
      }
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
    setDriver(a) { }
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

  // class GameContainer extends EntityContainer {
  //   constructor() {
  //     super();
  //     this.physicsContainer = new PhysicsContainer();
  //     this.UIContainers = new EntityContainer();
  //   }
  //   addEntity(entity) {
  //     this.physicsContainer.addEntity(entity);
  //     entity.setDriver(this);
  //   }
  //   addUI(UI) {
  //     this.UIContainer.addEntity(UI);
  //     UI.setDriver(this);
  //   }
  // }

  class Renderers {
    static Rect(canvas) {
      const { x, y, w, h, color } = this;
      canvas.fillStyle = color;
      canvas.fillRect(x, y, w, h);
    }
    static Image(canvas) {
      const { x, y, w, h, image } = this;
      canvas.drawImage(image, x, y, w, h);
    }
    static ColoredImage(canvas) {
      const { x, y, w, h, color, image } = this;
      canvas.save();
      canvas.drawImage(image, x, y, w, h);
      canvas.fillStyle = color;
      canvas.globalAlpha = 0.5;
      canvas.fillRect(x, y, w, h);
      canvas.restore();
    }
    static ColoredImage2(canvas) {
      const { x, y, w, h, color, image } = this;
      canvas.save();
      canvas.drawImage(image, x, y, w, h);
      canvas.globalCompositeOperation = 'hue';
      canvas.fillStyle = color;
      canvas.fillRect(x, y, w, h);
      canvas.restore();
    }
  }

  class Entity {
    constructor(x, y, w, h) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.initRenderer();
    }
    initRenderer() {
      this.color = 'black';
      // this.draw = RectRenderer;
      this.image = LoadImage('B.js');
      this.draw = Renderers.ColoredImage;
    }
    setDriver(driver) {
      this.driver = driver;
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
    containsPoint(point) {
      const rect = this;
      return point.x >= rect.x && point.x <= rect.x + rect.w &&
      point.y >= rect.y && point.y <= rect.y + rect.h;
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
    EntityContainer,
    LoadImage,
  };
  return BJSExports;
};
BDOTJS = BDOTJS.init();
