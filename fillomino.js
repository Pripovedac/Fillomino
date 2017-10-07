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
    // First idea:
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
  // Pay attention here: returned value is `false`, not `true`.
  // 'Cause if it's otherwise it will mean that some `1` is
  // not conected, and `1` is always conected.
  return false
}

let playFlag = true

Vue.component('board-cell', {
  template: `
    <div v-bind:class="{setfield : checkDefault(symbol)}">
      <span> {{ symbol.value }} </span>
      <div v-if="!checkDefault(symbol)">
        <button class='reset'
        @click=switchToReset>x</button>
      </div>
    </div>
    `,
  props: ['symbol'],
  methods: {
    checkDefault: function (field) {
      return field.default_
    },
    switchToReset: function () {
      playFlag = false;
    },
  },
});

Vue.component('fillomino-board', {
  template: `
    <div id="fillominoBoard" class="filominoBoard">
      <div class="board-row" v-for="(row, i) in values" :key="i">
        <board-cell class="board-cell" v-for="(cell, j) of row" :key="j"
          :symbol="cell"
          @click.native="$emit('play', i, j)"
          @contextmenu.native="$emit('reset', i, j)">
          </board-cell>
      </div>
    </div>
    `,
  props: ['values'],
});

Vue.component('button-row', {
  template: `
    <div id="buttonContainer">
    <label>Pick a number:</label>    
      <button class="button-row" 
      v-for="(number, i) in digits"
      @click="$emit('getnumber', i)">{{number}}</button>
    </div>
  `,
  props: ['digits'],
})

const tile = (value = undefined, status = 0, default_ = value !== undefined) =>
  ({ value, status, default_ });

new Vue({
  el: '#Fillomino',
  data: {
  // Status 0 => element is part of the polyomino
  // Status 1 => element is not part of the polyomino
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
    digits: [1, 2, 3, 4, 5, 6, 7, 8],
    message: '',
  },
  methods: {
    play: function (i, j) {
      if (playFlag) {
        console.log('Uso sam u plej.')
        deselectPreviousCell(tableRow, currentRow, currentCell)
        currentRow = i
        currentCell = j
        changeCell(tableRow, currentRow, currentCell)
        console.log(currentRow, currentCell)
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
      } else {
        playFlag = true
        this.reset(i, j)
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
      console.log('reset entered')
      event.preventDefault()
      if (this.startingBoard[i][j].default_) {
        return
      }
      // If deleted element was part of the polyomino
      // then that polyomino has to be destroyed
      // by setting its parts' status to zero.
      if (this.startingBoard[i][j].status === 1) {
        setStatusToZero(this.startingBoard, i, j, this.startingBoard[i][j].value)
      }

      this.startingBoard = displayBoard(this.startingBoard, [i, j], undefined)
      this.checkPolyominoAfterReset(this.startingBoard, i, j)
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
    restart: function () {
      this.startingBoard = [
        [tile(1), {}, {}, {}, {}, {}, {}, {}],
        [tile(2), tile(1), tile(8), {}, {}, tile(1), tile(3), tile(1)],
        [{}, tile(3), tile(1), tile(7), tile(7), {}, tile(5), {}],
        [tile(1), {}, {}, {}, {}, {}, {}, {}],
        [{}, tile(1), {}, {}, tile(4), tile(1), tile(5), {}],
        [{}, tile(4), tile(6), tile(4), tile(1), {}, {}, {}],
        [{}, {}, {}, tile(1), {}, tile(3), tile(1), tile(6)],
        [tile(1), {}, {}, {}, {}, tile(1), {}, {}],
      ]
    },
    getNumber: function (index) {
      this.number = index + 1
    },
  },
})

/* Keyboard navigation */
let currentRow = 0;
let currentCell = 0;
const tableRow = document.getElementsByClassName('board-row')
const numOfRows = tableRow.length
const numOfCells = tableRow[0].childNodes.length

function changeCell(rows, currRow, currCell) {
  const selectedRow = rows[currRow]
  const selectedCell = selectedRow.childNodes[currCell];
  selectedCell.style.background = 'rgba(116, 163, 230, 0.39)'
}

function deselectPreviousCell(rows, currRow, currCell) {
  const selectedRow = rows[currentRow]
  const selectedCell = selectedRow.childNodes[currCell];
  selectedCell.classList.value === 'board-cell setfield' ? selectedCell.style.background = 'rgba(5, 70, 161, 0.16)' :
    selectedCell.style.background = '#000A1C'
  /* fixing hover bug */
  // Problem explained:
  // Cells visited using keyboard didn't support hover effect
  // specified in .css file.
  selectedCell.onmouseover = function () {
    this.style.backgroundColor = 'rgba(116, 163, 230, 0.39)';
  }
  selectedCell.onmouseleave = function () {
    selectedCell.classList.value === 'board-cell setfield' ? selectedCell.style.background = 'rgba(5, 70, 161, 0.16)' :
      selectedCell.style.background = '#000A1C'
  }
  /* fixing hover bug done */
}


$(document).keydown(function (e) {
  // keyCode = 37 - left arrow key
  if (e.keyCode === 37 && currentCell > 0) {
    deselectPreviousCell(tableRow, currentRow, currentCell)
    currentCell -= 1;
    changeCell(tableRow, currentRow, currentCell)
  }
  // keyCode = 38 - upper arrow key
  if (e.keyCode === 38 && currentRow > 0) {
    deselectPreviousCell(tableRow, currentRow, currentCell)
    currentRow -= 1
    changeCell(tableRow, currentRow, currentCell)
  }
  // keyCode = 39 - right arrow key
  if (e.keyCode === 39 && currentCell < numOfCells - 1) {
    deselectPreviousCell(tableRow, currentRow, currentCell)
    currentCell += 1;
    changeCell(tableRow, currentRow, currentCell)
  }
  // keyCode = 40 - lower arrow key
  if (e.keyCode === 40 && currentRow < numOfRows - 1) {
    deselectPreviousCell(tableRow, currentRow, currentCell)
    currentRow += 1;
    changeCell(tableRow, currentRow, currentCell)
  }
})
/* Keyboard navigation ended */

