(function LoadItem() {
  const { Entity, Time } = BDOTJS;

  class ItemObject extends Entity {
    constructor(world, data, ...args) {
      super(...args);
      this.world = world;
      this.data = data;
      this.color = 'red';
      this.vx = 0;
      this.vy = 0;
      this.gravity = 1;
      this.pickedup = false;
      data.parent = this;
    }

    update() {
      this.applyGravity();
      this.applyVelocity();
      this.world.boundToFloor(this, this.onGrounded);
    }
    onCollision(col) {
      if (Math.abs(this.vy) >= 25 && col.team === 2) {
        col.takeDamage(3);
      }
      if (col.inventory && !this.pickedup && col.inventory.addItem(this.data)) {
        this.pickedup = true;
        this.shouldDelete = true;
      }
    }
  }

  class ItemData {
    constructor(name) {
      this.name = name;
    }
    useItem(user) {
      this.itemBehaviour(user);
    }
    dropItem(dropee) {
      this.parent.x = dropee.x + (dropee.w / 2);
      this.parent.y = dropee.y;
      this.parent.vy = 0;
      this.parent.shouldDelete = false;
      this.parent.driver.addEntity(this.parent);
      Time.setFramedTimeout(() => {
        this.parent.pickedup = false;
      }, 30);
    }
  }

  BDOTJS.ItemData = ItemData;
  BDOTJS.ItemObject = ItemObject;
}());
