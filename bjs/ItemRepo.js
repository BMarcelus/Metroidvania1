(function LoadItemRepo() {
  const { ItemObject, ItemData, Projectile, HitBox } = BDOTJS;

  class ItemRepo {
    static HeavyRock(world, x, y, w, h) {
      const item = new ItemObject(world, new ItemData('Heavy Rock', 3, 5), x, y, w, h);
      item.color = 'black';
      item.data.itemBehaviour = function throwRock(user) {
        user.shoot();
      }
      return item;
    }
    static RocketShoes(world, x, y, w, h) {
      const item = new ItemObject(world, new ItemData('Rocket Shoes', 1, 2), x, y, w, h);
      item.color = 'grey';
      item.data.itemBehaviour = function rocketJump(user) {
        user.vy = -40;
      }
      return item;
    }
    static AntigravityPotion(world, x, y, w, h) {
      const item = new ItemObject(world, new ItemData('Antigravity Potion', 2, 2), x, y, w, h);
      item.color='yellow';
      item.data.itemBehaviour = function flipGravity(user) {
        user.gravity = -user.gravity;
      }
      return item;
    }
    static Nuke(world, x, y, w, h) {
      const item = new ItemObject(world, new ItemData('Nuke', 1, 1), x, y, w, h);
      item.color='red';
      item.data.itemBehaviour = function shootNuke(user) {
        const projectile = new Projectile(1, 0, 3, 0, world, user.x - user.w / 2, user.y + user.h / 2 - (40 / 2), 40, 40);
        projectile.color = 'red';
        projectile.collisionBehaviour = function nukeProjectileHit(col) {
          if (col.team === 2) {
            const hitbox = new HitBox(projectile, this.x - 200 , this.y - 200, 400, 400);
            //hitbox.life = 300;
            hitbox.collisionBehaviour = function nukeHitboxHit(col) {
              if (col.team === 2) {
                col.takeDamage(100);
                //col.canMove = false;
                col.doKnockback(this.direction, 200, 100);
              }
            }
            user.driver.addEntity(hitbox);
          }
        };
        user.shootSpecific(projectile);
      }
      return item;
    }
  }

  BDOTJS.ItemRepo = ItemRepo;
}());
