# Firebase製 資格クイズアプリ

ServiceNowの資格 (CSA) 取得を目的とした、Webクイズアプリです。
Firebase (Hosting / Firestore) を使用して構築されています。


## ✨ 主な機能

* **Firebase連携**: Firestoreデータベースから問題とコメントを動的に読み込みます。
* **クイズ選択**: プラットフォーム (ServiceNow) → 資格 (CSA) → モード を順番に選択します。
* **問題一覧**: 取得した問題が一覧表示され、好きな問題からスタートできます。
* **一問一答クイズ**: プログレスバー付きのクイズ画面で、回答と採点（複数選択対応）ができます。
* **コメント機能**: 各問題ごとに、Firebaseと連携したコメントタイムラインがあり、匿名でコメントを投稿・閲覧できます。

## 🚀 使い方 (画面フロー)

1.  `index.html`: プラットフォームを選択
2.  `certification.html`: 資格を選択
3.  `mode.html`: 回答モードを選択
4.  `list.html`: 問題一覧から開始する問題を選択
5.  `quiz.html`: クイズ開始

## 🔧 セットアップ (Firebase)

1.  Firebaseプロジェクトを作成します (このリポジトリのデフォルトは `quiz-app-44460` です)。
2.  Firebase Hosting を有効にします。
3.  Firestore Database を有効にし、`quizzes` と `comments` コレクションを作成します。
4.  （※詳細は後述の「セキュリティ対応」を参照）
5.  `firebase deploy` コマンドでホスティングにデプロイします。
