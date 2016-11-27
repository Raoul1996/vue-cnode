/* eslint-disable */
import Index from '../page/index';
import User from '../page/user';
import Topic from '../page/topic';

const routes = [
  {
    path: '/',
    name: 'index',
    component: Index
  },
  {
    path: '/user/:id',
    name: 'user',
    component: User
  },
  {
    path: '/topic/:id',
    name: 'topic',
    component: Topic
  }
];

export default routes;
