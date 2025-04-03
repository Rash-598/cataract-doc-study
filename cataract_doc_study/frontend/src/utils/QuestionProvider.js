import questionsData from '../data/questions.json';

class QuestionProvider {
  constructor() {
    this.questions = questionsData;
  }

  getQuestion(question_id) {
    return this.questions.find(question => question.id === question_id);
  }

  getQuestionsByCondition(condition_id) {
    return this.questions.filter(question => question.condition_id === condition_id);
  }

  getAllQuestions() {
    return this.questions;
  }
}

const questionProvider = new QuestionProvider();
export default questionProvider;
