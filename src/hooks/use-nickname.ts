import { useState, useCallback } from "react";

const STORAGE_KEY = "kekonmange_nickname";

export function useNickname() {
  const [nickname, setNicknameState] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) || ""
  );

  const setNickname = useCallback((name: string) => {
    const trimmed = name.trim();
    localStorage.setItem(STORAGE_KEY, trimmed);
    setNicknameState(trimmed);
  }, []);

  return { nickname, setNickname, hasNickname: nickname.length > 0 };
}
