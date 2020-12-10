<template>
  <div>
    <Calendar class="center" @dayclick="dayClicked" :attributes="attributes" />
    <div v-if="selectedid >= 0" class="datepickerdiv">
      <date-picker
        class="center"
        :value="days"
        v-model="days[selectedid].date"
        mode="time"
        is24hr
        :minute-increment="15"
      />
      <button @click="closePicker()">Confirm</button>
      <button @click="removeDate()">Remove Date</button>
    </div>
  </div>
</template>

<script>
import Calendar from "v-calendar/lib/components/calendar.umd";
import DatePicker from "v-calendar/lib/components/date-picker.umd";
import api from "../services/apiservice";
export default {
  components: {
    Calendar,
    DatePicker,
  },
  data() {
    return {
      days: [],
      selectedid: -1,
    };
  },
  computed: {
    dates() {
      return this.days.map((day) => day.date);
    },
    attributes() {
      return this.dates.map((day) => ({ highlight: true, dates: day }));
    },
  },
  methods: {
    closePicker() {
      api.updateDate(this.days[this.selectedid]);
      this.selectedid = -1;
    },
    selectDate(id) {
      this.selectedid = id;
    },
    dayClicked(day) {
      var id = this.days.findIndex((d) => d.id === day.id);
      if (id < 0) {
        this.days.push({ id: day.id, date: day.date });
        api.addDate(this.days[this.days.length - 1]);
        id = this.days.length - 1;
      }
      if (this.selectedid >= 0) {
        api.updateDate(this.days[this.selectedid]);
      }
      this.selectedid = id;
    },
    removeDate() {
      api.removeDate(this.days.splice(this.selectedid, 1)[0]);
      this.selectedid = -1;
    },
  },
  async beforeMount() {
    var res = await api.getDates();
    if (res) {
      this.days = res;
    }
  },
};
</script>

<style scoped>
.datepickerdiv {
  margin-top: 2em;
  align-items: center;
}
.center {
  margin: auto;
}
</style>