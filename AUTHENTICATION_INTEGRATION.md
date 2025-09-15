# SpeedThreads Authentication Integration

## 🔐 **Authentication Flow Implemented**

### **1. First Install Behavior**
- ✅ Extension opens login page automatically on first install
- ✅ User must authenticate before using any extension features
- ✅ No UI elements injected until authentication is complete

### **2. Authentication Check**
- ✅ Content script checks authentication before initializing
- ✅ Validates JWT token with Supabase on each page load
- ✅ Shows login prompt overlay if not authenticated

### **3. Token Management**
- ✅ JWT tokens stored in `chrome.storage.local` (secure for extensions)
- ✅ Automatic token validation with Supabase
- ✅ Token persistence across browser sessions

## 📁 **Files Modified/Created**

### **Chrome Extension Files**
- `chrome-extension/manifest.json` - Added storage and tabs permissions
- `chrome-extension/src/background.js` - Added first install handler and auth message handling
- `chrome-extension/src/content.js` - Added authentication check before UI injection
- `chrome-extension/src/auth.js` - **NEW** - Authentication utilities

### **React App Files**
- `src/App.tsx` - Added extension communication on auth success
- `src/Login.tsx` - Added extension communication on login
- `src/chrome.d.ts` - **NEW** - TypeScript declarations for Chrome APIs

## 🔄 **Authentication Flow**

### **Step 1: Extension Installation**
```
User installs extension → Background script detects install → Opens login page
```

### **Step 2: User Authentication**
```
User visits Reddit/X → Content script loads → Checks authentication → Shows login prompt if not authenticated
```

### **Step 3: Login Process**
```
User clicks "Sign In" → Opens login page → User authenticates → Token stored in chrome.storage.local → Extension notified
```

### **Step 4: UI Injection**
```
Authentication successful → Content script proceeds → Injects SpeedThreads UI elements
```

## 🛠️ **How to Test**

### **1. Fresh Install Test**
1. Remove extension from Chrome
2. Reload extension from `chrome-extension/` folder
3. **Expected**: Login page opens automatically

### **2. Authentication Test**
1. Visit any Reddit or X thread
2. **Expected**: Login prompt overlay appears
3. Click "Sign In" → Login page opens
4. Authenticate with Google or email/password
5. **Expected**: Return to thread page, SpeedThreads UI appears

### **3. Token Persistence Test**
1. Close browser completely
2. Reopen browser and visit Reddit/X thread
3. **Expected**: SpeedThreads UI appears immediately (no login prompt)

## 🔧 **Configuration Required**

### **Supabase Setup**
1. **Enable Google OAuth** in Supabase dashboard
2. **Add redirect URLs**:
   - `http://localhost:3000/login`
   - `http://localhost:3000`

### **Extension Permissions**
- ✅ `storage` - For token persistence
- ✅ `tabs` - For opening login page
- ✅ `activeTab` - For content script injection
- ✅ `scripting` - For content script execution

## 🐛 **Troubleshooting**

### **Common Issues**

1. **Login page doesn't open on install**
   - Check if `http://localhost:3000` is running
   - Check browser console for errors

2. **Login prompt doesn't appear**
   - Check if content script is loading
   - Check browser console for authentication errors

3. **Token not persisting**
   - Check Chrome storage permissions
   - Check browser console for storage errors

4. **UI not injecting after login**
   - Check if authentication check is passing
   - Check browser console for initialization errors

### **Debug Steps**

1. **Check Extension Console**:
   - Go to `chrome://extensions/`
   - Click "Inspect views: background page"
   - Check console for errors

2. **Check Content Script Console**:
   - Visit Reddit/X thread
   - Open DevTools → Console
   - Look for SpeedThreads messages

3. **Check Storage**:
   - Go to DevTools → Application → Storage → Local Storage
   - Look for `speedthreads_token` and `speedthreads_user`

## ✅ **Security Features**

- ✅ JWT tokens validated with Supabase on each check
- ✅ Tokens stored in secure `chrome.storage.local`
- ✅ No sensitive data in localStorage
- ✅ Automatic token cleanup on logout
- ✅ Authentication required before any extension functionality

## 🚀 **Next Steps**

1. **Test the complete flow** with fresh extension install
2. **Configure Supabase OAuth** settings
3. **Test token persistence** across browser sessions
4. **Add logout functionality** to extension popup
5. **Add user info display** in extension popup
