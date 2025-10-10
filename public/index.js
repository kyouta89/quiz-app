// ServiceNowボタンがクリックされたときの処理
const servicenowBtn = document.getElementById("servicenow-btn");

servicenowBtn.addEventListener("click", () => {
  // 1. ユーザーの選択をlocalStorageに保存する
  localStorage.setItem("selectedPlatform", "ServiceNow");

  // 2. 次のページ（資格選択画面）に移動する
  window.location.href = "certification.html";
});
