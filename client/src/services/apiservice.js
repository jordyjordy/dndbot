import axios from 'axios'
const ip = process.env.VUE_APP_SERVER_IP

export default {
    getItems: async function() {
        const url = ip + "/item/list"
        console.log(url)
        try{
            const result = await axios.get(url)
            return result.data
        } catch(err) {
            return []
        }
    },
    getItemById: async function(id) {
        const url = ip + "/item/id?id=" + id
        try{
            const result = await axios.get(url)
            return result.data
        } catch(err) {
            return {}
        }
    },
    saveItem: async function(item) {
        const url = ip + "/item/update"
        try{
            const result = await axios.put(url, {item})
            return true
        } catch (err) {
            return false

        }
    },
    createItem: async function(item) {
        const url = ip + "/item/add"
        try{
            const result = await axios.post(url, {item})
            return true
        } catch(err) {
            return false
        }
    },
    deleteItem: async function(id) {
        const url = ip + '/item/delete?id='+id
        try{
            const result = await axios.delete(url)
            return true
        } catch(err) {
            return false
        }
    },
    searchItems: async function(terms) {
        const url = ip+ "/item/search?name=" + terms
        try{
            const result = await axios.get(url)
            return result.data
        } catch(err) {
            return []
        }
    }
}