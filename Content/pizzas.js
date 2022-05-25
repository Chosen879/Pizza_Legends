window.PizzaTypes = {
  normal: "normal",
  spicy: "spicy",
  veggie: "veggie",
  fungi: "fungi",
  chill: "chill",
}

window.Pizzas = {
  "c001": {
    name: "Freezin Fury",
    description: "A Freezing warrior that never backs down",
    type: PizzaTypes.chill,
    src: "/images/characters/pizzas/c001.png",
    icon: "/images/icons/chill.png",
    actions: [ "chillStatus1", "damage1" ]
  },
  "c002": {
    name: "Chilling Cabbage",
    description: "A chilling vegetable suprise",
    type: PizzaTypes.chill,
    src: "/images/characters/pizzas/c002.png",
    icon: "/images/icons/chill.png",
    actions: [ "chillStatus1", "damage1" ]
  },
  "c003": {
    name: "Cold Cut Meats",
    description: "A cold hearted meaty mage",
    type: PizzaTypes.chill,
    src: "/images/characters/pizzas/c003.png",
    icon: "/images/icons/chill.png",
    actions: [ "chillStatus1", "damage1" ]
  },
  "s001": {
    name: "Slice Samurai",
    description: "A hotheaded warrior who fears nothing",
    type: PizzaTypes.spicy,
    src: "/images/characters/pizzas/s001.png",
    icon: "/images/icons/spicy.png",
    actions: [ "damage1" ],
  },
  "s002": {
    name: "Bacon Brigade",
    description: "A salty warrior who fears nothing",
    type: PizzaTypes.spicy,
    src: "/images/characters/pizzas/s002.png",
    icon: "/images/icons/spicy.png",
    actions: [ "damage1", "saucyStatus", "clumsyStatus" ],
  },
  "s003": {
    name: "",
    description: "A salty warrior who fears nothing",
    type: PizzaTypes.spicy,
    src: "/images/characters/pizzas/s002.png",
    icon: "/images/icons/spicy.png",
    actions: [ "damage1", "saucyStatus", "clumsyStatus" ],
  },
  "v001": {
    name: "Call Me Kale",
    description: "Pizza desc here",
    type: PizzaTypes.veggie,
    src: "/images/characters/pizzas/v001.png",
    icon: "/images/icons/veggie.png",
    actions: [ "damage1" ],
  },
  "f001": {
    name: "Portobello Express",
    description: "Pizza desc here",
    type: PizzaTypes.fungi,
    src: "/images/characters/pizzas/f001.png",
    icon: "/images/icons/fungi.png",
    actions: [ "damage1" ],
  }
}