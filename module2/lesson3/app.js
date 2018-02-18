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
  top: 3, // Definindo número de alternativas retornadas para o usuário
});

const qnaMakerToolsPtBr = new customCognitiveService.QnAMakerToolsPtBr();
bot.library(qnaMakerToolsPtBr.createLibrary());

const qnaMakerDialog = new cognitiveService.QnAMakerDialog({
  recognizers: [recognizer],
  defaultMessage: 'Não entendi... Por favor, reformule a pergunta.',
  qnaThreshold: 0.5, // Ajustando nível de acertividade
  feedbackLib: qnaMakerToolsPtBr,
});

// Configurando bot para retornar respostas em forma de cards
qnaMakerDialog.respondFromQnAMakerResult = (session, result) => {
  const firstAnswer = result.answers[0].answer;
  const option = firstAnswer.split(';');
  if (option.length === 1) {
    return session.send(firstAnswer);
  }
  const [titulo, descricao, url, imagem] = option;
  const card = new builder.HeroCard(session)
    .title(titulo)
    .text(descricao)
    .images([
      builder.CardImage.create(session, imagem.trim()),
    ])
    .buttons([
      builder.CardAction.openUrl(session, url.trim(), 'Comprar'),
    ]);

  const answer = new builder.Message(session).addAttachment(card);
  return session.send(answer);
};

bot.dialog('/', qnaMakerDialog);
