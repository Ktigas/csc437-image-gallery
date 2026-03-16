// shared/ValidRoutes.js

export const VALID_ROUTES = {
    HOME: "/",
    UPLOAD: "/upload",
    LOGIN: "/login",
    REGISTER: "/register",
    IMAGE_DETAILS: "/images/:imageId",
};

// Concrete paths that the Express server should serve index.html for
export const VALID_CONCRETE_PATHS = [
    "/",
    "/upload",
    "/login",
    "/register"
];