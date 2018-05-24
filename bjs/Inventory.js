(function LoadInventory() {
  const { Entity, Input, Time, HitBox } = BDOTJS;

  class Inventory {
    constructor(maxsize) {
			this.items = [];
			this.maxsize = maxsize;
		}
		addItem(item) {
			if (this.items.length >= this.maxsize) return false;
			this.items.push(item);
			return true;
		}
		dropItem(dropee) {
			if (this.items.length <= 0) return false;
			let v = this.items.pop();
			v.dropItem(dropee);
			return true;
		}
  }

  BDOTJS.Inventory = Inventory;
}());
