const restify = require('restify')
const builder = require('botbuilder')

// Setup Restify Server
const server = restify.createServer()
server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`${server.name} listening to ${server.url}`)
})

// Crie um chat connector para se comunicar com o Bot Framework Service
const connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
})

// Endpoint que irá monitorar as mensagens do usuário
server.post('/api/messages', connector.listen())

// Recebe as mensagens do usuário e responde repetindo cada mensagem (prefixado com 'Você disse:')
const bot = new builder.UniversalBot(connector, session => {
  session.send(`Você disse: ${session.message.text}`)
})
