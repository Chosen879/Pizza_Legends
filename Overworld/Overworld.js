class Overworld {
 constructor(config) {
   this.element = config.element;
   this.canvas = this.element.querySelector(".game-canvas");
   this.ctx = this.canvas.getContext("2d");
   this.map = null;
  //  this.bgm = new bgm() 
 }

  startGameLoop() {
    const step = () => {
      //Clear off the canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      //Establish the camera person
      const cameraPerson = this.map.gameObjects.hero;

      //Update all objects
      Object.values(this.map.gameObjects).forEach(object => {
        object.update({
          arrow: this.directionInput.direction,
          map: this.map,
        })
      })
      

      //Draw Lower layer
      this.map.drawLowerImage(this.ctx, cameraPerson);

      //Draw Game Objects
      Object.values(this.map.gameObjects).sort((a,b) => {
        return a.y - b.y;
      }).forEach(object => {
        object.sprite.draw(this.ctx, cameraPerson);
      })

      //Draw Upper layer
      this.map.drawUpperImage(this.ctx, cameraPerson);
      
      if (!this.map.isPaused) {
        requestAnimationFrame(() => {
          step();   
        })
      }
    }
    step();
 }

 bindActionInput() {
   new KeyPressListener("Enter", () => {
     //Is there a person here to talk to?
     this.map.checkForActionCutscene()
   })
   new KeyPressListener("Space", () => {
     this.map.checkForActionCutscene()
   })
   new KeyPressListener("Escape", () => {
     if (!this.map.isCutscenePlaying) {
      this.map.startCutscene([
        { type: "pause" }
      ])
     }
   })
 }

 bindHeroPositionCheck() {
   document.addEventListener("PersonWalkingComplete", e => {
     if (e.detail.whoId === "hero") {
       //Hero's position has changed
       this.map.checkForFootstepCutscene()
     }
   })
 }

 startMap(mapConfig, heroInitialState=null) {
  this.map = new OverworldMap(mapConfig);
  this.map.overworld = this;
  this.map.mountObjects();

  if (heroInitialState) {
    const {hero} = this.map.gameObjects;
    this.map.removeWall(hero.x, hero.y);
    hero.x = heroInitialState.x;
    hero.y = heroInitialState.y;
    hero.direction = heroInitialState.direction;
    this.map.addWall(hero.x, hero.y);
  }

  this.progress.mapId = mapConfig.id;
  this.progress.startingHeroX = this.map.gameObjects.hero.x;
  this.progress.startingHeroY = this.map.gameObjects.hero.y;
  this.progress.startingHeroDirection = this.map.gameObjects.hero.direction;

 }

 async init() {

  const container = document.querySelector(".game-container");

  //Create a new Progress tracker
  this.progress = new Progress();

  //Show the title screen
  this.titleScreen = new TitleScreen({
    progress: this.progress
  })
  const useSaveFile = await this.titleScreen.init(container);

  //Potentially load saved data
  let initialHeroState = null;
  if (useSaveFile) {
    this.progress.load();
    initialHeroState = {
      x: this.progress.startingHeroX,
      y: this.progress.startingHeroY,
      direction: this.progress.startingHeroDirection,
    }
  }

  //Load the HUD
  this.hud = new Hud();
  this.hud.init(container);

  //Start the first map
  this.startMap(window.OverworldMaps[this.progress.mapId], initialHeroState );


  //Create controls
  this.bindActionInput();
  this.bindHeroPositionCheck();

  this.directionInput = new DirectionInput();
  this.directionInput.init();

  //Kick off the game!
  this.startGameLoop();


  this.map.startCutscene([
    { type: "addStoryFlag", flag: "DOING_FIRST_CUTSCENE" },
    // {
    //   type: "createGameObject",
    //   name: "beth",
    //   map: window.OverworldMaps[this.progress.mapId],
    //   object: new Person({
    //     src: "./images/characters/people/npc1.png",
    //     x: utils.withGrid(5),
    //     y: utils.withGrid(10),
    //     direction: "up"
    //   })
    // },
    // { type: "textMessage", text: "(After many hours of training, your pizza making skills are nearly perfect)" },
    // { type: "textMessage", text: "(You have mastered the use of any topping, and you can knead dough any style thats ever been imagined)" },
    { type: "walk", who: "beth", direction: "up" },
    { type: "walk", who: "beth", direction: "up" },
    { type: "walk", who: "beth", direction: "up" },
    { type: "walk", who: "beth", direction: "up" },
    { type: "walk", who: "beth", direction: "up" },
    { type: "walk", who: "beth", direction: "right" },
    { type: "walk", who: "beth", direction: "right" },
    { type: "walk", who: "beth", direction: "right" },
    { type: "walk", who: "beth", direction: "right" },
    // { type: "textMessage", text: "Beth: Dude, hurry up! The reveal is starting soon!!!"},
    // { type: "stand", who: "hero", direction: "left", wait: 200 },
    // { type: "walk", who: "beth", direction: "left" },
    // { type: "walk", who: "beth", direction: "left" },
    // { type: "walk", who: "beth", direction: "left" },
    // { type: "walk", who: "beth", direction: "left" },
    // { type: "textMessage", text: "You: Wait up, you havn't even told me your name" },
    // { type: "walk", who: "beth", direction: "right"},
    // { type: "walk", who: "beth", direction: "right"},
    // { type: "walk", who: "beth", direction: "right"},
    // { type: "textMessage", text: "Beth: Hello, my name is Beth" },
    // { type: "textMessage", text: "You: Hello, my name is John" },
    // { type: "textMessage", text: "You: Can you please tell me whats going on" },
    // { type: "textMessage", text: "Beth: The biggest pizza company in the world just descovered the biggest piece of pizza tech in over 50 years"},
    // { type: "textMessage", text: "You: Oh, then I guess we should get a move on" },
    { type: "changeMap", map: "DemoRoom", },
    { type: "showTutorial"}
  ])

 }
}