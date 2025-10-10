// ===== Firebaseの接続設定 =====
// 以前script.jsに書いたものと同じものをここに持ってくる
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

// ===== メインの処理 =====

// HTML要素を取得
const listDescription = document.getElementById("list-description");
const loadingMessage = document.getElementById("loading-message");
const questionListContainer = document.getElementById("question-list");

// localStorageからユーザーの選択を取得
const selectedPlatform = localStorage.getItem("selectedPlatform");
const selectedCertification = localStorage.getItem("selectedCertification");

// データベースから問題を取得して表示する非同期関数
async function fetchAndDisplayQuestions() {
  // もし情報がなければ、スタートページに戻す
  if (!selectedPlatform || !selectedCertification) {
    alert("情報が不足しています。最初のページに戻ります。");
    window.location.href = "start.html";
    return;
  }

  listDescription.innerText = `${selectedPlatform} / ${selectedCertification} の問題一覧`;

  try {
    // Firestoreに問い合わせ（クエリ）て、条件に合う問題を取得
    const snapshot = await db
      .collection("quizzes")
      .where("platform", "==", selectedPlatform)
      .where("certification", "==", selectedCertification)
      .get();

    const questions = [];
    snapshot.forEach((doc) => {
      // ドキュメントIDも一緒に保存しておくのがポイント
      questions.push({ id: doc.id, ...doc.data() });
    });

    loadingMessage.style.display = "none"; // 読み込みメッセージを非表示

    // 取得した問題をリストとして画面に表示
    questions.forEach((question, index) => {
      const listItem = document.createElement("a"); // クリックできるようにaタグを使う
      listItem.href = "quiz.html"; // クリックしたらクイズページへ
      listItem.classList.add("list-item");
      listItem.innerText = `${index + 1}. ${question.question}`;

      // data属性に、何番目の問題か（インデックス）を保存しておく
      listItem.dataset.index = index;

      questionListContainer.appendChild(listItem);
    });
  } catch (error) {
    console.error("問題の読み込みに失敗しました:", error);
    loadingMessage.innerText =
      "問題の読み込みに失敗しました。Firebaseのインデックス設定を確認してください。";
  }
}

// 問題リストの項目がクリックされたときの処理
questionListContainer.addEventListener("click", (event) => {
  // クリックされたのがリスト項目でなければ何もしない
  if (!event.target.classList.contains("list-item")) {
    return;
  }

  // デフォルトのページ遷移を一旦止める
  event.preventDefault();

  // data属性から、クリックされた問題のインデックスを取得
  const startIndex = event.target.dataset.index;

  // クイズを何問目から始めるかをlocalStorageに保存
  localStorage.setItem("startQuizIndex", startIndex);

  // クイズページに移動
  window.location.href = "quiz.html";
});

// ===== 実行 =====
fetchAndDisplayQuestions();
