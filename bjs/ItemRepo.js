(function LoadItemRepo() {
  const { ItemObject, ItemData, Projectile, HitBox, Time } = BDOTJS;

  class ItemRepo {
    static FireCloak(world, x, y) {
      const w = 50;
      const h = w;
      const item = new ItemObject(world, new ItemData('FireCloak', 2, 3), x, y, w, h);
      item.color = 'orange';
      item.data.itemBehaviour = function createFire(user) {
        for(var x = 0; x < 20; ++x) {
          Time.setFramedTimeout(() => {
            const hitbox = new HitBox(user, user.x - 200, user.y - 200, 400, 400);
            hitbox.collisionBehaviour = function nukeHitboxHit(col) {
              if (col.team === 2) {
                col.takeDamage(1);
              }
            };
            user.driver.addEntity(hitbox);
          }, x * 100);
        }
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
