const restify = require('restify');
const builder = require('botbuilder');

require('dotenv-extended').load();

// Definições do Restify Server
const server = restify.createServer();
server.listen(process.env.PORT, () => {
  console.log(`${server.name} listening to ${server.url}`);
});

// Criando um chat connector para se comunicar com o Bot Framework Services
const connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD,
});

// Endpoint que irá monitorar as mensagens do usuário
server.post('/api/messages', connector.listen());

// Recebe as mensagens do usuário e responde repetindo cada mensagem (prefixado com 'Você disse:')
const bot = new builder.UniversalBot(connector, (session) => {
  session.send(`Você disse: ${session.message.text}`);
});

// Opcional - Registrando o estado do bot em memória
const inMemoryStorage = new builder.MemoryBotStorage();
bot.set('storage', inMemoryStorage);
