import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue'
const app = createApp({})
const routes = [
  {
    path: '/list',
    name: 'List',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "list" */ '../views/List.vue')
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
    path: '/*',
    name: "leftover",
    component: app.component("page-not-found", {
      template: "",
      created: function () {
        this.$router.push("/list")
      }
    })

  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router