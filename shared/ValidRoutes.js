// shared/ValidRoutes.js
export const VALID_ROUTES = {
    HOME: "/",
    UPLOAD: "/upload",
    LOGIN: "/login",
    IMAGE_DETAILS: "/images/:imageId"  // This is a pattern, not a concrete path
};

// For concrete paths without parameters (used by backend)
export const VALID_CONCRETE_PATHS = [
    "/",
    "/upload",
    "/login"
];