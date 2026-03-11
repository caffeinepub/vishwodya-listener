import Text "mo:core/Text";
import Int "mo:core/Int";
import List "mo:core/List";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";

actor {
  // Types
  type User = {
    phone : Text;
    name : Text;
    referralCode : Text;
    referredBy : Text;
    freeMinutesBalance : Nat;
    totalReferrals : Nat;
    createdAt : Int;
  };

  type Session = {
    sessionId : Text;
    userPhone : Text;
    name : Text;
    age : Text;
    gender : Text;
    preferredListener : Text;
    language : Text;
    problemCategory : Text;
    description : Text;
    duration : Nat;
    status : Text;
    listenerAssigned : Text;
    couponUsed : Text;
    freeMinutesUsed : Nat;
    finalPrice : Nat;
    createdAt : Int;
    dateCode : Text;
  };

  type Coupon = {
    code : Text;
    discountType : Text;
    discountValue : Nat;
    expiryTimestamp : Int;
    usageLimit : Nat;
    usedCount : Nat;
  };

  type Referral = {
    id : Text;
    referrerPhone : Text;
    referredPhone : Text;
    rewardGiven : Bool;
    createdAt : Int;
  };

  // Storage
  let users = Map.empty<Text, User>();
  let sessions = Map.empty<Text, Session>();
  let coupons = Map.empty<Text, Coupon>();
  let referrals = Map.empty<Text, Referral>();

  var referralCounter = 1000;
  var sessionSerial : Nat = 0;

  // Helper Functions for Comparison and Sorting
  module Session {
    public func compareByCreatedAtDesc(a : Session, b : Session) : Order.Order {
      Int.compare(b.createdAt, a.createdAt);
    };
  };

  // Coupon Validation
  public query ({ caller }) func validateCoupon(code : Text, durationMinutes : Nat) : async {
    valid : Bool;
    discountType : Text;
    discountValue : Nat;
    message : Text;
  } {
    switch (coupons.get(code)) {
      case (null) {
        {
          valid = false;
          discountType = "";
          discountValue = 0;
          message = "Coupon not found";
        };
      };
      case (?coupon) {
        let now = Time.now();
        if (coupon.expiryTimestamp < now) {
          {
            valid = false;
            discountType = "";
            discountValue = 0;
            message = "Coupon expired";
          };
        } else if (coupon.usedCount >= coupon.usageLimit) {
          {
            valid = false;
            discountType = "";
            discountValue = 0;
            message = "Coupon usage limit reached";
          };
        } else {
          {
            valid = true;
            discountType = coupon.discountType;
            discountValue = coupon.discountValue;
            message = "Coupon valid";
          };
        };
      };
    };
  };

  // Submit Session
  public shared ({ caller }) func submitSession(
    userPhone : Text,
    name : Text,
    age : Text,
    gender : Text,
    preferredListener : Text,
    language : Text,
    problemCategory : Text,
    description : Text,
    duration : Nat,
    couponCode : Text,
    referralCode : Text,
    dateCode : Text
  ) : async {
    sessionId : Text;
    userReferralCode : Text;
  } {
    sessionSerial += 1;

    let now = Time.now();
    let sessionId = dateCode # "_" # sessionSerial.toText();

    // User handling
    let userReferralCode = switch (users.get(userPhone)) {
      case (null) {
        let newReferralCode = "REF" # referralCounter.toText();
        referralCounter += 1;

        let newUser : User = {
          phone = userPhone;
          name;
          referralCode = newReferralCode;
          referredBy = referralCode;
          freeMinutesBalance = 0;
          totalReferrals = 0;
          createdAt = now;
        };
        users.add(userPhone, newUser);
        newReferralCode;
      };
      case (?user) {
        user.referralCode;
      };
    };

    // Pricing
    var finalPrice = switch (duration) {
      case (10) { 49 };
      case (20) { 99 };
      case (30) { 149 };
      case (_) { 0 };
    };

    // Apply coupon
    if (couponCode != "") {
      switch (coupons.get(couponCode)) {
        case (?coupon) {
          if (coupon.discountType == "Percent") {
            finalPrice := finalPrice * (100 - coupon.discountValue) / 100;
          } else if (coupon.discountType == "Flat") {
            if (finalPrice > coupon.discountValue) {
              finalPrice -= coupon.discountValue;
            };
          };
        };
        case (null) {};
      };
    };

    // Create session
    let newSession : Session = {
      sessionId;
      userPhone;
      name;
      age;
      gender;
      preferredListener;
      language;
      problemCategory;
      description;
      duration;
      status = "Pending";
      listenerAssigned = "";
      couponUsed = couponCode;
      freeMinutesUsed = 0;
      finalPrice;
      createdAt = now;
      dateCode;
    };
    sessions.add(sessionId, newSession);

    {
      sessionId;
      userReferralCode;
    };
  };

  // Get User
  public query ({ caller }) func getUserByPhone(phone : Text) : async ?User {
    users.get(phone);
  };

  // Get Sessions by Status
  public query ({ caller }) func getSessions(statusFilter : Text) : async [Session] {
    let sessionList = List.empty<Session>();

    sessions.values().forEach(
      func(s) {
        if (statusFilter == "" or s.status == statusFilter) {
          sessionList.add(s);
        };
      }
    );

    sessionList.toArray().sort(Session.compareByCreatedAtDesc);
  };

  // Assign Listener
  public shared ({ caller }) func assignListener(sessionId : Text, listener : Text) : async Bool {
    switch (sessions.get(sessionId)) {
      case (?session) {
        let updatedSession : Session = {
          session with listenerAssigned = listener;
          status = "Assigned";
        };
        sessions.add(sessionId, updatedSession);
        true;
      };
      case (null) { false };
    };
  };

  // Update Session Status
  public shared ({ caller }) func updateSessionStatus(sessionId : Text, status : Text) : async Bool {
    switch (sessions.get(sessionId)) {
      case (?session) {
        let updatedSession : Session = { session with status };
        sessions.add(sessionId, updatedSession);
        true;
      };
      case (null) { false };
    };
  };

  // Get Users
  public query ({ caller }) func getUsers() : async [User] {
    users.values().toArray();
  };

  // Get Coupons
  public query ({ caller }) func getCoupons() : async [Coupon] {
    coupons.values().toArray();
  };

  // Add Coupon
  public shared ({ caller }) func addCoupon(
    code : Text,
    discountType : Text,
    discountValue : Nat,
    expiryTimestamp : Int,
    usageLimit : Nat
  ) : async Bool {
    let newCoupon : Coupon = {
      code;
      discountType;
      discountValue;
      expiryTimestamp;
      usageLimit;
      usedCount = 0;
    };
    coupons.add(code, newCoupon);
    true;
  };

  // Seed Coupons
  system func preupgrade() {};
  system func postupgrade() {};

  public shared ({ caller }) func adminLogin(username : Text, password : Text) : async Bool {
    username == "admin" and password == "vishwodya123";
  };
};
