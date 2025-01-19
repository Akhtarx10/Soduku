document.addEventListener("DOMContentLoaded", () => {
  const playButton = document.getElementById("play-button");
  const restartButton = document.getElementById("restart-button");
  const retryButton = document.getElementById("retry-button");
  const playAgainButton = document.getElementById("play-again-button");
  const hintButton = document.getElementById("hint-button");
  const submitButton = document.getElementById("submit-button");
  const homeScreen = document.getElementById("home-screen");
  const gameScreen = document.getElementById("game-screen");
  const gameOverScreen = document.getElementById("game-over-screen");
  const congratulationsScreen = document.getElementById(
    "congratulations-screen"
  );
  const sudokuBoard = document.getElementById("sudoku-board");
  const mistakesDisplay = document.getElementById("mistakes");
  const timerDisplay = document.getElementById("timer");
  const hintsDisplay = document.getElementById("hints");
  const correctSound = new Audio("/audio/correct.wav");
  const wrongSound = new Audio("/audio/wrong.wav");
  const gameRunningSound = new Audio("/audio/game-running.wav");
  const gameEndSound = new Audio("/audio/game-end.wav");

  let mistakes = 0;
  let hints = 3;
  let solutionBoard = [];
  let initialBoard = [];
  let timer;
  let secondsElapsed = 0;
  let timeLimit = 10 * 60; // 6 minutes in seconds

  playButton.addEventListener("click", startGame);
  restartButton.addEventListener("click", startGame);
  retryButton.addEventListener("click", startGame);
  playAgainButton.addEventListener("click", startGame);
  hintButton.addEventListener("click", giveHint);
  submitButton.addEventListener("click", validateBoard);

  function changeBackground(state) {
    document.body.className = state;
  }

  async function startGame() {
    mistakes = 0;
    hints = 3;
    secondsElapsed = 0;
    updateTimer();
    updateHints();
    updateMistakes();
    showElement(gameScreen);
    hideElement(homeScreen);
    hideElement(gameOverScreen);
    hideElement(congratulationsScreen);
    await generateBoard();
    generateSolution();
    fillBoard(initialBoard);
    startTimer();

    // Start looping the game running sound
    gameRunningSound.loop = true;
    gameRunningSound.play();

    // Change background to game screen
    changeBackground("game-screen");
  }

  async function generateBoard() {
    sudokuBoard.innerHTML = "";
    const response = await fetch("/generate");
    const data = await response.json();
    initialBoard = data.board;
    solutionBoard = JSON.parse(JSON.stringify(data.solution));
  }

  function generateSolution() {
    solveSudoku(solutionBoard);
  }

  function fillBoard(board) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const cell = document.createElement("input");
        cell.type = "text";
        cell.maxLength = 1;
        if (board[row][col] !== 0) {
          cell.value = board[row][col];
          cell.disabled = true;
        } else {
          cell.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              checkInput(e, row, col);
            }
          });
        }
        sudokuBoard.appendChild(cell);
      }
    }
  }

  function checkInput(e, row, col) {
    const value = parseInt(e.target.value);
    if (value === solutionBoard[row][col]) {
      e.target.classList.add("correct");
      e.target.classList.remove("wrong");
      correctSound.play();
      if (isSolved()) {
        showElement(congratulationsScreen);
        hideElement(gameScreen);
        stopTimer();

        // Change background to congratulations screen
        changeBackground("congratulations-screen");
      }
    } else {
      e.target.classList.add("wrong");
      e.target.classList.remove("correct");
      wrongSound.play();
      mistakes++;
      updateMistakes();
      if (mistakes >= 5) {
        showElement(gameOverScreen);
        hideElement(gameScreen);
        stopTimer();

        // Change background to game over screen
        changeBackground("game-over-screen");
      }
    }
  }

  function validateBoard() {
    const cells = sudokuBoard.querySelectorAll("input");
    for (let i = 0; i < cells.length; i++) {
      const row = Math.floor(i / 9);
      const col = i % 9;
      if (
        cells[i].value &&
        parseInt(cells[i].value) !== solutionBoard[row][col]
      ) {
        cells[i].classList.add("wrong");
        cells[i].classList.remove("correct");
        wrongSound.play();
        mistakes++;
        updateMistakes();
        if (mistakes >= 5) {
          showElement(gameOverScreen);
          hideElement(gameScreen);
          stopTimer();

          // Change background to game over screen
          changeBackground("game-over-screen");
        }
      } else if (cells[i].value) {
        cells[i].classList.add("correct");
        cells[i].classList.remove("wrong");
        correctSound.play();
      }
    }
    if (isSolved()) {
      showElement(congratulationsScreen);
      hideElement(gameScreen);
      stopTimer();

      // Change background to congratulations screen
      changeBackground("congratulations-screen");
    }
  }

  function isSolved() {
    const cells = sudokuBoard.querySelectorAll("input");
    for (let i = 0; i < cells.length; i++) {
      if (cells[i].value == "") {
        return false;
      }
    }
    return true;
  }

  function solveSudoku(board) {
    function isValid(board, row, col, num) {
      for (let i = 0; i < 9; i++) {
        if (board[row][i] === num || board[i][col] === num) {
          return false;
        }
      }
      const startRow = row - (row % 3),
        startCol = col - (col % 3);
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[i + startRow][j + startCol] === num) {
            return false;
          }
        }
      }
      return true;
    }

    function solve() {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (board[row][col] === 0) {
            for (let num = 1; num <= 9; num++) {
              if (isValid(board, row, col, num)) {
                board[row][col] = num;
                if (solve()) {
                  return true;
                }
                board[row][col] = 0;
              }
            }
            return false;
          }
        }
      }
      return true;
    }

    solve();
  }

  function startTimer() {
    timer = setInterval(() => {
      secondsElapsed++;
      updateTimer();
      if (secondsElapsed >= timeLimit) {
        showElement(gameOverScreen);
        hideElement(gameScreen);
        stopTimer();

        // Change background to game over screen
        changeBackground("game-over-screen");
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timer);
    gameRunningSound.pause(); // Stop the game running sound
    gameRunningSound.currentTime = 0; // Reset to the beginning
  }

  function updateTimer() {
    const remainingTime = timeLimit - secondsElapsed;
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  function giveHint() {
    if (hints <= 0) return;

    const cells = sudokuBoard.querySelectorAll("input");
    const emptyCells = [];
    cells.forEach((cell, index) => {
      if (cell.value === "") {
        emptyCells.push(index);
      }
    });

    if (emptyCells.length > 0) {
      const randomIndex =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const row = Math.floor(randomIndex / 9);
      const col = randomIndex % 9;
      cells[randomIndex].value = solutionBoard[row][col];
      cells[randomIndex].classList.add("correct");
      cells[randomIndex].disabled = true;
      hints--;
      updateHints();
    }
  }

  function updateHints() {
    hintsDisplay.textContent = hints;
  }

  function updateMistakes() {
    mistakesDisplay.textContent = mistakes;
  }

  function showElement(element) {
    element.classList.remove("hidden");
    if (element === gameOverScreen || element === congratulationsScreen) {
      gameEndSound.play(); // Play the game end sound
    }
  }

  function hideElement(element) {
    element.classList.add("hidden");
  }
});
