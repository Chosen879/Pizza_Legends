class OverworldMap {
  constructor(config) {
    this.overworld = null;
    this.gameObjects = config.gameObjects;
    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = config.walls || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
    this.isPaused = false;

    this.progress = new Progress()
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
      )
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
    )
  } 

  isSpaceTaken(currentX, currentY, direction) {
    const {x,y} = utils.nextPosition(currentX, currentY, direction);
    return this.walls[`${x},${y}`] || false;
  }

  mountObjects() {
    Object.keys(this.gameObjects).forEach(key => {

      let object = this.gameObjects[key];
      object.id = key;

      //TODO: determine if this object should actually mount
      object.mount(this);

    })
  }
 

  async startCutscene(events) {
    this.isCutscenePlaying = true;

    for (let i=0; i<events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      })
      const result = await eventHandler.init();
      if (result === "LOST_BATTLE") {
        break;
      }
    }
    this.isCutscenePlaying = false;
  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find(object => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
    });
    if (!this.isCutscenePlaying && match && match.talking.length) {

      const relevantScenario = match.talking.find(scenario => {
        return (scenario.required || []).every(sf => {
          return playerState.storyFlags[sf]
        })
      })
      relevantScenario && this.startCutscene(relevantScenario.events)
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[ `${hero.x},${hero.y}` ];
    if (!this.isCutscenePlaying && match) {
      const relevantScenario = match.find(scenario => {
        return (scenario.required || []).every(sf => {
          return playerState.storyFlags[sf]
        })
      })
    relevantScenario && this.startCutscene(relevantScenario.events)
    }
  }

  addWall(x,y) {
    this.walls[`${x},${y}`] = true;
  }
  removeWall(x,y) {
    delete this.walls[`${x},${y}`]
  }
  moveWall(wasX, wasY, direction) {
    this.removeWall(wasX, wasY);
    const {x,y} = utils.nextPosition(wasX, wasY, direction);
    this.addWall(x,y);
  }

}

window.OverworldMaps = {
  DemoRoom: {
    id: "DemoRoom",
    lowerSrc: "/images/maps/DemoLower.png",
    upperSrc: "/images/maps/DemoUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(6),
      }),
      npcA: new Person({
        x: utils.withGrid(9),
        y: utils.withGrid(9),
        src: "/images/characters/people/npc1.png",
        behaviorLoop: [
          { type: "walk", direction: "left", },
          { type: "walk", direction: "down", },
          { type: "walk", direction: "right", },
          { type: "walk", direction: "up", },
          { type: "stand", direction: "up", time: 400, },
        ],
        talking: [
          {
            required: ["TALKED_TO_ERIO"],
            events: [
              { type: "textMessage", text: "Isn't Erio the coolest?", faceHero: "npcA" },
            ]
          },
          {
            events: [
              { type: "textMessage", text: "I'm going to crush you!", faceHero: "npcA" },
              // { type: "battle", enemyId: "beth" },
              // { type: "addStoryFlag", flag: "DEFEATED_BETH"},
              // { type: "textMessage", text: "You crushed me like weak pepper.", faceHero: "npcA" },
              // { type: "textMessage", text: "Go away!"},
               //{ who: "npcB", type: "walk",  direction: "up" },
            ]
          }
        ]
      }),
      npcC: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(8),
        src: "/images/characters/people/npc1.png",
        behaviorLoop: [
          { type: "stand", direction: "left", time: 500, },
          { type: "stand", direction: "down", time: 500, },
          { type: "stand", direction: "right", time: 500, },
          { type: "stand", direction: "up", time: 500, },
          { type: "walk", direction: "left",  },
          { type: "walk", direction: "down",  },
          { type: "walk", direction: "right",  },
          { type: "walk", direction: "up",  },
        ],
      }),
      npcB: new Person({
        x: utils.withGrid(8),
        y: utils.withGrid(5),
        src: "/images/characters/people/erio.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Bahaha!", faceHero: "npcB" },
              { type: "addStoryFlag", flag: "TALKED_TO_ERIO"}
              //{ type: "battle", enemyId: "erio" }
            ]
          }
        ]
        // behaviorLoop: [
        //   { type: "walk",  direction: "left" },
        //   { type: "stand",  direction: "up", time: 800 },
        //   { type: "walk",  direction: "up" },
        //   { type: "walk",  direction: "right" },
        //   { type: "walk",  direction: "down" },
        // ]
      }),
      pizzaStone: new PizzaStone({
        x: utils.withGrid(2),
        y: utils.withGrid(7),
        storyFlag: "USED_PIZZA_STONE",
        pizzas: ["v001", "f001"],
      }),
    },
    walls: {
      [utils.asGridCoord(7,6)] : true,
      [utils.asGridCoord(8,6)] : true,
      [utils.asGridCoord(7,7)] : true,
      [utils.asGridCoord(8,7)] : true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(7,4)]: [
        {
          events: [
            { who: "npcB", type: "walk",  direction: "left" },
            { who: "npcB", type: "stand",  direction: "up", time: 500 },
            { type: "textMessage", text:"You can't be in there!"},
            { who: "npcB", type: "walk",  direction: "right" },
            { who: "hero", type: "walk",  direction: "down" },
            { who: "hero", type: "walk",  direction: "left" },
          ]
        }
      ],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            { 
              type: "changeMap", 
              map: "Kitchen",
              x: utils.withGrid(2),
              y: utils.withGrid(2), 
              direction: "down"
            }
          ]
        }
      ]
    }
  },
  Kitchen: {
    id: "Kitchen",
    lowerSrc: "/images/maps/KitchenLower.png",
    upperSrc: "/images/maps/KitchenUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(10),
        y: utils.withGrid(5),
        direction: "up"
      }),
    },
    walls: {
      [utils.asGridCoord(6,10)]: true,
      [utils.asGridCoord(7,10)]: true,
      [utils.asGridCoord(8,10)]: true,
      [utils.asGridCoord(9,9)]: true,
      [utils.asGridCoord(10,9)]: true,
      [utils.asGridCoord(9,7)]: true,
      [utils.asGridCoord(10,7)]: true,
      [utils.asGridCoord(6,7)]: true,
      [utils.asGridCoord(7,7)]: true,
      [utils.asGridCoord(11,10)]: true,
      [utils.asGridCoord(12,10)]: true,
      [utils.asGridCoord(13,9)]: true,
      [utils.asGridCoord(13,8)]: true,
      [utils.asGridCoord(13,7)]: true,
      [utils.asGridCoord(13,6)]: true,
      [utils.asGridCoord(13,5)]: true,
      [utils.asGridCoord(12,4)]: true,
      [utils.asGridCoord(11,4)]: true,
      [utils.asGridCoord(10,4)]: true,
      [utils.asGridCoord(9,4)]: true,
      [utils.asGridCoord(8,4)]: true,
      [utils.asGridCoord(7,4)]: true,
      [utils.asGridCoord(6,4)]: true,
      [utils.asGridCoord(5,4)]: true,
      [utils.asGridCoord(4,3)]: true,
      [utils.asGridCoord(3,4)]: true,
      [utils.asGridCoord(2,4)]: true,
      [utils.asGridCoord(1,5)]: true,
      [utils.asGridCoord(1,6)]: true,
      [utils.asGridCoord(1,7)]: true,
      [utils.asGridCoord(0,8)]: true,
      [utils.asGridCoord(1,9)]: true,
      [utils.asGridCoord(2,9)]: true,
      [utils.asGridCoord(3,10)]: true,
      [utils.asGridCoord(4,10)]: true,
      [utils.asGridCoord(5,11)]: true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            { type: "changeMap", map: "DiningRoom", x: utils.withGrid(7), y: utils.withGrid(3), direction: "down" }
          ]
        }
      ]
    }
  },
  DiningRoom: {
    id: "DiningRoom",
    lowerSrc: "/images/maps/DiningRoomLower.png",
    upperSrc: "/images/maps/DiningRoomUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(8),
        y: utils.withGrid(4),
        direction: "down"
      }),
      beth: new Person({
        src: "./images/characters/people/npc1.png",
        x: utils.withGrid(6),
        y: utils.withGrid(9),
        direction: "down"
      })
    },
    walls: {
      [utils.asGridCoord(8,3)]: true,
      [utils.asGridCoord(9,4)]: true,
      [utils.asGridCoord(10,4)]: true,
      [utils.asGridCoord(11,5)]: true,
      [utils.asGridCoord(12,4)]: true,
      [utils.asGridCoord(13,5)]: true,
      [utils.asGridCoord(13,6)]: true,
      [utils.asGridCoord(12,7)]: true,
      [utils.asGridCoord(11,7)]: true,
      [utils.asGridCoord(13,8)]: true,
      [utils.asGridCoord(13,9)]: true,
      [utils.asGridCoord(13,10)]: true,
      [utils.asGridCoord(13,11)]: true,
      [utils.asGridCoord(12,12)]: true,
      [utils.asGridCoord(11,12)]: true,
      [utils.asGridCoord(10,12)]: true,
      [utils.asGridCoord(9,12)]: true,
      [utils.asGridCoord(8,12)]: true,
      [utils.asGridCoord(7,12)]: true,
      [utils.asGridCoord(6,13)]: true,
      [utils.asGridCoord(5,12)]: true,
      [utils.asGridCoord(4,12)]: true,
      [utils.asGridCoord(3,12)]: true,
      [utils.asGridCoord(2,12)]: true,
      [utils.asGridCoord(1,12)]: true,
      [utils.asGridCoord(0,11)]: true,
      [utils.asGridCoord(0,10)]: true,
      [utils.asGridCoord(0,9)]: true,
      [utils.asGridCoord(0,8)]: true,
      [utils.asGridCoord(0,7)]: true,
      [utils.asGridCoord(0,6)]: true,
      [utils.asGridCoord(1,5)]: true,
      [utils.asGridCoord(2,5)]: true,
      [utils.asGridCoord(3,5)]: true,
      [utils.asGridCoord(4,5)]: true,
      [utils.asGridCoord(0,4)]: true,
      [utils.asGridCoord(1,3)]: true,
      [utils.asGridCoord(2,3)]: true,
      [utils.asGridCoord(3,3)]: true,
      [utils.asGridCoord(4,3)]: true,
      [utils.asGridCoord(5,3)]: true,
      [utils.asGridCoord(6,3)]: true,
      [utils.asGridCoord(7,2)]: true,
      [utils.asGridCoord(6,4)]: true,
      [utils.asGridCoord(6,5)]: true,
      [utils.asGridCoord(3,7)]: true,
      [utils.asGridCoord(3,10)]: true,
      [utils.asGridCoord(8,10)]: true,
      [utils.asGridCoord(8,7)]: true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(7,3)]: [
        {
          required: ["DOING_FIRST_CUTSCENE"],
          events: [
            { type: "walk", who: "hero", direction: "down" }, 
            { type: "textMessage", text: "What are you doing, we need to go to the reveal" }
          ]
        }, 
        {
          events: [
            { type: "changeMap", map: "Kitchen", x: utils.withGrid(5), y: utils.withGrid(10), direction: "up" }
          ]
        }
      ],
      [utils.asGridCoord(7,4)]: [
        {
          required: ["DOING_FIRST_CUTSCENE"],
          events: [
            { type: "walk", who: "beth", direction: "down" }, 
            { type: "textMessage", text: "You: Wait up, you havent even told me your name" },
            { type: "walk", who: "beth", direction: "up" },
            { type: "walk", who: "beth", direction: "up" },
            { type: "walk", who: "beth", direction: "up" },
            { type: "walk", who: "beth", direction: "up" },
            { type: "walk", who: "beth", direction: "right" },
            { type: "stand", who: "beth", direction: "up", wait: 300},
            { type: "walk", who: "hero", direction: "down" },
            { type: "textMessage", text: "Beth: Hello, my name is Beth" },
            { type: "textMessage", text: "You: Hello, my name is Drew" },
            { type: "textMessage", text: "You: Can you please tell me whats going on" },
            { type: "textMessage", text: "Beth: The biggest pizza making company has created new technology and is revealing it all today" },
            { type: "textMessage", text: "You: Oh, then I guess we should get a move on" },
            { type: "textMessage", text: "Beth: You go ahead I forgot somthing in the kitchen" },
            { type: "walk", who: "beth", direction: "right" },
            { type: "walk", who: "beth", direction: "up" },
            { type: "walk", who: "beth", direction: "up" },
            { type: "walk", who: "beth", direction: "left" },
            { type: "walk", who: "beth", direction: "up" },
            { type: "deleteGameObject", name: "beth" }
          ]
        },
      ],
      [utils.asGridCoord(6, 12)]: [
        {
          events: [
            { type: "changeMap", map: "Street", x: utils.withGrid(5), y: utils.withGrid(9), direction: "down" }
          ]
        }
      ]
    },
  },
  Street: {
    id: "Street",
    lowerSrc: "/images/maps/StreetLower.png",
    upperSrc: "/images/maps/StreetUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(21),
        y: utils.withGrid(8),
        direction: "down"
      }),
      beth: new Person({
          src: "./images/characters/people/npc1.png",
          x: utils.withGrid(22),
          y: utils.withGrid(12),
          behaviorLoop: [
            { type: "follow", follower: "beth", who: "hero" },
          ],
      })
    },
    walls: {
      [utils.asGridCoord(5,8)]: true,
      [utils.asGridCoord(4,9)]: true,
      [utils.asGridCoord(6,9)]: true,
      [utils.asGridCoord(7,9)]: true,
      [utils.asGridCoord(8,9)]: true,
      [utils.asGridCoord(9,9)]: true,
      [utils.asGridCoord(10,9)]: true,
      [utils.asGridCoord(11,9)]: true,
      [utils.asGridCoord(12,9)]: true,
      [utils.asGridCoord(13,8)]: true,
      [utils.asGridCoord(14,8)]: true,
      [utils.asGridCoord(15,7)]: true,
      [utils.asGridCoord(16,7)]: true,
      [utils.asGridCoord(17,7)]: true,
      [utils.asGridCoord(18,7)]: true,
      [utils.asGridCoord(19,7)]: true,
      [utils.asGridCoord(20,7)]: true,
      [utils.asGridCoord(21,7)]: true,
      [utils.asGridCoord(22,7)]: true,
      [utils.asGridCoord(23,7)]: true,
      [utils.asGridCoord(24,7)]: true,
      [utils.asGridCoord(24,6)]: true,
      [utils.asGridCoord(24,5)]: true,
      [utils.asGridCoord(25,4)]: true,
      [utils.asGridCoord(26,5)]: true,
      [utils.asGridCoord(26,6)]: true,
      [utils.asGridCoord(26,7)]: true,
      [utils.asGridCoord(27,7)]: true,
      [utils.asGridCoord(28,8)]: true,
      [utils.asGridCoord(28,9)]: true,
      [utils.asGridCoord(29,8)]: true,
      [utils.asGridCoord(30,9)]: true,
      [utils.asGridCoord(31,9)]: true,
      [utils.asGridCoord(32,9)]: true,
      [utils.asGridCoord(33,9)]: true,
      [utils.asGridCoord(34,10)]: true,
      [utils.asGridCoord(34,11)]: true,
      [utils.asGridCoord(34,12)]: true,
      [utils.asGridCoord(34,13)]: true,
      [utils.asGridCoord(33,14)]: true,
      [utils.asGridCoord(32,14)]: true,
      [utils.asGridCoord(31,14)]: true,
      [utils.asGridCoord(30,14)]: true,
      [utils.asGridCoord(29,14)]: true,
      [utils.asGridCoord(28,14)]: true,
      [utils.asGridCoord(27,14)]: true,
      [utils.asGridCoord(26,14)]: true,
      [utils.asGridCoord(25,14)]: true,
      [utils.asGridCoord(24,14)]: true,
      [utils.asGridCoord(23,14)]: true,
      [utils.asGridCoord(22,14)]: true,
      [utils.asGridCoord(21,14)]: true,
      [utils.asGridCoord(20,14)]: true,
      [utils.asGridCoord(19,14)]: true,
      [utils.asGridCoord(18,14)]: true,
      [utils.asGridCoord(17,14)]: true,
      [utils.asGridCoord(16,14)]: true,
      [utils.asGridCoord(15,14)]: true,
      [utils.asGridCoord(14,14)]: true,
      [utils.asGridCoord(13,14)]: true,
      [utils.asGridCoord(12,14)]: true,
      [utils.asGridCoord(11,14)]: true,
      [utils.asGridCoord(10,14)]: true,
      [utils.asGridCoord(9,14)]: true,
      [utils.asGridCoord(8,14)]: true,
      [utils.asGridCoord(7,14)]: true,
      [utils.asGridCoord(6,14)]: true,
      [utils.asGridCoord(5,14)]: true,
      [utils.asGridCoord(4,14)]: true,
      [utils.asGridCoord(3,13)]: true,
      [utils.asGridCoord(3,12)]: true,
      [utils.asGridCoord(3,11)]: true,
      [utils.asGridCoord(3,10)]: true,
      [utils.asGridCoord(16,9)]: true,
      [utils.asGridCoord(16,10)]: true,
      [utils.asGridCoord(16,11)]: true,
      [utils.asGridCoord(17,11)]: true,
      [utils.asGridCoord(17,10)]: true,
      [utils.asGridCoord(17,9)]: true,
      [utils.asGridCoord(18,11)]: true,
      [utils.asGridCoord(19,11)]: true,
      [utils.asGridCoord(25,11)]: true,
      [utils.asGridCoord(25,10)]: true,
      [utils.asGridCoord(25,9)]: true,
      [utils.asGridCoord(26,9)]: true,
      [utils.asGridCoord(26,10)]: true,
      [utils.asGridCoord(26,11)]: true,
    }, 
    cutsceneSpaces: {
      [utils.asGridCoord(21,10)]: [
        {
          events: [
            
          ]
        }
      ],
    }
  }
}
  