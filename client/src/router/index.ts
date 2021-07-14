import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/list',
    name: 'List',
    component: () => import('../views/List.vue')
  },
  {
    path: '/edit/:id',
    name: 'Edit',
    component: () => import('../views/Edit.vue'),
    props: true
  },
  {
    path: '/add',
    name: "Add",
    component: () => import("../views/Add.vue")
  },
  {
    path: '/authenticate',
    name: 'Authentication',
    component: () => import('../views/PassCode.vue')
  },
  {
    path: '/sessions',
    name: "Session Scheduling",
    component: () => import('../views/Schedule.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/list',
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: routes,
  linkActiveClass: 'active'
})

export default router
