import { useCallback } from "react";
import { useNavigate } from "react-router";
import { type SaveResult, useDiary } from "./diary-context";

/** 「保存」。保存できたら一覧へ戻る。画面のボタンと AI の層が同じものを使う */
export function useSaveEntry(): () => SaveResult {
  const { save } = useDiary();
  const navigate = useNavigate();
  return useCallback(() => {
    const result = save();
    if (result.ok) navigate("/");
    return result;
  }, [save, navigate]);
}
