"use strict";

const SIZE = 4;
let board = Array(SIZE * SIZE).fill(0);
let score = 0;
let acknowledgedWin = false;
let dialogOpen = false;

let boardElement;
let scoreElement;
let dialogElement;
let dialogTitle;
let dialogMessage;
let continueButton;
let dialogNewGameButton;

function mergeLine(line) {
  const tiles = line.filter(function (value) {
    return value !== 0;
  });
  const merged = [];
  let gainedScore = 0;

  for (let i = 0; i < tiles.length; i += 1) {
    if (i + 1 < tiles.length && tiles[i] === tiles[i + 1]) {
      const value = tiles[i] * 2;
      merged.push(value);
      gainedScore += value;
      i += 1;
    } else {
      merged.push(tiles[i]);
    }
  }

  while (merged.length < line.length) {
    merged.push(0);
  }

  return { line: merged, gainedScore: gainedScore };
}

function addRandomTile() {
  const emptyIndices = [];

  board.forEach(function (value, index) {
    if (value === 0) {
      emptyIndices.push(index);
    }
  });

  if (emptyIndices.length === 0) {
    return;
  }

  const index = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  board[index] = Math.random() < 0.9 ? 2 : 4;
}

function hasMoves() {
  if (board.includes(0)) {
    return true;
  }

  for (let row = 0; row < SIZE; row += 1) {
    for (let column = 0; column < SIZE; column += 1) {
      const index = row * SIZE + column;

      if (column < SIZE - 1 && board[index] === board[index + 1]) {
        return true;
      }
      if (row < SIZE - 1 && board[index] === board[index + SIZE]) {
        return true;
      }
    }
  }

  return false;
}

function render() {
  const fragment = document.createDocumentFragment();

  board.forEach(function (value) {
    const cell = document.createElement("div");
    cell.className = "cell";

    if (value !== 0) {
      cell.classList.add(value > 2048 ? "tile-super" : "tile-" + value);
      cell.textContent = String(value);
    }

    cell.setAttribute("role", "gridcell");
    cell.setAttribute("aria-label", value === 0 ? "빈 칸" : String(value));
    fragment.appendChild(cell);
  });

  boardElement.replaceChildren(fragment);
  scoreElement.textContent = String(score);
}

function hideDialog() {
  dialogOpen = false;
  dialogElement.hidden = true;
}

function showDialog(type) {
  dialogOpen = true;
  dialogElement.hidden = false;
  continueButton.hidden = type !== "win";

  if (type === "win") {
    dialogTitle.textContent = "2048 달성!";
    dialogMessage.textContent = "계속 플레이하거나 새 게임을 시작하세요.";
    continueButton.focus();
  } else {
    dialogTitle.textContent = "게임 오버";
    dialogMessage.textContent = "더 이상 이동할 수 없습니다.";
    dialogNewGameButton.focus();
  }
}

function newGame() {
  board = Array(SIZE * SIZE).fill(0);
  score = 0;
  acknowledgedWin = false;
  hideDialog();
  addRandomTile();
  addRandomTile();
  render();
}

function move(direction) {
  if (dialogOpen || !["left", "right", "up", "down"].includes(direction)) {
    return;
  }

  const nextBoard = board.slice();
  const vertical = direction === "up" || direction === "down";
  const reverse = direction === "right" || direction === "down";
  let gainedScore = 0;

  for (let lineIndex = 0; lineIndex < SIZE; lineIndex += 1) {
    const originalLine = [];

    for (let position = 0; position < SIZE; position += 1) {
      const index = vertical
        ? position * SIZE + lineIndex
        : lineIndex * SIZE + position;
      originalLine.push(board[index]);
    }

    const towardMovement = reverse
      ? originalLine.slice().reverse()
      : originalLine;
    const merged = mergeLine(towardMovement);
    const finalLine = reverse ? merged.line.slice().reverse() : merged.line;
    gainedScore += merged.gainedScore;

    for (let position = 0; position < SIZE; position += 1) {
      const index = vertical
        ? position * SIZE + lineIndex
        : lineIndex * SIZE + position;
      nextBoard[index] = finalLine[position];
    }
  }

  const changed = nextBoard.some(function (value, index) {
    return value !== board[index];
  });

  if (!changed) {
    return;
  }

  board = nextBoard;
  score += gainedScore;
  addRandomTile();
  render();

  if (!acknowledgedWin && board.some(function (value) { return value >= 2048; })) {
    showDialog("win");
  } else if (!hasMoves()) {
    showDialog("over");
  }
}

function setupGame() {
  boardElement = document.getElementById("board");
  scoreElement = document.getElementById("score");
  dialogElement = document.getElementById("dialog");
  dialogTitle = document.getElementById("dialog-title");
  dialogMessage = document.getElementById("dialog-message");
  continueButton = document.getElementById("continue-game");
  dialogNewGameButton = document.getElementById("dialog-new-game");

  document.getElementById("new-game").addEventListener("click", newGame);
  dialogNewGameButton.addEventListener("click", newGame);
  continueButton.addEventListener("click", function () {
    acknowledgedWin = true;
    hideDialog();

    if (!hasMoves()) {
      showDialog("over");
    }
  });

  document.querySelectorAll("[data-direction]").forEach(function (button) {
    button.addEventListener("click", function () {
      move(button.dataset.direction);
    });
  });

  const keyDirections = {
    ArrowUp: "up",
    ArrowLeft: "left",
    ArrowDown: "down",
    ArrowRight: "right"
  };

  document.addEventListener("keydown", function (event) {
    const direction = keyDirections[event.key];

    if (direction) {
      event.preventDefault();
      move(direction);
    }
  });

  newGame();
}

document.addEventListener("DOMContentLoaded", setupGame);
