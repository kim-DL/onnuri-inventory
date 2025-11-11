import { createBrowserRouter } from "react-router-dom";
import App from "./App";

const Placeholder = ({ text }: { text: string }) => (
    <div className="p-4">{text}</div>
);

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { index: true, element: <Placeholder text="Login (임시)" /> },
            { path: "products", element: <Placeholder text="Products List" /> },
            { path: "products/:id", element: <Placeholder text="Product Detail" /> },
            { path: "products/create", element: <Placeholder text="Product Create" /> },
            { path: "admin", element: <Placeholder text="Admin" /> },
        ],
    },
]);
