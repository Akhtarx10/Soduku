const express = require("express");
const router = express.Router();

function generateSudoku() {
  // A function to generate a valid Sudoku board
  const board = Array(9)
    .fill(null)
    .map(() => Array(9).fill(0)); // Initialize an empty 9x9 board

  if (!solveSudoku(board)) {
    throw new Error("Failed to generate a valid Sudoku solution");
  }

  const puzzle = createPuzzle(board); // Creating a puzzle with some cells missing

  return { board: puzzle, solution: board };
}

function solveSudoku(board) {
  // A backtracking algorithm to solve the Sudoku puzzle
  const emptyCell = findEmptyCell(board);
  if (!emptyCell) return board; // Puzzle solved

  const [row, col] = emptyCell;

  for (let num = 1; num <= 9; num++) {
    if (isValid(board, row, col, num)) {
      board[row][col] = num;
      if (solveSudoku(board)) return board;
      board[row][col] = 0; // Backtrack
    }
  }

  return false; // No solution
}

function isValid(board, row, col, num) {
  // Check if a number is valid in the given row, column, and 3x3 box
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num || board[i][col] === num) return false;
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r][c] === num) return false;
    }
  }

  return true;
}

function findEmptyCell(board) {
  // Find an empty cell (represented by 0)
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) return [row, col];
    }
  }
  return null;
}

function createPuzzle(solution) {
  // Remove random cells to create a puzzle
  const puzzle = JSON.parse(JSON.stringify(solution)); // Clone the solution board
  const cellsToRemove = Math.floor(Math.random() * 30) + 30; // Randomly decide how many cells to remove

  for (let i = 0; i < cellsToRemove; i++) {
    let row, col;
    do {
      row = Math.floor(Math.random() * 9);
      col = Math.floor(Math.random() * 9);
    } while (puzzle[row][col] === 0); // Ensure we don't remove an already empty cell

    puzzle[row][col] = 0; // Set a random cell to 0
  }

  return puzzle;
}

router.get("/generate", (req, res) => {
  try {
    const puzzle = generateSudoku();
    res.json(puzzle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
