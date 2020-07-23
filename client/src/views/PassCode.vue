<template>
    <div id="container2">
        <div id="alignment" v-if="!validated">
            <p>Enter Passcode:</p>
            <form v-on:submit.prevent='authenticate()'>
                <input v-model='passcode' ><button>Authenticate</button>
            </form>
        </div>
        <div id="temp" v-if="validated"><p>You are currently authenticated!</p>
            <button @click='clearAuthentication()'>Clear Authentication</button></div>
    </div>
</template>

<script>
import api from '../services/apiservice'
export default {
  data:function() {
    return {
      passcode: "",
      validated: false
    }
  },methods: {
        async authenticate() {
            if(await api.validateToken(this.passcode)) {
               localStorage.setItem("passcode",this.passcode)
               this.validated = true; 
               this.$root.$emit('send','authenticated')
            } else{
                alert("Incorrect passcode or something else went wrong.")
            }
        },
        async clearAuthentication() {
            api.clearToken(localStorage.getItem("passcode"))
            localStorage.removeItem("passcode")
            this.validated = false;
            this.$root.$emit('send','authenticated')
        }
    },async beforeMount() {
        if(localStorage.getItem("passcode") === null) {
            this.validated = false
        }else {
            if(await api.validateToken(localStorage.getItem("passcode"))) {
                this.validated = true
            } else {
                localStorage.removeItem("passcode")
                this.validated = false
            }
        }
    }
}
</script>

<style scoped>
p {
    font-size:20px;
}
html,body{
    padding:0;
    margin:0;
    width:100%;
    height:100%;
}
#container2{
    display:flex;
    min-height:100%;
    justify-content: center;
    align-items: center;
}
#alignment{
    margin:0px;
    padding:0;
    min-width: 300px;
    text-align: center;
    height:100%;
    align-items: center;

    
}
#alignment input{
    text-align: center;
    border-style:solid;
    border-width: 1px;
    margin:0;
    padding:0;
    width: 100%;
    font-size:40px;
    min-height: 2em;
}

button{
    margin:0 1px 0 1px;
    padding:0;
    font-size: 20px;
    border-style: none;
    border-width: 1px;
    color: white;
    border-radius: px;
    background-color: rgb(40, 100, 230);
    width: 100%;
    min-height: 2em;
}
button:hover{

    background-color: rgb(71, 121, 231);

}
</style>