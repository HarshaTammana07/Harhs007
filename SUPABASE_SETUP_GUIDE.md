# 🚀 Supabase Setup Guide for Family Business Management

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier available)
- Basic understanding of environment variables

## 🔧 Step-by-Step Setup

### **1. Create Supabase Project**

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Fill in project details:
   - **Name**: `family-business-management`
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your location
5. Click "Create new project"
6. Wait for project initialization (2-3 minutes)

### **2. Get Your Project Credentials**

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### **3. Set Up Environment Variables**

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: For development
NODE_ENV=development
```

**⚠️ Important**:

- Replace `your-project-id` and `your-anon-key-here` with your actual values
- Never commit `.env.local` to version control
- Add `.env.local` to your `.gitignore` file

### **4. Run Database Schema**

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the entire content from `database/supabase-schema.sql`
4. Click "Run" to execute the schema
5. Verify tables are created in **Table Editor**

### **5. Configure Row Level Security (RLS)**

The schema already includes RLS policies, but you can customize them:

```sql
-- Example: More restrictive policy for production
CREATE POLICY "Users can only see their own family data" ON family_members
    FOR ALL USING (auth.uid() = user_id);
```

For development, the current policies allow all authenticated users to access data.

### **6. Test Your Setup**

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Visit the demo page:

   ```
   http://localhost:3000/demo/family
   ```

3. Try these operations:
   - ✅ Add a new family member
   - ✅ Edit existing member
   - ✅ Delete a member
   - ✅ Search and filter

## 🔍 Troubleshooting

### **Common Issues**

#### **1. "Failed to load family members"**

```bash
# Check your environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Restart your dev server after adding env vars
npm run dev
```

#### **2. "Table doesn't exist" errors**

- Make sure you ran the complete schema from `database/supabase-schema.sql`
- Check the **Table Editor** in Supabase dashboard
- Verify all tables are created with correct names

#### **3. "Row Level Security" errors**

- Check if RLS policies are properly set up
- For development, you can temporarily disable RLS:

```sql
ALTER TABLE family_members DISABLE ROW LEVEL SECURITY;
```

#### **4. "Invalid API key" errors**

- Verify your `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Make sure you're using the **anon/public** key, not the service role key
- Check for any extra spaces or characters

### **Debug Mode**

Add this to your component to debug API calls:

```typescript
// Add to FamilyManagement.tsx for debugging
useEffect(() => {
  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log(
    "Supabase Key:",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + "..."
  );
}, []);
```

## 🔐 Security Best Practices

### **Environment Variables**

```bash
# ✅ Good - Use environment variables
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# ❌ Bad - Never hardcode in source code
const supabaseUrl = "https://xxxxx.supabase.co";
```

### **Row Level Security**

```sql
-- ✅ Good - Restrict access by user
CREATE POLICY "Users see own data" ON family_members
    FOR ALL USING (auth.uid() = user_id);

-- ❌ Bad - Allow all access (only for development)
CREATE POLICY "Allow all" ON family_members
    FOR ALL USING (true);
```

### **API Keys**

- ✅ Use **anon/public** key for client-side
- ❌ Never use **service role** key in client-side code
- ✅ Keep service role key server-side only

## 📊 Verify Your Setup

### **1. Database Tables**

Check these tables exist in Supabase **Table Editor**:

- ✅ `family_members`
- ✅ `buildings`
- ✅ `apartments`
- ✅ `flats`
- ✅ `lands`
- ✅ `tenants`
- ✅ `rent_payments`
- ✅ `insurance_policies`
- ✅ `documents`

### **2. API Connection**

Test API connection in browser console:

```javascript
// Open browser dev tools and run:
fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + "/rest/v1/family_members", {
  headers: {
    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    Authorization: "Bearer " + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
})
  .then((r) => r.json())
  .then(console.log);
```

### **3. Demo Page**

Visit `/demo/family` and verify:

- ✅ Page loads without errors
- ✅ "Add Family Member" button works
- ✅ Form opens and submits
- ✅ Data persists after page refresh

## 🚀 Production Deployment

### **Environment Variables for Production**

```env
# Production environment
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
NODE_ENV=production
```

### **Deployment Platforms**

#### **Vercel**

1. Connect your GitHub repo
2. Add environment variables in Vercel dashboard
3. Deploy automatically

#### **Netlify**

1. Connect your GitHub repo
2. Add environment variables in site settings
3. Deploy automatically

#### **Custom Server**

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📈 Next Steps

1. **Authentication**: Add user authentication with Supabase Auth
2. **Real-time**: Implement real-time updates with Supabase subscriptions
3. **File Storage**: Use Supabase Storage for profile photos and documents
4. **Backup**: Set up automated database backups
5. **Monitoring**: Add error tracking and performance monitoring

## 🆘 Need Help?

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Community**: [supabase.com/community](https://supabase.com/community)
- **GitHub Issues**: Create an issue in your project repo

---

**🎉 Once setup is complete, your family management system will be fully API-driven and production-ready!**
