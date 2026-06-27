<style scoped>
.item-title {
    /*font-size: var(--f7-list-item-subtitle-font-size) !important;*/
    font-weight: var(--f7-list-item-subtitle-font-weight) !important;
}
</style>
<template>
    <f7-page>
        <f7-navbar :title="`${trans('modules.tasks.subTask')} | ${trans('app.task')} #${item.task_short_code} `">
            <f7-nav-right>
                <f7-link popup-close>{{ trans('app.close') }}</f7-link>
            </f7-nav-right>
        </f7-navbar>

        <f7-list media-list dividers>

            <f7-list-item
                    v-for="(subtask, index) in filteredList"
                    v-bind:key="subtask.id"
            >

                <template #media>
                    <f7-checkbox :checked="subtask.status === 'complete'"
                                 @change="checkUncheck(subtask, index)"></f7-checkbox>
                </template>
                <template #subtitle class="same-line">
                    <div class="same-line">
                        <div class="text-align-left">{{ subtask.title }}</div>
                        <div class="text-align-right">
                            <f7-link @click="remove(subtask)">
                                <f7-icon f7="trash_circle_fill" color="red"></f7-icon>
                            </f7-link>
                        </div>
                    </div>
                </template>
                <template #text>{{ formatDueDate(subtask.due_date) }}</template>
            </f7-list-item>
        </f7-list>
        <f7-block v-if="!busy && item.subtasks.length === 0" class="text-align-center">
            {{ trans('modules.tasks.noSubTaskFound') }}
        </f7-block>

        <sub-task-create :item="item" v-on:fetch="getItem"></sub-task-create>

        <!-- Extended FAB Center Bottom (Red) -->
        <f7-fab position="right-bottom" slot="fixed" @click="f7().popup.open('.new-sub-task-popup')" color="blue">
            <f7-icon ios="f7:plus" aurora="f7:plus" md="material:add"></f7-icon>
        </f7-fab>
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
    props: {
        item: Object,
        f7route: Object,
        f7router: Object,
    },
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
            return this.item.subtasks;
        },
    },
    methods: {
        f7() {
            return f7
        },
        checkUncheck(subtask, index) {
            f7.preloader.show();
            this.busy = true;

            const newStatus = subtask.status === 'complete' ? 'incomplete' : 'complete';
            const dataToSend = {
                status: newStatus,
            };

            axiosHttp.put(`/task/${this.item.id}/subtask/${subtask.id}`, dataToSend).then(
                (response) => {
                    f7.preloader.hide();
                    Cache.removeMatching('task');
                    this.item.subtasks[index].status = newStatus;
                    this.f7router.back();
                    this.busy = false;
                },
                (response) => {
                    this.busy = false;
                    f7.preloader.hide();
                    f7.dialog.alert(response.response.data.error.message);
                }
            );
        },

        remove(subtask) {
            f7.preloader.show();
            axiosHttp.delete(`/task/${this.item.id}/subtask/${subtask.id}`).then(
                (response) => {
                    this.removeFromList(subtask);
                    f7.preloader.hide();
                    Cache.removeMatching('task');
                },
                () => {
                    f7.preloader.hide();
                }
            );
        },
        removeFromList(subtask) {
            const index = this.item.subtasks.indexOf(subtask);
            this.item.subtasks.splice(index, 1);
        },
    },
};
</script>

<style scoped></style>
