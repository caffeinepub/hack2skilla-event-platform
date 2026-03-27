import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TechEvent {
    id: bigint;
    status: EventStatus;
    registrationLimit: bigint;
    isPublished: boolean;
    bannerBlobId?: string;
    currentRegistrations: bigint;
    name: string;
    createdAt: bigint;
    description: string;
    isFree: boolean;
    specialInstructions?: string;
    onlineLink?: string;
    endDateTime?: bigint;
    category: EventCategory;
    price: number;
    dateTime: bigint;
    location: string;
}
export interface EventRegistration {
    id: bigint;
    eventId: bigint;
    name: string;
    createdAt: bigint;
    isPaid: boolean;
    email: string;
    stripePaymentId?: string;
    contactNumber: string;
    organization?: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface Testimonial {
    id: bigint;
    content: string;
    isPublished: boolean;
    name: string;
    createdAt: bigint;
    role: string;
}
export enum EventCategory {
    seminar = "seminar",
    workshop = "workshop",
    hackathon = "hackathon",
    podcast = "podcast",
    webinar = "webinar",
    techCarnival = "techCarnival",
    summit = "summit",
    aiConference = "aiConference"
}
export enum EventStatus {
    upcoming = "upcoming",
    live = "live",
    completed = "completed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createEvent(event: TechEvent): Promise<bigint>;
    createTestimonial(testimonial: Testimonial): Promise<bigint>;
    deleteEvent(eventId: bigint): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getEvents(category: string | null, status: string | null): Promise<Array<TechEvent>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<string | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    publishEvent(eventId: bigint): Promise<void>;
    publishTestimonial(testimonialId: bigint): Promise<void>;
    registerForEvent(registration: EventRegistration): Promise<bigint>;
    saveCallerUserProfile(profile: string): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    subscribeToNewsletter(email: string): Promise<bigint>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    unsubscribe(email: string): Promise<void>;
    updateEvent(eventId: bigint, event: TechEvent): Promise<void>;
}
