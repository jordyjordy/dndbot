import axios from 'axios'
const ip = process.env.VUE_APP_SERVER_IP

export default {
    getItems: async function () {
        const url = ip + "/item/list"
        try {
            const result = await axios.get(url)
            return result.data
        } catch (err) {
            return []
        }
    },
    getItemById: async function (id) {
        const url = ip + "/item/id?id=" + id
        try {
            const result = await axios.get(url)
            return result.data
        } catch (err) {
            return {}
        }
    },
    saveItem: async function (item) {
        const url = ip + "/item/update"
        try {
            const result = await axios.put(url, { item }, { headers: { token: localStorage.getItem('passcode') } })
            return true
        } catch (err) {
            return false

        }
    },
    createItem: async function (item) {
        const url = ip + "/item/add"
        try {
            const result = await axios.post(url, { item }, { headers: { token: localStorage.getItem('passcode') } })
            return true
        } catch (err) {
            return false
        }
    },
    deleteItem: async function (id) {
        const url = ip + '/item/delete?id=' + id
        try {
            const result = await axios.delete(url, { headers: { token: localStorage.getItem('passcode') } })
            return true
        } catch (err) {
            return false
        }
    },
    searchItems: async function (terms) {
        const url = ip + "/item/search?name=" + terms
        try {
            const result = await axios.get(url)
            return result.data
        } catch (err) {
            return []
        }
    },
    validateToken: async function (token) {
        const url = ip + "/token/validate?token=" + token
        try {
            const result = await axios.get(url)
            return result.data
        } catch (err) {
            return false
        }

    },
    clearToken: async function (token) {
        const url = ip + '/token/clear?token=' + token
        try {
            const result = await axios.delete(url)
            return result.data
        } catch (err) {
            return false
        }
    },
    getDates: async function (token) {
        const url = ip + '/sessions'
        try {
            const result = await axios.get(url)
            if (result.data) {
                if (result.data) {
                    return result.data.map(day => {
                        var temp = day
                        temp.date = new Date(day.date)
                        return temp;
                    });
                }
                return false;
            }
        } catch (err) {
            return false
        }
    },
    addDate: async function (day) {
        const url = ip + "/sessions/add"
        try {
            var tempday = { _id: day._id, id: day.id }
            tempday.date = day.date.getTime()
            const result = await axios.post(url, { day: tempday }, { headers: { token: localStorage.getItem('passcode') } })
            return true
        } catch (err) {
            return false
        }
    },
    updateDate: async function (day) {
        const url = ip + "/sessions/update"
        try {
            var tempDate = { _id: day._id, id: day.id }
            tempDate.date = day.date.getTime()
            const result = await axios.put(url, { day: tempDate }, { headers: { token: localStorage.getItem('passcode') } })
            return true
        } catch (err) {
            return false
        }
    },
    removeDate: async function (day) {
        var url = ip + '/sessions/delete' + "?id=" + day.id
        try {
            const result = await axios.delete(url, { headers: { token: localStorage.getItem('passcode') } })
            return true
        } catch (err) {
            return false
        }
    }
}