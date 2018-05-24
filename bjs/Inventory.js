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
  }

  BDOTJS.Inventory = Inventory;
}());
