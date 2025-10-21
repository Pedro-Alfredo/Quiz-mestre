const startScreen = document.getElementById('start-screen');
const quizContainer = document.getElementById('quiz-container');
const endScreen = document.getElementById('end-screen');
const questionBox = document.getElementById('question');
const answersBox = document.getElementById('answers');
const nextBtn = document.getElementById('next-btn');
const scoreText = document.getElementById('score');
const finalScore = document.getElementById('final-score');
const finalMessage = document.getElementById('final-message');
const rankingList = document.getElementById('ranking-list');
const restartBtn = document.getElementById('restart-btn');
const startBtn = document.getElementById('start-btn');
const playerNameInput = document.getElementById('player-name');
const bgMusic = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
const themeToggle = document.getElementById('theme-toggle');
const correctSound = document.getElementById('correct-sound');
const wrongSound = document.getElementById('wrong-sound');

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let playerName = '';

// Iniciar quiz
startBtn.onclick = () => {
  playerName = playerNameInput.value.trim() || 'Jogador';
  startScreen.classList.add('hidden');
  quizContainer.classList.remove('hidden');
  fetchQuestions();
  bgMusic.play();
};

// Alternar música
musicToggle.onclick = () => {
  if (bgMusic.paused) {
    bgMusic.play();
  } else {
    bgMusic.pause();
  }
};

// Alternar tema
themeToggle.onclick = () => {
  document.body.classList.toggle('light');
  document.body.classList.toggle('dark');
};

// Buscar perguntas da API e traduzir
async function fetchQuestions() {
  const res = await fetch('https://opentdb.com/api.php?amount=10&category=9&type=multiple');
  const data = await res.json();
  const translated = await Promise.all(
    data.results.map(async q => {
      const question = await translateText(decodeHTML(q.question));
      const correct = await translateText(decodeHTML(q.correct_answer));
      const incorrects = await Promise.all(q.incorrect_answers.map(a => translateText(decodeHTML(a))));
      return {
        question,
        correct,
        answers: shuffle([correct, ...incorrects])
      };
    })
  );
  questions = translated;
  showQuestion();
}

function decodeHTML(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

async function translateText(text) {
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|pt`);
    const data = await res.json();
    return data.responseData.translatedText || text;
  } catch {
    return text;
  }
}

function showQuestion() {
  nextBtn.disabled = true;
  const q = questions[currentQuestionIndex];
  questionBox.textContent = q.question;
  answersBox.innerHTML = '';
  q.answers.forEach(answer => {
    const btn = document.createElement('button');
    btn.textContent = answer;
    btn.onclick = () => selectAnswer(btn, q.correct);
    answersBox.appendChild(btn);
  });
}

function selectAnswer(button, correctAnswer) {
  Array.from(answersBox.children).forEach(btn => btn.disabled = true);
  if (button.textContent === correctAnswer) {
    button.classList.add('correct');
    score++;
    correctSound.play();
  } else {
    button.classList.add('wrong');
    wrongSound.play();
  }
  scoreText.textContent = `Pontuação: ${score}`;
  nextBtn.disabled = false;
}

nextBtn.onclick = () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) showQuestion();
  else endQuiz();
};

function endQuiz() {
  quizContainer.classList.add('hidden');
  endScreen.classList.remove('hidden');
  finalScore.textContent = `${playerName}, acertaste ${score} de ${questions.length} perguntas!`;

  const ratio = score / questions.length;
  if (ratio === 1) finalMessage.textContent = "Perfeito! És um génio! 🧠";
  else if (ratio >= 0.7) finalMessage.textContent = "Excelente trabalho! 💪";
  else if (ratio >= 0.4) finalMessage.textContent = "Bom esforço! Continua a praticar. 🙂";
  else finalMessage.textContent = "Precisas treinar mais. 😅";

  saveScore();
  renderRanking();
}

restartBtn.onclick = () => {
  score = 0;
  currentQuestionIndex = 0;
  endScreen.classList.add('hidden');
  quizContainer.classList.remove('hidden');
  scoreText.textContent = 'Pontuação: 0';
  fetchQuestions();
};

function saveScore() {
  const ranking = JSON.parse(localStorage.getItem('quizRanking')) || [];
  ranking.push({ name: playerName, score, date: new Date().toLocaleString() });
  ranking.sort((a, b) => b.score - a.score);
  localStorage.setItem('quizRanking', JSON.stringify(ranking.slice(0, 5)));
}

function renderRanking() {
  const ranking = JSON.parse(localStorage.getItem('quizRanking')) || [];
  rankingList.innerHTML = '';
  ranking.forEach(r => {
    const li = document.createElement('li');
    li.textContent = `${r.name}: ${r.score} pontos (${r.date})`;
    rankingList.appendChild(li);
  });
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}
