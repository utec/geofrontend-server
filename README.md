# GeoFrontend - The server for your frontends

![home](home.png)

Minimal nodejs express server to publish html static SPA webpage which is the result of **npm run build** command on your projects :react, angulas, vue ,etc and inject security and settings to your bundle

# Functionalities

- Static server for your builded assests from any framework like vue, angular, react. etc
- Forget about security when your are developing in any javascript framework, because the **geofrontend server** will manage it.
- By default, **basic authentication** is ready to use.
- How to keep one javascript build across several environments? Let me think.. Yeah **geofrontend server** will pubish and **/settings.json** http endpoint with custom configurtion for your web.

# Modes

In order to publish your static assets, you could choose one of these modes:

- GeoFrontend server as npm module
- GeoFrontend server as standalone


# Geofront server as npm module

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

# Geofront server as standalone

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

# Custom Security

Basically you just need to create an npm module with the following interface:

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
