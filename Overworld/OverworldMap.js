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
        x: utils.withGrid(0),
        y: utils.withGrid(0),
        direction: "down"
      }),
      npcA: new Person({
        src: "./images/characters/people/npc4.png",
        x: utils.withGrid(5),
        y: utils.withGrid(8),
        direction: "up"
      }),
    },
    walls: {
      [utils.asGridCoord(6,4)] : true,
      [utils.asGridCoord(7,3)] : true,
      [utils.asGridCoord(8,4)] : true,
      [utils.asGridCoord(9,3)] : true,
      [utils.asGridCoord(10,3)] : true,
      [utils.asGridCoord(11,4)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(6,10)] : true,
      [utils.asGridCoord(5,11)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(1,10)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,4)] : true,
      [utils.asGridCoord(1,3)] : true,
      [utils.asGridCoord(2,3)] : true,
      [utils.asGridCoord(3,3)] : true,
      [utils.asGridCoord(4,3)] : true,
      [utils.asGridCoord(5,3)] : true,
      [utils.asGridCoord(7,6)] : true,
      [utils.asGridCoord(8,6)] : true,
      [utils.asGridCoord(7,7)] : true,
      [utils.asGridCoord(8,7)] : true,
    },
    cutsceneSpaces: {
      
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
            { type: "changeMap", map: "DiningRoom", x: 7, y: 3, direction: "down" }
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
          events: [
            { type: "changeMap", map: "Kitchen", x: 5, y: 10, direction: "up" }
          ]
        }
      ],
      [utils.asGridCoord(6, 12)]: [
        {
          required: ["DOING_FIRST_CUTSCENE"],
          events: [
            { type: "changeMap", map: "DemoStreet", x: 5, y: 9, direction: "down" }
          ]
        },
        {
          events: [
            { type: "changeMap", map: "Street", x: 5, y: 9, direction: "down" }
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
  },
  DemoStreet: {
    id: "DemoStreet",
    lowerSrc: "/images/maps/StreetLower.png",
    upperSrc: "/images/maps/StreetUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(21),
        y: utils.withGrid(12),
        direction: "down"
      }),
      Spec1: new Person({
        src: "./images/characters/people/npc1.png",
        x: utils.withGrid(22),
        y: utils.withGrid(12),
        direction: "up"
      }),
      Spec2: new Person({
        src: "./images/characters/people/npc2.png",
        x: utils.withGrid(23),
        y: utils.withGrid(12),
        direction: "up"
      }),
      Spec3: new Person({
        src: "./images/characters/people/npc3.png",
        x: utils.withGrid(20),
        y: utils.withGrid(12),
        direction: "up"
      }),
      Spec4: new Person({
        src: "./images/characters/people/npc4.png",
        x: utils.withGrid(22),
        y: utils.withGrid(13),
        direction: "up"
      }),
      Spec5: new Person({
        src: "./images/characters/people/npc7.png",
        x: utils.withGrid(23),
        y: utils.withGrid(13),
        direction: "up"
      }),
      Spec6: new Person({
        src: "./images/characters/people/npc3.png",
        x: utils.withGrid(24),
        y: utils.withGrid(13),
        direction: "up"
      }),
      Announcer: new Person({
        src: "./images/characters/people/npc8.png",
        x: utils.withGrid(22),
        y: utils.withGrid(10),
        direction: "down"
      }),
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
     [utils.asGridCoord(12,10)]: [
       {
        events: [
          { type: "textMessage", text: "Announcer: Welcome one and all to the reveal of the newest piece of pizza technology"},
          { type: "walk", who: "hero", direction: "right"},
          { type: "walk", who: "hero", direction: "down"},
          { type: "walk", who: "hero", direction: "down"},
          { type: "walk", who: "hero", direction: "down"},
          { type: "walk", who: "hero", direction: "right"},
          { type: "walk", who: "hero", direction: "right"},
          { type: "walk", who: "hero", direction: "right"},
          { type: "walk", who: "hero", direction: "right"},
          { type: "walk", who: "hero", direction: "right"},
          { type: "walk", who: "hero", direction: "right"},
          { type: "walk", who: "hero", direction: "right"},
          { type: "walk", who: "hero", direction: "right"},
          { type: "walk", who: "hero", direction: "up"},
          { type: "textMessage", text: "Announcer: We call it the Pizza Stone"},
          { type: "walk", who: "Announcer", direction: "left"},
          {
            type: "createGameObject",
            name: "pizzaStone",
            map: "DemoStreet",
            object: new PizzaStone({
              x: utils.withGrid(22),
              y: utils.withGrid(10),
              pizzas: ["s001"],
              tutorial: "true"
            })
          },
          { type: "stand", who: "Announcer", direction: "down"},
          { type: "textMessage", text: "Announcer: This might just look like a ball of dough, but when someone creates a pizza with this dough the pizza becomes alive and you can battle them"},
          { type: "textMessage", text: "Announcer: Why you, standing in front of me, come use the dough and show the crowd"}
        ]
       }
     ],
     [utils.asGridCoord(12,11)]: [
      {
       events: [
         { type: "textMessage", text: "Announcer: Welcome one and all to the reveal of the newest piece of pizza technology"},
         { type: "walk", who: "hero", direction: "right"},
         { type: "walk", who: "hero", direction: "down"},
         { type: "walk", who: "hero", direction: "down"},
         { type: "walk", who: "hero", direction: "right"},
         { type: "walk", who: "hero", direction: "right"},
         { type: "walk", who: "hero", direction: "right"},
         { type: "walk", who: "hero", direction: "right"},
         { type: "walk", who: "hero", direction: "right"},
         { type: "walk", who: "hero", direction: "right"},
         { type: "walk", who: "hero", direction: "right"},
         { type: "walk", who: "hero", direction: "right"},
         { type: "walk", who: "hero", direction: "up"},
         { type: "textMessage", text: "Announcer: We call it the Pizza Stone"},
         { type: "walk", who: "Announcer", direction: "left"},
         {
           type: "createGameObject",
           name: "pizzaStone",
           map: "DemoStreet",
           object: new PizzaStone({
             x: utils.withGrid(22),
             y: utils.withGrid(10),
             pizzas: ["s001"],
             tutorial: "true"
           })
         },
         { type: "stand", who: "Announcer", direction: "down"},
         { type: "textMessage", text: "Announcer: This might just look like a ball of dough, but when someone creates a pizza with this dough the pizza becomes alive and you can battle them"},
         { type: "textMessage", text: "Announcer: Why you, standing in front of me, come use the dough and show the crowd"}
       ]
      }
    ],
    [utils.asGridCoord(12,12)]: [
      {
       events: [
         { type: "textMessage", text: "Announcer: Welcome one and all to the reveal of the newest piece of pizza technology"},
         { type: "walk", who: "hero", direction: "right"},
         { type: "walk", who: "hero", direction: "down"},
         { type: "walk", who: "hero", direction: "right"},
         { type: "walk", who: "hero", direction: "right"},
         { type: "walk", who: "hero", direction: "right"},
         { type: "walk", who: "hero", direction: "right"},
         { type: "walk", who: "hero", direction: "right"},
         { type: "walk", who: "hero", direction: "right"},
         { type: "walk", who: "hero", direction: "right"},
         { type: "walk", who: "hero", direction: "right"},
         { type: "walk", who: "hero", direction: "up"},
         { type: "textMessage", text: "Announcer: We call it the Pizza Stone"},
         { type: "walk", who: "Announcer", direction: "left"},
         {
           type: "createGameObject",
           name: "pizzaStone",
           map: "DemoStreet",
            object: new PizzaStone({
              x: utils.withGrid(22),
              y: utils.withGrid(10),
              pizzas: ["s001"],
              tutorial: "true"
            })
         },
         { type: "stand", who: "Announcer", direction: "down"},
         { type: "textMessage", text: "Announcer: This might just look like a ball of dough, but when someone creates a pizza with this dough the pizza becomes alive and you can battle them"},
         { type: "textMessage", text: "Announcer: Why you, standing in front of me, come use the dough and show the crowd"}
       ]
      }
    ],
    [utils.asGridCoord(12,13)]: [
      {
       events: [
      { type: "textMessage", text: "Announcer: Welcome one and all to the reveal of the newest piece of pizza technology"},
      { type: "walk", who: "hero", direction: "right"},
      { type: "walk", who: "hero", direction: "right"},
      { type: "walk", who: "hero", direction: "right"},
      { type: "walk", who: "hero", direction: "right"},
      { type: "walk", who: "hero", direction: "right"},
      { type: "walk", who: "hero", direction: "right"},
      { type: "walk", who: "hero", direction: "right"},
      { type: "walk", who: "hero", direction: "right"},
      { type: "walk", who: "hero", direction: "right"},
      { type: "walk", who: "hero", direction: "up"},
      { type: "textMessage", text: "Announcer: We call it the Pizza Stone"},
      { type: "walk", who: "Announcer", direction: "left"},
      {
        type: "createGameObject",
        name: "pizzaStone",
        map: "DemoStreet",
        object: new PizzaStone({
          x: utils.withGrid(22),
          y: utils.withGrid(10),
          pizzas: ["s001"],
          tutorial: "true"
        })
       },
       { type: "stand", who: "Announcer", direction: "down"},
       { type: "textMessage", text: "Announcer: This might just look like a ball of dough, but when someone creates a pizza with this dough the pizza becomes alive and you can battle them"},
       { type: "textMessage", text: "Announcer: Why you, standing in front of me, come use the dough and show the crowd"}
      ]
     }
    ],
    }
  }
}
  