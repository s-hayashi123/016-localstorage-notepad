import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [memo, setMemo] = useState("");

  const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMemo(e.target.value);
  };

  useEffect(() => {
    const savedMemo = localStorage.getItem("my-memo");
    if (savedMemo) setMemo(savedMemo);
  }, []);

  useEffect(() => {
    localStorage.setItem("my-memo", memo);
  }, [memo]);
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-6 text-center">永続メモ帳</h1>
        <div className="grid w-full gap-2">
          <Label htmlFor="message" className="text-lg">
            あなたのメモ
          </Label>
          {/* TODO: ここにshadcn/uiのTextareaコンポーネントを配置しましょう */}
          <Textarea
            placeholder="ここにメモを入力..."
            id="message"
            className="h-64 bg-gray-800 border-gray-700 tet-white"
            value={memo}
            onChange={handleMemoChange}
          />
          {/* ヒント: placeholderプロパティで「ここにメモを入力...」と表示してみましょう */}
        </div>
      </div>
    </div>
  );
}

export default App;
