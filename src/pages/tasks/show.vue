<style scoped>
.ios .tabbar-icons .tab-link, .ios .tabbar-icons .link {
    font-size: small;
}
</style>
<template>
    <f7-page
            @page:init="pageLoad"
            @page:beforeout="onPageBeforeOut"
            ptr
            @ptr:refresh="refresh"
            @page:beforeremove="onPageBeforeRemove"
            tabs
    >
        <f7-navbar :sliding="false"  layout="dark" theme="black" back-link>
            <f7-nav-title sliding v-if="item">{{ trans('app.task') }} #{{ item.task_short_code }}</f7-nav-title>
            <f7-nav-right>
                <f7-link sheet-open=".task-actions" icon-f7="ellipsis_vertical"></f7-link>
            </f7-nav-right>
        </f7-navbar>

        <skeleton-show-task v-if="busy"></skeleton-show-task>

        <template v-if="item && !busy" class="padding-top">

            <f7-block-title text-color="blue">{{ item.heading }}</f7-block-title>

            <f7-block>
                <div class="margin-top-half padding-top-half">
                    <div v-if="item.project">
                        <f7-icon f7="layers"></f7-icon>
                        {{ item.project.project_name }}
                    </div>
                </div>

                <div class="same-line margin-top">
                    <div :class="`${item.board_column?.column_name?.length>12 ?'w-65':'w-75'}`">
                        {{ formatDueDate(item.start_date) }} <span
                            v-if="item.due_date"> &rarr; {{ formatDueDate(item.due_date) }}</span>
                    </div>
                    <div class="text-align-right">
                        <f7-link sheet-open=".board-actions">
                            <badge :item="item"></badge>
                        </f7-link>
                    </div>
                </div>
                <div class="grid grid-cols-1 margin-top" v-if="item.users.length > 0">

                    <div class="user-list">
                        <f7-link v-for="user in item.users"
                                 v-bind:key="user.id">
                            <f7-chip :text="user.name">
                                <template #media>
                                    <img :src="user.image_url" alt=""/>
                                </template>
                            </f7-chip>
                            <!--                            <img :src="user.image_url" width="25" height="25"-->
                            <!--                                 class="lazy lazy-fade-in margin-right-half" alt=""/>-->
                        </f7-link>
                    </div>
                </div>
            </f7-block>

            <template v-if="item.description">
                <f7-block-title>{{ trans('app.description') }}</f7-block-title>
                <f7-block>
                    <p v-html="item.description" id="description" class="description" @click="handleClick"></p>
                </f7-block>
            </template>

            <f7-photo-browser :photos="images" type="popup" theme="dark" :toolbar="false"
                              ref="popup"></f7-photo-browser>

            <f7-sheet class="task-actions" style="height: auto;" swipe-to-close backdrop>
                <f7-toolbar>
                    <div class="left padding-left">{{ trans('app.action') }}</div>
                    <div class="right">
                        <f7-link sheet-close>{{ trans('app.close') }}</f7-link>
                    </div>
                </f7-toolbar>

                <!-- Scrollable sheet content -->
                <f7-list dividers outline>
                    <f7-list-item
                            view=".view-main"
                            link="#"
                            sheet-close
                            :title="trans('modules.tasks.changeStatus')"
                            @click="statusUpdate"
                    ></f7-list-item>
                    <f7-list-item view=".view-main" sheet-close :title="trans('modules.tasks.reminder')"
                                  @click="remind"></f7-list-item>
                    <f7-list-item view=".view-main" sheet-close :title="trans('app.edit')"
                                  @click.prevent="edit(item)"></f7-list-item>
                    <f7-list-item view=".view-main" @click="remove" :title="trans('app.delete')"></f7-list-item>
                </f7-list>
            </f7-sheet>

            <f7-sheet class="board-actions" style="height: auto;" swipe-to-close backdrop>
                <f7-toolbar>
                    <div class="left padding-left">{{ trans('modules.tasks.moveToBoard') }}</div>
                    <div class="right">
                        <f7-link sheet-close>{{ trans('app.close') }}</f7-link>
                    </div>
                </f7-toolbar>

                <!-- Scrollable sheet content -->
                <f7-list dividers outline>
                    <f7-list-item
                            v-for="column in filteredColumns"
                            :key="column.id"
                            view=".view-main"
                            sheet-close
                            :title="column.column_name"
                            @click="changeStatus(column)"
                    >

                        <f7-badge :style="`background-color:${column.label_color}`"></f7-badge>
                    </f7-list-item>
                </f7-list>
            </f7-sheet>
            <!--    POP UPS        -->
            <f7-popup push swipe-to-close class="subtask-popup" @popup:closed="popupOpened = false" @popup:open="getItem()">
                <sub-task-list :item="item"></sub-task-list>
            </f7-popup>

            <f7-popup push swipe-to-close class="notes-popup" @popup:closed="popupOpened = false">
                <notes-list :item="item"></notes-list>
            </f7-popup>

            <f7-popup push swipe-to-close class="comments-popup" @popup:closed="popupOpened = false" @popup:open="getItem()">
                <comments-list :item="item"></comments-list>
            </f7-popup>

            <f7-popup push swipe-to-close class="timesheet-popup" @popup:closed="popupOpened = false">
                <timesheet-list :item="item"></timesheet-list>
            </f7-popup>

            <f7-popup push swipe-to-close class="files-popup" @popup:closed="popupOpened = false">
                <files-list :item="item"></files-list>
            </f7-popup>

        </template>
        <f7-toolbar tabbar position="bottom" icons v-if="item && !busy">
            <f7-link
                    tab-link="#tab-1"
                    popup-open=".subtask-popup"
            >
                <f7-icon f7="text_badge_checkmark">
                    <f7-badge v-if="item.subtasks.length>0">{{ item.subtasks.length }}</f7-badge>
                </f7-icon>
                {{ trans('modules.tasks.subTask') }}
            </f7-link>
            <f7-link
                    tab-link="#tab-1"
                    popup-open=".comments-popup"
            >
                <f7-icon f7="chat_bubble_2">
                    <f7-badge v-if="item.comments.length>0">{{ item.comments.length }}</f7-badge>
                </f7-icon>
                {{ trans('modules.tasks.comment') }}
            </f7-link>
            <f7-link
                    tab-link="#tab-1"
                    popup-open=".notes-popup"
            >
                <f7-icon f7="chat_bubble_text">
                    <f7-badge v-if="item.notes.length>0">{{ item.notes.length }}</f7-badge>
                </f7-icon>
                {{ trans('modules.projects.note') }}
            </f7-link>
            <f7-link
                    tab-link="#tab-1"
                    popup-open=".timesheet-popup"
            >
                <f7-icon f7="clock">
                    <f7-badge v-if="item.time_logged.length>0">{{ item.time_logged.length }}</f7-badge>

                </f7-icon>
                {{ trans('app.menu.timeLogs') }}
            </f7-link>
            <f7-link
                    popup-open=".files-popup"
                    tab-link="#tab-1">
                <f7-icon f7="paperclip">
                    <f7-badge v-if="item.files.length>0">{{ item.files.length }}</f7-badge>
                </f7-icon>
                {{ trans('app.file') }}
            </f7-link>
        </f7-toolbar>

    </f7-page>
</template>

<script type="text/babel">
import Cache from '../../js/vue/scripts/cache';

import CommonMixin from '../../js/vue/mixins/common.vue';
import ModuleMixin from './mixin.vue';
import SubTaskList from './sub-tasks/subtasks-list.vue';
import NotesList from './notes/notes-list.vue';
import CommentsList from './comments/comments-list.vue';
import TimesheetList from './timesheet/timesheet-list.vue';
import FilesList from './files/files.vue';
import {f7} from 'framework7-vue';
import axiosHttp from "@/js/vue/boot/axiosHttp";
import SkeletonShowTask from "@/pages/tasks/skeleton-show-task.vue";
import EmployeeComponent from "@/pages/common/employee-component.vue";

export default {
    props: {
        f7route: Object,
        f7router: Object,
    },
    mixins: [CommonMixin, ModuleMixin],
    data() {
        return {
            endpoint: '/task',
            item: null,
            busy: true,
        };
    },
    components: {
        EmployeeComponent,
        SkeletonShowTask,
        'sub-task-list': SubTaskList,
        'files-list': FilesList,
        'notes-list': NotesList,
        'comments-list': CommentsList,
        'timesheet-list': TimesheetList,
    },
    computed: {
        completeIncompleteText() {
            return this.item.board_column.slug === 'completed' ? 'Incomplete' : 'Complete';
        },
        filteredColumns() {
            return this.item.all_board_columns.filter(column => column.id !== this.item.board_column.id);
        },
    },
    methods: {
        init() {
            // this.item = null;
            this.busy = true;

            this.getItem().then(() => {
                this.busy = false;
                this.removePtrClass();
            });
        },

        pageLoad(page) {
            this.init();
        },

        refresh(){
            Cache.removeMatching(`task/${this.item.id}`);
            this.init();
        },
        edit(item) {
            this.f7router.navigate(this.selfUrl + item.id + '/edit', {
                params: {
                    item: item,
                },
            });
        },

        remove() {
            f7.dialog.confirm(`${this.trans('messages.confirmation.taskDelete')}`, '', () => {
                f7.preloader.show();

                axiosHttp.delete(`/task/${this.item.id}`).then(
                    (response) => {
                        f7.preloader.hide();
                        Cache.removeMatching('task');
                        this.$store.commit('sendCacheInvalidate', 'task');
                        this.f7router.back();
                    },
                    (response) => {
                        f7.preloader.hide();
                        f7.dialog.alert(response.response.data.error.message);
                    }
                );
            });
        },
        statusUpdate() {
            f7.sheet.close('.task-actions');
            f7.sheet.open('.board-actions');
        },
        changeStatus(column) {
            f7.sheet.close();
            this.item.board_column = column;
            axiosHttp.put(`/task/${this.item.id}`, {board_column_id: column.id}).then(
                (response) => {
                    Cache.removeMatching('task');
                    this.$store.commit('sendCacheInvalidate', 'task');
                },
                (error) => {
                    f7.preloader.hide();
                    f7.dialog.alert(error.response.data.error.message);
                }
            );
        },
        remind() {
            f7.sheet.close();
            f7.preloader.show();
            axiosHttp.get(`/task/remind/${this.item.id}`).then(
                (response) => {
                    f7.preloader.hide();

                    const toast = f7.toast.create({
                        text: response.data.message,
                        position: 'center',
                        closeTimeout: 2000,
                    });

                    toast.open();
                },
                (response) => {
                    f7.preloader.hide();
                    f7.dialog.alert(response.response.data.error.message);
                }
            );
        },
    },
};
</script>
