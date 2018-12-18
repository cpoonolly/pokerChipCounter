import Vue from 'vue'
import Router from 'vue-router'
import StartScreen from '@/components/StartScreen'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'StartScreen',
      component: StartScreen
    }
  ]
})
