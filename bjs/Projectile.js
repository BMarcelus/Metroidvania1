(function LoadProjectile() {
  const { HitBox } = BDOTJS;

  class Projectile extends HitBox {
    constructor(vx, vy, speed, damage, ...args) {
      super(...args);
      this.vx = vx * speed;
      this.vy = vy * speed;
      this.speed = speed;
      this.damage = damage;
      this.tag = 1;
      this.direction = vx;
      this.life = 100;
    }
    update() {
      super.update();
      this.applyVelocity();
    }
    onCollision(col) {
      super.onCollision(col);
      if (col.team === 2) {
        this.shouldDelete = true;
      }
    }
  }

  BDOTJS.Projectile = Projectile;
}());
