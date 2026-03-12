import Text "mo:core/Text";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Map "mo:core/Map";

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

  // Implicitly stable with --default-persistent-actors
  var referralCounter : Nat = 1000;
  var sessionSerial : Nat = 0;
  var defaultCouponsInitialized : Bool = false;

  let users    = Map.empty<Text, User>();
  let sessions = Map.empty<Text, Session>();
  let coupons  = Map.empty<Text, Coupon>();
  let referrals = Map.empty<Text, Referral>();

  let farFuture : Int = 4070908800000000000;

  func initDefaultCoupons() {
    if (not defaultCouponsInitialized) {
      coupons.add("FIRST50",  { code = "FIRST50";  discountType = "Percent"; discountValue = 50; expiryTimestamp = farFuture; usageLimit = 10000; usedCount = 0 });
      coupons.add("LISTEN30", { code = "LISTEN30"; discountType = "Percent"; discountValue = 30; expiryTimestamp = farFuture; usageLimit = 10000; usedCount = 0 });
      coupons.add("WELCOME20",{ code = "WELCOME20";discountType = "Percent"; discountValue = 20; expiryTimestamp = farFuture; usageLimit = 10000; usedCount = 0 });
      defaultCouponsInitialized := true;
    };
  };

  initDefaultCoupons();

  // Coupon Validation
  public query func validateCoupon(code : Text, _durationMinutes : Nat) : async {
    valid : Bool;
    discountType : Text;
    discountValue : Nat;
    message : Text;
  } {
    switch (coupons.get(code)) {
      case (null) {
        { valid = false; discountType = ""; discountValue = 0; message = "Coupon not found" };
      };
      case (?coupon) {
        let now = Time.now();
        if (coupon.expiryTimestamp < now) {
          { valid = false; discountType = ""; discountValue = 0; message = "Coupon expired" };
        } else if (coupon.usedCount >= coupon.usageLimit) {
          { valid = false; discountType = ""; discountValue = 0; message = "Coupon usage limit reached" };
        } else {
          { valid = true; discountType = coupon.discountType; discountValue = coupon.discountValue; message = "Coupon valid" };
        };
      };
    };
  };

  // Submit Session
  public shared func submitSession(
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
    dateCode : Text,
    freeMinutesToUse : Nat
  ) : async { sessionId : Text; userReferralCode : Text } {
    sessionSerial += 1;
    let now = Time.now();
    let sessionId = dateCode # "_" # sessionSerial.toText();

    // User handling
    let userReferralCode = switch (users.get(userPhone)) {
      case (null) {
        let newReferralCode = "REF" # referralCounter.toText();
        referralCounter += 1;
        users.add(userPhone, {
          phone = userPhone;
          name;
          referralCode = newReferralCode;
          referredBy = referralCode;
          freeMinutesBalance = 0;
          totalReferrals = 0;
          createdAt = now;
        });
        newReferralCode;
      };
      case (?user) { user.referralCode };
    };

    // Process referral reward
    if (referralCode != "") {
      var referrerPhone : Text = "";
      for (u in users.values()) {
        if (u.referralCode == referralCode and u.phone != userPhone) {
          referrerPhone := u.phone;
        };
      };
      if (referrerPhone != "") {
        switch (users.get(referrerPhone)) {
          case (?referrer) {
            users.add(referrerPhone, {
              referrer with
              freeMinutesBalance = Nat.min(referrer.freeMinutesBalance + 5, 30);
              totalReferrals = referrer.totalReferrals + 1;
            });
            let refId = "RF" # now.toText();
            referrals.add(refId, { id = refId; referrerPhone; referredPhone = userPhone; rewardGiven = true; createdAt = now });
          };
          case (null) {};
        };
      };
    };

    // Pricing
    var finalPrice : Nat = switch (duration) {
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
            finalPrice := if (finalPrice > coupon.discountValue) finalPrice - coupon.discountValue else 0;
          };
          coupons.add(couponCode, { coupon with usedCount = coupon.usedCount + 1 });
        };
        case (null) {};
      };
    };

    // Apply free minutes
    var actualFreeMinutesUsed : Nat = 0;
    if (freeMinutesToUse > 0) {
      switch (users.get(userPhone)) {
        case (?user) {
          let toUse = Nat.min(freeMinutesToUse, user.freeMinutesBalance);
          // safe subtraction: toUse * 5 cannot exceed finalPrice after Nat.min
          let freeDiscount = Nat.min(toUse * 5, finalPrice);
          finalPrice -= freeDiscount;
          actualFreeMinutesUsed := toUse;
          users.add(userPhone, { user with freeMinutesBalance = user.freeMinutesBalance - toUse });
        };
        case (null) {};
      };
    };

    sessions.add(sessionId, {
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
      freeMinutesUsed = actualFreeMinutesUsed;
      finalPrice;
      createdAt = now;
      dateCode;
    });

    { sessionId; userReferralCode };
  };

  public query func getUserByPhone(phone : Text) : async ?User {
    users.get(phone);
  };

  public query func getSessions(statusFilter : Text) : async [Session] {
    let all = sessions.values().toArray();
    let filtered = if (statusFilter == "") all
      else all.filter(func(s : Session) : Bool { s.status == statusFilter });
    filtered.sort(func(a : Session, b : Session) : Order.Order {
      Int.compare(b.createdAt, a.createdAt);
    });
  };

  public shared func assignListener(sessionId : Text, listener : Text) : async Bool {
    switch (sessions.get(sessionId)) {
      case (?session) {
        sessions.add(sessionId, { session with listenerAssigned = listener; status = "Assigned" });
        true;
      };
      case (null) { false };
    };
  };

  public shared func updateSessionStatus(sessionId : Text, status : Text) : async Bool {
    switch (sessions.get(sessionId)) {
      case (?session) {
        sessions.add(sessionId, { session with status });
        true;
      };
      case (null) { false };
    };
  };

  public query func getUsers() : async [User] {
    users.values().toArray();
  };

  public query func getCoupons() : async [Coupon] {
    coupons.values().toArray();
  };

  public query func getReferrals() : async [Referral] {
    referrals.values().toArray();
  };

  public shared func addCoupon(
    code : Text,
    discountType : Text,
    discountValue : Nat,
    expiryTimestamp : Int,
    usageLimit : Nat
  ) : async Bool {
    coupons.add(code, { code; discountType; discountValue; expiryTimestamp; usageLimit; usedCount = 0 });
    true;
  };

  public shared func adminLogin(username : Text, password : Text) : async Bool {
    username == "admin" and password == "vishwodya123";
  };
};
