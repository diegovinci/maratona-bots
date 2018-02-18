const restify = require('restify');
const builder = require('botbuilder');
const cognitiveService = require('botbuilder-cognitiveservices');
const customCognitiveService = require('../../helpers/customCognitiveService');

require('dotenv-extended').load();

// =========================================================
// Bot Setup
// =========================================================

const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`${server.name} listening to ${server.url}`);
});

const connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD,
});

const bot = new builder.UniversalBot(connector);
bot.set('storage', new builder.MemoryBotStorage());

server.post('/api/messages', connector.listen());

// =========================================================
// Dialog Settings
// =========================================================

const recognizer = new cognitiveService.QnAMakerRecognizer({
  knowledgeBaseId: process.env.QNAMAKER_KNOWLEDGE_BASE,
  subscriptionKey: process.env.QNAMAKER_SUBSCRIPTION_KEY,
  top: 3, // Definindo número de opções para o entendimento parcial da pergunta
});

const qnaMakerToolsPtBr = new customCognitiveService.QnAMakerToolsPtBr();
bot.library(qnaMakerToolsPtBr.createLibrary());

const qnaMakerDialog = new cognitiveService.QnAMakerDialog({
  recognizers: [recognizer],
  defaultMessage: 'Não entendi... Por favor, reformule a pergunta.',
  qnaThreshold: 0.5, // Definindo nível de acertividade
  feedbackLib: qnaMakerToolsPtBr,
});

bot.dialog('/', qnaMakerDialog);
