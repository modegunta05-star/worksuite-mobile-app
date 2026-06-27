<style type="text/css">
.badge-profile-image {
    height: 40px;
    width: 40px;
    border-radius: 50%;
}
</style>
<template>
    <f7-page @page:init="pageLoad">
        <f7-navbar :back-link="true" :title="trans('app.menu.events')" sliding layout="dark" theme="white"></f7-navbar>
        <f7-card>
            <f7-list media-list  v-if="item" outline dividers>
                <f7-list-item :title="trans('modules.events.eventName')" :after="item.event_name"></f7-list-item>
                <f7-list-item :title="trans('modules.events.startOn')" :after="formatStartDate()"></f7-list-item>
                <f7-list-item :title="trans('modules.events.endOn')" :after="formatEndDate()"></f7-list-item>
            </f7-list>
            <f7-block-title v-if="item">{{ trans('modules.events.where') }}</f7-block-title>
            <f7-block inner v-if="item">
                <template v-if="item.where">
                    {{ item.where }}
                </template>
                <template v-else>-</template>
            </f7-block>
            <f7-block-title v-if="item">{{ trans('app.details') }}</f7-block-title>
            <f7-block inner v-if="item">
                <template v-if="item.description">
                    <div v-html="item.description"></div>
                </template>
                <template v-else>-</template>
            </f7-block>
            <f7-block-title v-if="item">{{ trans('modules.events.attendees') }}</f7-block-title>
            <f7-list media-list class="no-margin" v-if="item">
                <f7-list-item
                        v-for="(employee, index) in item.attendees"
                        v-bind:key="index"
                        :title="employee.name"
                        :subtitle="formatBadgeSubtitle(employee)"
                >
                    <template #media>
                        <img :src="employee.image_url" alt="" width="40px" height="40px"/>
                    </template>
                </f7-list-item>
            </f7-list>
        </f7-card>
    </f7-page>
</template>

<script type="text/babel">
import moment from 'moment';

import CommonMixin from '../../js/vue/mixins/common.vue';
import {f7} from "framework7-vue";
import axiosHttp from "@/js/vue/boot/axiosHttp";

export default {
    props: {
        f7route: Object,
        f7router: Object,
    },
    mixins: [CommonMixin],
    data() {
        return {
            endpoint: '/event',
            item: null,

            busy: false,
        };
    },
    mounted() {
        //
    },
    methods: {
        init() {
            this.item = null;

            f7.preloader.show();

            this.getItem().then(
                () => {
                    f7.preloader.hide();
                },
                () => {
                    f7.preloader.hide();
                    this.f7router.load({
                        url: '/self/calender',
                    });
                }
            );
        },
        pageLoad(page) {
            // if (page.detail.page.query.item !== undefined && page.detail.page.query.item !== null) {
            //     this.item = page.detail.page.query.item;
            // }
            // else {
            this.init();
            // }
        },
        getItem() {
            return axiosHttp
                .get(
                    `/event/${this.f7route.params.id}?fields=${encodeURIComponent(
                        'id,event_name,label_color,start_date_time,end_date_time,description,where,attendees.limit(1000){id,name,email,status,image,image_url}},attendees:employeeDetail{id,employee_id},attendees:employeeDetail:designation{id,name},attendees:employeeDetail:department{id,team_name}'
                    )}`
                )
                .then(
                    (response) => {
                        this.item = response.data.data;
                    },
                    () => {
                        f7.preloader.hide();
                    }
                );
        },

        formatBadgeSubtitle(employee) {
            return (
                (employee.employee_detail && employee.employee_detail.designation ? employee.employee_detail.designation.name : '-') +
                ' ' +
                (employee.employee_detail && employee.employee_detail.department ? employee.employee_detail.department.team_name : '-')
            );
        },

        formatStartDate() {
            return moment(this.item.start_date_time).format('MMM DD[,] hh:mm A');
        },

        formatEndDate() {
            if (this.item.end_date_time === null) {
                return '-';
            }
            return moment(this.item.end_date_time).format('MMM DD[,] hh:mm A');

        },

        formatDays() {
            return this.item.days;
        },

        formatHalfDay() {
            return this.capitalize(this.item.half_day);
        },

        formatHalfDayColor() {
            return this.item.half_day === 'yes' ? 'green' : 'grey';
        },

        formatStatus() {
            return this.item.status.charAt(0).toUpperCase() + this.item.status.slice(1);
        },

        formatStatusColor() {
            if (this.item.status === 'pending') {
                return 'orange';
            }
            if (this.item.status === 'accepted') {
                return 'green';
            }
            if (this.item.status === 'rejected') {
                return 'red';
            }
        },
    },
};
</script>
