<style type="text/css"></style>
<template>
    <f7-card class="dashboard-card">

        <f7-card-header class="color-white text-color-white bg-color-orange " title="Header">
            {{ trans('app.todaysAttendance') }}
            <f7-icon f7="alarm"></f7-icon>
        </f7-card-header>
        <f7-card-content :class="`${busy ? 'skeleton-text skeleton-effect-wave' : ''}`">
            <p>
                <strong>{{ trans('modules.attendance.present') }} ({{ presentCount }})</strong>
            </p>
            <f7-progressbar :progress="present" color="green" class="attendance-progress"></f7-progressbar>

            <p>
                <strong>{{ trans('modules.attendance.absent') }} ({{ absentCount }})</strong>
            </p>
            <f7-progressbar :progress="absent" color="red" class="attendance-progress"></f7-progressbar>
        </f7-card-content>
        <f7-card-footer :class="`${busy ? 'skeleton-text skeleton-effect-wave' : ''}`">
            <f7-link href="/attendance/from-dashboard" :ignore-cache="false">
                {{ trans('modules.attendance.viewFullAttendance') }}
            </f7-link>
        </f7-card-footer
        >
    </f7-card>
</template>
<script type="text/babel">
import moment from 'moment';
import Cache from '../js/vue/scripts/cache';
import CommonMixin from '../js/vue/mixins/common.vue';
import axiosHttp from '../js/vue/boot/axiosHttp';

export default {
    props: {
        f7route: Object,
        f7router: Object,
    },
    mixins: [CommonMixin],
    data() {
        return {
            employees: [],
            attendances: [],
            busy: true,
        };
    },
    methods: {
        init(refresh) {

            if(refresh){
                Cache.removeMatching('employee');
                Cache.removeMatching('attendance');
            }

            this.busy = true;
            const promises = [];
            promises.push(this.getEmployees());
            promises.push(this.getTodayAttendance());

            Promise.all(promises).then(
                () => {
                    // console.log(this.item);
                    // this.item.project = _.find(this.projects, (item) => item.id === id)
                    this.busy = false;
                    this.removePtrClass();
                },
                () => {
                    this.busy = false;
                    this.removePtrClass();
                }
            );
        },
        getEmployees() {
            return Cache.httpGet(
                '/employee?fields=id,name,email,status,image,image_url,employeeDetail{id,employee_id}&limit=1000&filters=status eq "active"'
            ).then((response) => {
                this.employees = response.data;
            });
        },
        getTodayAttendance() {
            const date = moment().format('YYYY-MM-DD');

            return Cache.httpGet(`/attendance?fields=${encodeURIComponent('id,user{id,name,image,image_url}')}&filters=clock_in_time lk "${date}%"&limit=1000`)
                .then((response) => {
                    this.attendances = response.data;
                });
        },
        refresh() {
            this.init(true);
        },

        moment(date) {
            return moment(date);
        },
        removePtrClass() {
            let active = document.querySelectorAll('.ptr-content');
            for (let i = 0; i < active.length; i++) {
                active[i].classList.remove('ptr-refreshing');
                active[i].classList.remove('ptr-pull-up');
                active[i].classList.remove('ptr-transitioning');
            }
        },
    },
    mounted() {
        this.init();
    },
    computed: {
        present() {
            if (this.employees.length > 0) {
                return Math.round((this.attendances.length / this.employees.length) * 100);
            }
            return 0;
        },

        presentCount() {
            if (this.employees.length > 0) {
                return this.attendances.length;
            }
            return 0;
        },

        absent() {
            if (this.employees.length > 0) {
                return Math.round(((this.employees.length - this.attendances.length) / this.employees.length) * 100);
            }

            return 0;

        },

        absentCount() {
            if (this.employees.length > 0) {
                return this.employees.length - this.attendances.length;
            }

            return 0;

        },
    },
};
</script>
