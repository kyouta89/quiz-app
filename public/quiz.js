// ===== Firebaseの接続設定 =====
const firebaseConfig = {
  apiKey: "AIzaSyDybPVVNsPQ7uOmJCFOKbvawkvxiGgFDC4",
  authDomain: "quiz-app-44460.firebaseapp.com",
  projectId: "quiz-app-44460",
  storageBucket: "quiz-app-44460.firebasestorage.app",
  messagingSenderId: "144465216665",
  appId: "1:144465216665:web:76ba9c93b5085222d6a6408",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ===== グローバル変数 =====
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

// ===== アプリの起動処理 =====

async function startApp() {
  // 1. localStorageからユーザーの選択を取得
  const selectedPlatform = localStorage.getItem("selectedPlatform");
  const selectedCertification = localStorage.getItem("selectedCertification");

  // もし情報がなければ、スタートページに戻す
  if (!selectedPlatform || !selectedCertification) {
    alert("情報が不足しています。最初のページからやり直してください。");
    window.location.href = "start.html";
    return;
  }

  try {
    // 2. 選択された条件でFirebaseから問題を取得
    const snapshot = await db
      .collection("quizzes")
      .where("platform", "==", selectedPlatform)
      .where("certification", "==", selectedCertification)
      .get();

    snapshot.forEach((doc) => {
      quizData.push({ id: doc.id, ...doc.data() });
    });

    // 3. 何問目から始めるかを決定
    const startIndex = localStorage.getItem("startQuizIndex");
    if (startIndex) {
      currentQuiz = parseInt(startIndex, 10); // 文字列を数値に変換
      localStorage.removeItem("startQuizIndex"); // 一度使ったら消しておく
    } else {
      currentQuiz = 0; // 指定がなければ最初から
    }

    loadQuiz(); // 準備ができたので、指定された問題からクイズを開始
  } catch (error) {
    console.error("Error fetching quizzes: ", error);
    questionEl.innerText = "クイズの読み込みに失敗しました。";
  }
}

// ===== 関数の定義 =====
// (displayComments, loadQuiz, showResults, イベントリスナーのコードは
//  以前の完成版から一切変更ありません。以下にそのまま貼り付けます)

async function displayComments(questionIndex) {
  commentTimeline.innerHTML = "";
  const currentQuestion = quizData[questionIndex];
  if (!currentQuestion) return;
  const questionIdentifier = currentQuestion.id;

  try {
    const snapshot = await db
      .collection("comments")
      .where("questionId", "==", questionIdentifier)
      .orderBy("timestamp", "asc")
      .get();

    const comments = [];
    snapshot.forEach((doc) => {
      comments.push(doc.data());
    });

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
      let date = comment.timestamp ? comment.timestamp.toDate() : new Date();
      const formattedDate = date.toLocaleString("ja-JP");
      timeSpan.innerText = formattedDate;
      entryDiv.appendChild(textP);
      entryDiv.appendChild(timeSpan);
      commentTimeline.appendChild(entryDiv);
    });
  } catch (error) {
    console.error("コメントの読み込みに失敗しました:", error);
    commentTimeline.innerHTML = `<p style="color: red; font-size: 12px; text-align: center;">コメントの読み込み中にエラーが発生しました。</p>`;
  }
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

submitBtn.addEventListener("click", async () => {
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

    await displayComments(currentQuiz);
    resultView.classList.remove("hidden");
    isAnswerSubmitted = true;
    submitBtn.innerText = "NEXT QUESTION";
  }
});

commentSubmitBtn.addEventListener("click", async () => {
  const commentText = commentInput.value.trim();
  if (commentText === "") return;
  const currentQuestion = quizData[currentQuiz];
  const questionIdentifier = currentQuestion.id;
  try {
    await db.collection("comments").add({
      questionId: questionIdentifier,
      text: commentText,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
    commentInput.value = "";
    await displayComments(currentQuiz);
    submitStatus.innerText = "コメントが送信されました！";
  } catch (error) {
    console.error("コメントの送信に失敗しました:", error);
    submitStatus.innerText = "コメントの送信に失敗しました。";
  }
  setTimeout(() => {
    submitStatus.innerText = "";
  }, 2000);
});

// ===== 初期化処理 =====
startApp();
