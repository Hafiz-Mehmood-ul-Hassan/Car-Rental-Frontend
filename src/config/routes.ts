export const routeRules = [
  // 🟢 PUBLIC ROUTES
  {
    path: "/",
    type: "public",
  },
  {
    path: "/cars",
    type: "public",
  },
  {
    path: "/login",
    type: "public",
  },
  {
    path: "/register",
    type: "public",
  },

  // 🔵 AUTH ONLY
  {
    path: "/dashboard",
    type: "auth",
  },
  {
    path: "/profile",
    type: "auth",
  },

  // 🔴 KYC REQUIRED
  {
    path: "/booking",
    type: "kyc",
  },
  {
    path: "/cars/create",
    type: "kyc",
  },
];