const questionBox = document.getElementById('question');
const answersBox = document.getElementById('answers');
const nextBtn = document.getElementById('next-btn');
const scoreText = document.getElementById('score');
const endScreen = document.getElementById('end-screen');
const finalScore = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

const correctSound = document.getElementById('correct-sound');
const wrongSound = document.getElementById('wrong-sound');

let currentQuestionIndex = 0;
let score = 0;
let questions = [];

// Função de tradução usando a API gratuita MyMemory
async function translateText(text) {
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|pt`);
    const data = await res.json();
    return data.responseData.translatedText || text;
  } catch {
    return text;
  }
}

async function fetchQuestions() {
  const res = await fetch('https://opentdb.com/api.php?amount=10&category=9&type=multiple');
  const data = await res.json();

  // Traduz perguntas e respostas
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
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    endQuiz();
  }
};

function endQuiz() {
  document.getElementById('quiz-container').classList.add('hidden');
  endScreen.classList.remove('hidden');
  finalScore.textContent = `Acertaste ${score} de ${questions.length} perguntas!`;
}

restartBtn.onclick = () => {
  score = 0;
  currentQuestionIndex = 0;
  endScreen.classList.add('hidden');
  document.getElementById('quiz-container').classList.remove('hidden');
  scoreText.textContent = 'Pontuação: 0';
  fetchQuestions();
};

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Inicia o quiz
fetchQuestions();
