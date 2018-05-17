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
  }

  BDOTJS.HitBox = HitBox;
}());
