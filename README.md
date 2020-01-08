# GeoFrontend - The server for your frontends

![home](home.png)

Minimal nodejs express server to publish html static SPA webpage which is the result of **npm run build** command on your projects :react, angulas, vue ,etc and inject security and settings to your bundle

# Functionalities

- Static server for your builded assests from any framework like vue, angular, react. etc
- Forget about security when your are developing in any javascript framework, because the **geofrontend server** will manage it.
- By default, **basic authentication** is ready to use.
- How to keep one javascript build across several environments? Let me think.. Yeah **geofrontend server** will publish and **/settings.json** http endpoint with custom configuration for your web.

# Modes

In order to publish your static assets, you could choose one of these modes:

**GeoFrontend server as npm module**

**GeoFrontend server as standalone**

> The following steps are tested in Linux environments. For windows check this [guide](https://github.com/utec/geofrontend-server/wiki/Windows-Guideline)


# Geofrontend server as npm module

Just add the dependency:

```
npm install utec/geofrontend-server#master --save
```

Add an entry in your scripts:

```json
"scripts": {
  "start": "geofrontend-server $INIT_CWD/application.json $INIT_CWD/public"
}
```

Create a file called **application.json** inside of your application, based on **application.json.template**

Export these values:

```bash
export AUTH_USER=jane
export AUTH_PASSWORD=doe
export PORT=8080
```

Build your app with **npm run build**

And just run with: **npm run start**

Go to your browser an enter to http://localhost:8080 and a popup will prompt you asking the credentials.

> It is assumed that your application has an command called **build** and the result of that is stored in **public** folder. Just change it according to your real scenario

# Geofrontend server as standalone

- Clone this repository
- Execute **npm run build** or any command required to **build** your application.
- Move all your static files (html, css, js, img) into build folder. **index.html** file must exist. You could use the index.html in this repository as example.
- Rename the default **application.json.template** to **application.json**
- Install node libraries :

```
npm install
```

Export these values:

```
export AUTH_USER=jane
export AUTH_PASSWORD=doe
export PORT=8080
```

And just run with: **npm run start**

Go to your browser an enter to http://localhost:8080 and a popup will prompt you asking the credentials.

# application.json

Is the only properties or configurations file. You can use hardcoded values or environment variables.

I recommended you to use **environment variables** to make the application agnostic to the server where will be deployed. You just need export values before server startup.

# /setting.json

Forgot the **.env** file, manually variables configuration and a build for a new environment.

Geofrontend server will expose an endpoint /settings.json with values ready to use as your properties or configurations file.

```json
{
  "status": 200,
  "message": "success",
  "content": {
    "session": {
      "user": "jane"
    },
    "settings": {
      "someToken": null,
      "employeeApi": {
        "baseUrl": "https://employee-api.acme.com"
      },
      "cdn": {
        "baseUrl": "https://cdn.acme.com"
      },
      "welcomeMessage": "Welcome to acme web",
      "backgroundColor": "#4884157",
      "etc": "etc"
    }
  }
}
```

**session** values comes from your security plugin and  **settings** from `"frontend": {}` in your application.json

Your app (vue, react, angular, jquery, etc) must consume this endpoint in an early line in order to pass the configuration and session values to the entire application (js files)

# Development (vue, angular, react, etc)

In development stage, you must mock the  settings endpoint and use it with javascript variable.

You can inject this variable using [webpack](https://gist.github.com/jrichardsz/1d11120dab4764f4d7f42faf6460997f)

After that, add this snippet in the entrypoint of your app or an early line:

```js
var settingsUrl;
if(DEV_SETTINGS_URL){
  settingsUrl = DEV_SETTINGS_URL;
}else{
  var urlHelper = new microfrontendTools.UrlHelper();
  settingsUrl = urlHelper.getLocationBasePath();
}
```

In real environment, if your GeoFrontend server is deployed as www.acme.com, settings url will be www.acme.com/settings.json. You can use [microfrontend-tools](https://github.com/utec/microfrontend-tools) to get the exact settings url no matter if ip:port or domain is used.

Finally consume this url it with axios or pure javascript like **sample/index.html**

# Custom Security

By default, just a basic security is enabled. In order to disable it, change security.enable to false in application.json. Addtionally you can delete npmModule and configModule in application.json

If you need to create a custom security (users in a database ,an external api, oauth, google, etc), basically you just need to create a **plugin in form of an npm module** with the following interface:

**my-custom-security-module**
```javascript
function MyCustomSecurity(expressServer, options) {

  // required method
  this.ensureAuthenticated = function(req, res, next) {
    //put here your custom logic
  }

  //add another functions
}

module.exports = MyCustomSecurity;
```

Configure it in your application.json:

```json
"npmModule": {
  "name": "my-custom-security-module"
},
"configModule": {
  "param1": "at-field",
  "param_n": "dummy-eva"
}
```

And add it to your package.json.

**configModule** will be passed as argument to your plugin. Line 32 in security/SecurityConfigurator.js

> Note: You must publish your module in the public npm registry, in [github](https://stackoverflow.com/a/21918559/3957754) or in your private npm registry. At least option, you could add your code to the geofrontend code.

A complete guideline is available in the [wiki](https://github.com/utec/geofrontend-server/wiki/Custom-Security)

# Roadmap

- [ ] Use an advanced session store (i.e redis, mongo.) instead express default memory.
- [ ] Search an easy way for development stage: Frameworks in development mode, uses internal light server like express and **geofrontend server** works only for your builded assets.

# Contributors

<table>
  <tbody>
    <td>
      <img src="https://avatars0.githubusercontent.com/u/3322836?s=460&v=4" width="100px;"/>
      <br />
      <label><a href="http://jrichardsz.github.io/">Richard Leon</a></label>
      <br />
    </td>
    <td>
      <img src="https://avatars3.githubusercontent.com/u/1450270?s=460&v=4" width="100px;"/>
      <br />
      <label><a href="https://github.com/nbpalomino/">Nick Palomino</a></label>
      <br />
    </td>
  </tbody>
</table>

# License

[MIT License](./LICENSE)
