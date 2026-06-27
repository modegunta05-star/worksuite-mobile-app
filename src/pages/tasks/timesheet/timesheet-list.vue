<template>
    <f7-page>
        <f7-navbar :title="`${trans('app.menu.timeLogs') } | ${trans('app.task')} #${item.task_short_code}` ">
            <f7-nav-right>
                <f7-link popup-close>{{ trans('app.close') }}</f7-link>
            </f7-nav-right>
        </f7-navbar>

        <f7-list media-list outline strong v-for="item in filteredList" v-bind:key="item.id">
            <f7-list-item title="Employee:">
                <template #after>
                    <f7-chip :text="item.user.name">
                        <template #media>
                            <img :src="item.user.image_url" :alt="item.user.name"/>
                        </template>
                    </f7-chip>
                </template>
            </f7-list-item>
            <f7-list-item :title="trans('modules.employees.memo')+':'" :after="item.memo"></f7-list-item>

            <f7-list-item :title="trans('modules.employees.startTime')+':'"
                          :after="item.start_time ? moment(item.start_time).format('DD-MM-YYYY hh:mm a'):'-'">
            </f7-list-item>

            <f7-list-item :title="trans('modules.employees.endTime')+':'"
                          :after="item.end_time ? moment(item.end_time).format('DD-MM-YYYY hh:mm a'):'-'">
            </f7-list-item>

            <f7-list-item :title="trans('modules.employees.hoursLogged')+':'"
                          :after="convertMinutesToHoursAndMinutes(item.total_minutes)">
            </f7-list-item>
        </f7-list>

        <f7-block v-if="!busy && item.time_logged.length === 0" class="text-align-center">
            {{ trans('messages.noRecordFound') }}
        </f7-block>
    </f7-page>
</template>

<script>
import Cache from '../../../js/vue/scripts/cache';
import ModuleMixin from '../mixin.vue';

import SubTaskCreate from './create.vue';
import CommonMixin from '../../../js/vue/mixins/common.vue';
import {f7} from "framework7-vue";
import axiosHttp from "@/js/vue/boot/axiosHttp";

export default {
    mixins: [CommonMixin, ModuleMixin],
    props: ['item'],
    name: 'subtasks',
    data() {
        return {
            busy: false,
        };
    },
    components: {
        SubTaskCreate,
    },
    computed: {
        filteredList() {
            return this.item.time_logged;
        },
    },
    methods: {
        f7() {
            return f7
        },

        remove(item) {
            f7.preloader.show();
            axiosHttp.delete(`/task/${this.item.id}/time_logged/${item.id}`).then(
                (response) => {
                    this.removeFromList(item);
                    f7.preloader.hide();
                    Cache.removeMatching('comment');
                },
                () => {
                    f7.preloader.hide();
                }
            );
        },
        removeFromList(subtask) {
            const index = this.item.time_logged.indexOf(subtask);
            this.item.time_logged.splice(index, 1);
        },
        convertMinutesToHoursAndMinutes(minutes) {

            if (minutes == null) {
                return '-';
            }
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours}h ${remainingMinutes} min${remainingMinutes !== 1 ? 's' : ''}`;
        }
    },
};
</script>

<style scoped></style>
