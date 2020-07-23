<template>
  <div class="container">
    <div>
      <div>
        <form v-on:submit.prevent="searchItems()">
        <input v-model="searchterms"><button @click="searchItems()">Search</button>
        </form>
      </div>  
      <div id="listcontainer">
        <div class="itemcard" v-for="item in items" :key="item._id" @click="loadItem(item._id)">
            <div class="cardheader"><h1>{{item.name}}</h1><h2>type: {{item.type}}</h2><h3>edited by: {{item.edit}}</h3></div>
            <div class="details">
              <p>{{item.details}}</p>
          </div>
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
      var result = await api.getItems();
      result.sort(function(a,b) {
        return ('' + a.name).localeCompare(b.name)
      })
      this.items = result
      
      
    }, loadItem(id) {
      this.$router.push('/edit/'+id)
    }, async searchItems() {
      if(this.searchterms == "") {
        await this.getItems();
      } else {
        var result = await api.searchItems(this.searchterms)
        result.sort(function(a,b) {
          return ('' + a.name).localeCompare(b.name)
        })
        this.items = result
      }
    }
  },beforeMount() {
      console.log("hi?")
        this.getItems()
  }

}
</script>

<style scoped>
body{
  width:100%;
  height:100%;
  padding:0;
  margin:0;
}
.container{
  padding:0;
  margin:0;
  width:100%;
  display:flex;
  justify-content: center;
  text-align: center;
}
.itemcard{
  min-height: 10vh;
  max-height:8.4em;
  width: 30em;
  border-style:solid;
  border-radius: 2px;
  border-color:rgb(102, 102, 102);
  border-width:1px;
  box-shadow: 2px 3px 12px -4px rgba(43, 43, 43, 0.75);
  overflow:hidden;
  padding:0px;
}
.itemcard:hover{
  box-shadow: none;
}
#listcontainer{
  margin-top:20px;
  display: inline-block;
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap:1em;

}
.cardheader{
  overflow: auto;
  background-color: rgb(40, 100, 230);
  color:white;
  padding:2px;
  margin:0px;
}
h1{
  padding-left:20px;
  margin:5px;
  float:left;
}
h2{
  font-size: 19px;
  padding-top:14px;
  padding-left:30px;
  margin:0px;
  float:left;
}
h3{
  font-size:13px;
  float:right;
  margin:0px;
  padding-bottom:0px;
  padding-top:30px;
}

</style>

