<template>
  <div id="container">
      Name:<input v-model="item.name"><br>
      Type:<input v-model="item.type"><br>
      <br>
      <textarea v-model="item.details"></textarea><br>
      <button @click="saveItem()">Save</button>
  </div>

</template>

<script>
import api from '../services/apiservice'
export default {
    props: ['id'],
    data: function() {
        return {
            item: {
                name: "",
                type: "",
                details: "",
            }
        }
    },
    methods: {
        async getItem(id) {
            var temp = await api.getItemById(id)
            this.item = temp
        },
        async saveItem() {
            console.log(this.item.details)
            console.log("yay")
            await api.createItem(this.item)
            this.$router.push('/list')

        }
    }, beforeMount() {
        this.getItem(this.id)
    }

}
</script>

<style>
textarea{
    resize: vertical;
    width: 40vw;
    height:30vh;
}
</style>