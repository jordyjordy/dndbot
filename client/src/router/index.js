import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

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
    props:true
  },
  {
    path: '/add',
    name: "Add",
    component: () => import("../views/Add.vue")
  },
  {
      path: '/*',
      name: "leftover",
      component: Vue.component("page-not-found", {
        template: "",
        created: function() {
          this.$router.push("/list")
        }
      })
      
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
