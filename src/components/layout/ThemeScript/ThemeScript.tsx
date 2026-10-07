"use client";

import { useSyncExternalStore } from "react";

export const THEME_STORAGE_KEY = "keyterminus-theme";

export const THEME_INIT = `(function(){try{var d=document.documentElement;var t=null;try{t=localStorage.getItem("${THEME_STORAGE_KEY}")}catch(e){}if(t!=="light"&&t!=="dark"){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}d.setAttribute("data-theme",t);d.classList.toggle("dark",t==="dark")}catch(e){}})();`;

const subscribe = () => () => {};

export function ThemeScript() {
  const fromServer = useSyncExternalStore(subscribe, () => false, () => true);
  if (!fromServer) return null;
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />;
}
