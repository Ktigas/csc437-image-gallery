// frontend/src/MainLayout.jsx
import { Outlet } from "react-router";
import { Header } from "./Header.jsx";

export function MainLayout({ authToken }) {
    return (
        <div>
            <Header authToken={authToken} />
            <div style={{ padding: "0 2em" }}>
                <Outlet />
            </div>
        </div>
    );
}
