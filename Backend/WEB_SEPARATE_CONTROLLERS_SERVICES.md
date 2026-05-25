# Web Separate Controllers and Services

## Overview
Complete separation of web booking APIs from mobile/client APIs. Web APIs are **not client-based** and don't require `clientId`.

## Structure Created

### 1. Web User Service
**File:** `src/services/web/user/user.service.js`

**Functions:**
- `loginUserWithMobileNo(phoneNumber, countryCode)` - Send OTP (no clientId)
- `mobileUserOtpVerify(phoneNumber, countryCode, otp)` - Verify OTP (no clientId)
- `findRolesByRoleUser()` - Find User role

**Key Differences from Mobile:**
- ✅ No `clientId` required
- ✅ Platform-wide (not client-specific)
- ✅ Simpler logic (no client validation)

### 2. Web User Controller
**File:** `src/controllers/web/user/user.controller.js`

**Endpoints:**
- `POST /v1/web/user/login` - Send OTP
- `POST /v1/web/user/verify` - Verify OTP
- `POST /v1/web/user/create` - Create user (no clientId)
- `GET /v1/web/user/getProfile` - Get profile
- `PUT /v1/web/user/updateUsers` - Update user
- `GET /v1/web/user/places` - Autocomplete places
- `GET /v1/web/user/request/history` - Request history

**Key Differences from Mobile:**
- ✅ No `getClientId()` calls
- ✅ No clientId in user creation
- ✅ Platform-wide user management

### 3. Web Country Route
**File:** `src/routes/web/country/country.route.js`
- Uses existing `countryController.getCountries()` (no clientId needed)

## Service Registration

**File:** `src/services/index.js`
```javascript
module.exports.webUserService = require('./web/user/user.service');
```

## Route Registration

**File:** `src/routes/v1/index.js`
```javascript
const WebUserRoute = require('../web/user/user.route');
const WebCountryRoute = require('../web/country/country.route');

// In defaultRoutes array:
{
  path: '/web/user',
  route: WebUserRoute,
},
{
  path: '/web/country',
  route: WebCountryRoute,
}
```

## Comparison: Mobile vs Web

| Feature | Mobile API | Web API |
|---------|-----------|---------|
| **Base Path** | `/v1/api/*` | `/v1/web/*` |
| **ClientId Required** | ✅ Yes | ❌ No |
| **Service** | `mobileauthService` | `webUserService` |
| **Controller** | `api/auth/user.controller` | `web/user/user.controller` |
| **User Creation** | Requires clientId | Platform-wide |
| **Scope** | Client-specific | Platform-wide |

## Key Benefits

1. **Complete Separation** - Web and mobile are completely separate
2. **No Client Dependency** - Web doesn't need clientId
3. **Simpler Logic** - Web APIs are simpler (no client validation)
4. **Independent Scaling** - Can scale web and mobile independently
5. **Clear Organization** - Easy to find web vs mobile code

## File Structure

```
mainbackend/src/
├── services/
│   ├── api/          # Mobile/client APIs (requires clientId)
│   │   └── auth/
│   │       └── auth.service.js
│   └── web/          # Web APIs (no clientId)
│       └── user/
│           └── user.service.js
├── controllers/
│   ├── api/          # Mobile/client controllers
│   │   └── auth/
│   │       └── user.controller.js
│   └── web/          # Web controllers
│       └── user/
│           └── user.controller.js
└── routes/
    ├── api/          # Mobile/client routes
    │   └── auth/
    │       └── user.route.js
    └── web/           # Web routes
        ├── user/
        │   └── user.route.js
        └── country/
            └── country.route.js
```

## Status

✅ **Web User Service** - Created (no clientId)
✅ **Web User Controller** - Created (no clientId)
✅ **Web Routes** - Updated to use web controllers
✅ **Service Registration** - Added to services/index.js
✅ **Route Registration** - Added to routes/v1/index.js

All web APIs are now completely separate from mobile/client APIs!

