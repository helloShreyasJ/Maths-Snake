// Game variables
let lives = 3;
let correctAnswers = 0;
let playerName = '';
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
let gameInterval;  // Store game interval
let questionDifficulty = 1;  // Difficulty level for questions
let gamePaused = false;  // Flag to pause the game

// Game settings
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scale = 20;  // Size of one square
const rows = canvas.height / scale;
const columns = canvas.width / scale;

let snake = [{ x: 5, y: 5 }];
let apple = randomApplePosition();
let direction = 'RIGHT';
let changingDirection = false;

// Start the game when the player enters their name
document.getElementById("startGameButton").addEventListener("click", () => {
    playerName = document.getElementById("playerName").value.trim();
    if (playerName === "") {
        alert("Please enter your name to start the game.");
    } else {
        document.getElementById("nameArea").style.display = 'none'; // Hide name input
        startGame();  // Start the game
    }
});

// Display leaderboard (Only top 5)
function displayLeaderboard() {
    const leaderboardList = document.getElementById("leaderboardList");
    leaderboardList.innerHTML = ''; // Clear current leaderboard
    leaderboard.sort((a, b) => b.correctAnswers - a.correctAnswers); // Sort by correct answers

    // Display only top 5 players
    const top5Leaderboard = leaderboard.slice(0, 5);

    top5Leaderboard.forEach(entry => {
        const listItem = document.createElement("li");
        listItem.textContent = `${entry.name}: ${entry.correctAnswers} correct answers`;
        leaderboardList.appendChild(listItem);
    });

    document.getElementById("leaderboardArea").style.display = 'block';  // Show leaderboard area
}

// Save the player's score to the leaderboard
function saveScore() {
    leaderboard.push({ name: playerName, correctAnswers: correctAnswers });
    leaderboard.sort((a, b) => b.correctAnswers - a.correctAnswers);  // Sort by correct answers
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    displayLeaderboard();  // Update leaderboard display
}

// Generate random apple position
function randomApplePosition() {
    return {
        x: Math.floor(Math.random() * columns),
        y: Math.floor(Math.random() * rows)
    };
}

// Draw the snake
function drawSnake() {
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? 'green' : 'lightgreen';  // Head is dark green
        ctx.fillRect(segment.x * scale, segment.y * scale, scale, scale);
    });
}

// Draw the apple
function drawApple() {
    ctx.fillStyle = 'red';
    ctx.fillRect(apple.x * scale, apple.y * scale, scale, scale);
}

// Move the snake
function moveSnake() {
    const head = { ...snake[0] };

    if (direction === 'RIGHT') head.x++;
    if (direction === 'LEFT') head.x--;
    if (direction === 'UP') head.y--;
    if (direction === 'DOWN') head.y++;

    snake.unshift(head);  // Add new head to snake array

    // Check if snake eats apple
    if (head.x === apple.x && head.y === apple.y) {
        apple = randomApplePosition();  // New apple position
        askQuestion();  // Ask a math question
    } else {
        snake.pop();  // Remove last segment of the snake
    }

    // Check for collisions
    if (head.x < 0 || head.x >= columns || head.y < 0 || head.y >= rows || collisionWithSnake(head)) {
        gameOver();
    }
}

// Check if the snake collides with itself
function collisionWithSnake(head) {
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true;
        }
    }
    return false;
}

// Ask math question
function askQuestion() {
    const questionType = Math.floor(Math.random() * 3);  // Randomize question type: 0 (addition), 1 (subtraction), 2 (multiplication)
    let num1, num2, correctAnswer;

    if (questionType === 0) {
        // Addition
        num1 = Math.floor(Math.random() * (10 * questionDifficulty));
        num2 = Math.floor(Math.random() * (10 * questionDifficulty));
        correctAnswer = num1 + num2;
        document.getElementById("questionText").textContent = `What is ${num1} + ${num2}?`;
    } else if (questionType === 1) {
        // Subtraction
        num1 = Math.floor(Math.random() * (10 * questionDifficulty)) + 5;  // Make sure num1 is greater than num2
        num2 = Math.floor(Math.random() * (10 * questionDifficulty));
        correctAnswer = num1 - num2;
        document.getElementById("questionText").textContent = `What is ${num1} - ${num2}?`;
    } else {
        // Multiplication (Times tables)
        num1 = Math.floor(Math.random() * 12) + 1;  // Times tables 1-12
        num2 = Math.floor(Math.random() * 12) + 1;
        correctAnswer = num1 * num2;
        document.getElementById("questionText").textContent = `What is ${num1} x ${num2}?`;
    }

    document.getElementById("questionArea").style.display = 'block';
    document.getElementById("submitAnswer").onclick = () => checkAnswer(correctAnswer);
    
    gamePaused = true;  // Pause the game
}

// Check the answer
function checkAnswer(correctAnswer) {
    const userAnswer = parseInt(document.getElementById("answerInput").value, 10);
    if (userAnswer === correctAnswer) {
        correctAnswers++;  // Correct answer
        questionDifficulty++;  // Increase difficulty
        document.getElementById("correctAnswers").textContent = correctAnswers;
        document.getElementById("questionArea").style.display = 'none';
        gamePaused = false;  // Resume the game
    } else {
        lives--;
        document.getElementById("lives").textContent = lives;
        if (lives <= 0) {
            gameOver();  // End game if no lives remain
        } else {
            alert("Wrong answer! You lost a life.");
        }
    }
}

// Update the game
function updateGame() {
    if (gamePaused) return;  // Skip if game is paused
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSnake();
    drawApple();
    moveSnake();
}

// Start the game
function startGame() {
    gameInterval = setInterval(updateGame, 100);  // 100ms per frame
    document.getElementById("restartButton").style.display = 'none';
    document.getElementById("leaderboardArea").style.display = 'none'; // Hide leaderboard area when game starts
}

// Game Over
function gameOver() {
    clearInterval(gameInterval);
    alert(`Game Over! You got ${correctAnswers} correct answers.`);
    saveScore();
    displayLeaderboard();  // Show leaderboard
    document.getElementById("restartButton").style.display = 'block';
}

// Restart the game
document.getElementById("restartButton").addEventListener("click", () => {
    lives = 3;
    correctAnswers = 0;
    questionDifficulty = 1;
    snake = [{ x: 5, y: 5 }];
    apple = randomApplePosition();
    direction = 'RIGHT';
    document.getElementById("lives").textContent = lives;
    document.getElementById("correctAnswers").textContent = correctAnswers;
    document.getElementById("restartButton").style.display = 'none';
    startGame();
});

// Change direction based on key press
document.addEventListener("keydown", (e) => {
    if (e.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
    if (e.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
    if (e.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
    if (e.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
});
