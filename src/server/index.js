import express from "express"
import cors from "cors"
import React from 'react'
import { renderToString } from "react-dom/server"
import serialize from "serialize-javascript"
import { StaticRouter, matchPath } from "react-router-dom"

import App from '../shared/App'
import { fetchPopularRepos } from '../shared/api'
import routes from '../shared/routes'

const app = express()

app.use(cors())

// We're going to serve up the public
// folder since that's where our
// client bundle.js file will end up.
app.use(express.static("public"))

app.get("*", (req, res, next) => {
  const activeRoute = routes.find(
    (route) => matchPath(req.url, route)
  ) || {}

  const promise = activeRoute.fetchInitialData
    ? activeRoute.fetchInitialData(req.path)
    : Promise.resolve();

  promise.then((data) => {
    const context = data;
    const markup = renderToString(
      <StaticRouter location={req.url} context={{ data }}>
        <App />
      </StaticRouter>
    )
  
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Server-side rendered page</title>
          <script src="/bundle.js" defer></script>
          <script>window.__INITIAL_DATA__ = ${serialize(data)}</script>
        </head>
  
        <body>
          <div id="app">${markup}</div>
        </body>
      </html>
    `)
  }).catch(next)
  
})

app.listen(3000, () => {
  console.log(`Server is listening on port: 3000`)
})