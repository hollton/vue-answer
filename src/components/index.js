// const ComHeader = resolve => { require(['./Header/ComHeader'], resolve) };
// const SideBar = resolve => { require(['./SideBar/SideBar'], resolve) };
// const Question = resolve => { require(['./Question/Question'], resolve) };

import Header  from './Header';
import Footer from './Footer';
import SideBar from './SideBar/SideBar';
import AnswerQuestion from './Question/AnswerQuestion';  //作答题目界面
import MarkQuestion from './Question/MarkQuestion';  //批阅题目界面
import SideBarTools from './SideBar/Sections';
import Cover from './Cover';
import Loading from './Loading/Loading';
import Guide from './Guide/Guide';

export default {
    ...Header,
    ...Footer,
    SideBar,
    AnswerQuestion,
    MarkQuestion,
    ...SideBarTools,
    ...Cover,
    Loading,
    Guide
};