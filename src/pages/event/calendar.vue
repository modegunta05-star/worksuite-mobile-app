<style type="text/css">
/*.calendar-day-number {*/
/*    display: inline-block;*/
/*    border-radius: 50%;*/
/*    position: relative;*/
/*    width: var(--f7-calendar-day-size);*/
/*    height: var(--f7-calendar-day-size);*/
/*    line-height: var(--f7-calendar-day-size);*/
/*}*/

.calendar-day.picker-calendar-day-has-event span:before,
.calendar-day.picker-calendar-day-has-holiday span:after {
    transform: translateX(-50%);
    border-radius: 100%;
    position: absolute;
    bottom: 0;
    height: 5px;
    content: '';
    width: 5px;
    left: 50%;
    margin-top: 1px;
}

.calendar-day.picker-calendar-day-has-event span:before {
    background-color: #4cd964;
    margin-left: -3px; /* Adjust positioning to avoid overlap */
}

.calendar-day.picker-calendar-day-has-single-event span:before {
    background-color: #4cd964;
}

.calendar-day.picker-calendar-day-has-holiday span:after {
    background-color: #ff3b30;
    margin-left: 3px; /* Adjust positioning to avoid overlap */
}
.calendar-day.picker-calendar-day-has--single-holiday span:after {
    background-color: #ff3b30;
}



.android .calendar-custom-toolbar {
    top: 0;
}
</style>
<template>
    <f7-page ptr @ptr:refresh="loadData(true)" class="bg-white calender" @page:beforein="init">
        <f7-navbar :sliding="false">
            <f7-nav-left>
                <f7-link icon-ios="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
            </f7-nav-left>
            <f7-nav-title sliding>{{ trans('app.menu.calendar') }}</f7-nav-title>
        </f7-navbar>

        <f7-block strong class="no-padding">
            <div id="calendar-inline-container" class="block block-strong no-padding no-margin"></div>
        </f7-block>
        <f7-list id="calendar-events" class="no-margin no-safe-area-left">
            <f7-list-item
                    v-for="(item, index) in selectedDateEvents"
                    v-bind:key="index"
                    :title="item.title"
                    :badge="capitalize(item.type)"
                    :badge-color="item.color"
                    :link="formatLink(item)"
            >
                <template #root-start>
                    <div class="event-color" :style="{ 'background-color': item.color }"></div>
                </template>
            </f7-list-item>
            <f7-list-item v-if="selectedDateEvents.length === 0" class="text-align-center">
                <template #title>
                    <span class="text-color-gray text-align-center">No events for this day</span>
                </template>
            </f7-list-item>
        </f7-list>
        <!-- </f7-block> -->
    </f7-page>
</template>

<script>
import moment from 'moment';
import Cache from '../../js/vue/scripts/cache';

import CommonMixin from '../../js/vue/mixins/common.vue';
import {f7} from "framework7-vue";
import _ from "lodash";
import {nextTick} from 'vue';

export default {
    props: {
        f7route: Object,
        f7router: Object,
        theme: Object,
    },
    mixins: [CommonMixin],
    data() {
        return {
            rawEvents: {
                events: [],
                holidays: [],
                leaves: [],
                birthdays: [],
                interviews: [],
                anniversaries: [],
            },

            // style: this.theme.ios ? 'background:#fff; margin:-10px -15px' : 'background:#fff; margin:-16px -16px',
            currentYear: moment().get('Y'),
            currentMonth: moment().get('M'),
            startMonth: moment().get('M'),
            calendarInline: '',
            selectedDate: moment().format('YYYY-MM-DD'),
        };
    },
    mounted() {
    },
    methods: {
        onPageInit(e) {
            console.log('onPageInit');
            const self = this;
            // const $ = self.Dom7;
            // Inline with custom toolbar
            const monthNames = [
                this.trans('app.months.January'),
                this.trans('app.months.February'),
                this.trans('app.months.March'),
                this.trans('app.months.April'),
                this.trans('app.months.May'),
                this.trans('app.months.June'),
                this.trans('app.months.July'),
                this.trans('app.months.August'),
                this.trans('app.months.September'),
                this.trans('app.months.October'),
                this.trans('app.months.November'),
                this.trans('app.months.December'),
            ];

            console.log(monthNames);
            console.log(self.calendarInline);
            // self.calendarInline !== '' ? self.calendarInline.destroy() : '';
            // self.calendarInline.destroy();
            if (self.calendarInline === '') {
                self.calendarInline = f7.calendar.create({
                    containerEl: '#calendar-inline-container',
                    value: [new Date()],
                    renderToolbar: function () {
                        return (
                            '<div class="toolbar calendar-custom-toolbar">\n' +
                            '                <div class="toolbar calendar-custom-toolbar no-shadow">\n' +
                            '                    <div class="toolbar-inner">\n' +
                            '                        <div class="left">\n' +
                            '                            <a href="#" class="link icon-only"><i class="icon icon-back"></i></a>\n' +
                            '                        </div>\n' +
                            '                        <div class="center"></div>\n' +
                            '                        <div class="right">\n' +
                            '                            <a href="#" class="link icon-only"><i class="icon icon-forward"></i></a>\n' +
                            '                        </div>\n' +
                            '                    </div>\n' +
                            '                </div>\n' +
                            '\n' +
                            '            </div>'
                        );
                    },
                    on: {
                        init(c) {
                            $('.calendar-custom-toolbar .center').text(`${monthNames[c.currentMonth]}, ${c.currentYear}`);
                            $('.calendar-custom-toolbar .left .link').on('click', () => {
                                self.calendarInline.prevMonth();
                                self.addEventDots();
                            });
                            $('.calendar-custom-toolbar .right .link').on('click', () => {
                                self.calendarInline.nextMonth();
                                self.addEventDots();
                            });
                        },
                        monthYearChangeStart(c) {
                            $('.calendar-custom-toolbar .center').text(`${monthNames[c.currentMonth]}, ${c.currentYear}`);
                        },

                        change(calender, dates) {
                            self.selectedDate = moment(dates[0]).format('YYYY-MM-DD');
                        },
                    },
                });
            }
        },
        init() {
            this.onPageInit();
            this.loadData();
        },

        loadData(force) {
            if (force) {
                Cache.removeMatching('me/calendar');
            }

            // force means we are doing pull down to refresh
            if (!force) {
                f7.preloader.show();
            }

            Promise.all([this.loadEvents()]).then((result) => {
                if (!force) {
                    f7.preloader.hide();
                }

                f7.ptr.done();
            }, () => {
                if (!force) {
                    f7.preloader.hide();
                }
                f7.ptr.done();
            });


        },
        loadEvents() {
            return Cache.httpGet('/me/calendar').then(
                (response) => {
                    this.rawEvents = response.data;
                    nextTick(() => {
                        this.addEventDots();
                        f7.ptr.done();
                    });
                },
                (error) => {
                    // Handle the error as needed
                    console.error("Failed to load events:", error);
                }
            );
        },
        addEventDots() {
            document.querySelectorAll('.calendar-day').forEach((item) => {
                item.classList.remove('picker-calendar-day-has-events');
            });

            const eventCounts = {};

            this.events.forEach((item) => {
                const start = moment(item.start);
                const end = moment(item.end);
                while (start.isSameOrBefore(end, 'day')) {


                    const dateKey = `${start.get('Y')}-${start.get('M')}-${start.get('D')}`;
                    const className = `picker-calendar-day-has-${item.type}`;

                    try {
                        document.querySelector(`[data-date="${dateKey}`).classList.add(`${className}`);
                    }
                    catch(e) {}

                    if (!eventCounts[dateKey]) {
                        eventCounts[dateKey] = {};
                    }

                    if (!eventCounts[dateKey]) {
                        eventCounts[dateKey]['count'] = 0;
                    }

                    eventCounts[dateKey]['count']++;

                    start.add(1, 'day');
                }
            });


            // Apply the appropriate class based on the counts
            // Object.keys(eventCounts).forEach((dateKey) => {
            //     const dayElement = document.querySelector(`[data-date="${dateKey}"]`);
            //     if (dayElement) {
            //         Object.keys(eventCounts[dateKey]).forEach((className) => {
            //             const count = eventCounts[dateKey]['count'];
            //             if (count > 1) {
            //                 dayElement.classList.add(className);
            //             } else {
            //                 const singleClassName = className.replace('picker-calendar-day-has-', 'picker-calendar-day-has-single-');
            //                 dayElement.classList.add(singleClassName);
            //             }
            //         });
            //     }
            // });

        },
        onChange(calender, dates) {
            this.selectedDate = moment(dates[0]).format('YYYY-MM-DD');
        },
        onMonthYearChangeStart(p, year, month) {
            this.currentYear = year;
            this.currentMonth = month;
            this.selectedDate = null;

            nextTick(() => {
                this.addEventDots();
            });
        },
        onMonthYearChangeEnd(p, year, month) {
            //
        },
        moment(date) {
            return moment(date);
        },
        formatLink(item) {
            if (item.type === 'event') {
                return `/event/${item.id}`;
            }
            return null;
        },
    },
    computed: {
        startYear() {
            if (moment().get('M') < this.startMonth) {
                return moment().get('Y') - 1;
            }
            return moment().get('Y');

        },
        startDate() {
            return moment().year(this.startYear).month(this.startMonth).startOf('month').toDate();
        },
        endDate() {
            return moment(this.startDate).add(1, 'year').subtract(1, 'day').toDate();
        },
        events() {
            const eventArray = [];

            this.rawEvents.events.forEach((data) => {
                let color;
                color = 'green';

                eventArray.push({
                    title: data.event_name,
                    start: data.start_date_time,
                    end: data.end_date_time,
                    type: 'event',
                    allDay: 1,
                    color,
                    icon: 'zmdi-sun',
                    id: data.id,
                });
            });

            this.rawEvents.holidays.forEach((data) => {
                let color;

                color = 'red';

                eventArray.push({
                    title: data.occassion,
                    start: data.date,
                    end: data.date,
                    type: 'holiday',
                    allDay: 1,
                    color,
                    icon: 'zmdi-sun',
                    id: data.id,
                });
            });
            return eventArray;
        },
        selectedDateEvents() {
            if (this.selectedDate === null) {
                return [];
            }

            const selectedDate = moment(this.selectedDate);

            return _.filter(this.events, (item) => {
                return selectedDate.isBetween(item.start, item.end, 'days', '[]');
            });
        },
    },
};
</script>
