const endpoints = {

    AUTH: {
        LOGIN: "/api/v1/admin/login",
        PROFILE: "/api/v1/admin/me"
    },
    RATES: {
        GET: "/api/v1/rates",
        ADMIN: "/api/v1/admin/rates"
    },
    SWAPS: {
        ADMIN: "/api/v1/admin/swaps"
    },
    LOANS: {
        ADMIN: "/api/v1/admin/loans"
    },
    KYC: {
        ADMIN: "/api/v1/admin/kyc"
    }

}

export default endpoints;