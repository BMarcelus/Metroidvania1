(function LoadInventory() {

  const { EntityContainer, Driver, ButtonUI, TrollButtonUI, ItemButtonUI } = BDOTJS;

  class Inventory {
    constructor(maxsize, parent) {
      this.items = [];
      this.maxsize = maxsize;
      this.currsize = 0;
      this.parent = parent;
      this.gameScene = null;
      this.open = false;
    }
    printinv() {
      for (var x = 0; x < this.items.length; ++x) {
        console.log(this.items[x].name);
      }
    }
    setupUI() {
      this.UI = new EntityContainer(Driver.getCanvas());
      this.UI.addEntity(new ButtonUI('Return to Game', () => {
        Driver.setScene(this.parent.driver);
      }, 100, 100, 300, 100));
      this.UI.addEntity(new ButtonUI('Refresh', () => {
        return this.setupUI();
      }, 500, 100, 300, 100));
      for (var x = 0; x < this.maxsize; ++x) {
        const button = new ButtonUI("", null, (150*(x+1))-5, 295, 110, 110);
        button.background = "#d4d4d6";
        this.UI.addEntity(button);
        if (this.items[x] && this.items[x].name) {
          this.UI.addEntity(new ItemButtonUI(this.items[x], this.parent, this, 150*(x+1), 300, 100, 100));
          const percentage = "" + this.items[x].currstack + "/" + this.items[x].maxstack;
          this.UI.addEntity(new ButtonUI(percentage, null, (150 * (x + 1)) + 80, 390, 20, 10) );
        }
      }
      Driver.setScene(this.UI);
    }
    findItemIndex(item) {
      let index = -1;
      for (var x = 0; x < this.maxsize; ++x) {
        if(this.items[x] && (item == null || this.items[x].name === item.name)) {
          index = x;
          break;
        }
      }
      return index;
    }
    addItem(item) {
      if (this.currsize >= this.maxsize) return false;
      let index = this.findItemIndex(item);
      if (index > -1) {
        this.items[index].currstack += item.currstack;
        const diff = this.items[index].enforceMaxStack();
        if(diff != 0) {
          item.currstack = diff;
          return false;
        }
        return true;
      }
      index = this.items.indexOf(null);
      if (index > -1)
        this.items[index] = item;
      else
        this.items.push(item);
      this.currsize++;
      return true;
    }
    dropItem(dropee) {
      if (this.currsize <= 0) return false;
      const index = this.findItemIndex(null);
      if (index <= -1) {
        return false; 
      }
      const v = this.items[index];
      console.log(v);
      this.items[index] = null;
      this.currsize--;
      v.dropItem(dropee);
      return true;
    }
    removeItem(item)
    {
      const index = this.items.indexOf(item);
      if(index > -1)
      {
        this.items[index] = null;//this.items.splice(index, 1);
        this.currsize--;
      }
      return index == -1;
    }
    toggleDisplay()
    {
      this.open = !this.open;
      if(open)
        this.setupUI();
      else
        Driver.setScene(this.parent.driver);
    }
  }

  BDOTJS.Inventory = Inventory;
}());
