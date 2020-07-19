<template>
  <div id="container">
      Name:<input v-model="item.name"><br>
      Type:<input v-model="item.type"><br><br>
      <textarea v-model="item.details"></textarea><br>
      <button @click="saveItem()">Save</button>
      <button @click="deleteItem()">Delete</button>
  </div>

</template>

<script>
import api from '../services/apiservice'
export default {
    props: ['id'],
    data: function() {
        return {
            item: {
                name: "temp",
                type: "temp",
                details: "temp",
            },
            loaded: false
        }
    },
    methods: {
        async getItem(id) {
            var temp = await api.getItemById(id)
            this.item = temp
            this.loaded = true
        },
        async saveItem() {
            console.log(this.item.details)
            if(this.loaded) {
                console.log("yay")
                await api.saveItem(this.item)
                this.$router.push('/list')
            }

        },
        async deleteItem() {
            if(this.loaded) {
                console.log("yay")
                await api.deleteItem(this.item._id)
                this.$router.push('/list')
            }
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