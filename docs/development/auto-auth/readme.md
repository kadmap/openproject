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

1. The user is directed to the `/auto_auth` URL with appropriate user information in query parameters
2. The auto_auth.js script executes and first attempts to authenticate with the provided login and password
3. If authentication is successful, the user is logged in and redirected to the root path or specified redirect path
4. If authentication fails (user doesn't exist or credentials are invalid), the script proceeds with registration:
   - Registration data is gathered from URL parameters or defaults
   - A POST request is sent to the `/complete_auto_register` endpoint
   - The server creates the user and returns a success response with user details
   - The client-side script then attempts to log in with the credentials used for registration
   - After successful login, the user is redirected to the root path or a specified redirect path
   - If registration fails, error information is provided

### Login Parameters

The following parameters can be provided in the URL for authentication:

| Parameter | Description | Example |
|-----------|-------------|---------|
| login | User's login name | `login=admin` |
| password | User's password | `password=secret123` |

If authentication fails, registration will be attempted.

### Registration Parameters

The following parameters can be provided in the URL for registration:

| Parameter | Description | Example |
|-----------|-------------|---------|
| firstname | User's first name | `firstname=John` |
| lastname | User's last name | `lastname=Smith` |
| email | User's email address | `email=john.smith@example.com` |
| login | User's login name (defaults to email username) | `login=jsmith` |
| password | User's password (generated randomly if not provided) | `password=SecurePass123` |

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
    "mail": "john.smith@example.com"
  },
  "logged_in": false
}
```

Note that the `logged_in` value is always `false` because the server does not attempt to log in the user automatically. The client-side JavaScript handles the login attempt after receiving this response.

## Usage and Integration

### Auto Authentication URL Example

```
https://your-openproject-instance.com/auto_auth?firstname=John&lastname=Smith&email=john.smith@example.com&login=jsmith&password=SecurePass123
```

### JavaScript Integration

For client-side integration, include the auto_auth.js file in your HTML:

```html
<script src="/assets/auto_auth.js"></script>
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
    "password": "SecurePass123",
    "password_confirmation": "SecurePass123"
  }
}
```

## Security Considerations

- **Auto registration should only be enabled in controlled environments** where you trust the registration sources
- Ensure that auto-registration requests originate from trusted sources
- Consider implementing additional verification mechanisms for registrations
- Use HTTPS to protect sensitive data during the registration process
- Be aware that allowing auto-registration could potentially enable abuse if not properly secured

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

---

**Note**: Always follow best security practices when implementing automatic registration and authentication systems. 
