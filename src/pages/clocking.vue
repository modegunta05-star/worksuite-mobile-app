<template>
    <f7-card class="dashboard-card">

        <f7-card-header class="color-white text-color-white bg-color-orange"
        >{{ trans('app.todaysAttendance') }}
            <f7-icon f7="alarm"></f7-icon>
        </f7-card-header>
        <f7-card-content>
            <f7-block class="error-block text-align-center margin-top"
                      v-if="error && error.innererror && (error.innererror.code === 2000 || error.innererror.code === 2001)">
                {{ error.message }}
            </f7-block>


            <f7-list media-list :class="`${busy ? 'skeleton-text skeleton-effect-wave' : ''}`" dividers>
                <f7-list-item :title="trans('modules.attendance.ipAddress')"
                              :after="ipAddress"></f7-list-item>
                <f7-list-item :title="trans('app.time')" :after="currentTime.format('LTS')"></f7-list-item>

                <template v-if="todayAttendance.attendance">
                    <f7-list-item
                            :title="trans('modules.attendance.clockedIn')"
                            :after="moment(todayAttendance.attendance.clock_in_time).format('LT')"
                            v-if="clocked_in"
                    >
                    </f7-list-item>
                    <f7-list-item
                            :title="trans('modules.attendance.clockedOut')"
                            :after="moment(todayAttendance.attendance.clock_out_time).format('LT')"
                            v-if="clocked_out"
                    >
                    </f7-list-item>
                    <f7-list-item :title="trans('modules.attendance.working_from')"
                                  :after="(work_from_type == 'other') ? working_from : work_from_type"></f7-list-item>
                </template>


                <template v-else>
                    <f7-list-input
                            :label="trans('modules.attendance.working_from')"
                            type="select"
                            :placeholder="trans('modules.attendance.workFrom')"
                            @change="onStatusChange"
                            :value="work_from_type"
                    >
                        <option :value="work"
                                v-for="work in work_from_types"
                                :selected="work == work_from_type"
                                :key="work">
                            {{ work }}
                        </option>
                    </f7-list-input>
                    <f7-list-input
                            v-if="work_from_type =='other'"
                            autofocus
                            clear-button
                            :label="trans('modules.attendance.otherPlace')"
                            autocorrect="off"
                            type="text"
                            @input="working_from = $event.target.value"
                    ></f7-list-input>

                </template>

                <f7-list-input hidden="hidden"></f7-list-input>
            </f7-list>
        </f7-card-content>
        <f7-card-footer
                v-if="
                error === null &&
                ((todayAttendance.office_hours_passed === false && todayAttendance.attendance === null) ||
                    (todayAttendance.attendance && todayAttendance.attendance.status !== 'absent')) &&
                remainingClockIn > 0
            "
        >
            <f7-button raised fill color="blue" @click="clockIn()" :disabled="busy || clocked_in">
                {{ clocked_in ? trans('modules.attendance.clockedIn') : trans('modules.attendance.clock_in') }}
            </f7-button>
            <f7-button raised fill color="red" @click="clockOut()" :disabled="busy || !clocked_in || clocked_out">
                {{ clocked_out ? trans('modules.attendance.clockedOut') : trans('modules.attendance.clock_out') }}
            </f7-button>
        </f7-card-footer>
        <f7-block v-if="remainingClockIn === 0"
                  class="error-block text-align-center margin-bottom padding-bottom margin-top">
            {{ trans('messages.maxClockin') }}
        </f7-block>
    </f7-card>
</template>
<script type="text/babel">
import moment from 'moment';
import Cache from '../js/vue/scripts/cache';
import axiosHttp from '../js/vue/boot/axiosHttp';
import CommonMixin from '../js/vue/mixins/common.vue';
import {f7} from 'framework7-vue';

export default {
    props: {
        f7route: Object,
        f7router: Object,
    },
    mixins: [CommonMixin],
    data() {
        return {
            todayAttendance: {},
            ipAddress: null,
            error: null,
            currentTime: moment(),
            diffFromLocalTime: 0, // Diff in seconds from local time. We use this difference to add to current local time to display clock,
            remainingClockIn: '',
            busy: true,
            work_from_types: ['home', 'office', 'other'],
            work_from_type: 'office',
            working_from: 'office',
        }
    },
    created() {
        if (this.work_from_types.length > 0) {
            this.work_from_type = 'office';
            this.working_from = 'office';
        }
    },
    methods: {
        onStatusChange(event) {
            this.work_from_type = event.target.value;
        },
        clockIn() {
            f7.preloader.show();

            const data = {
                work_from_type: this.work_from_type,
                working_from: this.working_from,
            };

            axiosHttp.post('/attendance/clock-in', data).then(
                (response) => {
                    Cache.removeMatching('attendance');
                    this.reRefeshData();
                })
                .catch((error) => {
                    f7.preloader.hide();
                });
        },
        clockOut() {
            f7.preloader.show();

            const data = {
                work_from_type: this.work_from_type,
                working_from: this.working_from,
            };

            axiosHttp.post(`/attendance/clock-out/${this.todayAttendance.attendance.id}`, data).then(
                () => {
                    Cache.removeMatching('attendance');
                    this.reRefeshData();
                },
                () => {
                    f7.preloader.hide();
                }
            );
        },
        getTodayAttendance() {
            return Cache.httpGet('/attendance/today')
                .then((response) => {
                    const {data} = response;
                    this.todayAttendance = data;
                    this.ipAddress = data.ip_address;
                    this.currentTime = moment(data.time);
                    this.remainingClockIn = data.remaining_clock_in;
                    this.diffFromLocalTime = this.currentTime.diff(moment(), 'seconds');

                    if (data.attendance) {
                        console.log('/attendance/today',data.attendance);
                        this.work_from_type = data.attendance.work_from_type;
                        this.working_from = data.attendance?.working_from;
                        // this.ipAddress = data.attendance.ip_address;
                    }

                    // Set clock ticking
                    setInterval(() => {
                        this.currentTime = moment().add(this.diffFromLocalTime, 'seconds');
                    }, 1000);
                })
                .catch((error) => {
                    this.error = error.response?.data?.error;
                });
        },
        loadData(refresh) {

            if (refresh) {
                Cache.removeMatching('employee');
                Cache.removeMatching('attendance');
            }

            this.busy = true;
            this.error = null;
            this.reRefeshData();
        },

        reRefeshData() {
            const promiseArray = [];
            promiseArray.push(this.getTodayAttendance());

            Promise.all(promiseArray)
                .then(() => {
                    // Handle successful resolution if needed
                })
                .finally(() => {
                    this.removePtrClass();
                    f7.preloader.hide();
                    this.busy = false;
                });

        },

        moment(date) {
            return moment(date);
        },

        duration(duration) {
            const hours = Math.floor(duration / 60);
            const minutes = duration % 60;

            if (hours === 0) {
                return `${minutes} mins`;
            }
            return `${hours} hrs ${minutes} mins`;

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
    computed: {
        clocked_in() {
            return this.todayAttendance.attendance !== null;
        },
        clocked_out() {
            return this.todayAttendance.attendance !== null && this.todayAttendance.attendance.clock_out_time !== null;
        },
    },
    mounted() {
        // this.loadData();
    },
};
</script>
