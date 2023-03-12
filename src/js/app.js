// TODO: write code here
import TrelloLogic from './logic';

const page = document.querySelector('#trello');
const app = new TrelloLogic(page);
app.init();
