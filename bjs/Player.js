(function LoadPlayer() {
  const { Entity, Input, Time, HitBox } = BDOTJS;

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
      this.doubleJumps = 3;
      this.maxDoubleJumps = 3;
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
      if (Input.getButtonDown('shoot')) {
        this.shoot();
      }
      if (Input.getButtonDown('dash')) {
        this.dash(hi, Input.getAxisVertical());
      }
      if (this.hasGravity) {
        this.applyGravity();
      }
      this.applyVelocity();
      this.world.boundToFloor(this, this.onGrounded);
    }
    dash(hi, vi) {
      this.sustainVelocity = true;
      this.hasGravity = false;
      // this.canMove = false;
      this.vx = hi * 20;
      this.vy = vi * 20;
      setTimeout(() => {
        this.sustainVelocity = false;
        this.canMove = true;
        this.hasGravity = true;
        this.vy = 0;
      }, 100);
    }
    attack() {
      const s = 74;
      const d = ((this.w + s) / 2) * (1 - (2 * this.flipped));
      let x = this.x + (this.w / 2) + d + this.vx;
      x -= s / 2;
      const y = (this.y + (this.h / 2)) - (s / 2);
      const hitbox = new HitBox(this, x, y, s, s);
			hitbox.collisionBehaviour = function(col) {
				if(col.team === 2)
      	{
        	//col.takeDamage(3);
        	col.doKnockback(this.direction, -10, 30);
				}
			}
      this.driver.addEntity(hitbox);
    }
    shoot() {
      const w = 9;
      const h = 3;
      const d = ((this.w + w) / 2) * (1 - (2 * this.flipped));
      let x = this.x + (this.w / 2) + d + this.vx;
      x -= w / 2;
      const y = (this.y + (this.h / 2)) - (h / 2);
      //constructor(vx, vy, speed, damage, ...args) {
      const projectile = new this.Projectile( (1 - (2 * this.flipped)), 0, 20, 1, this.world, x, y, w, h);
      projectile.collisionBehaviour = function(col) {
        if(col.team === 2)
      	{
        	col.takeDamage(1);
        	col.doKnockback(this.direction, 10, 10);
				}
      }
      this.driver.addEntity(projectile);
    }
    jump() {
      if (!this.grounded) {
        if(this.doubleJumps > 0) {
          this.doubleJumps--;
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
    takeDamage(dmg){
			if (this.invul) return;
      this.invul = true;
      this.color = '#f00';
      this.canMove = false;
      this.sustainVelocity = true;
      setTimeout(() => { this.color = '#faa'; }, 50);
      this.life -= dmg;
			setTimeout(() => {
        this.color = '#000';
        this.invul = false;
        this.canMove = true;
        this.sustainVelocity = false;
      }, 200);
		}
		doKnockback(dir, xForce, yForce) {
			this.vx = xForce * dir;
			this.vy = -1 * yForce;
		}
    onCollision(col) {
    }
  }

  BDOTJS.Player = Player;
}());
