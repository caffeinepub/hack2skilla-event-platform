import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Map "mo:core/Map";

actor {
  include MixinStorage();

  type EventCategory = {
    #hackathon;
    #workshop;
    #seminar;
    #webinar;
    #aiConference;
    #summit;
    #techCarnival;
    #podcast;
  };

  module EventCategory {
    func categoryToText(category : EventCategory) : Text {
      switch (category) {
        case (#hackathon) { "hackathon" };
        case (#workshop) { "workshop" };
        case (#seminar) { "seminar" };
        case (#webinar) { "webinar" };
        case (#aiConference) { "aiConference" };
        case (#summit) { "summit" };
        case (#techCarnival) { "techCarnival" };
        case (#podcast) { "podcast" };
      };
    };

    public func compare(cat1 : EventCategory, cat2 : EventCategory) : Order.Order {
      Text.compare(categoryToText(cat1), categoryToText(cat2));
    };

    public func compareByPrefix(prefix : Text) : (EventCategory, EventCategory) -> Order.Order {
      func(cat1 : EventCategory, cat2 : EventCategory) : Order.Order {
        let c1 = categoryToText(cat1).startsWith(#text prefix);
        let c2 = categoryToText(cat2).startsWith(#text prefix);
        if (c1 and not c2) { #less } else if (not c1 and c2) { #greater } else {
          Text.compare(categoryToText(cat1), categoryToText(cat2));
        };
      };
    };
  };

  public type EventStatus = {
    #live;
    #upcoming;
    #completed;
  };

  module EventStatus {
    func statusToText(status : EventStatus) : Text {
      switch (status) {
        case (#live) { "live" };
        case (#upcoming) { "upcoming" };
        case (#completed) { "completed" };
      };
    };

    public func compare(stat1 : EventStatus, stat2 : EventStatus) : Order.Order {
      Text.compare(statusToText(stat1), statusToText(stat2));
    };

    public func compareByPrefix(prefix : Text) : (EventStatus, EventStatus) -> Order.Order {
      func(stat1 : EventStatus, stat2 : EventStatus) : Order.Order {
        let s1 = statusToText(stat1).startsWith(#text prefix);
        let s2 = statusToText(stat2).startsWith(#text prefix);
        if (s1 and not s2) { #less } else if (not s1 and s2) { #greater } else {
          Text.compare(statusToText(stat1), statusToText(stat2));
        };
      };
    };
  };

  public type TechEvent = {
    id : Nat;
    name : Text;
    category : EventCategory;
    description : Text;
    dateTime : Int;
    endDateTime : ?Int;
    location : Text;
    onlineLink : ?Text;
    isFree : Bool;
    price : Float;
    registrationLimit : Nat;
    currentRegistrations : Nat;
    bannerBlobId : ?Text;
    specialInstructions : ?Text;
    isPublished : Bool;
    createdAt : Int;
    status : EventStatus;
  };

  module TechEvent {
    public func compare(event1 : TechEvent, event2 : TechEvent) : Order.Order {
      switch (Text.compare(event1.name, event2.name)) {
        case (#equal) { Nat.compare(event1.id, event2.id) };
        case (order) { order };
      };
    };

    public func compareByCategory(event1 : TechEvent, event2 : TechEvent) : Order.Order {
      switch (EventCategory.compare(event1.category, event2.category)) {
        case (#equal) { Nat.compare(event1.id, event2.id) };
        case (order) { order };
      };
    };

    public func compareByDateTime(event1 : TechEvent, event2 : TechEvent) : Order.Order {
      Int.compare(event1.dateTime, event2.dateTime);
    };

    public func compareByStatus(event1 : TechEvent, event2 : TechEvent) : Order.Order {
      switch (EventStatus.compare(event1.status, event2.status)) {
        case (#equal) { Nat.compare(event1.id, event2.id) };
        case (order) { order };
      };
    };

    public func compareByLocation(event1 : TechEvent, event2 : TechEvent) : Order.Order {
      switch (Text.compare(event1.location, event2.location)) {
        case (#equal) { Nat.compare(event1.id, event2.id) };
        case (order) { order };
      };
    };
  };

  type EventRegistration = {
    id : Nat;
    name : Text;
    email : Text;
    contactNumber : Text;
    organization : ?Text;
    eventId : Nat;
    stripePaymentId : ?Text;
    isPaid : Bool;
    createdAt : Int;
  };

  module EventRegistration {
    public func compare(reg1 : EventRegistration, reg2 : EventRegistration) : Order.Order {
      Nat.compare(reg1.id, reg2.id);
    };

    public func compareByEventId(reg1 : EventRegistration, reg2 : EventRegistration) : Order.Order {
      Nat.compare(reg1.eventId, reg2.eventId);
    };

    public func compareByName(reg1 : EventRegistration, reg2 : EventRegistration) : Order.Order {
      switch (Text.compare(reg1.name, reg2.name)) {
        case (#equal) { Nat.compare(reg1.id, reg2.id) };
        case (order) { order };
      };
    };

    public func compareByEmail(reg1 : EventRegistration, reg2 : EventRegistration) : Order.Order {
      switch (Text.compare(reg1.email, reg2.email)) {
        case (#equal) { Nat.compare(reg1.id, reg2.id) };
        case (order) { order };
      };
    };

    public func compareByCreatedAt(reg1 : EventRegistration, reg2 : EventRegistration) : Order.Order {
      Int.compare(reg1.createdAt, reg2.createdAt);
    };
  };

  type Testimonial = {
    id : Nat;
    name : Text;
    role : Text;
    content : Text;
    isPublished : Bool;
    createdAt : Int;
  };

  module Testimonial {
    public func compare(test1 : Testimonial, test2 : Testimonial) : Order.Order {
      Nat.compare(test1.id, test2.id);
    };

    public func compareByCreatedAt(test1 : Testimonial, test2 : Testimonial) : Order.Order {
      Int.compare(test1.createdAt, test2.createdAt);
    };
  };

  module Storage {
    type BlobId = Text;
    public type ExternalBlob = {
      cyclesSpent : Nat;
      size : Int;
      blobId : BlobId;
    };
  };

  type NewsletterSubscriber = {
    id : Nat;
    email : Text;
    createdAt : Int;
  };

  module NewsletterSubscriber {
    public func compare(sub1 : NewsletterSubscriber, sub2 : NewsletterSubscriber) : Order.Order {
      Nat.compare(sub1.id, sub2.id);
    };

    public func compareByEmail(sub1 : NewsletterSubscriber, sub2 : NewsletterSubscriber) : Order.Order {
      switch (Text.compare(sub1.email, sub2.email)) {
        case (#equal) { Nat.compare(sub1.id, sub2.id) };
        case (order) { order };
      };
    };

    public func compareByCreatedAt(sub1 : NewsletterSubscriber, sub2 : NewsletterSubscriber) : Order.Order {
      Int.compare(sub1.createdAt, sub2.createdAt);
    };
  };

  var nextEventId = 1;
  var nextRegistrationId = 1;
  var nextTestimonialId = 1;
  var nextSubscriberId = 1;

  let events = Map.empty<Nat, TechEvent>();
  let registrations = Map.empty<Nat, EventRegistration>();
  let testimonials = Map.empty<Nat, Testimonial>();
  let subscribers = Map.empty<Text, NewsletterSubscriber>();
  let userProfiles = Map.empty<Principal, Text>();

  func getEventInternal(eventId : Nat) : TechEvent {
    switch (events.get(eventId)) {
      case (null) { Runtime.trap("Event not found") };
      case (?event) { event };
    };
  };

  func getRegistrationInternal(registrationId : Nat) : EventRegistration {
    switch (registrations.get(registrationId)) {
      case (null) { Runtime.trap("Registration not found") };
      case (?registration) { registration };
    };
  };

  func getTestimonialInternal(testimonialId : Nat) : Testimonial {
    switch (testimonials.get(testimonialId)) {
      case (null) { Runtime.trap("Testimonial not found") };
      case (?testimonial) { testimonial };
    };
  };

  //----------------------
  // Authorization & Stripe
  //----------------------
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var stripeConfig : ?Stripe.StripeConfiguration = null;
  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can set Stripe configuration");
    };
    stripeConfig := ?config;
  };

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  //-----------------
  // User Profile Management
  //-----------------
  public query ({ caller }) func getUserProfile(user : Principal) : async ?Text {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : Text) : async () {
    userProfiles.add(caller, profile);
  };

  //-----------------
  // Events Management
  //-----------------
  public shared ({ caller }) func createEvent(event : TechEvent) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can create events");
    };

    let eventId = nextEventId;
    nextEventId += 1;

    let newEvent : TechEvent = {
      event with
      id = eventId;
      currentRegistrations = 0;
      isPublished = false;
      createdAt = Time.now();
      status = #upcoming;
    };

    events.add(eventId, newEvent);
    eventId;
  };

  public query func getEvents(category : ?Text, status : ?Text) : async [TechEvent] {
    events.values().toArray();
  };

  public shared ({ caller }) func updateEvent(eventId : Nat, event : TechEvent) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can update events");
    };

    let existingEvent = getEventInternal(eventId);

    if (existingEvent.currentRegistrations > event.registrationLimit) {
      Runtime.trap("Registration limit cannot be less than current registrations");
    };

    let updatedEvent : TechEvent = {
      existingEvent with
      name = event.name;
      category = event.category;
      description = event.description;
      dateTime = event.dateTime;
      endDateTime = event.endDateTime;
      location = event.location;
      onlineLink = event.onlineLink;
      isFree = event.isFree;
      price = event.price;
      registrationLimit = event.registrationLimit;
      bannerBlobId = event.bannerBlobId;
      specialInstructions = event.specialInstructions;
    };

    events.add(eventId, updatedEvent);
  };

  public shared ({ caller }) func deleteEvent(eventId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can delete events");
    };
    if (not events.containsKey(eventId)) {
      Runtime.trap("Event already deleted or does not exist.");
    };
    events.remove(eventId);
  };

  public shared ({ caller }) func publishEvent(eventId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can publish events");
    };

    let event = getEventInternal(eventId);
    events.add(eventId, { event with isPublished = true });
  };

  //-------------------
  // Registration Logic
  //-------------------
  public shared ({ caller }) func registerForEvent(registration : EventRegistration) : async Nat {
    let event = getEventInternal(registration.eventId);

    if (event.currentRegistrations >= event.registrationLimit) {
      Runtime.trap("Event is full");
    };

    let newRegistrationId = nextRegistrationId;
    nextRegistrationId += 1;

    let newRegistration : EventRegistration = {
      registration with
      id = newRegistrationId;
      createdAt = Time.now();
    };

    registrations.add(newRegistrationId, newRegistration);

    let updatedEvent : TechEvent = {
      event with
      currentRegistrations = event.currentRegistrations + 1;
    };

    events.add(event.id, updatedEvent);

    newRegistrationId;
  };

  //-----------------
  // Testimonials Logic
  //-----------------

  public shared ({ caller }) func createTestimonial(testimonial : Testimonial) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can create testimonials");
    };

    let testimonialId = nextTestimonialId;
    nextTestimonialId += 1;

    let newTestimonial : Testimonial = {
      testimonial with
      id = testimonialId;
      isPublished = false;
      createdAt = Time.now();
    };

    testimonials.add(testimonialId, newTestimonial);
    testimonialId;
  };

  public shared ({ caller }) func publishTestimonial(testimonialId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can publish testimonials");
    };

    let testimonial = getTestimonialInternal(testimonialId);
    testimonials.add(testimonialId, { testimonial with isPublished = true });
  };

  //---------------------
  // Newsletter Logic
  //---------------------
  public shared ({ caller }) func subscribeToNewsletter(email : Text) : async Nat {
    if (subscribers.containsKey(email)) {
      Runtime.trap("Email already subscribed");
    };

    let subscriberId = nextSubscriberId;
    nextSubscriberId += 1;

    let newSubscriber : NewsletterSubscriber = {
      id = subscriberId;
      email;
      createdAt = Time.now();
    };

    subscribers.add(email, newSubscriber);
    subscriberId;
  };

  public shared ({ caller }) func unsubscribe(email : Text) : async () {
    if (not subscribers.containsKey(email)) {
      Runtime.trap("Email not subscribed or already unsubscribed.");
    };
    subscribers.remove(email);
  };
};
