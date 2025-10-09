# Troubleshooting Guide - Stripe Removal

## Current Error: EPERM (Permission Denied)

### Problem
```
Error: EPERM: operation not permitted, rename 'C:\Users\teja\Desktop\meet-bot\node_modules\.prisma\client\query_engine-windows.dll.node.tmp2784'
```

### Cause
The Prisma query engine file is locked because:
1. Your development server (`npm run dev`) is still running
2. Another process is using the Prisma client

### Solution

#### Step 1: Stop All Running Processes
1. **Find and stop the dev server:**
   - Look for any terminal windows running `npm run dev`
   - Press `Ctrl+C` to stop it
   - Or close the terminal window

2. **Check Task Manager (Windows):**
   - Press `Ctrl+Shift+Esc` to open Task Manager
   - Look for `node.exe` processes
   - End any Node.js processes related to this project

#### Step 2: Clean and Regenerate
Once all processes are stopped, run these commands:

```bash
# Remove the locked Prisma client
rmdir /s /q node_modules\.prisma

# Regenerate Prisma client
npx prisma generate

# Install dependencies (if needed)
npm install
```

#### Step 3: Start Fresh
```bash
# Start the development server
npm run dev
```

## Alternative: Restart Your Computer
If the above doesn't work:
1. Save all your work
2. Restart your computer
3. Open the project in VS Code
4. Run `npx prisma generate`
5. Run `npm run dev`

## Verification Steps

After successfully starting the server, verify:

1. **No Stripe Errors:**
   - Check browser console (F12)
   - Check terminal output
   - Should see no Stripe-related errors

2. **Test Features:**
   - Sign up/Sign in works
   - Google Calendar connection works
   - Pricing page shows free plan
   - No payment prompts appear

3. **Database Check:**
   ```bash
   npx prisma studio
   ```
   - Open Prisma Studio
   - Check User table
   - Verify no `stripeCustomerId` or `subscriptionStatus` columns
   - All users should have `currentPlan: "premium"`

## Common Issues After Stripe Removal

### Issue 1: "User not found" errors
**Solution:** The user might not exist in the database. The `/api/user/usage` endpoint now auto-creates users.

### Issue 2: TypeScript errors about Stripe types
**Solution:**
```bash
# Clear TypeScript cache
rm -rf .next
npm run dev
```

### Issue 3: Old Stripe webhooks still firing
**Solution:**
- Go to your Stripe Dashboard
- Disable or delete the webhook endpoint
- Or ignore them (they won't affect your app)

## Environment Variables Checklist

Make sure your `.env` file has these (and NOT Stripe variables):

```env
# Required
DATABASE_URL=
OPENAI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
CLERK_WEBHOOK_SECRET=
PINECONE_API_KEY=
RESEND_API_KEY=

# Optional
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

## Files Changed Summary

If you need to verify changes:
- ✅ `prisma/schema.prisma` - Removed Stripe fields
- ✅ `lib/usage.ts` - Removed subscription checks
- ✅ `app/api/user/usage/route.ts` - Updated fields
- ✅ `app/api/user/increment-chat/route.ts` - Updated fields
- ✅ `app/pricing/page.tsx` - New free plan UI
- ✅ `package.json` - Removed stripe package
- ✅ Deleted: `app/api/stripe/`
- ✅ Deleted: `app/api/webhooks/stripe/`

## Need Help?

If you're still experiencing issues:
1. Check the `STRIPE_REMOVAL_GUIDE.md` for complete change list
2. Verify all files were updated correctly
3. Make sure no Stripe imports remain in the code
4. Check that database schema matches the updated Prisma schema
