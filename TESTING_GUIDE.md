# Complete Testing Guide for Meet-Bot (Without Stripe)

## Prerequisites

Before testing, ensure you have:
- ✅ Stopped the old dev server
- ✅ Run `npx prisma generate`
- ✅ All environment variables set in `.env`

## Step-by-Step Testing Process

### 1. Start the Development Server

```bash
npm run dev
```

Expected output:
```
▲ Next.js 15.5.3
- Local:        http://localhost:3000
- Ready in X.Xs
```

### 2. Test Landing Page

**URL:** `http://localhost:3000`

**What to check:**
- [ ] Page loads without errors
- [ ] No Stripe-related errors in browser console (F12)
- [ ] Hero section displays
- [ ] Features section displays
- [ ] Integrations section displays

**How to check console:**
1. Press F12 to open Developer Tools
2. Click "Console" tab
3. Look for any red errors
4. Should see NO Stripe errors

---

### 3. Test Pricing Page

**URL:** `http://localhost:3000/pricing`

**What to check:**
- [ ] Page loads successfully
- [ ] Shows single "Premium" plan card
- [ ] Price shows "Free"
- [ ] "Free Forever" badge displays
- [ ] "Get Started Free" button is visible
- [ ] Click button redirects to `/home`
- [ ] No Stripe checkout errors

**Expected UI:**
```
┌─────────────────────────┐
│   Free Forever Badge    │
│                         │
│       Premium           │
│         Free            │
│                         │
│  Full access to all     │
│  features - No payment  │
│  required!              │
│                         │
│  ✓ Unlimited meetings   │
│  ✓ Unlimited AI chat    │
│  ✓ All integrations     │
│                         │
│  [Get Started Free]     │
└─────────────────────────┘
```

---

### 4. Test User Authentication

**URL:** `http://localhost:3000/sign-up`

**What to check:**
- [ ] Sign up page loads
- [ ] Can create new account
- [ ] No payment prompts appear
- [ ] Redirects to home after signup
- [ ] User created in database

**Verify in Database:**
```bash
npx prisma studio
```
1. Open User table
2. Find your new user
3. Check `currentPlan` = "premium"
4. Check NO `stripeCustomerId` column exists
5. Check NO `subscriptionStatus` column exists

---

### 5. Test Home Dashboard

**URL:** `http://localhost:3000/home`

**What to check:**
- [ ] Dashboard loads after login
- [ ] No "upgrade plan" messages
- [ ] No payment prompts
- [ ] Can see upcoming meetings section
- [ ] Can see past meetings section
- [ ] No errors in console

---

### 6. Test Google Calendar Integration

**URL:** `http://localhost:3000/home`

**What to check:**
- [ ] "Connect Google Calendar" button visible
- [ ] Click button starts OAuth flow
- [ ] Redirects to Google login
- [ ] After authorization, redirects back
- [ ] Shows "Calendar Connected" status
- [ ] No subscription check errors

**Expected flow:**
1. Click "Connect Google Calendar"
2. Google OAuth popup/redirect
3. Grant permissions
4. Redirect to `/home?connected=direct`
5. Calendar status shows connected

---

### 7. Test Meeting Bot Functionality

**Prerequisites:** Google Calendar connected

**What to check:**
- [ ] Can schedule a meeting in Google Calendar
- [ ] Lambda function picks up the meeting (check logs)
- [ ] Bot joins meeting automatically
- [ ] No "upgrade to send bot" errors
- [ ] Unlimited meetings allowed

**How to test:**
1. Create a Google Meet in your calendar
2. Wait for Lambda to poll (runs every 5 minutes)
3. Check database for new meeting record
4. Verify `botScheduled` = true

---

### 8. Test AI Chat Feature

**URL:** `http://localhost:3000/chat`

**What to check:**
- [ ] Chat page loads
- [ ] Can send messages
- [ ] AI responds
- [ ] No "upgrade to chat" errors
- [ ] No daily message limit enforced
- [ ] Unlimited chat messages allowed

**Test messages:**
1. "Hello, can you help me?"
2. "What meetings do I have?"
3. Send 10+ messages to verify no limits

---

### 9. Test Integrations Page

**URL:** `http://localhost:3000/integrations`

**What to check:**
- [ ] Page loads
- [ ] Shows Slack integration
- [ ] Shows Jira integration
- [ ] Shows Asana integration
- [ ] Shows Trello integration
- [ ] No "premium only" restrictions
- [ ] All integrations available

---

### 10. Test Settings Page

**URL:** `http://localhost:3000/settings`

**What to check:**
- [ ] Settings page loads
- [ ] Can update bot name
- [ ] Can upload bot avatar
- [ ] No subscription/billing section
- [ ] No "upgrade plan" prompts
- [ ] Changes save successfully

---

### 11. Test API Endpoints

**Test with browser or Postman:**

#### Check User Usage
```bash
GET http://localhost:3000/api/user/usage
```
**Expected response:**
```json
{
  "currentPlan": "premium",
  "meetingsThisMonth": 0,
  "chatMessagesToday": 0
}
```
**Should NOT include:**
- ❌ `subscriptionStatus`
- ❌ `billingPeriodStart`
- ❌ `stripeCustomerId`

#### Check Calendar Status
```bash
GET http://localhost:3000/api/user/calendar-status
```
**Expected response:**
```json
{
  "connected": true
}
```

---

### 12. Browser Console Checks

**Open Developer Tools (F12) and check:**

#### Console Tab
- [ ] No Stripe errors
- [ ] No 404 errors for `/api/stripe/*`
- [ ] No subscription check failures
- [ ] No payment-related warnings

#### Network Tab
- [ ] No failed requests to Stripe
- [ ] No 404s for deleted routes
- [ ] All API calls succeed

---

### 13. Database Verification

**Run Prisma Studio:**
```bash
npx prisma studio
```

**Check User table:**
- [ ] `currentPlan` column exists (should be "premium")
- [ ] `meetingsThisMonth` column exists
- [ ] `chatMessagesToday` column exists
- [ ] NO `stripeCustomerId` column
- [ ] NO `stripeSubscriptionId` column
- [ ] NO `subscriptionStatus` column
- [ ] NO `billingPeriodStart` column

**Check Meeting table:**
- [ ] Meetings are created
- [ ] `botScheduled` field works
- [ ] No subscription-related fields

---

## Common Test Scenarios

### Scenario 1: New User Signup
1. Go to `/sign-up`
2. Create account
3. Should auto-redirect to `/home`
4. Check database - user has `currentPlan: "premium"`
5. No payment required

### Scenario 2: Schedule Multiple Meetings
1. Connect Google Calendar
2. Create 5+ meetings
3. All should be processed
4. No "limit reached" errors
5. Verify unlimited access

### Scenario 3: Heavy Chat Usage
1. Go to `/chat`
2. Send 50+ messages
3. All should work
4. No daily limit enforced
5. Verify unlimited access

### Scenario 4: Integration Setup
1. Go to `/integrations`
2. Connect Slack
3. Connect Jira/Asana/Trello
4. All should work without payment
5. No premium restrictions

---

## Error Checking Checklist

### ✅ Should NOT See These Errors:
- ❌ "Upgrade your plan"
- ❌ "Subscription required"
- ❌ "Payment method needed"
- ❌ "Monthly limit reached"
- ❌ "Daily limit exceeded"
- ❌ Stripe API errors
- ❌ 404 errors for `/api/stripe/*`
- ❌ 404 errors for `/api/webhooks/stripe`

### ✅ Should See These Working:
- ✅ All pages load successfully
- ✅ User can sign up without payment
- ✅ Unlimited meetings
- ✅ Unlimited chat messages
- ✅ All integrations available
- ✅ No subscription checks
- ✅ "Free" or "Premium" plan displayed

---

## Performance Testing

### Load Testing
```bash
# Test multiple concurrent users
# Use tools like Apache Bench or k6
ab -n 100 -c 10 http://localhost:3000/
```

### Database Performance
```bash
# Check query performance in Prisma Studio
# Monitor slow queries
# Verify indexes are working
```

---

## Final Verification

Run through this quick checklist:

1. [ ] Server starts without errors
2. [ ] Landing page loads
3. [ ] Pricing shows free plan
4. [ ] User can sign up
5. [ ] No payment prompts anywhere
6. [ ] Dashboard works
7. [ ] Calendar connects
8. [ ] Chat works unlimited
9. [ ] Integrations available
10. [ ] No Stripe errors in console
11. [ ] Database schema correct
12. [ ] All API endpoints work

---

## Troubleshooting

If you encounter issues, check:
1. [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) - Common issues and solutions
2. [`STRIPE_REMOVAL_GUIDE.md`](STRIPE_REMOVAL_GUIDE.md) - What was changed
3. Browser console for specific errors
4. Terminal output for server errors
5. Database schema in Prisma Studio

---

## Success Criteria

Your project is working correctly if:
- ✅ No Stripe-related errors anywhere
- ✅ All features work without payment
- ✅ Users get "premium" plan by default
- ✅ No subscription checks block features
- ✅ Unlimited meetings and chat work
- ✅ All integrations are accessible

**Congratulations! Your Meet-Bot is now completely free to use! 🎉**
