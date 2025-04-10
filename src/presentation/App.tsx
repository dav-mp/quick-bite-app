// App.tsx
import React from "react";
// import { Provider } from "react-redux";

// import { store } from "../app/infrastructure/store";  // tu store de Redux (por ej.)
import { AppRouter } from "./routes/AppRouter";       // tu router principal

export const App: React.FC = () => {
  return (
    // <Provider store={store}>
        <AppRouter />
    // </Provider>
  );
};
