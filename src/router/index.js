import Vue from 'vue';
import Router from 'vue-router';
import StartScreen from '@/components/StartScreen';
import NewGameScreen from '@/components/NewGameScreen';

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'StartScreen',
      component: StartScreen
    },
    {
      path: '/new-game',
      name: 'NewGameScreen',
      component: NewGameScreen
    }
  ]
})
