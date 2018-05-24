(function LoadItem() {
  const { Entity, Inventory } = BDOTJS;

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
			if(!col.inventory) return;
			if(col.inventory.addItem(this.data))
				this.shouldDelete = true;
    }
	}
	
	class ItemData {
		constructor() {
			
		}
		useItem(user) {
			this.itemBehaviour(user);
		}
		itemBehaviour(user)
		{
			console.log("default item behaviour");
		}
	}

	BDOTJS.ItemData = ItemData;
	BDOTJS.ItemObject = ItemObject;
}());
