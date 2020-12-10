<template>
  <div id="app">
    <div id="nav">
      <router-link to="/list">List</router-link> <b>|</b>
      <router-link to="/authenticate">Authenticate</router-link>
      <b v-if="validated"> | </b>
      <router-link to="/add" v-if="validated">Add</router-link>
      <b v-if="validated"> | </b>
      <router-link to="/sessions" v-if="validated">Schedule</router-link>
    </div>
    <router-view />
  </div>
</template>
<script>
import api from "./services/apiservice";
export default {
  data: function () {
    return {
      validated: false,
    };
  },
  methods: {
    async validate() {
      if (localStorage.getItem("passcode") !== null) {
        this.validated = await api.validateToken(
          localStorage.getItem("passcode")
        );
      } else {
        this.validated = false;
      }
    },
  },
  beforeMount() {
    this.validate();
  },
  created() {
    this.$root.$on("send", (message) => {
      if (message === "authenticated") {
        this.validate();
      }
    });
  },
};
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #146abb;
}
</style>
