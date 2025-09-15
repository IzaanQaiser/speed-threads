# SpeedThreads Login Page Setup

This document explains how to set up and use the standalone login page for SpeedThreads.

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env` file in the project root with your Supabase credentials:

```bash
cp .env.example .env
```

Then edit `.env` and add your Supabase project details:

```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The login page will be available at: **http://localhost:3000/login**

## 🔧 Features

### Authentication Methods

1. **Google OAuth Login**
   - Click "Login with Google" button
   - Redirects to Google OAuth flow
   - Returns to login page after authentication

2. **Email/Password Login**
   - Enter email and password
   - Validates credentials with Supabase
   - Shows success/error messages

### Token Management

- JWT tokens are automatically saved to `localStorage` as `speedthreads_token`
- Tokens persist across browser sessions
- Console logging shows user object and JWT token for debugging

## 📁 File Structure

```
src/
├── supabaseClient.ts    # Supabase client configuration
├── Login.tsx           # Login page component
├── App.tsx             # Main app component with auth state
└── main.tsx            # React app entry point
```

## 🔍 Testing

1. **Visit http://localhost:3000/login**
2. **Test Google Login:**
   - Click "Login with Google"
   - Complete OAuth flow
   - Check console for user data and JWT

3. **Test Email Login:**
   - Enter valid email/password
   - Submit form
   - Check console for user data and JWT

4. **Verify Token Storage:**
   - Open browser DevTools
   - Check Application > Local Storage
   - Look for `speedthreads_token` key

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Supabase Configuration

Make sure your Supabase project has:

1. **Authentication enabled**
2. **Google OAuth provider configured** (for Google login)
3. **Email authentication enabled** (for email/password login)
4. **Proper redirect URLs** configured in Supabase dashboard

### Redirect URL Setup

In your Supabase dashboard, add these redirect URLs:
- `http://localhost:3000/login` (development)
- `http://localhost:3000` (fallback)

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Check your `.env` file has correct Supabase credentials
   - Ensure no extra spaces or quotes in the values

2. **Google OAuth not working**
   - Verify Google OAuth is enabled in Supabase dashboard
   - Check redirect URLs are properly configured

3. **CORS errors**
   - Ensure your Supabase project allows localhost:3000
   - Check Supabase project settings

4. **Token not saving**
   - Check browser console for errors
   - Verify localStorage is enabled in your browser

### Debug Mode

The app logs detailed information to the browser console:
- User authentication state changes
- JWT tokens
- Error messages
- Supabase responses

Open DevTools Console to see all authentication events.

## 🔄 Next Steps

After successful login implementation:

1. **Chrome Extension Integration**
   - Move token storage from localStorage to chrome.storage.local
   - Add token validation and refresh logic
   - Integrate with extension background script

2. **Enhanced UI**
   - Add loading states
   - Improve error handling
   - Add password reset functionality

3. **Security**
   - Implement token refresh
   - Add session timeout
   - Secure token storage
