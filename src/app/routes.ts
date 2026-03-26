import { createBrowserRouter } from "react-router";
import { Login } from "./components/Login";
import { Player } from "./components/Player";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/player",
    Component: Player,
  }
]);
