/* eslint-disable no-alert, no-console, func-names  */ // Eslint comand for disabling warnings

function displayBoard(board, index, number) {
  const boardClone = [...board.map(row => ([...row]))]
  boardClone[index[0]][index[1]] = { value: number, status: 0 }
  console.log('Displej: ', boardClone)
  return boardClone
}

function countTakenFields(board) {
  let counter = 0
  board.forEach((row) => {
    row.forEach((cell) => {
      if (cell.value !== undefined) {
        counter += 1
      }
    })
  })
  return counter
}

function checkBoundaries(board, i, j) {
  return i >= 0 && i < board.length && j >= 0 && j < board.length
}

function setStatusToZero(board, i, j, number) {
  if (number !== 1) {
    if (checkBoundaries(board, i, j) && board[i][j].value !== undefined
      && board[i][j].status === 1 && board[i][j].value === number) {
      board[i][j].status = 0
      if (j > 0) {
        setStatusToZero(board, i, j - 1, number)
      }
      if (j < board.length - 1) {
        setStatusToZero(board, i, j + 1, number)
      }
      if (i < board.length - 1) {
        setStatusToZero(board, i + 1, j, number)
      }
      if (i > 0) {
        setStatusToZero(board, i - 1, j, number)
      }
    }
  }
}

function countNeighbours(board, i, j, number) {
  let counter = 1
  if (checkBoundaries(board, i, j) && board[i][j].value !== undefined
    && board[i][j].status === 0 && board[i][j].value === number) {
    board[i][j].status = 1
    if (j > 0) {
      counter += countNeighbours(board, i, j - 1, number)
    }
    if (j < board.length - 1) {
      counter += countNeighbours(board, i, j + 1, number)
    }
    if (i > 0) {
      counter += countNeighbours(board, i - 1, j, number)
    }
    if (i < board.length - 1) {
      counter += countNeighbours(board, i + 1, j, number)
    }
    return counter
    // return 1 + countNeighbours(board, i, j - 1, number) +
    // countNeighbours(board, i, j + 1, number) +
    // countNeighbours(board, i + 1, j, number) +
    // countNeighbours(board, i - 1, j, number)
  }
  return 0
}

function checkStatus(element) {
  if (element.value !== 1) {
    return element.status === 0
  }
  // Obrati paznju, ovde moras da vratis `false`, ne `true`.
  // Jer ako vratis true
  // ispasce da postoji neki koji nije spojen, a kec
  // je uvek spojen.
  return false
}

Vue.component('fillomino-board', {
  template: `
    <div id="fillominoBoard" class="filominoBoard">
      <div class="board-row" v-for="(row, i) in values">
        <board-cell class="board-cell" v-for="(cell, j) of row"
          :symbol="cell"
          @click.native="$emit('play', i, j)"
          @contextmenu.native="$emit('reset', i, j)">
          </board-cell>
      </div>
    </div>
    `,
  props: ['values'],
});

Vue.component('board-cell', {
  template: `
    <div v-bind:class="{setfield : checkDefault(symbol)}">
      <span> {{ symbol.value }} </span>
      <!-- <button id='reset'>x</button> -->
    </div>
    `,
  props: ['symbol'],
  methods: {
    checkDefault: function (field) {
      return field.default_
    },
  },
});

const tile = (value = undefined, status = 0, default_ = value !== undefined) =>
  ({ value, status, default_ });

new Vue({
  el: '#Fillomino',
  data: {
  // Status 0 => element nije clan poliomina
  // Status 1 => element jeste clan poliomina
  //  isActive: true,
    default_: true,
    startingBoard: [
      [tile(1), {}, {}, {}, {}, {}, {}, {}],
      [tile(2), tile(1), tile(8), {}, {}, tile(1), tile(3), tile(1)],
      [{}, tile(3), tile(1), tile(7), tile(7), {}, tile(5), {}],
      [tile(1), {}, {}, {}, {}, {}, {}, {}],
      [{}, tile(1), {}, {}, tile(4), tile(1), tile(5), {}],
      [{}, tile(4), tile(6), tile(4), tile(1), {}, {}, {}],
      [{}, {}, {}, tile(1), {}, tile(3), tile(1), tile(6)],
      [tile(1), {}, {}, {}, {}, tile(1), {}, {}],
    ],
    number: 0,
    message: '',
  },
  methods: {
    play: function (i, j) {
      console.log('Uso sam u plej.');
      // ovo mogu i da ostavim i tako omogucim brisanje elemenata
      if (this.startingBoard[i][j].value !== undefined) {
        console.log('Prvi if.')
        console.log('this.startingBoard[i][j].value', this.startingBoard[i][j].value)
        this.number = this.startingBoard[i][j].value
        console.log('number: ', this.number)
      } else {
        if (this.number === 0) {
          this.displayMessage('Choose your number first.')
        } else {
          console.log('Za upis: ', i, j)
          this.startingBoard = displayBoard(this.startingBoard, [i, j], this.number)
          console.log('Starting board: ', this.startingBoard)
          if (this.checkPolyomino(this.startingBoard, i, j, this.number)) {
            this.displayMessage('You\'ve created polyomino! :D')
          } else {
            setStatusToZero(this.startingBoard, i, j, this.number)
          }
          if (countTakenFields(this.startingBoard) === Math.pow(this.startingBoard.length, 2)) {
            this.checkWinner(this.startingBoard)
          }
        }
      }
    },

    checkPolyomino: function (board, i, j, number) {
      const counter = countNeighbours(board, i, j, number)
      if (counter > number) {
        this.displayMessage('Look what you\'ve done, bro.')
      }
      return counter === number
    },
    checkWinner: function (board) {
      const check = board.some(row => row.some(checkStatus))
      check ? this.displayMessage('Think a bit more.') :
        this.displayMessage('Awesome! :D')
    },
    reset: function (i, j) {
      event.preventDefault()
      if (this.startingBoard[i][j].default_) {
        return
      }
      // Ako je izbrisani element deo polyomino-a, onda
      // moramo da razbijemo polyomino postavljajuci
      // status svim ostalim clanovima na nulu
      if (this.startingBoard[i][j].status === 1) {
        setStatusToZero(this.startingBoard, i, j, this.startingBoard[i][j].value)
      }

      this.startingBoard = displayBoard(this.startingBoard, [i, j], undefined)
      this.checkPolyominoAfterReset(this.startingBoard, i, j)
      // startingBoard gadjam globalno, jebiga
    },
    checkPolyominoAfterReset: function (board, i, j) {
      if (i > 0) {
        if (!this.checkPolyomino(board, i - 1, j, board[i - 1][j].value)) {
          setStatusToZero(board, i - 1, j, board[i - 1][j].value)
        }
      }
      if (i < board.length - 1) {
        if (!this.checkPolyomino(board, i + 1, j, board[i + 1][j].value)) {
          setStatusToZero(board, i + 1, j, board[i + 1][j].value)
        }
      }
      if (j > 0) {
        if (!this.checkPolyomino(board, i, j - 1, board[i][j - 1].value)) {
          setStatusToZero(board, i, j - 1, board[i][j - 1].value)
        }
      }
      if (j < board.length - 1) {
        if (!this.checkPolyomino(board, i, j + 1, board[i][j + 1].value)) {
          setStatusToZero(board, i, j + 1, board[i][j + 1].value)
        }
      }
    },
    displayMessage: function (message) {
      this.message = message.toString()
      setTimeout(() => this.message = '', 1000)
    },
    checkDefault: function (field) {
      return field.value === undefined
    },
  },
})
