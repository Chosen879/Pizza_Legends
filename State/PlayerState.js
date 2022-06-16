class PlayerState {
  constructor() {
    this.pizzas = {}
    this.lineup = [];
    this.items = [
      { actionId: "item_recoverHp", instanceId: "item1" },
      { actionId: "item_recoverHp", instanceId: "item2" },
      { actionId: "item_recoverHp", instanceId: "item3" },
      { actionId: "item_recoverStatus", instanceId: "item4" },
      { actionId: "item_recoverStatus", instanceId: "item5" },
      { actionId: "item_recoverStatus", instanceId: "item6" },
    ]
    this.storyFlags = {};
  }

  addPizza(pizzaId) {
    const newId = `p${Date.now()}`+Math.floor(Math.random() * 99999);
    this.pizzas[newId] = {
      pizzaId,
      hp: 50,
      maxHp: 50,
      xp: 0,
      maxXp: 100,
      level: 1,
      status: null,
    }
    if (this.lineup.length < 3) {
      this.lineup.push(newId)
    }
    utils.emitEvent("LineupChanged");
  }

  removePizza(pizzaId) { 
    const match = Object.keys(this.pizzas).find(key => {
      const pizza = this.pizzas[key];
      return pizza.pizzaId === pizzaId; //or whatever you want
    })
    console.log(match)
    if(this.pizzas[match]) {
      delete this.pizzas[match]
      this.lineup = this.lineup.filter(item => item != match)
    }
    console.log(this.pizzas)
    console.log(this.lineup)    
    utils.emitEvent("LineupChanged");
  }

  swapLineup(oldId, incomingId) {
    const oldIndex = this.lineup.indexOf(oldId);
    this.lineup[oldIndex] = incomingId;
    utils.emitEvent("LineupChanged");
  }

  moveToFront(futureFrontId) {
    this.lineup = this.lineup.filter(id => id !== futureFrontId);
    this.lineup.unshift(futureFrontId);
    utils.emitEvent("LineupChanged");
  }

}
window.playerState = new PlayerState();