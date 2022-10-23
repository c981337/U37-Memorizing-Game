const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished'
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

const view = {
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]

    return `        
      <p>${number}</p>
        <img
          src="${symbol}"
          alt=""
        />
      <p>${number}</p>`
  },

  getCardElement(index) {
    return `
      <div data-index=${index} class="card back">
      </div>
    `
  },

  displayCards(index) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = index.map(index => this.getCardElement(index)).join('')
  },

  transformNumber(number) {
    switch(number) {
      case 1 : return 'A'
      case 11 : return 'J'
      case 12 : return 'Q'
      case 13 : return 'K'
      default : return number
    }
  },

  flipCards(...cards) {
    cards.forEach(card =>{
      if(card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(card.dataset.index)
        return
    }

    card.classList.add('back')
    card.innerHTML = null
    return
    })
  },

  pairCards(...cards) {
    cards.forEach(card => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },

  renderTriedTime(times) {
    document.querySelector('.tried').textContent = `You've tried: ${times} times`
  },

  appendWrongAnimation(...cards) {
    cards.forEach(card => {
      card.classList.add('wrong')  
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), {once: true})
    })
  },

  showFameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

const controller = {
  curentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  dispatchCardAction(card) {
    if(!card.classList.contains('back')) {
      return
    }
    switch (this.curentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.curentState = GAME_STATE.SecondCardAwaits
        return
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTime(++model.triedTime)
        view.flipCards(card)
        model.revealedCards.push(card)
        if(model.isRevealedCardsMatched()) {
          view.renderScore(model.score+=10)
          this.curentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if(model.score === 260) {
            this.curentState = GAME_STATE.GameFinished
            view.showFameFinished()
            return
          }
          this.curentState = GAME_STATE.FirstCardAwaits
        }else {
          this.curentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000);
        }
        return
    }
    console.log('this.currentState', this.curentState)
    console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
  },

  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.curentState = GAME_STATE.FirstCardAwaits
  }
}

const model = {
  revealedCards: [],

  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  score: 0,
  triedTime: 0
}

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for(let index = number.length - 1; index > 0; index --) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
      ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

controller.generateCards()

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})