(function LoadPlayer() {
  const { Entity, Input, Time, HitBox, Inventory } = BDOTJS;

  class Player extends Entity {
    constructor(world, Projectile, ...args) {
      super(...args);
      this.world = world;
      this.vx = 0;
      this.vy = 0;
      this.gravity = 1;
      this.startH = this.h;
      this.startW = this.w;
      this.onGrounded = this.onGrounded.bind(this);
      this.flipped = false;
      this.direction = 1;
      this.team = 1;
      this.sustainVelocity = false;
      this.hasGravity = true;
      this.canMove = true;
      this.Projectile = Projectile;
      this.attackData = {
        damage: 0,
        knockback: { vx: -10, vy: 30 },
      };
      this.maxDoubleJumps = 1;
      this.doubleJumps = this.maxDoubleJumps;
      this.inventory = new Inventory(5, this);
    }
    update() {
      const hi = Input.getAxisHorizontal();
      if (!this.sustainVelocity) {
        this.vx *= 0.6;
      }
      if (this.canMove) {
        this.x += hi * Time.deltaTime * 10;
      }
      if (hi) {
        this.flipped = hi < 0;
        this.direction = 1 - (2 * this.flipped);
      }
      if (Input.getButtonDown('jump')) {
        this.jump();
      }
      if (Input.getButtonDown('crouch')) {
        this.h = this.startH / 2;
        this.y += this.startH / 2;
      } else if (Input.getButtonUp('crouch')) {
        this.h = this.startH;
        this.y -= this.startH / 2;
      }
      if (Input.getButtonDown('attack')) {
        this.x += this.direction * 20;
        this.attack();
      } else if (Input.getButtonUp('attack')) {
        this.x -= this.direction * 20;
      }
      if (Input.getButtonDown('attack2')) {
        this.x -= this.direction * 20;
        this.spearattack();
      } else if (Input.getButtonUp('attack2')) {
        this.x += this.direction * 20;
      }
      if (Input.getButtonDown('dash')) {
        this.dash(hi, Input.getAxisVertical());
      }
      if (Input.getButtonDown('q')) {
        this.inventory.dropItem(this);
      }
      if (Input.getButtonDown('inventory')) {
        this.inventory.toggleDisplay();
      }
      if (Input.getButtonDown('slot1')) {
        this.inventory.useItem(0);
      }
      if (Input.getButtonDown('slot2')) {
        this.inventory.useItem(1);
      }
      if (Input.getButtonDown('slot3')) {
        this.inventory.useItem(2);
      }
      if (Input.getButtonDown('slot4')) {
        this.inventory.useItem(3);
      }
      if (Input.getButtonDown('slot5')) {
        this.inventory.useItem(4);
      }
      if (this.hasGravity) {
        this.applyGravity();
      }
      this.applyVelocity();
      this.world.boundToFloor(this, this.onGrounded);
    }
    dash(hi, vi) {
      if (!this.canMove) return;
      this.sustainVelocity = true;
      this.hasGravity = false;
      // this.canMove = false;
      this.vx = hi * 20;
      this.vy = vi * 20;
      Time.setFramedTimeout(() => {
        this.vx = 0;
        this.vy = 0;
        Time.setFramedTimeout(() => {
          this.sustainVelocity = false;
          this.canMove = true;
          this.hasGravity = true;
          this.vy = -this.gravity;
        }, 2);
      }, 6);
    }
    spearattack() {
      const w = 200;
      const h = 10;
      let x = this.x + (this.w / 2);
      x -= this.flipped ? w : 0;
      const y = this.y + ((this.h / 2) - (h / 2));
      const hitbox = new HitBox(this, x, y, w, h);
      hitbox.collisionBehaviour = function playerAttackHit(col) {
        if (col.team === 2) {
          col.takeDamage(1);
          col.doKnockback(this.direction, 200, 100);
        }
      };
      this.driver.addEntity(hitbox);
    }
    attack() {
      const s = 74;
      const d = ((this.w + s) / 2) * (1 - (2 * this.flipped));
      let x = this.x + (this.w / 2) + d + this.vx;
      x -= s / 2;
      const y = (this.y + (this.h / 2)) - (s / 2);
      this.createHitBox(this.attackData, x, y, s);
    }
    createHitBox(attackData, x, y, s) {
      const hitbox = new HitBox(this, x, y, s, s);
      hitbox.collisionBehaviour = function playerAttackHit(col) {
        if (col.team === 2) {
          col.takeDamage(attackData.damage);
          col.doKnockback(this.direction, attackData.knockback.vx, attackData.knockback.vy);
        }
      };
      this.driver.addEntity(hitbox);
    }
    shoot() {
      const w = 9;
      const h = 3;
      const d = ((this.w + w) / 2) * (1 - (2 * this.flipped));
      let x = this.x + (this.w / 2) + d + this.vx;
      x -= w / 2;
      const y = (this.y + (this.h / 2)) - (h / 2);
      const vx = (1 - (2 * this.flipped));
      const vy = 0;
      const speed = 20;
      const damage = 1;
      const projectile = new this.Projectile(vx, vy, speed, damage, this.world, x, y, w, h);
      projectile.collisionBehaviour = function playerProjectileHit(col) {
        if (col.team === 2) {
          col.takeDamage(1);
          col.doKnockback(this.direction, 10, 10);
        }
      };
      this.driver.addEntity(projectile);
    }
    shootSpecific(projectile) {
      const d = ((this.w + projectile.w) / 2) * (1 - (2 * this.flipped));
      let x = this.x + (this.w / 2) + d + this.vx;
      x -= projectile.w / 2;
      const y = (this.y + (this.h / 2)) - (projectile.h / 2);
      projectile.vx = (1 - (2 * this.flipped));
      projectile.vy = 0;
      projectile.x = x;
      projectile.y = y;
      this.driver.addEntity(projectile);
    }
    jump() {
      if (!this.grounded) {
        if (this.doubleJumps > 0) {
          this.doubleJumps -= 1;
          this.vy = -20;
        }
      } else {
        this.vy = -20;
        this.grounded = false;
      }
    }
    onGrounded() {
      this.grounded = true;
      this.vy = 0;
      this.doubleJumps = this.maxDoubleJumps;
    }
    takeDamage(dmg) {
      if (this.invul) return;
      this.invul = true;
      this.color = '#f00';
      Time.setFramedTimeout(() => { this.color = '#faa'; }, 10);
      this.life -= dmg;
      Time.setFramedTimeout(() => {
        this.color = '#000';
        this.invul = false;
      }, 30);
    }
    doKnockback(dir, xForce, yForce) {
      this.vx = xForce * dir;
      this.vy = -1 * yForce;
      this.sustainVelocity = true;
      this.canMove = false;
      Time.setFramedTimeout(() => {
        this.canMove = true;
        this.sustainVelocity = false;
      }, 30);
    }
  }

  BDOTJS.Player = Player;
}());
