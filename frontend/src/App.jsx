// frontend/src/App.jsx
import { useState } from "react";
import { Routes, Route } from "react-router";
import { MainLayout } from "./MainLayout.jsx";
import { AllImages } from "./images/AllImages.jsx";
import { ImageDetails } from "./images/ImageDetails.jsx";
import { UploadPage } from "./UploadPage.jsx";
import { LoginPage } from "./LoginPage.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { VALID_ROUTES } from "../../shared/ValidRoutes.js";

function App() {
    const [authToken, setAuthToken] = useState(null);

    return (
        <Routes>
            <Route element={<MainLayout authToken={authToken} />}>
                <Route
                    path={VALID_ROUTES.HOME}
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <AllImages authToken={authToken} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={VALID_ROUTES.UPLOAD}
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <UploadPage authToken={authToken} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={VALID_ROUTES.IMAGE_DETAILS}
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <ImageDetails authToken={authToken} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={VALID_ROUTES.LOGIN}
                    element={
                        <LoginPage
                            isRegistering={false}
                            onAuthToken={setAuthToken}
                        />
                    }
                />
                <Route
                    path={VALID_ROUTES.REGISTER}
                    element={
                        <LoginPage
                            isRegistering={true}
                            onAuthToken={setAuthToken}
                        />
                    }
                />
            </Route>
        </Routes>
    );
}

export default App;
