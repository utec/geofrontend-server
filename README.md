# Geofront - The server for your frontends

![home](home.png)

Minimal nodejs express server to publish html static SPA webpage which is the result of **npm run build** command on your projects :react, angulas, vue ,etc and inject security and settings to your bundle

# Functionalities

- Static server for your builded assests from any framework like vue, angular, react. etc
- Forget about security when your are developing in any javascript framework, because the **geofrontend server** will manage it.
- How to keep one javascript build across several environments? Let me think.. Yeah **geofrontend server** will pubish and **/settings.json** http endpoint with custom configurtion for your web.

# Steps

- Clone project
- Put any web resources to **build** folder (css, js, fonts,html, etc). **index.html** file must exist. You could use the index.html in this repository as example.
- Install node libraries :

```
npm install
```

- By default security is disabled.

- Run

```shell
export PORT=8080
npm run start
```
- Go to your browser an enter to http://localhost:8080
- You could consume this endpoint http://localhost:8080/settings.json in your javascript app, which will return you the content of this section of your application.json

```json
"frontend": {

}
```

# Enable Security

Basically you just need to enable the security and set the name of your custom npm security module in the application.json

```json
"security": {
  "enable": true,
  "npmModule": "my_custom_security_module",
}
```

A complete guideline is available in the [wiki](https://github.com/utec/geofrontend-server/wiki/Security)

# TODO

- [ ] Use an advanced session store instead express default memory.
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
  </tbody>
</table>

# License

[MIT License](./LICENSE)
