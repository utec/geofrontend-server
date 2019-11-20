# Geofront - User Guide

![home](home.png)

This project **Geofront server** is created for providing easy to use security (JWT, HTTP Basic Auth, etc.) and dynamic configuration.

Play nice together with all JS libraries like React, Vue, Angular, etc.

# Configuration as Standalone

- Clone this project
- Install all dependencies with **npm install**
- Set your config in **application.json** like this:
```json
"security": {
  "enable": true,
  "npmModule": {
    "name": "basic-security-client"
  },
  "configModule": {
    "user": "${AUTH_USER}",
    "password": "${AUTH_PASSWORD}"
  }
}
```
- Move all your static files (html, css, js, img) into **build** folder
- Run this in console
```bash
export PORT=8080
npm run start
```

- Go to your browser an enter to http://localhost:8080
- You could consume this endpoint http://localhost:8080/settings.json in your javascript app, which will return you the content of this section of your application.json


# Configuration as Module

- Add this module in **package.json** with:
```bash
npm install --save geofrontend-server
```
- Create a file with name **application.json** and set your configuration
```json
{
  "server": {
    "security": {
      "enable": false,
      "npmModule": {
        "name": "basic-security-client"
      },
      "configModule": {
        "user": "${AUTH_USER}",
        "password": "${AUTH_PASSWORD}"
      }
    }
  },
  "frontend": {
    "token": "${token}",
    "employeeApi": {
      "baseUrl": "https://employee-api.acme.com"
    },
    "cdn": {
      "baseUrl": "https://cdn.acme.com"
    },
    "welcomeMessage": "Welcome to acme web",
    "backgroundColor": "#4884157",
    "etc":"etc"
  },
  "endpoints": {
    "settings": {
      "httpResponseHeaderNamePrefix": "ACME-ORG"
    }
  }
}
```
- Add a new scripts property **start** in your **package.json**
```json
  "scripts": {
    "start": "geofront-server $INIT_CWD/application.json $INIT_CWD/public"
  },
```

- Finally run **npm run start** and enjoy this **GeoFront Server**