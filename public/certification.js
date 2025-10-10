// ページが読み込まれたときに、どのプラットフォームが選ばれたかを確認
const selectedPlatform = localStorage.getItem("selectedPlatform");

// もし前のページでServiceNowが選ばれていなければ、スタートページに戻す（エラー防止）
if (selectedPlatform !== "ServiceNow") {
  alert("プラットフォームが選択されていません。最初のページに戻ります。");
  window.location.href = "start.html";
}

// CSAボタンがクリックされたときの処理
const csaBtn = document.getElementById("csa-btn");

csaBtn.addEventListener("click", () => {
  // 1. ユーザーの選択をlocalStorageに保存する
  localStorage.setItem("selectedCertification", "CSA");

  // 2. 次のページ（回答方法選択画面）に移動する
  window.location.href = "mode.html";
});
