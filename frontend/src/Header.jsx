// frontend/src/Header.jsx
import { Link } from "react-router";
import { VALID_ROUTES } from "../../shared/ValidRoutes.js";
import "./Header.css";

export function Header({ authToken }) {
    return (
        <header>
            <h1>My cool image site</h1>
            <div>
                <nav>
                    <Link to={VALID_ROUTES.HOME}>Home</Link>
                    <Link to={VALID_ROUTES.UPLOAD}>Upload</Link>
                    {authToken ? (
                        <span>Logged in</span>
                    ) : (
                        <>
                            <Link to={VALID_ROUTES.LOGIN}>Log in</Link>
                            <Link to={VALID_ROUTES.REGISTER}>Register</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
