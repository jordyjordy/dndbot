<template>
  <div class="container">
    <div>
       <form v-on:submit.prevent="searchItems()">
      <input v-model="searchterms"><button @click="searchItems()">Search</button>
       </form>
    </div>
    <div id="listcontainer">
      <div class="itemcard" v-for="item in items" :key="item._id" @click="loadItem(item._id)">
        <div class="cardheader"><h1>{{item.name}} </h1></div>
        <div class="details">
          <p>Type: {{item.type}}</p>
          <p>{{item.details}}</p>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import api from '../services/apiservice'
export default {
  data:function() {
    return {
      items: [],
      searchterms: ""
    }
  },
  methods: { 
    async getItems() {
      console.log("hi")
      this.items = await api.getItems();
      
    }, loadItem(id) {
      this.$router.push('/edit/'+id)
    }, async searchItems() {
      if(this.searchterms == "") {
        await this.getItems();
      } else {
        this.items = await api.searchItems(this.searchterms)
      }
    }
  },beforeMount() {
      console.log("hi?")
        this.getItems()
  }

}
</script>

<style>
.container{
  margin:0 25% 0 25%;
}
.itemcard{
  height: 15vh;
  width: 50vw;
  margin-top:20px;
  border-style:none;
  border-radius: 20px;
  box-shadow: 6px 7px 18px -2px rgba(0,0,0,0.75);
  overflow:hidden;
  padding:0px;
}
.itemcard:hover{
    box-shadow: 0px 0px 7px -1px rgba(0,0,0,0.75);
}

.cardheader{
  background-color: rgb(40, 100, 230);
  color:white;
  padding:0px;
}
h1{
  margin:0px;
}
</style>

