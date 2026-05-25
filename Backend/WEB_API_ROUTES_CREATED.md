# Web API Routes Created

## Overview
Separate web-specific API routes have been created to avoid duplication with mobile API routes. All web booking APIs now use the `/v1/web/*` prefix.

## New Routes Created

### 1. Web User Routes
**File:** `src/routes/web/user/user.route.js`
**Base Path:** `/v1/web/user`

#### Endpoints:
- `POST /v1/web/user/login` - Send OTP to user's phone number
- `POST /v1/web/user/verify` - Verify OTP and get tokens
- `POST /v1/web/user/create` - Register/create new user
- `GET /v1/web/user/getProfile` - Get user profile (requires auth)
- `PUT /v1/web/user/updateUsers` - Update user (requires auth)
- `GET /v1/web/user/places` - Get autocomplete places
- `GET /v1/web/user/request/history` - Get request history

### 2. Web Country Routes
**File:** `src/routes/web/country/country.route.js`
**Base Path:** `/v1/web/country`

#### Endpoints:
- `GET /v1/web/country/list` - Get list of all countries (public, no auth)

## Route Registration

Routes are registered in `src/routes/v1/index.js`:

```javascript
// Web-specific routes (separate from mobile API)
{
  path: '/web/user',
  route: WebUserRoute,
},
{
  path: '/web/country',
  route: WebCountryRoute,
}
```

## Comparison: Mobile vs Web APIs

| Feature | Mobile API | Web API |
|---------|-----------|---------|
| **Base Path** | `/v1/api/*` | `/v1/web/*` |
| **Send OTP** | `/api/user/login` | `/web/user/login` |
| **Verify OTP** | `/api/user/verify` | `/web/user/verify` |
| **Register** | `/api/user/create` | `/web/user/create` |
| **Get Countries** | `/api/driver/getCountry/list` | `/web/country/list` |
| **Get Profile** | `/api/user/getProfile` | `/web/user/getProfile` |

## Controllers Used

Both web and mobile routes use the **same controllers** to avoid code duplication:
- `authController` - For authentication (login, verify)
- `userController` - For user operations (create, getProfile, update)
- `countryController` - For country operations

This ensures:
- ✅ Same business logic
- ✅ Same validation
- ✅ Same error handling
- ✅ Separate API endpoints
- ✅ Easy to maintain

## Frontend Integration

The frontend (`taxiWebBook`) is already configured to use these web endpoints:
- `lib/api/services/auth.service.ts` - Uses `/web/user/*` endpoints
- `lib/api/services/country.service.ts` - Uses `/web/country/list` endpoint

## Future Web APIs

When creating new web-specific APIs, follow this pattern:

1. **Create route file** in `src/routes/web/{module}/{module}.route.js`
2. **Use existing controllers** (or create new ones if needed)
3. **Register route** in `src/routes/v1/index.js` with `/web/{module}` path
4. **Update frontend** to use `/web/{module}/*` endpoints

## Example: Adding New Web API

```javascript
// 1. Create route file: src/routes/web/vehicle/vehicle.route.js
const express = require('express');
const vehicleController = require('../../../controllers/boilerplate/vehicle.controller');
const router = express.Router();

router.get('/list', vehicleController.getVehicles);
module.exports = router;

// 2. Register in src/routes/v1/index.js
const WebVehicleRoute = require('../web/vehicle/vehicle.route');

// Add to defaultRoutes array:
{
  path: '/web/vehicle',
  route: WebVehicleRoute,
}
```

## Benefits

1. **Clear Separation** - Web and mobile APIs are clearly separated
2. **No Duplication** - Same controllers, different routes
3. **Easy Maintenance** - Update controller once, affects both
4. **Scalability** - Easy to add web-specific features
5. **Organization** - Clear folder structure

## Status

✅ **Web User Routes** - Created and registered
✅ **Web Country Routes** - Created and registered
✅ **Route Registration** - Added to main routes file
✅ **Frontend Integration** - Already configured

All web booking APIs are now separate from mobile APIs!

