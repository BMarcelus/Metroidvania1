(function LoadInventory() {

  const { EntityContainer, Driver, ButtonUI, TrollButtonUI, ItemButtonUI, BasicText } = BDOTJS;

  class Inventory {
    constructor(maxsize, quicksize, parent) {
      this.slots = [];
      this.items = [];
      this.maxsize = maxsize;
      this.currsize = 0;
      this.quicksize = quicksize;
      this.parent = parent;
      this.open = true;
      this.toggleDisplay();
    }
    printinv() {
      for (var x = 0; x < this.items.length; ++x) {
        console.log(this.items[x].name);
      }
    }
    validateInventory() {
      for(var x = 0; x < this.maxsize; ++x) {
        if(this.items[x] && this.items[x].currstack <= 0) {
          this.removeItem(this.items[x]);
        }
      }
    }
    mainSlots() {
      for (var x = 0; x < this.maxsize - this.quicksize; ++x) {
        this.slots[x] = new BasicText("", (150 * (x + 1)) - 5, 295, 110, 110);
        this.slots[x].background = "#d4d4d6";
        this.invUI.addEntity(this.slots[x]);
        if (this.items[x] && this.items[x].name) {
          this.invUI.addEntity(new ItemButtonUI(this.items[x], this.parent, this, true, 150 * (x + 1), 300, 100, 100));
          const percentage = "" + this.items[x].currstack + "/" + this.items[x].maxstack;
          this.invUI.addEntity(new BasicText(percentage, (150 * (x + 1)) + 80, 390, 20, 10) );
        }
      }
    }
    quickSlots(container, yBase, draggable) {
      container.addEntity(new BasicText("U", 325, 460 + yBase, 50, 70));
      container.addEntity(new BasicText("I", 475, 460 + yBase, 50, 70));
      container.addEntity(new BasicText("O", 625, 460 + yBase, 50, 70));
      container.addEntity(new BasicText("", 300, 410 + yBase, 400, 30));
      container.addEntity(new BasicText("Quick Slots", 300, 435 + yBase, 400, 20));
      for (var x = this.maxsize - this.quicksize; x < this.maxsize; ++x) {
        const xVal = x - this.maxsize + this.quicksize + 2;
        this.slots[x] = new BasicText("", 150 * xVal - 5, 505 + yBase, 110, 110);
        this.slots[x].background = "#d4d4d6";
        container.addEntity(this.slots[x]);
        if (this.items[x] && this.items[x].name) {
          container.addEntity(new ItemButtonUI(this.items[x], this.parent, this, draggable, 150 * xVal, 510 + yBase, 100, 100));
          const percentage = "" + this.items[x].currstack + "/" + this.items[x].maxstack;
          container.addEntity(new BasicText(percentage, 150 * xVal + 80, 600 + yBase, 20, 10) );
        }
      }
    }
    refresh() {
      this.setupUI();
      this.setupGameUI();
      this.open = !this.open;
      this.toggleDisplay();
    }

    setupUI() {
      this.validateInventory();
      this.invUI = new EntityContainer(Driver.getCanvas());
      this.invUI.addEntity(new ButtonUI('Return to Game', () => {
        this.toggleDisplay();
      }, 100, 100, 300, 100));
      this.mainSlots();
      this.quickSlots(this.invUI, 0, true);
    }
    setupGameUI() {
      this.validateInventory();
      if(this.gameUI) this.gameUI.shouldDelete = true;
      this.gameUI = new EntityContainer(Driver.getCanvas());
      this.quickSlots(this.gameUI, -390, false);
      this.parent.scene.addEntity(this.gameUI);
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
    useItem(index) {
      if(this.items[index]) {
        const b = this.items[index].useItem(this.parent);
        this.refresh();
        return b;
      }
      return false;
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
        this.refresh();
        return true;
      }
      index = this.items.indexOf(null);
      if (index > -1) {
        this.items[index] = item;
      } else {
        this.items.push(item);
      }
      this.currsize++;
      this.refresh();
      return true;
    }
    dropItem(dropee) {
      if (this.currsize <= 0) {
        return false;
      }
      const index = this.findItemIndex(null);
      if (index <= -1) {
        return false; 
      }
      const v = this.items[index];
      this.items[index] = null;
      this.currsize--;
      v.dropItem(dropee);
      return true;
    }
    removeItem(item) {
      const index = this.items.indexOf(item);
      if(index > -1) {
        this.items[index] = null;//this.items.splice(index, 1);
        this.currsize--;
        this.setupUI();
      }
      return index == -1;
    }
    toggleDisplay() {
      this.open = !this.open;
      if(this.open) {
        this.setupUI();
        Driver.setScene(this.invUI);
      } else {
        this.setupGameUI();
        Driver.setScene(this.parent.driver);
      }
    }
  }

  BDOTJS.Inventory = Inventory;
}());
