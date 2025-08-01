const orangeContainer = document.getElementById("orange-container");
const yellowRow = document.getElementById("yellow-row");
const squareSize = 40;
const gap = 1;
const orangeSquares = [];
const yellowSquares = [];
const magyarABC = "AÁBCDEÉFGHIÍJKLMNOÓÖŐPQRSTUÚÜŰVWXYZ";
const jokerChar = "***AAEE";
let currentRound = 0;
let totalScore = 0;
let timerInterval;

const roundLabel = document.createElement("div");
roundLabel.style.position = "absolute";
roundLabel.style.top = "calc(12 * 41px + 6mm + 2 * 41px + 6mm + 40px)";
roundLabel.style.left = "6mm";
roundLabel.style.fontWeight = "bold";
roundLabel.style.color = "darkblue";
roundLabel.style.fontSize = "20px";
roundLabel.style.zIndex = "2";
document.body.appendChild(roundLabel);

const scoreLabel = document.createElement("div");
scoreLabel.style.position = "absolute";
scoreLabel.style.top = "calc(12 * 41px + 6 * 41px - 3mm)";
scoreLabel.style.left = "2mm";
scoreLabel.style.fontWeight = "bold";
scoreLabel.style.color = "darkgreen";
scoreLabel.style.fontSize = "18px";
scoreLabel.style.whiteSpace = "pre-line";
scoreLabel.style.zIndex = "2";
scoreLabel.textContent = "Eredmény: 0 pont";
document.body.appendChild(scoreLabel);

const labeledSquares = [
  { row: 1, col: 3, letter: "J" },
  { row: 2, col: 3, letter: "Á" },
  { row: 3, col: 3, letter: "T" },
  { row: 4, col: 3, letter: "É" },
  { row: 5, col: 3, letter: "K" },
  { row: 7, col: 1, letter: "A" },
  { row: 9, col: 2, letter: "B" },
  { row: 9, col: 3, letter: "E" },
  { row: 9, col: 4, letter: "T" },
  { row: 9, col: 5, letter: "Ű" },
  { row: 9, col: 6, letter: "K" },
  { row: 9, col: 7, letter: "K" },
  { row: 9, col: 8, letter: "E" },
  { row: 9, col: 9, letter: "L" }
];

for (let row = 0; row < 12; row++) {
  for (let col = 0; col < 10; col++) {
    const square = document.createElement("div");
    square.classList.add("square");

    const match = labeledSquares.find(pos => pos.row === row && pos.col === col);
    if (match) {
      square.classList.add("red");
      square.textContent = match.letter;
    } else {
      square.classList.add("orange");
    }

    square.style.position = "absolute";
    square.style.left = `${col * (squareSize + gap)}px`;
    square.style.top = `${row * (squareSize + gap)}px`;
    orangeContainer.appendChild(square);
    orangeSquares.push(square);
  }
}

const originalRedPositions = labeledSquares.map(pos => `${pos.row},${pos.col}`);

const blueFrame = document.createElement("div");
blueFrame.id = "blue-frame";
document.body.appendChild(blueFrame);

const timerContainer = document.createElement("div");
timerContainer.id = "timer-container";
timerContainer.textContent = "3:00";
document.body.appendChild(timerContainer);

const startMessage = document.createElement("div");
startMessage.id = "start-message";
startMessage.textContent = "Készülj!";
document.body.appendChild(startMessage);

const dictionaryButton = document.createElement("div");
dictionaryButton.id = "dictionary-button";
dictionaryButton.classList.add("button");
dictionaryButton.textContent = "Szótár";
document.body.appendChild(dictionaryButton);

dictionaryButton.addEventListener("click", () => {
  checkAttachedYellowNeighbors({
    orangeSquares,
    yellowSquares,
    squareSize,
    gap,
    startMessageElement: startMessage,
    enforceLayout: false
  });
});

const okButton = document.createElement("div");
okButton.id = "ok-button";
okButton.classList.add("button");
okButton.textContent = "OK";
document.body.appendChild(okButton);

const newGameButton = document.createElement("div");
newGameButton.id = "new-game-button";
newGameButton.classList.add("button");
newGameButton.textContent = "Új játék";
newGameButton.style.top = "calc(12 * 41px + 6 * 41px + 10 mm)";
newGameButton.style.left = "2mm";
document.body.appendChild(newGameButton);

newGameButton.addEventListener("click", () => {
  currentRound = 0;
  totalScore = 0;
  scoreLabel.textContent = "Eredmény: 0 pont";
  roundLabel.textContent = "";
  timerContainer.textContent = "3:00";
  startMessage.classList.add("hidden");

  yellowSquares.forEach(square => square.remove());
  yellowSquares.length = 0;

  const allRedSquares = document.querySelectorAll(".square.red");
  allRedSquares.forEach(square => {
    const row = Math.floor(square.offsetTop / (squareSize + gap));
    const col = Math.floor(square.offsetLeft / (squareSize + gap));
    const key = `${row},${col}`;
    if (!originalRedPositions.includes(key)) {
      square.remove();
    }
  });

  startNextRound();
});
function makeDraggable(elem) {
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

  elem.addEventListener("mousedown", (e) => {
    if (!elem.classList.contains("yellow")) return;
    isDragging = true;
    const rect = elem.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    elem.style.position = "absolute";
    elem.style.zIndex = 1000;
    elem.style.left = `${e.clientX - offsetX}px`;
    elem.style.top = `${e.clientY - offsetY}px`;
    elem.style.cursor = "grabbing";
    document.body.appendChild(elem);
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    elem.style.left = `${e.clientX - offsetX}px`;
    elem.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    elem.style.cursor = "grab";
    snapToOrangeSquare(elem);
  });

  elem.addEventListener("touchstart", (e) => {
    if (!elem.classList.contains("yellow")) return;
    if (e.touches.length !== 1) return;
    isDragging = true;
    const touch = e.touches[0];
    const rect = elem.getBoundingClientRect();
    offsetX = touch.clientX - rect.left;
    offsetY = touch.clientY - rect.top;
    elem.style.position = "absolute";
    elem.style.zIndex = 1000;
    elem.style.left = `${touch.clientX - offsetX}px`;
    elem.style.top = `${touch.clientY - offsetY}px`;
    elem.style.cursor = "grabbing";
    document.body.appendChild(elem);
    e.preventDefault();
  }, { passive: false });

  document.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    elem.style.left = `${touch.clientX - offsetX}px`;
    elem.style.top = `${touch.clientY - offsetY}px`;
    e.preventDefault();
  }, { passive: false });

  document.addEventListener("touchend", () => {
    if (!isDragging) return;
    isDragging = false;
    elem.style.cursor = "grab";
    snapToOrangeSquare(elem);
  });
}

function snapToOrangeSquare(elem) {
  for (let orange of orangeSquares) {
    const oRect = orange.getBoundingClientRect();
    const yRect = elem.getBoundingClientRect();
    const overlapX = Math.max(0, Math.min(oRect.right, yRect.right) - Math.max(oRect.left, yRect.left));
    const overlapY = Math.max(0, Math.min(oRect.bottom, yRect.bottom) - Math.max(oRect.top, yRect.top));
    const overlapArea = overlapX * overlapY;
    const yellowArea = yRect.width * yRect.height;

    if (overlapArea / yellowArea >= 0.7) {
      const orangeLeft = oRect.left + window.scrollX;
      const orangeTop = oRect.top + window.scrollY;
      elem.style.left = `${orangeLeft}px`;
      elem.style.top = `${orangeTop}px`;
      return;
    }
  }
}

okButton.addEventListener("click", () => {
  clearInterval(timerInterval);
  endRound();
});

function endRound() {
  checkAttachedYellowNeighbors({
    orangeSquares,
    yellowSquares,
    squareSize,
    gap,
    startMessageElement: startMessage,
    onRoundEnd: handleRoundFinish,
    enforceLayout: true
  });
}

function handleRoundFinish({ totalScore: earnedPoints, validWord, usedSquares }) {
  if (!usedSquares || usedSquares.length === 0 || !validWords.has(validWord.toUpperCase())) {
    scoreLabel.textContent = `Eredmény: ${totalScore} pont`;
    yellowSquares.forEach(square => square.remove());
    yellowSquares.length = 0;

    setTimeout(() => {
      startNextRound();
    }, 4000);
    return;
  }

  totalScore += earnedPoints;
  scoreLabel.textContent = `Eredmény: ${totalScore} pont`;

  startMessage.textContent = `A fordulóban a ${validWord} szót raktad ki, ${earnedPoints} pontot szereztél!`;
startMessage.classList.remove("hidden");
setTimeout(() => startMessage.classList.add("hidden"), 4000);

  usedSquares.forEach(square => {
    const numberElement = square.querySelector(".number");
    if (numberElement) numberElement.remove();

    square.classList.remove("yellow");
    square.classList.add("red");
    square.style.backgroundColor = "red";
    square.style.color = "white";

    if (!orangeSquares.includes(square)) {
      orangeSquares.push(square);
    }
  });

  yellowSquares.forEach(square => {
    if (!usedSquares.includes(square)) {
      square.remove();
    }
  });

  yellowSquares.length = 0;

  setTimeout(() => {
    startNextRound();
  }, 4000);
}

function startNextRound() {
  currentRound++;
  if (currentRound > 5) {
    startMessage.textContent = "A játék véget ért!";
    startMessage.classList.remove("hidden");
    return;
  }

  roundLabel.textContent = `Forduló: ${currentRound}`;
  timerContainer.textContent = "3:00";

  startMessage.textContent = "Készülj!";
  startMessage.classList.remove("hidden");
  let flashInterval = setInterval(() => {
    startMessage.classList.toggle("hidden");
  }, 500);

  setTimeout(() => {
    clearInterval(flashInterval);
    startMessage.classList.add("hidden");

    generateYellowSquares();
    startCountdown();
  }, 5000);
}

function generateYellowSquares() {
  yellowSquares.length = 0;
  yellowRow.innerHTML = "";

  for (let i = 0; i < 10; i++) {
    const yellow = document.createElement("div");
    yellow.classList.add("square", "yellow");

    const allChars = magyarABC + jokerChar;
    const letter = allChars.charAt(Math.floor(Math.random() * allChars.length));
    yellow.textContent = letter;

    const number = document.createElement("div");
    number.classList.add("number");
    number.textContent = Math.floor(Math.random() * 9) + 1;
    yellow.appendChild(number);

    yellowRow.appendChild(yellow);
    yellowSquares.push(yellow);
    makeDraggable(yellow);
  }
}

function startCountdown() {
  let timeLeft = 180;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerContainer.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endRound();
    }
  }, 1000);
}

startNextRound();
