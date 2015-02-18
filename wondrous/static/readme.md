### Frontend Wondrous App
-------

build on **flux** paradigm , meaning that each component is a view/controller (**action** creator). Each component is also listening to different stores.

Each action/piece of data goes through the dispatcher and is delegated into the **stores**. The stores ensure that data is consistent across all components -- making sure that there's only one copy. So if I am loading Navbar and settings, I would load data from from the same stores. At the same time, if the User Store changes, both settings and navbar will be updated with it.

### Directory
actions - lists all the actions

components - the view/controllers

constants - the constant variables to name the actions

dispatcher - the tiny piece of flux code that works to delegate **actions** to **stores** to **controllers**

stores - the js data storage (more or less a cache)
<hr>

##### requires Node.js/npm
To install everything in package.json `sudo npm install`

To build bundle.min.js `npm run build`

To start watching for changes (compiles to bundle.js) `npm run start`
