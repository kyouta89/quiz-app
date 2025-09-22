// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDybPVVNsPQ7uOmJCFOKbvawkvxiGgFDC4",
  authDomain: "quiz-app-44460.firebaseapp.com",
  projectId: "quiz-app-44460",
  storageBucket: "quiz-app-44460.firebasestorage.app",
  messagingSenderId: "144465216665",
  appId: "1:144465216665:web:76ba9c93b50852ad6a6408",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- グローバル変数 ---
let quizData = [];
let currentQuiz = 0;
let score = 0;
let isAnswerSubmitted = false;

// --- HTMLの要素を取得 ---
const quizContainer = document.getElementById("quiz-container");
const resultView = document.getElementById("result-view");
const progressText = document.getElementById("progress-text");
const progressBarActual = document.getElementById("progress-bar-actual");
const questionEl = document.getElementById("question");
const subTextEl = document.getElementById("sub-text");
const answersContainer = document.getElementById("answers");
const submitBtn = document.getElementById("submit-btn");
const resultMessage = document.getElementById("result-message");
const commentInput = document.getElementById("comment-input");
const commentSubmitBtn = document.getElementById("comment-submit-btn");
const submitStatus = document.getElementById("submit-status");
const commentTimeline = document.getElementById("comment-timeline");

// --- 関数の定義 ---
async function startApp() {
  try {
    const snapshot = await db.collection("quizzes").get();
    snapshot.forEach((doc) => {
      quizData.push(doc.data());
    });

    console.log("Firebaseから取得したデータ:", quizData);

    loadQuiz();
  } catch (error) {
    console.error("Error fetching quizzes: ", error);
    questionEl.innerText = "クイズの読み込みに失敗しました。";
  }
}

function displayComments(questionIndex) {
  const timelineKey = `quiz_timeline_${questionIndex}`;
  const savedTimeline = localStorage.getItem(timelineKey);
  const comments = savedTimeline ? JSON.parse(savedTimeline) : [];
  commentTimeline.innerHTML = "";
  if (comments.length === 0) {
    commentTimeline.innerHTML = `<p style="color: #999; font-size: 12px; text-align: center;">まだコメントはありません。</p>`;
    return;
  }
  comments.forEach((comment) => {
    const entryDiv = document.createElement("div");
    entryDiv.classList.add("comment-entry");
    const textP = document.createElement("p");
    textP.classList.add("comment-text");
    textP.innerText = comment.text;
    const timeSpan = document.createElement("span");
    timeSpan.classList.add("comment-timestamp");
    const formattedDate = new Date(comment.timestamp).toLocaleString("ja-JP");
    timeSpan.innerText = formattedDate;
    entryDiv.appendChild(textP);
    entryDiv.appendChild(timeSpan);
    commentTimeline.appendChild(entryDiv);
  });
}

function loadQuiz() {
  isAnswerSubmitted = false;
  resultView.classList.add("hidden");
  answersContainer.classList.remove("disabled");
  submitBtn.disabled = false;
  submitBtn.innerText = "SUBMIT ANSWER";
  commentInput.value = "";
  submitStatus.innerText = "";
  commentTimeline.innerHTML = "";
  const currentQuizData = quizData[currentQuiz];
  progressText.innerText = `QUESTION ${currentQuiz + 1} OF ${quizData.length}`;
  progressBarActual.style.width = `${
    ((currentQuiz + 1) / quizData.length) * 100
  }%`;
  questionEl.innerText = currentQuizData.question;
  subTextEl.innerText = currentQuizData.subText;
  answersContainer.innerHTML = "";
  currentQuizData.answers.forEach((answerText) => {
    const answerDiv = document.createElement("div");
    answerDiv.classList.add("answer-option");
    answerDiv.innerText = answerText;
    answerDiv.addEventListener("click", () => {
      answerDiv.classList.toggle("selected");
    });
    answersContainer.appendChild(answerDiv);
  });
}

function showResults() {
  quizContainer.innerHTML = `
        <h2 style="text-align: center;">クイズ終了！</h2>
        <h3 style="text-align: center;">あなたのスコアは ${score} / ${quizData.length} 問正解です。</h3>
        <button id="submit-btn" onclick="location.reload()">もう一度挑戦する</button>
    `;
}

// --- イベントリスナーの設定 ---
submitBtn.addEventListener("click", () => {
  if (isAnswerSubmitted) {
    currentQuiz++;
    if (currentQuiz < quizData.length) {
      loadQuiz();
    } else {
      showResults();
    }
  } else {
    const selectedAnswers = document.querySelectorAll(
      ".answer-option.selected"
    );
    if (selectedAnswers.length === 0) {
      alert("回答を選択してください。");
      return;
    }
    answersContainer.classList.add("disabled");

    // ▼▼▼ ここを修正！ .trim() を追加 ▼▼▼
    const selectedTexts = Array.from(selectedAnswers).map((el) =>
      el.innerText.trim()
    );
    const correctAnswers = quizData[currentQuiz].correct;

    const isCorrect =
      selectedTexts.length === correctAnswers.length &&
      [...selectedTexts].sort().join(",") ===
        [...correctAnswers].sort().join(",");

    if (isCorrect) {
      score++;
      resultMessage.innerText = "正解！";
      resultMessage.style.color = "#28a745";
    } else {
      resultMessage.innerText = "不正解…";
      resultMessage.style.color = "#dc3545";
    }
    const allAnswerOptions = document.querySelectorAll(".answer-option");
    allAnswerOptions.forEach((option) => {
      const answerText = option.innerText;
      if (correctAnswers.includes(answerText)) {
        option.classList.add("correct-answer");
      }
      if (
        option.classList.contains("selected") &&
        !correctAnswers.includes(answerText)
      ) {
        option.classList.add("incorrect-answer");
      }
    });
    displayComments(currentQuiz);
    resultView.classList.remove("hidden");
    isAnswerSubmitted = true;
    submitBtn.innerText = "NEXT QUESTION";
  }
});

commentSubmitBtn.addEventListener("click", () => {
  const commentText = commentInput.value.trim();
  if (commentText === "") return;
  const timelineKey = `quiz_timeline_${currentQuiz}`;
  const savedTimeline = localStorage.getItem(timelineKey);
  const comments = savedTimeline ? JSON.parse(savedTimeline) : [];
  const newComment = {
    text: commentText,
    timestamp: new Date().toISOString(),
  };
  comments.push(newComment);
  localStorage.setItem(timelineKey, JSON.stringify(comments));
  commentInput.value = "";
  displayComments(currentQuiz);
  submitStatus.innerText = "コメントが追加されました！";
  setTimeout(() => {
    submitStatus.innerText = "";
  }, 2000);
});

// --- 初期化処理 ---
startApp();
