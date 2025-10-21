const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const playerNameInput = document.getElementById('playerName');
const startBtn = document.getElementById('startBtn');
const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const scoreEl = document.getElementById('score');
const nextBtn = document.getElementById('next-btn');
const musicBtn = document.getElementById('music-btn');
const themeToggle = document.getElementById('theme-toggle');

let playerName = '';
let currentQuestion = {};
let score = 0;
let music = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_fecf42f9a7.mp3?filename=gaming-music-loop-112191.mp3');
music.loop = true;

startBtn.onclick = () => {
  playerName = playerNameInput.value.trim();
  if (!playerName) return alert('Por favor, escreve o teu nome.');
  startScreen.classList.remove('active');
  quizScreen.classList.add('active');
  loadQuestion();
};

musicBtn.onclick = () => {
  if (music.paused) music.play(); else music.pause();
};

themeToggle.onclick = () => {
  document.body.classList.toggle('light-mode');
};

nextBtn.onclick = () => {
  loadQuestion();
};

async function loadQuestion() {
  answersEl.innerHTML = 'Carregando...';
  const res = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');
  const data = await res.json();
  currentQuestion = data.results[0];
  showQuestion();
}

function showQuestion() {
  const q = currentQuestion;
  questionEl.innerHTML = decodeHTML(q.question);
  const options = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);
  answersEl.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = decodeHTML(opt);
    btn.onclick = () => checkAnswer(opt === q.correct_answer);
    answersEl.appendChild(btn);
  });
}

function checkAnswer(correct) {
  if (correct) score += 1;
  scoreEl.textContent = 'Pontuação: ' + score;
  saveRanking();
  loadQuestion();
}

function decodeHTML(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

function saveRanking() {
  const ranking = JSON.parse(localStorage.getItem('ranking') || '[]');
  ranking.push({ name: playerName, score: score, date: new Date().toLocaleString() });
  localStorage.setItem('ranking', JSON.stringify(ranking));
}
