<style type="text/css" scoped>
#selected {
    background-color: rgba(0, 0, 0, 0.15);
}
</style>
<template>
    <f7-page ptr @ptr:refresh="refresh" @page:init="pageLoad" id="task-list" :page-content="false">
        <!-- Top Navbar -->
        <f7-navbar :sliding="false" back-link v-if="f7route.params.from">
            <f7-nav-title>
                {{ trans('app.menu.attendance') }} ({{ moment(selectedDate).format('DD MMM YYYY') }})
            </f7-nav-title>
            <f7-nav-right>
                <f7-link href="#" @click.prevent="selectDate" icon-f7="calendar"></f7-link>
            </f7-nav-right>
            <f7-sheet :opened="datepickerOpen" ref="datepicker" class="picker-calendar">
                <f7-link href="#" @click.prevent="selectDate" icon-f7="calendar"></f7-link>
                <f7-input type="hidden" readonly="readonly" id="attendance-picker-calendar"/>
            </f7-sheet>
        </f7-navbar>
        <f7-navbar :sliding="false" v-else>
            <f7-nav-left>
                <f7-link icon-ios="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
            </f7-nav-left>
            <f7-nav-title v-if="!f7route.params.from">
                {{ trans('app.menu.attendance') }} ({{ moment(selectedDate).format('DD MMM YYYY') }})
            </f7-nav-title>
            <f7-nav-right>
                <f7-link href="#" @click.prevent="selectDate" icon-f7="calendar"></f7-link>
            </f7-nav-right>
            <f7-sheet :opened="datepickerOpen" ref="datepicker" class="picker-calendar">
                <f7-link href="#" @click.prevent="selectDate" icon-f7="calendar"></f7-link>
                <f7-input type="hidden" readonly="readonly" id="attendance-picker-calendar"/>
            </f7-sheet>
        </f7-navbar>

        <f7-toolbar tabbar theme="orange" position="top" v-if="$store.getters.isAdmin">
            <f7-link :tab-link="'#present' + pageId" tab-link-active>{{ trans('modules.attendance.present') }}
                ({{ totalPresent }})
            </f7-link>
            <f7-link :tab-link="'#absent' + pageId">{{ trans('modules.attendance.absent') }} ({{
                    totalAbsent
                }})
            </f7-link>
        </f7-toolbar>
        <f7-tabs swipeable>
            <f7-tab :id="'present' + pageId" tab-active class="page-content">
                <skeleton v-if="busy && !isRefreshing"></skeleton>
                <div v-else>
                    <f7-block v-if="totalPresent === 0" class="text-align-center">
                        {{ trans('messages.noAttendanceDetailToday') }}
                    </f7-block>
                </div>
                <f7-block v-if="!busy && notMarked.length === 0" style="text-align: center">
                    {{ trans('messages.noAttendanceDetailToday') }}
                </f7-block>
                <f7-list media-list inset dividers strong id="employee-list" class="search-list searchbar-found">
                    <f7-list-item
                            media-item
                            v-for="item in present"
                            v-bind:key="item.id"
                            :title="item.user.name"
                            :text="formatSubtitle(item.user)"
                    >
                        <template #after>
                            <div >
                                <f7-link :tooltip="item.half_day_type"  v-if="item.half_day === 'yes'" class="icon-tooltip">
                                    <f7-icon f7="star_lefthalf_fill" size="15px" color="red"
                                             style="vertical-align:baseline"></f7-icon>
                                </f7-link>
                                {{ moment(item.clock_in_time).format('LT') }}
                            </div>
                        </template>
                        <template #media>
                            <img :src="item.user.image_url" width="44" height="44" class="lazy lazy-fade-in"/>
                        </template>
                    </f7-list-item>
                </f7-list>
            </f7-tab>
            <f7-tab :id="'absent' + pageId" class="page-content">
                <skeleton v-if="busy && !isRefreshing"></skeleton>
                <div v-else>
                    <f7-block v-if="notMarked.length === 0 && !isRefreshing" style="text-align: center">
                        {{ trans('modules.attendance.everyonePresent') }}
                    </f7-block>
                </div>
                <f7-list media-list inset dividers strong id="employee" class="search-list searchbar-found"
                         v-if="!busy && !isRefreshing">

                    <f7-list-item
                            v-for="item in notMarked"
                            v-bind:key="item.id"
                            :badge="trans('modules.attendance.absent')"
                            :title="item.name"
                            :text="formatSubtitle(item)"
                    >
                        <template #media>
                            <img :src="item.image_url" width="44" height="44" class="lazy lazy-fade-in"/>
                        </template>
                    </f7-list-item>
                </f7-list>
            </f7-tab>

        </f7-tabs>
    </f7-page>
</template>

<script type="text/babel">
import {f7} from 'framework7-vue';
import CommonMixin from '../../js/vue/mixins/common.vue';
import moment from 'moment';
import Cache from '../../js/vue/scripts/cache';
import _ from 'lodash';
import Skeleton from "./skeleton.vue";

export default {
    components: {Skeleton},
    props: {
        f7route: Object,
        f7router: Object,
    },
    mixins: [CommonMixin],
    data() {
        return {
            calender: '',
            employeeList: [],
            presentEmployees: [],
            selectedDate: new Date(),
            datepickerOpen: false,
            filters: '',
            isRefreshing: false,
            pageId: 1, // This is to change tab ids, because tab links do not work because of page caching
            busy: false,
        };
    },
    created() {
        this.pageId = Math.round(Math.random() * 100);
    },
    mounted() {

    },
    methods: {
        pageLoad(page) {
            f7.tooltip.create({
                targetEl: '.icon-tooltip',
                text: 'Tooltip text',
            });
            this.init();
        },
        init() {
            this.busy = true;
            const promises = [];
            promises.push(this.getEmployees());
            promises.push(this.getPresentEmployees());
            promises.push(this.initCalendar());

            Promise.all(promises).then(() => {
                this.busy = false;
                this.removePtrClass();
            }).catch(() => {
                this.busy = false;
                this.removePtrClass();
            });

        },
        refresh() {
            this.isRefreshing = true;
            Cache.removeMatching('employee');
            Cache.removeMatching('attendance');
            this.init();

            this.isRefreshing = false
        },
        removePtrClass() {
            let active = document.querySelectorAll('.ptr-content');
            for (let i = 0; i < active.length; i++) {
                active[i].classList.remove('ptr-refreshing');
                active[i].classList.remove('ptr-pull-up');
                active[i].classList.remove('ptr-transitioning');
            }
        },

        getEmployees() {
            return Cache.httpGet(
                `/employee?fields=${encodeURIComponent(
                    'id,name,email,image,image_url,status,pending_task,leaves_taken,projects_count,employeeDetail.limit(1000){id,employee_id},employeeDetail:department{id,team_name},employeeDetail:designation{id,name}'
                )}&filters=status eq "active"&limit=1000`
            ).then((response) => {
                this.employeeList = response.data;
            });
        },
        getPresentEmployees() {
            return Cache.httpGet(
                `/attendance?fields=${encodeURIComponent(
                    'id,half_day,half_day_type,clock_in_date,clock_in_time,user.limit(1000){id,name,email,status,image,image_url},user:employeeDetail.limit(1000){id,employee_id},user:employeeDetail:designation.limit(1000){id,name},user:employeeDetail:department.limit(1000){id,team_name}'
                )}&filters=clock_in_time lk "${moment(this.currentDate).format('YYYY-MM-DD')}%"&limit=1000`
            ).then((response) => {
                this.presentEmployees = response.data;
            });
        },
        selectDate() {
            this.calender.open();
        },
        moment(date) {
            return moment(date);
        },
        initCalendar() {
            this.calender = f7.calendar.create({
                inputEl: '#attendance-picker-calendar',
                openIn: 'customModal',
                header: true,
                footer: true,
                closeOnSelect: true,
                on: {
                    change: this.setDate,
                },
            });
        },
        setDate(c, val) {
            (this.selectedDate = val[0]), this.init();
        },
        getFilters() {
            let filters = '';
            const date = moment(this.selectedDate).format('YYYY-MM-DD');
            filters += `clock_in_time lk "${this.currentDate}%" and`;

            // Remove trailing 'and' and encode for URI
            filters = encodeURIComponent(this.filters.substring(0, this.filters.length - 4));

            return filters;
        },
        formatSubtitle(employee) {
            const detail = employee?.employee_detail;

            return [
                detail?.designation?.name,
                detail?.department?.team_name
            ].filter(Boolean).join(', ');
        },
        show(item) {
            this.f7router.navigate({
                name: 'employee.show',
                params: {
                    id: item.id,
                },
                query: {
                    item: JSON.stringify(item),
                },
            });
        },
    },
    computed: {
        present() {
            return this.presentEmployees;
        },
        totalPresent() {
            return this.presentEmployees.length;
        },
        notMarked() {
            const marked = _.map(this.presentEmployees, (item) => item.user.id);
            return _.filter(this.employeeList, (item) => marked.indexOf(item.id) === -1);
        },
        totalAbsent() {
            const marked = _.map(this.presentEmployees, (item) => item.user.id);
            return _.filter(this.employeeList, (item) => marked.indexOf(item.id) === -1).length;
        },
        currentDate() {
            return this.selectedDate;
        },
    },
};
</script>
