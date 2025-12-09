"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { Toaster } from "@/components/ui/sonner";
import TopProgressBar from "@/components/shared/top-progress-bar";
import ScrollToTopButton from "@/components/shared/scroll-to-top-button";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <TopProgressBar />
      {children}
      <ScrollToTopButton />
      <Toaster />
    </Provider>
  );
}
