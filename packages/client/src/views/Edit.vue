<template>
  <div id="container">
    Name:<input v-model="item.name" /><br />
    Type:<input v-model="item.type" /><br /><br />
    <textarea v-model="item.details"></textarea><br />
    <button @click="saveItem()" v-if="validated">Save</button>
    <button @click="deleteItem()" v-if="validated">Delete</button>
  </div>
</template>

<script>
import api from "../services/apiservice";
export default {
  props: ["id"],
  data: function () {
    return {
      item: {
        name: "temp",
        type: "temp",
        details: "temp",
      },
      loaded: false,
      validated: false,
    };
  },
  methods: {
    async getItem(id) {
      var temp = await api.getItemById(id);
      this.item = temp;
      this.loaded = true;
    },
    async saveItem() {
      if (this.loaded) {
        if (await api.saveItem(this.item)) {
          this.$router.push("/list");
        } else {
          alert(
            "something went wrong with saving, your token probably timed out. Sorry bro."
          );
        }
      }
    },
    async deleteItem() {
      if (this.loaded) {
        await api.deleteItem(this.item._id);
        this.$router.push("/list");
      }
    },
  },
  async beforeMount() {
    this.getItem(this.id);
    if (localStorage.getItem("passcode") !== null) {
      this.validated = await api.validateToken(
        localStorage.getItem("passcode")
      );
    } else {
      this.validated = false;
    }
  },
};
</script>

<style>
textarea {
  resize: vertical;
  width: 40vw;
  height: 30vh;
}
</style>