class OverworldEvent {
  constructor({ map, event}) {
    this.map = map;
    this.event = event;

    this.progress = new Progress()
  }

  stand(resolve) {
    const who = this.map.gameObjects[ this.event.who ];
    who.startBehavior({
      map: this.map
    }, {
      type: "stand",
      direction: this.event.direction,
      wait: this.event.wait
    })
    
    //Set up a handler to complete when correct person is done walking, then resolve the event
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonStandComplete", completeHandler);
        resolve();
      }
    }
    document.addEventListener("PersonStandComplete", completeHandler)
  }

  walk(resolve) {
    const who = this.map.gameObjects[ this.event.who ];
    who.startBehavior({
      map: this.map
    }, {
      type: "walk",
      direction: this.event.direction,
      retry: true
    })

    //Set up a handler to complete when correct person is done walking, then resolve the event
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonWalkingComplete", completeHandler);
        resolve();
      }
    }
    document.addEventListener("PersonWalkingComplete", completeHandler)

  }

  textMessage(resolve) {

    if (this.event.faceHero) {
      const obj = this.map.gameObjects[this.event.faceHero];
      obj.direction = utils.oppositeDirection(this.map.gameObjects["hero"].direction);
    }

    const message = new TextMessage({
      text: this.event.text,
      onComplete: () => resolve()
    })
    message.init( document.querySelector(".game-container") )
  }

  changeMap(resolve) {
    const sceneTransition = new SceneTransition();
    sceneTransition.init(document.querySelector(".game-container"), () => {
      this.map.overworld.startMap( window.OverworldMaps[this.event.map], {
        x: this.event.x,
        y: this.event.y,
        direction: this.event.direction,
      });
      resolve();
      sceneTransition.fadeOut();
    })
  }

  battle(resolve) {
    const battle = new Battle({
      enemy: Enemies[this.event.enemyId],
      arena: this.event.arena,
      onComplete: (didWin) => {
        resolve(didWin ? "WON_BATTLE" : "LOST_BATTLE");
      }
    })
    battle.init(document.querySelector(".game-container"));

  }

  pause(resolve) {
    this.map.isPaused = true;
    const menu = new PauseMenu({
      progress: this.map.overworld.progress,
      onComplete: () => {
        resolve();
        this.map.isPaused = false;
        this.map.overworld.startGameLoop();
      }
    });
    menu.init(document.querySelector(".game-container"));
  }

  addStoryFlag(resolve) {
    window.playerState.storyFlags[this.event.flag] = true;
    resolve();
  }

  removeStoryFlag(resolve) {
    window.playerState.storyFlags[this.event.flag] = false
    resolve()
  }

  craftingMenu(resolve) {
    const menu = new CraftingMenu({
      pizzas: this.event.pizzas,
      onComplete: () => {
        resolve();
      }
    })
    menu.init(document.querySelector(".game-container"))
  }

  createGameObject(resolve) {
    const {name, object} = this.event
    this.map.gameObjects[name] = object
    this.map.mountObjects()
    resolve()
  }

  deleteGameObject(resolve) {
    const { name } = this.event
    const person = this.map.gameObjects[name]
    delete this.map.removeWall(person.x, person.y)
    delete this.map.gameObjects[name]
    resolve()
  }

  follow(resolve) {
    const { follower, who } = this.event
    const person = this.map.gameObjects[who]
    const follow = this.map.gameObjects[follower]
    let direction = null
    if(person.x > follow.x) {
      direction = "right"
    } else if (person.x < follow.x) {
      direction = "left"
    } else if (person.y > follow.y) {
      direction = "down"
    } else if (person.y < follow.y) {
      direction = "up"
    } else {
      resolve()
    }

    follow.startBehavior({
      map: this.map
    }, {
      type: "walk",
      direction: direction,
      retry: true
    })
    resolve()
  }


  init() {
    return new Promise(resolve => {
      this[this.event.type](resolve)      
    })
  }

}