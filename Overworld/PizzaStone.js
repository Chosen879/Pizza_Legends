class PizzaStone extends GameObject {
  constructor(config) {
    super(config);
    this.sprite = new Sprite({
      gameObject: this,
      src: "/images/characters/pizza-stone.png",
      animations: {
        "used-down"   : [ [0,0] ],
        "unused-down" : [ [1,0] ],
      },
      currentAnimation: "used-down"
    });
    // this.storyFlag = config.storyFlag;
    this.pizzas = config.pizzas;

    this.talking = [
      {
        required: [config.storyFlag],
        events: [
          { type: "textMessage", text: "You have already used this." },
        ]
      },
      {
        required: [config.tutorial],
        events: [
          { type: "textMessage", text: "Approaching the legendary pizza stone..." },
          { type: "craftingMenu", pizzas: this.pizzas },
          { type: "addStoryFlag", flag: config.storyFlag },
          { type: "textMessage", text: "Crowd: Ohhhhhhhhh" },
          { type: "textMessage", text: "The end(for now)" },
        ]
      },
      {
        events: [
          { type: "textMessage", text: "Approaching the legendary pizza stone..." },
          { type: "craftingMenu", pizzas: this.pizzas },
          { type: "addStoryFlag", flag: config.storyFlag },
        ]
      }
    ]

  }

  update() {
   this.sprite.currentAnimation = playerState.storyFlags[this.storyFlag]
    ? "used-down"
    : "unused-down";
  }

}