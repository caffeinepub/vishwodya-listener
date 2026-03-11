# Vishwodya Listener

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Homepage with hero, how-it-works, problem categories grid, privacy promise, and CTA sections
- Session request form (name, age, gender, preferred listener, language, problem category, description, phone, duration, coupon, referral code)
- Session ID auto-generation: VS + DDMM + ListenerType (M/F/A) + CategoryCode (2 chars) + Serial (01-99)
- User identity by phone number: auto-generates unique referral code (REF + 4 digits) and free minutes wallet on first submission
- Coupon validation system: FIRST50 (50% off), LISTEN30 (30% off), WELCOME20 (₹20 off) -- with expiry and usage limits
- Referral system: applying a referral code at booking rewards referrer with 5 free minutes; milestones at 3 and 5 referrals give 15 and 30 free mins
- Free minutes wallet: balance tracked per phone number, applicable at booking to reduce paid duration
- Confirmation screen after form submission showing Session ID and "Listener will contact you within 1 hour"
- Admin dashboard (login: admin / vishwodya123) with tabs: New Requests, Pending, Assigned, Completed, Users, Coupons, Analytics
- Admin can assign listener (Male/Female) to a session and update session status
- Analytics: total sessions, users, referrals, top problem categories chart
- Pricing: ₹49 (10 min), ₹99 (20 min), ₹149 (30 min) -- no in-app payment, manual collection
- 18+ disclaimer and "not therapy" disclaimer on homepage and form

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend (Motoko)
- `User` type: id, name, phone, referralCode, referredBy, freeMinutesBalance, totalReferrals
- `Session` type: sessionId, userId, date, problemCategory, listenerGender, listenerAssigned, duration, status, couponUsed, freeMinutesUsed, language, description, age, gender
- `Coupon` type: code, discountType (percent/flat), discountValue, expiryDate, usageLimit, usedCount
- `Referral` type: referrerPhone, referredPhone, rewardGiven
- Functions:
  - `submitSession(form data)` -> creates or fetches user by phone, validates coupon, applies referral, generates session ID, stores session
  - `validateCoupon(code, duration)` -> returns discount info or error
  - `getUserByPhone(phone)` -> returns user with wallet balance
  - `adminLogin(username, password)` -> returns auth token
  - `getSessions(status?)` -> returns sessions list
  - `assignListener(sessionId, listener)` -> updates session
  - `updateSessionStatus(sessionId, status)` -> updates session
  - `getUsers()` -> returns all users
  - `getCoupons()` -> returns all coupons
  - `addCoupon(coupon)` -> adds coupon
  - `getAnalytics()` -> returns aggregate stats
  - `getDailySessionCount(date)` -> for serial number generation

### Frontend
- Page: `/` -- Homepage
- Page: `/book` -- Session request form
- Page: `/confirmation/:sessionId` -- Post-submission confirmation
- Page: `/admin` -- Admin login
- Page: `/admin/dashboard` -- Admin dashboard with tabs
- Seed coupons in backend init: FIRST50, LISTEN30, WELCOME20
