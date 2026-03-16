// frontend/src/LoginPage.jsx
import React, { useActionState } from "react";
import { Link, useNavigate } from "react-router";
import { VALID_ROUTES } from "../../shared/ValidRoutes.js";
import "./LoginPage.css";

export function LoginPage({ isRegistering, onAuthToken }) {
    const navigate = useNavigate();

    async function  handleSubmit(prevState, formData) {
        const username = formData.get("username");
        const password = formData.get("password");
        const email = formData.get("email");

        if (isRegistering) {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            if (res.status === 201) {
                const data = await res.json();
                onAuthToken(data.token);
                navigate("/");
                return null;
            } else if (res.status === 409) {
                return "That username is already taken. Please choose another.";
            } else {
                return "Registration failed. Please check your details and try again.";
            }
        } else {
            const res = await fetch("/api/auth/tokens", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (res.status === 200) {
                const data = await res.json();
                onAuthToken(data.token);
                navigate("/");
                return null;
            } else if (res.status === 401) {
                return "Incorrect username or password. Please try again.";
            } else {
                return "Login failed. Please try again later.";
            }
        }
    }

    const [errorMessage, submitAction, isPending] = useActionState(handleSubmit, null);

    return (
        <>
            <h2>{isRegistering ? "Register a new account" : "Login"}</h2>

            {errorMessage && (
                <p className="LoginPage-error" aria-live="polite">
                    {errorMessage}
                </p>
            )}

            <form className="LoginPage-form" action={submitAction}>
                <label htmlFor="login-username">Username</label>
                <input
                    id="login-username"
                    name="username"
                    type="text"
                    required
                    disabled={isPending}
                    autoComplete="username"
                />

                {isRegistering && (
                    <>
                        <label htmlFor="login-email">Email</label>
                        <input
                            id="login-email"
                            name="email"
                            type="email"
                            required
                            disabled={isPending}
                            autoComplete="email"
                        />
                    </>
                )}

                <label htmlFor="login-password">Password</label>
                <input
                    id="login-password"
                    name="password"
                    type="password"
                    required
                    disabled={isPending}
                    autoComplete={isRegistering ? "new-password" : "current-password"}
                />

                <input
                    type="submit"
                    value={isPending ? "Please wait..." : isRegistering ? "Register" : "Login"}
                    disabled={isPending}
                />
            </form>

            {isRegistering ? (
                <p>
                    Already have an account?{" "}
                    <Link to={VALID_ROUTES.LOGIN}>Login here</Link>
                </p>
            ) : (
                <p>
                    Don&apos;t have an account?{" "}
                    <Link to={VALID_ROUTES.REGISTER}>Register here</Link>
                </p>
            )}
        </>
    );
}
