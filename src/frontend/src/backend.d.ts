import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Session {
    age: string;
    finalPrice: bigint;
    status: string;
    duration: bigint;
    couponUsed: string;
    listenerAssigned: string;
    name: string;
    createdAt: bigint;
    description: string;
    userPhone: string;
    language: string;
    freeMinutesUsed: bigint;
    gender: string;
    sessionId: string;
    dateCode: string;
    preferredListener: string;
    problemCategory: string;
}
export interface Coupon {
    expiryTimestamp: bigint;
    discountValue: bigint;
    code: string;
    discountType: string;
    usedCount: bigint;
    usageLimit: bigint;
}
export interface User {
    referralCode: string;
    totalReferrals: bigint;
    name: string;
    createdAt: bigint;
    freeMinutesBalance: bigint;
    referredBy: string;
    phone: string;
}
export interface backendInterface {
    addCoupon(code: string, discountType: string, discountValue: bigint, expiryTimestamp: bigint, usageLimit: bigint): Promise<boolean>;
    adminLogin(username: string, password: string): Promise<boolean>;
    assignListener(sessionId: string, listener: string): Promise<boolean>;
    getCoupons(): Promise<Array<Coupon>>;
    getSessions(statusFilter: string): Promise<Array<Session>>;
    getUserByPhone(phone: string): Promise<User | null>;
    getUsers(): Promise<Array<User>>;
    submitSession(userPhone: string, name: string, age: string, gender: string, preferredListener: string, language: string, problemCategory: string, description: string, duration: bigint, couponCode: string, referralCode: string, dateCode: string): Promise<{
        userReferralCode: string;
        sessionId: string;
    }>;
    updateSessionStatus(sessionId: string, status: string): Promise<boolean>;
    validateCoupon(code: string, durationMinutes: bigint): Promise<{
        discountValue: bigint;
        valid: boolean;
        discountType: string;
        message: string;
    }>;
}
