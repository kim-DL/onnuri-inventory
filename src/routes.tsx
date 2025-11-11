import { Navigate, createBrowserRouter } from "react-router-dom";
import App from "./App";
import Protected from "./components/Protected";
import Login from "./pages/Login";
import ProductsList from "./pages/ProductsList";
import ProductDetail from "./pages/ProductDetail";
import ProductCreate from "./pages/ProductCreate";
import TxnForm from "./pages/TxnForm";
import Admin from "./pages/Admin";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <Protected />,
    children: [
      {
        element: <App />,
        children: [
          { index: true, element: <Navigate to="products" replace /> },
          { path: "products", element: <ProductsList /> },
          { path: "products/create", element: <ProductCreate /> },
          { path: "products/:id", element: <ProductDetail /> },
          { path: "inbound", element: <TxnForm mode="in" /> },
          { path: "outbound", element: <TxnForm mode="out" /> },
          { path: "adjust", element: <TxnForm mode="adj" /> },
          {
            element: <Protected roles={["admin"]} />,
            children: [{ path: "admin", element: <Admin /> }],
          },
        ],
      },
    ],
  },
]);
