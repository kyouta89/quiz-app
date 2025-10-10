// 前のページまでの選択内容を確認
const selectedPlatform = localStorage.getItem("selectedPlatform");
const selectedCertification = localStorage.getItem("selectedCertification");

// もし情報が欠けていたら、スタートページに戻す
if (!selectedPlatform || !selectedCertification) {
  alert(
    "プラットフォームまたは資格が選択されていません。最初のページに戻ります。"
  );
  window.location.href = "start.html";
}

// 「一問一答」ボタンがクリックされたときの処理
const sequentialBtn = document.getElementById("sequential-btn");

sequentialBtn.addEventListener("click", () => {
  // 1. ユーザーの選択をlocalStorageに保存する
  localStorage.setItem("selectedMode", "sequential");

  // 2. 次のページ（問題一覧画面）に移動する
  window.location.href = "list.html";
});
