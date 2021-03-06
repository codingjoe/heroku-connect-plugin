'use strict'
const api = require('../../lib/connect/api.js')
const regions = require('../../lib/connect/regions.js')
const cli = require('heroku-cli-util')
const co = require('co')

module.exports = {
  topic: 'connect',
  command: 'info',
  default: false,
  description: 'display connection information',
  help: 'display connection information',
  flags: [
    {name: 'resource', description: 'specific connection resource name', hasValue: true},
    regions.flag
  ],
  needsApp: true,
  needsAuth: true,
  run: cli.command(co.wrap(function * (context, heroku) {
    context.region = yield regions.determineRegion(context, heroku)
    let connections = yield api.withUserConnections(context, context.app, context.flags, true, heroku)

    if (connections.length === 0) {
      console.log('No connection found, requesting auth...')
      yield api.requestAppAccess(context, context.app)
      connections = yield api.withUserConnections(context, context.app, context.flags, false, heroku)
    }

    if (connections.length === 0) {
      console.log('No connections found')
    }

    connections.forEach(function (connection) {
      api.connection_info(connection, true)
      console.log('')
    })
  }))
}
