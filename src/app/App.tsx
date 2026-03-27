import { RouterProvider } from "react-router";
import { router } from "./routes";
import useNavigation from "./hook/use-navigation";

export default function App() {

  useNavigation()
  
  return <RouterProvider router={router} />;
}
