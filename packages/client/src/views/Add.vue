<template>
  <div id="container">
    Name:<input v-model="item.name" /><br />
    Type:<input v-model="item.type" /><br />
    <br />
    <textarea v-model="item.details"></textarea><br />
    <button @click="saveItem()">Save</button>
  </div>
</template>

<script>
import api from "../services/apiservice";
export default {
  props: ["id"],
  data: function () {
    return {
      item: {
        name: "",
        type: "",
        details: "",
      },
      validated: false,
    };
  },
  methods: {
    async saveItem() {
      await api.createItem(this.item);
      this.$router.push("/list");
    },
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