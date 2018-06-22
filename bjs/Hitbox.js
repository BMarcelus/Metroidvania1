(function LoadHitBox() {
  const { Entity } = BDOTJS;

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
    onCollision(col) {
      this.collisionBehaviour(col);
    }
  }

  class HitBoxSequence {
    setDriver(a) { }
    draw() { }

    constructor(parent, options, ...args) {
      this.parent = parent;
      this.startX = parent.x;
      this.startY = parent.y;
      this.hitBoxInfo = [...args];
      this.index = 0;
      this.counter = 0;
      this.color = 'red';

      this.enforceOptions(options);
    }

    enforceOptions(options) {
      if(options.flipX) {
        for(var x = 0; x < this.hitBoxInfo.length; ++x) {
          this.hitBoxInfo[x][0] = -this.hitBoxInfo[x][0];
        }
      }
      if(options.color != null) {
        this.color = options.color;
      }
    }
    
    update() {
      if(this.index >= this.hitBoxInfo.length) {
        this.shouldDelete = true;
        return;
      }
      if(this.counter++ <= this.hitBoxInfo[this.index][4]) {
        return;
      }
      this.counter = 0;
      const curr = this.hitBoxInfo[this.index++];
      let hitBox = new HitBox(this.parent, curr[0] + this.startX, curr[1] + this.startY, curr[2], curr[3]);
      hitBox.collisionBehaviour = this.collisionBehaviour;
      hitBox.life = curr[4];
      hitBox.color = this.color;
      this.parent.driver.addEntity(hitBox);
    }
  }

  BDOTJS.HitBox = HitBox;
  BDOTJS.HitBoxSequence = HitBoxSequence;
}());
