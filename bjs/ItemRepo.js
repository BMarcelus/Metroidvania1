(function LoadItemRepo() {
  const { ItemObject, ItemData, Projectile, HitBox, HitBoxSequence, Time } = BDOTJS;

  class ItemRepo {
    static SwordSwing(world, x, y) {
      const w = 10;
      const h = 10;
      const item = new ItemObject(world, new ItemData('SwordSwing', 200, 300), x, y, 50, 50);
      item.color = 'green';
      
      item.data.itemBehaviour = function swingSword(user) {
        let hitBoxOptions = {};
        hitBoxOptions.flipX = (user.direction == -1);
        const z1 = new HitBoxSequence (user, hitBoxOptions,
          [-30, -50, 70, 50, 2],
          [30, -30, 50, 50, 2],
          [60, 10, 50, 50, 2],
          [90, 40, 50, 50, 2]
        );
        hitBoxOptions.color = 'green';
        const z2 = new HitBoxSequence (user, hitBoxOptions,
          [-30, -70, 70, 50, 2],
          [30, -50, 50, 50, 2],
          [60, -10, 50, 50, 2],
          [90, 20, 50, 50, 2]
        );
        z1.collisionBehaviour = z2.collisionBehaviour = function swordSwingHit(col) {
          if (col.team === 2) {
            col.doKnockback(this.direction, 20, 20);
            col.takeDamage(1);
          }
        }
        user.driver.addEntity(z1);
        user.driver.addEntity(z2);  
      }
      return item;
    }
    static FireCloak(world, x, y) {
      const w = 50;
      const h = w;
      const item = new ItemObject(world, new ItemData('FireCloak', 2, 3), x, y, w, h);
      item.color = 'orange';
      item.data.itemBehaviour = function createFire(user) {
        let hitBoxOptions = {};
        hitBoxOptions.flipX = (user.direction == -1);
        const hitboxes = new HitBoxSequence (user, hitBoxOptions,
          [0, 0, 10, 10, 1],
          [0, -30, 10, 10, 1],
          [30, -30, 10, 10, 1],
          [30, 0, 10, 10, 1],
          [30, 30, 10, 10, 1],
          [0, 30, 10, 10, 1],
          [-30, 30, 10, 10, 1],
          [-30, 0, 10, 10, 1],
          [-30, -30, 10, 10, 1]
        );
        hitboxes.collisionBehaviour = function fireCloakHit(col) {
          if (col.team === 2) {
            col.doKnockback(this.direction, 20, 1);
            col.takeDamage(1);
          }
        }
        user.driver.addEntity(hitboxes);
      };
      return item;
    }
    static HeavyRock(world, x, y) {
      const w = 50;
      const h = w;
      const item = new ItemObject(world, new ItemData('Heavy Rock', 3, 5), x, y, w, h);
      item.color = 'black';
      item.data.itemBehaviour = function throwRock(user) {
        user.shoot();
      };
      return item;
    }
    static SlowMo(world, x, y) {
      const w = 50;
      const h = w;
      const item = new ItemObject(world, new ItemData('SlowMo', 10, 20), x, y, w, h);
      item.image = BDOTJS.LoadImage('clock');
      item.color = null;//'purple';
      item.data.itemBehaviour = function slowMo() {
        Time.timeScale = 0.25;
        Time.setFramedInterval(() => {
          Time.timeScale = 1;
        }, 500);
      };
      return item;
    }
    static RocketShoes(world, x, y) {
      const w = 50;
      const h = w;
      const item = new ItemObject(world, new ItemData('Rocket Shoes', 1, 2), x, y, w, h);
      item.image = BDOTJS.LoadImage('rocketshoes');
      item.color = null;
      item.data.itemBehaviour = function rocketJump(user) {
        user.vy = -40;
      };
      return item;
    }
    static AntigravityPotion(world, x, y) {
      const w = 50;
      const h = w;
      const item = new ItemObject(world, new ItemData('Antigravity Potion', 2, 2), x, y, w, h);
      item.image = BDOTJS.LoadImage('revgravpot');
      item.color = null;
      item.data.itemBehaviour = function flipGravity(user) {
        user.gravity = -user.gravity;
      };
      return item;
    }
    static Nuke(world, x, y) {
      const w = 50;
      const h = w;
      const item = new ItemObject(world, new ItemData('Nuke', 1, 1), x, y, w, h);
      item.color = 'red';
      item.data.itemBehaviour = function shootNuke(user) {
        const projectile = new Projectile(1, 0, 3, 0, world, user.x - user.w / 2, user.y + user.h / 2 - (40 / 2), 40, 40);
        projectile.color = 'red';
        projectile.collisionBehaviour = function nukeProjectileHit(col) {
          if (col.team === 2) {
            const hitbox = new HitBox(projectile, this.x - 200, this.y - 200, 400, 400);
            hitbox.collisionBehaviour = function nukeHitboxHit(col2) {
              if (col2.team === 2) {
                col2.takeDamage(100);
                col2.doKnockback(this.direction, 200, 100);
              }
            };
            user.driver.addEntity(hitbox);
          }
        };
        user.shootSpecific(projectile);
      };
      return item;
    }
  }

  BDOTJS.ItemRepo = ItemRepo;
}());
