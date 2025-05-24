# Dify API WrapperDify のチャットボット API をラップし、Vercel にデプロイするためのサーバーレス API です。## 機能- ✅ Dify のチャット機能を簡単に統合- ✅ テキスト生成機能をサポート- ✅ CORS 対応でフロントエンドから直接利用可能- ✅ 環境変数による設定管理- ✅ エラーハンドリングとログ出力- ✅ ヘルスチェック機能- ✅ **TypeScript で型安全性を提供**- ✅ **包括的な型定義と IntelliSense サポート**

## 🚀 デプロイ手順

### 1. Vercel にデプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/dify-api-wrapper)

または手動でデプロイ：

```bash
# レポジトリをクローン
git clone https://github.com/yourusername/dify-api-wrapper.git
cd dify-api-wrapper

# 依存関係をインストール
npm install

# Vercel CLIでデプロイ
npx vercel --prod
```

### 2. 環境変数の設定

Vercel のダッシュボードで以下の環境変数を設定：

```bash
DIFY_API_KEY=your_dify_api_key_here
DIFY_BASE_URL=https://api.dify.ai
```

**環境変数の取得方法：**

1. [Dify](https://dify.ai)にログイン
2. アプリケーションを選択
3. 左メニューの「API Access」をクリック
4. API キーを生成・コピー

## 📚 API エンドポイント

### チャット API

```
POST /api/chat
```

**リクエスト例：**

```json
{
    "message": "こんにちは、調子はどうですか？",
    "conversation_id": "1c7e55fb-1ba2-4e10-81b5-30addcea2276",
    "user_id": "user123"
}
```

**レスポンス例：**

```json
{
    "success": true,
    "data": {
        "message": "こんにちは！調子は良いです、ありがとうございます。",
        "conversation_id": "1c7e55fb-1ba2-4e10-81b5-30addcea2276",
        "message_id": "msg-abc123",
        "created_at": 1704067200,
        "metadata": {
            "model": "gpt-3.5-turbo",
            "tokens": 25
        }
    }
}
```

### テキスト生成 API

```
POST /api/completion
```

**リクエスト例：**

```json
{
    "inputs": {
        "text": "AIについての短い物語を書いて"
    },
    "user_id": "user123",
    "response_mode": "blocking"
}
```

### ヘルスチェック API

```
GET /api/health
```

**レスポンス例：**

```json
{
    "status": "healthy",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "version": "1.0.0",
    "endpoints": {
        "chat": "/api/chat",
        "completion": "/api/completion",
        "health": "/api/health"
    },
    "configuration": {
        "dify_base_url": "https://api.dify.ai",
        "api_key_configured": true,
        "node_version": "v18.17.0",
        "environment": "production"
    }
}
```

## 🛠️ 開発・テスト

### ローカル開発

```bash
# 依存関係をインストール
npm install

# 環境変数を設定（.env ファイルを作成）
cp env.example .env
# .env ファイルを編集してDIFY_API_KEYを設定

# ローカルサーバーを起動
npm run dev
```

### API テスト例（curl）

```bash
# ヘルスチェック
curl https://your-deployment-url.vercel.app/api/health

# チャット
curl -X POST https://your-deployment-url.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'

# テキスト生成
curl -X POST https://your-deployment-url.vercel.app/api/completion \
  -H "Content-Type: application/json" \
  -d '{"inputs": {"text": "Write a haiku about technology"}}'
```

### JavaScript での利用例

```javascript
// チャット機能
async function sendMessage(message, conversationId = null) {
    const response = await fetch(
        "https://your-deployment-url.vercel.app/api/chat",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: message,
                conversation_id: conversationId,
                user_id: "user123",
            }),
        }
    );

    const data = await response.json();
    return data;
}

// 使用例
sendMessage("こんにちは！")
    .then((response) => {
        console.log("AI回答:", response.data.message);
        console.log("会話ID:", response.data.conversation_id);
    })
    .catch((error) => {
        console.error("エラー:", error);
    });
```

## 🔧 設定オプション

### 環境変数

| 変数名          | 必須 | デフォルト値          | 説明              |
| --------------- | ---- | --------------------- | ----------------- |
| `DIFY_API_KEY`  | ✅   | -                     | Dify の API キー  |
| `DIFY_BASE_URL` | ❌   | `https://api.dify.ai` | Dify のベース URL |

## 📝 注意事項

-   API キーは必ず Vercel の環境変数として設定し、コードに直接記述しないでください
-   レート制限がある場合があります。Dify の利用規約を確認してください
-   本番環境では適切な認証・認可機能の追加を検討してください

## 🤝 貢献

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 🔗 関連リンク

-   [Dify 公式サイト](https://dify.ai)
-   [Dify API ドキュメント](https://docs.dify.ai/guides/application-publishing/developing-with-apis)
-   [Vercel ドキュメント](https://vercel.com/docs)
