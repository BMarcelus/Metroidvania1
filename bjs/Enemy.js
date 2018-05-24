(function LoadEnemy() {
	const { Entity, Time, HitBox } = BDOTJS;
	class Enemy extends Entity {
    constructor(world, ...args) {
      super(...args);
      this.world = world;
      this.vx = 0;
      this.vy = 0;
      this.gravity = 1;
      this.color = 'blue';
      this.life = 3;
      this.mx = 0;
      this.team = 2;
      this.flipped = false;
      this.direction = 1;
      this.canMove = true;
      this.onGrounded = this.onGrounded.bind(this);
    }
    update() {
      if (this.canMove) {
        if (Math.random() > 0.95) {
          if (Math.random() > 0.5) {
            this.mx = 1;
          } else {
            this.mx = -1;
          }
        }
        this.x += this.mx * 3;
      }
      if (Time.frame % 60 === 0) this.attack();
      if (this.mx) {
        this.flipped = this.mx < 0;
        this.direction = 1 - (2 * this.flipped);
      }
      this.applyGravity();
      this.applyVelocity();
      this.world.boundToFloor(this, this.onGrounded);
		}
		takeDamage(dmg){
			if (this.invul) return;
			this.invul = true;
			this.color = '#0ff';
			setTimeout(() => { this.color = '#2af'; }, 50);
			this.life -= dmg;
			if (this.life <= 0) {
				setTimeout(() => { this.shouldDelete = true; }, 200);
			} else {
				setTimeout(() => { this.color = 'blue'; this.invul = false; }, 200);
			}
		}
		doKnockback(dir, xForce, yForce) {
			this.vx = xForce * dir;
      this.vy = -1 * yForce;
      this.canMove = false;
      Time.setFramedTimeout(() => {
        this.canMove = true;
      }, 30);
		}
    attack() {
      const s = 74;
      const d = ((this.w + s) / 2) * (1 - (2 * this.flipped));
      let x = this.x + (this.w / 2) + d + this.vx;
      x -= s / 2;
			const y = (this.y + (this.h / 2)) - (s / 2);
			const hitbox = new HitBox(this, x, y, s, s);
			hitbox.collisionBehaviour = function(col) {
				if(col.team === 1)
      	{
        	col.takeDamage(1);
        	col.doKnockback(this.direction, 10, 10);
				}
			}
      this.driver.addEntity(hitbox);
    }
    onGrounded() {
      this.grounded = true;
      this.vx = 0;
    }
  }
  
	BDOTJS.Enemy = Enemy;
  }());
