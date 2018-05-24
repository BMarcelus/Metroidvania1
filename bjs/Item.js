(function LoadItem() {
  const { Entity } = BDOTJS;

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
    }

    update() {
      this.applyGravity();
      this.applyVelocity();
      this.world.boundToFloor(this, this.onGrounded);
    }
    onCollision(col) {
      if (!col.inventory) return;
      if (col.inventory.addItem(this.data)) {
        this.shouldDelete = true;
      }
    }
  }

  class ItemData {
    useItem(user) {
      this.itemBehaviour(user);
    }
  }

  BDOTJS.ItemData = ItemData;
  BDOTJS.ItemObject = ItemObject;
}());
