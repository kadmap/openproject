# Automatic Authentication and Registration

This document provides information about OpenProject's automatic authentication and registration features that allow for simplified user login and registration processes without manual intervention.

## Table of Contents

- [Overview](#overview)
- [Auto Authentication](#auto-authentication)
- [Usage and Integration](#usage-and-integration)
- [Security Considerations](#security-considerations)
- [API Reference](#api-reference)

## Overview

OpenProject offers a comprehensive solution for automating user authentication and onboarding:

- **Auto Authentication**: Enables automatic user login and registration with specified attributes

This feature is particularly useful for:
- Integration with external systems
- Onboarding new users through customized workflows
- Creating seamless sign-up and authentication experiences
- Developing custom applications that interact with OpenProject

## Auto Authentication

The Auto Authentication feature enables automatic user authentication or registration based on provided information, first attempting to log in with the provided credentials and only creating a new account if the login fails.

### Endpoints

- **UI Endpoint**: `/auto_auth` - Provides a loading screen while login/registration is processed
- **API Endpoint**: `/complete_auto_register` - Processes the actual registration request
- **Controller Actions**: `auto_auth` and `complete_auto_register` in `AccountController`

### How It Works

1. The user is directed to the `/auto_auth` URL with Kadmap API information in query parameters
2. The auto_auth.js script fetches user data from the Kadmap API using the provided user_id
3. The script first attempts to authenticate with the credentials from the API response
4. If authentication is successful, the user is logged in and redirected to the root path or specified redirect path
5. If authentication fails (user doesn't exist or credentials are invalid), the script proceeds with registration:
   - Registration data is gathered from the Kadmap API response
   - A POST request is sent to the `/complete_auto_register` endpoint
   - The server creates the user and returns a success response with user details
   - The client-side script then attempts to log in with the credentials used for registration
   - After successful login, the user is redirected to the root path or a specified redirect path
   - If registration fails, error information is provided

### URL Parameters

The following parameters can be provided in the URL for Kadmap API integration:

| Parameter | Description | Example |
|-----------|-------------|---------|
| kadmap_api_url | URL of the Kadmap API | `kadmap_api_url=http://192.168.30.77:19090` |
| user_id | User ID in the Kadmap system | `user_id=891e9432-6655-413e-8840-27ad23c9b223` |

### Kadmap API Response Format

The Kadmap API should return a JSON response in the following format:

```json
{
  "data": {
    "fullName": "John Smith",
    "userKID": "john.smith@example.com",
    "userId": "user-password-or-id",
    "role": "admin"
  }
}
```

The script will:
- Split `fullName` into first and last name
- Use `userKID` as both the email and login
- Use `userId` as the password
- Use `role` to determine admin status (if "admin", user will be created as an administrator)

### Response Format

Successful registration returns a JSON response:

```json
{
  "success": true,
  "message": "Your account has been activated. You can now log in.",
  "user": {
    "id": 123,
    "login": "jsmith",
    "firstname": "John",
    "lastname": "Smith",
    "mail": "john.smith@example.com",
    "admin": true
  },
  "logged_in": false
}
```

Note that the `logged_in` value is always `false` because the server does not attempt to log in the user automatically. The client-side JavaScript handles the login attempt after receiving this response.

## Usage and Integration

### Auto Authentication URL Example

```
https://your-openproject-instance.com/auto_auth?kadmap_api_url=http://192.168.30.77:19090&user_id=891e9432-6655-413e-8840-27ad23c9b223
```

### JavaScript Integration

For client-side integration, include the auto_auth.js file in your HTML:

```html
<script src="/assets/auto_auth.js" data-redirect-path="/your-custom-path"></script>
```

### Server-Side Integration

For server-side integration, you can make a direct POST request to the `/complete_auto_register` endpoint:

```
POST /complete_auto_register
Content-Type: application/json
X-CSRF-Token: [your-csrf-token]

{
  "user": {
    "login": "jsmith",
    "firstname": "John",
    "lastname": "Smith",
    "mail": "john.smith@example.com",
    "password": "user-password-or-id",
    "password_confirmation": "user-password-or-id",
    "guard": "admin"
  }
}
```

The `guard` parameter determines the user's admin status:
- If `guard` is set to "admin" (case-insensitive), the user will be created as an administrator
- For any other value or if omitted, the user will be created as a regular user

## Security Considerations

- **Auto registration should only be enabled in controlled environments** where you trust the registration sources
- Ensure that auto-registration requests originate from trusted sources
- Consider implementing additional verification mechanisms for registrations
- Use HTTPS to protect sensitive data during the registration process
- Be aware that allowing auto-registration could potentially enable abuse if not properly secured
- The Kadmap API URL must be properly configured in the Content Security Policy
- Ensure proper authentication and authorization for the Kadmap API endpoint

## Kadmap API Integration

When integrating with the Kadmap API, the following considerations apply:

### Content Security Policy (CSP)

The Kadmap API URL must be added to the Content Security Policy's `connect-src` directive. This is configured through an environment variable:

```bash
KADMAP_API_URL=http://your-api-url:port
```

The default value is `http://192.168.30.77:19090` if not specified.

### Docker Configuration

When running OpenProject in Docker, you can configure the Kadmap API URL in several ways:

1. Using environment variables when running docker-compose:
```bash
KADMAP_API_URL=http://your-api-url:port docker-compose up
```

2. Using a `.env` file in the same directory as your docker-compose files:
```
KADMAP_API_URL=http://your-api-url:port
```

3. Adding to your `docker-compose.override.yml`:
```yaml
services:
  backend:
    environment:
      KADMAP_API_URL: "${KADMAP_API_URL:-http://192.168.30.77:19090}"
```

### Security Recommendations

- Use HTTPS for the Kadmap API endpoint in production environments
- Regularly update the API URL if it changes
- Consider implementing API authentication if not already present
- Monitor CSP violations in your browser's console for potential security issues
- Ensure the Kadmap API implements proper security measures
- Consider implementing rate limiting for the API endpoint
- Use secure communication channels between OpenProject and the Kadmap API

## API Reference

### Auto Authentication JavaScript

The `auto_auth.js` script accepts the following data attributes:

- `data-redirect-path`: Path to redirect after login or registration

### Controller Methods

- `AccountController#auto_auth`: Renders the auto authentication view
- `AccountController#complete_auto_register`: Processes the registration request and returns JSON response

### Configuration

Auto-registration is subject to the global self-registration settings in OpenProject. To ensure auto-registration works:

1. Enable self-registration in Administration → Authentication → Self-registration
2. Ensure the user has proper permissions for the registration process
3. Configure the Kadmap API URL in your environment or Docker configuration

---

**Note**: Always follow best security practices when implementing automatic registration and authentication systems.
