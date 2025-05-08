/**
 * OpenProject Auto Authentication
 *
 * This script provides functionality to automatically authenticate a user in OpenProject.
 * It first tries to log in with the provided credentials, and only if that fails,
 * it attempts to register a new user via the complete_auto_register endpoint.
 */

// Auto authentication JavaScript

document.addEventListener("DOMContentLoaded", function () {
  // Get path information from the script tag data attributes
  var scriptTag = document.querySelector('script[src*="auto_auth"]');
  var signinPath = "/login";
  var registerPath = "/complete_auto_register";
  var redirectPath = scriptTag ? scriptTag.getAttribute("data-redirect-path") : "/";

  // Get CSRF token
  var csrfToken = document.querySelector('meta[name="csrf-token"]');
  if (!csrfToken) {
    console.error("CSRF token not found. Make sure you have a valid csrf-token meta tag.");
    return;
  }

  // Get authentication data from URL params or defaults
  var firstName;
  var lastName;
  var email;
  var login;
  var password;

  // Parse URL query parameters
  var urlParams = new URLSearchParams(window.location.search);

  // Get API URL from URL params or defaults
  var apiUrl = urlParams.get("kadmap_api_url");
  var userId = urlParams.get("user_id");

  // Call API to get authentication data
  var xhr = new XMLHttpRequest();
  xhr.open("GET", apiUrl + "/directory/users/" + userId, true);
  xhr.setRequestHeader("Accept", "application/json");
  xhr.send();

  // If the response is successful, attempt to log in
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        console.log("Authentication data:", this.responseText);
        var response = JSON.parse(this.responseText);
        var responseData = response.data;
        var names = responseData.fullName.split(" ");
        firstName = names[0];
        lastName = names[1];
        email = responseData.userKID;
        login = responseData.userKID;
        password = responseData.userId;

        // First, try to authenticate with the provided credentials
        attemptLogin(login, password);
      } else {
        console.error("Failed to get authentication data:", this.statusText);
      }
    }
  };

  // First, try to authenticate with the provided credentials
  // attemptLogin();

  /**
   * Attempt to log in with the provided credentials
   */
  function attemptLogin() {
    console.log("Attempting to log in user:", login);

    var loginXhr = new XMLHttpRequest();
    loginXhr.open("POST", signinPath, true);
    loginXhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    loginXhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    loginXhr.setRequestHeader("Accept", "*/*");

    loginXhr.onreadystatechange = function () {
      if (loginXhr.readyState === 4) {
        if (loginXhr.status === 200) {
          console.log("Login successful");
          window.location.href = redirectPath || "/";
        } else {
          console.log("Login failed, attempting registration");
          // Login failed, attempt registration
          attemptRegistration();
        }
      }
    };

    var loginParams = {
      authenticity_token: csrfToken.getAttribute("content"),
      username: login,
      password: password,
    };
    var loginQueryString = new URLSearchParams(loginParams).toString();

    loginXhr.send(loginQueryString);
  }

  /**
   * Attempt to register a new user
   */
  function attemptRegistration() {
    // Create XMLHttpRequest for registration
    var xhr = new XMLHttpRequest();
    xhr.open("POST", registerPath, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("X-CSRF-Token", csrfToken.getAttribute("content"));
    xhr.setRequestHeader("Accept", "application/json");

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        // Log response for debugging
        console.log("Registration response:", this.responseText);

        try {
          var response = JSON.parse(this.responseText);

          if (xhr.status === 201) {
            console.log("User registered successfully");

            // Always attempt login after successful registration
            console.log("Attempting login after successful registration");
            attemptLogin();
          } else {
            console.error("Registration failed:", response.errors || "Unknown error");

            // Optional: implement error handling UI here
            if (typeof window.onRegistrationError === "function") {
              window.onRegistrationError(response.errors);
            }
          }
        } catch (e) {
          console.error("Error parsing response:", e);
        }
      }
    };

    // Prepare user data
    var userData = {
      login: login,
      firstname: firstName,
      lastname: lastName,
      mail: email,
      password: password,
      password_confirmation: password,
    };

    // Prepare request data
    var requestData = {
      user: userData,
      authenticity_token: csrfToken.getAttribute("content"),
    };

    console.log("Attempting to register user:", login);

    // Send the request
    xhr.send(JSON.stringify(requestData));
  }

  /**
   * Generate a random password of specified length
   */
  function generateRandomPassword(length) {
    var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    var password = "";

    for (var i = 0; i < length; i++) {
      var randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    return password;
  }
});
