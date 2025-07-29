# 【React & TypeScript】localStorageを使って作る！メモ帳アプリ開発チュートリアル (016)

## 🚀 はじめに (The "Why")

こんにちは！このチュートリアルでは、ReactとTypeScriptを使い、ブラウザを閉じても内容が消えないシンプルなメモ帳アプリを開発します。

**完成形のイメージ:**
![メモ帳アプリの完成イメージ](https://i.imgur.com/V3Z7Q0f.gif)

このアプリ開発を通して、あなたはただのメモ帳を作るだけではありません。Webアプリケーションに**永続性**を持たせるための重要な技術、`localStorage`の使い方をマスターします。なぜこの技術が重要なのでしょうか？ユーザーが入力した情報や設定が、ページを再読み込みしただけで消えてしまったら、とても不便ですよね。`localStorage`を学ぶことで、ユーザー体験を格段に向上させる「状態の保存」を実装できるようになります。

さらに、Reactの基本的なHooksである`useState`や`useEffect`の理解を深め、より実践的な使い方を学びます。最終的には、このロジックを再利用可能な**カスタムHook** (`useLocalStorage`) に切り出すことで、プロフェッショナルなコードの書き方にも触れていきます。

さあ、準備はいいですか？一緒に開発を始めましょう！

---

## 🛠 環境構築 (公式ドキュメント完全準拠)

まず、開発環境をセットアップします。ここでは、モダンなフロントエンド開発で人気のツール`Vite`を使用します。`shadcn/ui`の公式ドキュメントに沿って、一字一句正確に進めていきましょう。

### 1. Viteプロジェクトの作成

ターミナルを開き、以下のコマンドを実行して、React + TypeScriptのプロジェクトを新規作成します。

```bash
npm create vite@latest my-notepad-app -- --template react-ts
cd my-notepad-app
```

### 2. Tailwind CSSの導入

次に、UIのスタイリングのためにTailwind CSSを導入します。

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

`tailwind.config.js`ファイルが生成されるので、以下のように設定します。

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

`src/index.css`の中身を、Tailwind CSSのディレクティブに置き換えます。

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3. shadcn/ui のセットアップ

コンポーネントライブラリ`shadcn/ui`をセットアップします。まず、パスエイリアスを設定するために`tsconfig.json`を編集します。

```json
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
  },
  // ...
}
```

次に、`vite.config.ts`を更新して、Viteがパスエイリアスを解決できるようにします。

```bash
npm install -D @types/node
```

```typescript
// vite.config.ts
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

最後に、`shadcn/ui`の初期化コマンドを実行します。

```bash
npx shadcn-ui@latest init
```

いくつかの質問が表示されますので、以下のように答えてください。（内容は好みに合わせて変更してOKです）

```
Would you like to use TypeScript (recommended)? yes
Which style would you like to use? › Default
Which color would you like to use as base color? › Slate
Where is your global CSS file? › › src/index.css
Do you want to use CSS variables for colors? › yes
Where is your tailwind.config.js located? › tailwind.config.js
Configure import alias for components: › @/components
Configure import alias for utils: › @/lib/utils
Are you using React Server Components? › no
```

これで、コンポーネントを追加する準備が整いました。

### 4. 必要なコンポーネントの追加

今回は、テキストエリアとラベルを使用します。

```bash
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add label
```

以上で環境構築は完了です！`npm run dev`を実行して、開発サーバーを起動しましょう。

---

## 🧠 思考を促す開発ステップ

ここからは、実際にメモ帳アプリの機能を実装していきます。完成コードをただコピーするのではなく、`// TODO:`コメントをヒントに、あなた自身で考えながら進めてみましょう。

### Step 1: 基本的なUIの作成

まずは、メモを入力するためのUIを`App.tsx`に作成します。

```tsx
// src/App.tsx
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-6 text-center">永続メモ帳</h1>
        <div className="grid w-full gap-2">
          <Label htmlFor="message" className="text-lg">あなたのメモ</Label>
          {/* TODO: ここにshadcn/uiのTextareaコンポーネントを配置しましょう */}
          {/* ヒント: placeholderプロパティで「ここにメモを入力...」と表示してみましょう */}
        </div>
      </div>
    </div>
  )
}

export default App
```

### Step 2: `useState`でメモの状態を管理する

ユーザーが入力したテキストを、Reactのコンポーネント内で保持する必要があります。ここで登場するのが`useState`です。

```tsx
// src/App.tsx
import { useState } from "react" // 忘れずにimport！
import { Textarea } from "@/components/ui/textarea"
// ... (他のimport)

function App() {
  // TODO: メモの文字列を保持するためのstate（状態）をuseStateを使って定義しましょう。
  // ヒント: const [memo, setMemo] = useState<string>(''); のような形になります。

  const handleMemoChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    // TODO: Textareaの値が変わるたびに、上で定義したstateを更新する処理を書きましょう。
    // ヒント: event.target.value に入力されたテキストが入っています。
  };

  return (
    <div className="min-h-screen ...">
      {/* ... */}
      <Textarea
        placeholder="ここにメモを入力..."
        id="message"
        className="h-64 bg-gray-800 border-gray-700 text-white"
        // TODO: valueとonChangeプロパティをstateと連携させましょう。
      />
      {/* ... */}
    </div>
  )
}
```

### Step 3: `useEffect`で初回読み込み時に`localStorage`からデータを復元する

いよいよ`localStorage`の登場です。コンポーネントが最初に表示されたとき（マウント時）に、`localStorage`に保存されているデータを探し、あればそれを`state`にセットします。この「特定のタイミングで処理を実行する」のが`useEffect`の役割です。

```tsx
// src/App.tsx
import { useState, useEffect } from "react" // useEffectをimport！
// ...

function App() {
  const [memo, setMemo] = useState<string>('');

  // TODO: useEffectを使って、コンポーネントがマウントされた時に一度だけ実行される処理を書きましょう。
  // ヒント: useEffect(() => { ... }, []); のように、第二引数に空の配列を渡します。

  useEffect(() => {
    // --- この中を実装 ---
    // TODO: localStorageから 'my-memo' というキーで保存された値を取得してみましょう。
    // ヒント: const savedMemo = localStorage.getItem('my-memo');

    // TODO: 取得した値が存在する場合（nullでない場合）、その値でmemoのstateを更新しましょう。
    // ヒント: if (savedMemo) { setMemo(savedMemo); }
    // --- ここまで ---
  }, []); // 空の配列は「最初の一回だけ実行する」という意味

  // ... (handleMemoChangeとreturn文は同じ)
}
```

この時点で一度ブラウザをリロードしてみてください。まだ何も保存していないので変化はありませんが、エラーが出ていないことを確認しましょう。

### Step 4: `useEffect`でメモの変更を`localStorage`に保存する

次に、ユーザーがメモを編集するたびに、その内容を`localStorage`に保存する処理を追加します。ここでも`useEffect`を使いますが、今度は「`memo`という`state`が変更されるたびに」処理を実行するようにします。

```tsx
// src/App.tsx
// ... (importは同じ)

function App() {
  const [memo, setMemo] = useState<string>('');

  // localStorageからの読み込み (Step 3で実装済み)
  useEffect(() => {
    const savedMemo = localStorage.getItem('my-memo');
    if (savedMemo) {
      setMemo(savedMemo);
    }
  }, []);

  // TODO: もう一つuseEffectを追加して、memoの内容が変更されるたびに実行される処理を書きましょう。
  // ヒント: useEffect(() => { ... }, [memo]); のように、第二引数の配列に監視したい値(memo)を入れます。

  useEffect(() => {
    // --- この中を実装 ---
    // TODO: 現在のmemoの内容を、'my-memo' というキーでlocalStorageに保存しましょう。
    // ヒント: localStorage.setItem('my-memo', memo);
    // --- ここまで ---
  }, [memo]); // [memo] は「memoが変更された時だけ実行する」という意味

  // ... (handleMemoChangeとreturn文は同じ)
}
```

これで、メモ帳の基本機能は完成です！テキストエリアに何か入力し、ブラウザをリロードしてみてください。入力した内容が復元されていれば成功です！

### Step 5: 【リファクタリング】カスタムHook `useLocalStorage` を作ろう！

`localStorage`と`useState`を組み合わせるロジックは、他の場所でも使いたくなるかもしれません。このような再利用可能なロジックは、**カスタムHook**として切り出すのがReactのベストプラクティスです。

`src/hooks`フォルダを新規作成し、その中に`useLocalStorage.ts`というファイルを作りましょう。

```ts
// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

// TODO: useStateとuseEffectのロジックをこの関数の中に移植しましょう。
// このHookは、useStateのように [値, 値を更新する関数] のペアを返すように作ります。
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Step 1: useStateを定義する
  // 初期値を設定する際、まずlocalStorageに値があるか確認し、
  // あればその値を、なければinitialValueを使うようにしましょう。
  // ヒント: useStateの初期値には関数を渡すことができます。
  // const [storedValue, setStoredValue] = useState<T>(() => { ... });
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // Step 2: useEffectを定義する
  // storedValueが変更されたら、localStorageにその値を保存するようにします。
  // ヒント: JSON.stringifyを使って値を文字列に変換してから保存しましょう。
  // localStorageは文字列しか保存できないためです。
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  // Step 3: useStateと同じ形式で値を返す
  return [storedValue, setStoredValue] as const;
}
```

そして、`App.tsx`をこのカスタムHookを使って書き換えます。驚くほどシンプルになりますよ！

```tsx
// src/App.tsx
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useLocalStorage } from "./hooks/useLocalStorage" // 作成したHookをimport

function App() {
  // TODO: useStateとuseEffectを使っていた部分を、useLocalStorageフックの呼び出しに置き換えましょう。
  const [memo, setMemo] = useLocalStorage<string>('my-memo', '');

  const handleMemoChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMemo(event.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-6 text-center">永続メモ帳 (カスタムHook版)</h1>
        <div className="grid w-full gap-2">
          <Label htmlFor="message" className="text-lg">あなたのメモ</Label>
          <Textarea
            id="message"
            placeholder="ここにメモを入力..."
            className="h-64 bg-gray-800 border-gray-700 text-white"
            value={memo}
            onChange={handleMemoChange}
          />
        </div>
        <div className="mt-4 text-sm text-gray-400">
          <p>入力内容は自動でブラウザに保存されます。</p>
        </div>
      </div>
    </div>
  )
}

export default App
```

どうでしょうか？`App.tsx`から`localStorage`に関する記述が一切なくなり、コンポーネントの見通しが非常に良くなりました。これがカスタムHookの力です。

---

## 📚 深掘りコラム (Deep Dive)

### なぜ`useEffect`の第二引数（依存配列）が重要なのか？

`useEffect`の第二引数、依存配列は、Reactのパフォーマンスとバグの防止に非常に重要です。

- **`[]` (空の配列):** Effectはコンポーネントの**初回マウント時に一度だけ**実行されます。`localStorage`からのデータ読み込みや、初期設定のAPI呼び出しなどに最適です。
- **`[value]` (値を含む配列):** Effectは初回マウント時に加え、**`value`が変更されるたびに**実行されます。今回の例では、`[memo]`と指定することで、ユーザーがメモを更新するたびに保存処理が走るようにしました。
- **指定しない:** Effectは**毎回のレンダリング後**に実行されます。これは意図しない無限ループを引き起こす原因になりやすいため、通常は避けるべきです。例えば、Effect内で`state`を更新すると、「更新→再レンダリング→Effect実行→更新...」というループに陥ります。

依存配列を正しく理解し、設定することが`useEffect`を使いこなす鍵となります。

---

## 🔥 挑戦課題 (Challenges)

このチュートリアルで学んだ知識を応用して、さらに機能を追加してみましょう！

- **Easy 難易度: "保存しました"通知機能**
  - メモが`localStorage`に保存された直後に、「保存しました！」というメッセージを2秒間だけ表示する機能を追加してみましょう。
  - ヒント: `setTimeout`と、通知の表示状態を管理する新しい`useState`を使います。

- **Medium 難易度: 複数メモの管理機能**
  - 現在は一つのメモしか保存できません。複数のメモをリストで管理し、新規作成、選択、削除ができるように拡張してみましょう。
  - ヒント: `localStorage`に保存するデータを、文字列からオブジェクトの配列（例: `[{id: 1, content: '...'}, {id: 2, content: '...'}]`）に変更する必要があります。`JSON.stringify`と`JSON.parse`がさらに重要になります。

- **Hard 難易度: パフォーマンス改善（デバウンス）**
  - 現在の実装では、一文字入力するたびに`localStorage`への書き込みが発生します。これではパフォーマンスに影響が出る可能性があります。
  - ユーザーの入力が500ミリ秒間止まったら初めて保存処理が実行されるように、「デバウンス(debounce)」というテクニックを実装してみましょう。
  - ヒント: `setTimeout`と`clearTimeout`を組み合わせることで実現できます。これを`useDebounce`という別のカスタムHookとして実装すると、さらに学びが深まります。

---

## ✅ 結論

お疲れ様でした！このチュートリアルを通して、あなたは以下のことを学びました。

- `localStorage`を使ったデータの永続化
- `useState`と`useEffect`の実践的な使い方
- `useEffect`の依存配列の重要性
- ロジックを再利用可能にするための**カスタムHook**の作成方法

これらのスキルは、今後のReact開発において間違いなくあなたの武器になります。ぜひ、挑戦課題にも取り組んでみてください。

Happy Coding!
