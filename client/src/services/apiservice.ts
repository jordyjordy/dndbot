import axios from 'axios'
const ip = process.env.VUE_APP_SERVER_IP

type day = { id: Number, date: Date, _id?: Number }
type item = any

export default {
    getItems: async function () {
        const url = ip + "/item/list"
        try {
            const result = await axios.get(url)
            console.log(result)
            return result.data
        } catch (err) {
            return []
        }
    },
    getItemById: async function (id: Number) {
        const url = ip + "/item/id?id=" + id
        try {
            const result = await axios.get(url)
            return result.data
        } catch (err) {
            return {}
        }
    },
    saveItem: async function (item: item) {
        const url = ip + "/item/update"
        try {
            const result = await axios.put(url, { item }, { headers: { token: localStorage.getItem('passcode') } })
            return true
        } catch (err) {
            return false

        }
    },
    createItem: async function (item: item) {
        const url = ip + "/item/add"
        try {
            const result = await axios.post(url, { item }, { headers: { token: localStorage.getItem('passcode') } })
            return true
        } catch (err) {
            return false
        }
    },
    deleteItem: async function (id: Number) {
        const url = ip + '/item/delete?id=' + id
        try {
            const result = await axios.delete(url, { headers: { token: localStorage.getItem('passcode') } })
            return true
        } catch (err) {
            return false
        }
    },
    searchItems: async function (terms: String) {
        const url = ip + "/item/search?name=" + terms
        try {
            const result = await axios.get(url)
            return result.data
        } catch (err) {
            return []
        }
    },
    validateToken: async function (token: String) {
        const url = ip + "/token/validate?token=" + token
        try {
            const result = await axios.get(url)
            return result.data
        } catch (err) {
            return false
        }

    },
    clearToken: async function (token: String) {
        const url = ip + '/token/clear?token=' + token
        try {
            const result = await axios.delete(url)
            return result.data
        } catch (err) {
            return false
        }
    },
    getDates: async function (token: String) {
        const url = ip + '/sessions'
        try {
            const result = await axios.get(url)
            if (result.data) {
                if (result.data) {
                    return result.data.map((day: { id: Number, date: Date }) => {
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
    addDate: async function (day: day) {
        const url = ip + "/sessions/add"
        try {
            var tempday: { id: Number, date: Number } = { id: day.id, date: 0 }
            tempday.date = day.date.getTime()
            const result = await axios.post(url, { day: tempday }, { headers: { token: localStorage.getItem('passcode') } })
            return result.data.date._id
        } catch (err) {
            return false
        }
    },
    updateDate: async function (day: day) {
        const url = ip + "/sessions/update"
        try {
            var tempDate: { _id?: Number, id: Number, date: Number } = { _id: day._id, id: day.id, date: 0 }
            tempDate.date = day.date.getTime()
            const result = await axios.put(url, { day: tempDate }, { headers: { token: localStorage.getItem('passcode') } })
            return true
        } catch (err) {
            return false
        }
    },
    removeDate: async function (day: day) {
        var url = ip + '/sessions/delete' + "?id=" + day.id
        try {
            const result = await axios.delete(url, { headers: { token: localStorage.getItem('passcode') } })
            return true
        } catch (err) {
            return false
        }
    }
}