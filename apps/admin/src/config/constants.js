const endpoints = {

    AUTH: {
        LOGIN: "/api/v1/admin/login",
        PROFILE: "/api/v1/admin/me"
    },
    RATES: {
        GET: "/api/v1/rates",
        ADMIN: "/api/v1/rates/admin/rates"
    },
    SWAPS: {
        ADMIN: "/api/v1/swap/admin/swaps"
    },
    LOANS: {
        ADMIN: "/api/v1/loan/admin/loans"
    },
    KYC: {
        ADMIN: "/api/v1/loan/admin/kyc"
    },
    USERS: {
        ADMIN: "/api/v1/auth/admin/users",
        DETAILS: (uid) => `/api/v1/auth/admin/users/${uid}`
    },
    CRON: {
        RUN_INTEREST: "/api/v1/loan/admin/run-interest-collection",
        HISTORY: "/api/v1/loan/admin/cron-history",
        LOANS_USERS: "/api/v1/loan/admin/loans-users",
    },
    SETTINGS: {
        GET: "/api/v1/admin/settings",
    }

}

export default endpoints;