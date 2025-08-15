# 🔧 Fix RLS (Row Level Security) Issue

## 🎯 The Problem

You're getting a "Something went wrong" error because the database has **Row Level Security (RLS)** enabled, but the policies only allow **authenticated users**. Since you don't have authentication set up yet, anonymous users (like your app) can't access the data.

## ✅ Quick Fix (2 minutes)

### **Step 1: Go to Supabase Dashboard**
1. Open [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `pdxzgauqxdxokolfhywc`
3. Go to **SQL Editor**

### **Step 2: Run the Fix Script**
1. Click **"New Query"**
2. Copy and paste this SQL:

```sql
-- Fix RLS Policies for Development (Anonymous Access)
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON family_members;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON buildings;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON apartments;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON flats;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON lands;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON tenants;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON tenant_references;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON property_tenants;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON rent_payments;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON insurance_policies;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON premium_payments;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON documents;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON maintenance_records;

-- Create new policies that allow anonymous access for development
CREATE POLICY "Allow anonymous access for development" ON family_members FOR ALL USING (true);
CREATE POLICY "Allow anonymous access for development" ON buildings FOR ALL USING (true);
CREATE POLICY "Allow anonymous access for development" ON apartments FOR ALL USING (true);
CREATE POLICY "Allow anonymous access for development" ON flats FOR ALL USING (true);
CREATE POLICY "Allow anonymous access for development" ON lands FOR ALL USING (true);
CREATE POLICY "Allow anonymous access for development" ON tenants FOR ALL USING (true);
CREATE POLICY "Allow anonymous access for development" ON tenant_references FOR ALL USING (true);
CREATE POLICY "Allow anonymous access for development" ON property_tenants FOR ALL USING (true);
CREATE POLICY "Allow anonymous access for development" ON rent_payments FOR ALL USING (true);
CREATE POLICY "Allow anonymous access for development" ON insurance_policies FOR ALL USING (true);
CREATE POLICY "Allow anonymous access for development" ON premium_payments FOR ALL USING (true);
CREATE POLICY "Allow anonymous access for development" ON documents FOR ALL USING (true);
CREATE POLICY "Allow anonymous access for development" ON maintenance_records FOR ALL USING (true);
```

3. Click **"Run"** to execute the SQL
4. You should see "Success. No rows returned" message

### **Step 3: Test the Fix**
1. Go back to your app: `http://localhost:3000`
2. Navigate to **Family Members**
3. The error should be gone!

## 🧪 Verify the Fix

Run this command to test:
```bash
npm run check:supabase
```

You should see:
```
✅ Connection successful!
✅ Write test successful!
🎉 All tests passed!
```

## 🔍 Alternative: Use Test Pages

If you want to debug further:

1. **Database Test**: `http://localhost:3000/test-db`
2. **Debug Page**: `http://localhost:3000/debug/family`
3. **Demo Page**: `http://localhost:3000/demo/family`

## 🛡️ Security Note

**Important**: This fix allows **anonymous access** to your database, which is fine for development but **NOT for production**.

### **For Production**, you should:
1. Implement user authentication (Supabase Auth)
2. Create proper RLS policies based on user ownership
3. Restrict access to authenticated users only

Example production policy:
```sql
-- Production: Only allow users to see their own data
CREATE POLICY "Users can only access their own family data" ON family_members
    FOR ALL USING (auth.uid() = user_id);
```

## 🎉 What This Fixes

After running the fix:
- ✅ Family Members page will load
- ✅ You can add new family members
- ✅ You can edit existing members
- ✅ You can delete members
- ✅ All CRUD operations will work
- ✅ Demo page will work perfectly

## 🚀 Next Steps

1. **Fix the RLS policies** (run the SQL above)
2. **Test your app** - Family Members should work
3. **Add some family members** to test functionality
4. **Later**: Implement authentication for production use

---

**This is a common issue when setting up Supabase with RLS enabled. The fix takes 2 minutes!** 🚀