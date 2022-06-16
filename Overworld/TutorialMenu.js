class TutorialMenu {
  constructor({ onComplete }){
    this.options = [{
      label: "Next",
      description: "Close Tutorial",
    }]
    this.onComplete = onComplete
  }

  getOptions() {
    return this.options.map(option => {
      return {
        label: option.label,
        description: option.description,
        handler: () => {
          playerState.addPizza('f001')
          playerState.addPizza('c001')
          playerState.addPizza('s001')
          this.close()
        }
      }
    })
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("CraftingMenu");
    this.element.classList.add("overlayMenu");
    this.element.innerHTML = (`
      <p>Use the arrow keys or WASD for movement, press enter or space to talk or interact, and use esc to open the menu.</p>
    `)
  }

  close() {
    this.keyboardMenu.end();
    this.element.remove();
    this.onComplete();
  }


  init(container) {
    this.createElement();
    this.keyboardMenu = new KeyboardMenu({
      descriptionContainer: container
    })
    this.keyboardMenu.init(this.element)
    this.keyboardMenu.setOptions(this.getOptions())

    container.appendChild(this.element);
  }
}