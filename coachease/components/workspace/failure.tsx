"use client";
import s from "./workspace.module.css";
export default function WorkspaceFailure({ reset }: { reset: () => void }) {
  return <main className={s.page}><header className={s.pageHeader}><div><h1>Could not load this page</h1><p>Your workspace is temporarily unavailable. Check your connection and try again.</p></div></header><button type="button" className={s.primary} onClick={reset}>Try again</button></main>;
}
