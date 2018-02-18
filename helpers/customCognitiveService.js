const builder = require('botbuilder');
const entities = require('html-entities');

const htmlentities = new entities.AllHtmlEntities();

const customCognitiveService = (() => {
  const answerSelectionDialog = [
    (session, args) => {
      const qnaMakerResult = args;
      const qnaMakerSession = session;
      qnaMakerSession.dialogData.qnaMakerResult = qnaMakerResult;
      const questionOptions = qnaMakerResult.answers.map(qna => (
        htmlentities.decode(qna.questions[0])
      ));
      const promptOptions = { listStyle: builder.ListStyle.button };
      builder.Prompts.choice(session, 'Escolha abaixo', questionOptions, promptOptions);
    },
    (session, results) => {
      const { qnaMakerResult } = session.dialogData;
      const filteredResult = qnaMakerResult.answers.filter(qna => (
        htmlentities.decode(qna.questions[0]) === results.response.entity
      ));
      const selectedQnA = filteredResult[0];
      session.send(selectedQnA.answer);
      session.endDialogWithResult(selectedQnA);
    },
  ];

  function QnaMakerToolsPtBr() {
    this.lib = new builder.Library('QnaMakerToolsPtBr');
    this.lib.dialog('answerSelection', answerSelectionDialog);
  }

  QnaMakerToolsPtBr.prototype.createLibrary = function createLibrary() {
    return this.lib;
  };

  QnaMakerToolsPtBr.prototype.answerSelector = function answerSelector(session, options) {
    session.beginDialog('QnaMakerToolsPtBr:answerSelection', options || {});
  };

  return QnaMakerToolsPtBr;
})();

exports.QnAMakerToolsPtBr = customCognitiveService;
