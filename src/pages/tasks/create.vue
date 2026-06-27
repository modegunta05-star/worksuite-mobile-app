<template>
    <f7-page @page:init="pageLoad">
        <f7-navbar :back-link="true" :title="`${trans('app.add')} ${trans('modules.tasks.newTask')}`" sliding
                   layout="light" theme="white">
        </f7-navbar>
        <f7-card>

            <f7-list inset form @submit.prevent="false" id="form" dividers>
                <f7-list-item
                        :title="trans('app.project')"
                        smart-select
                        id="projectSmartSelect"
                        clear-button
                        @change="onProjectChange"
                        :smart-select-params="{ openIn: 'popup', searchbar: true, searchbarPlaceholder: trans('app.search') }"
                >
                    <select name="project" @change="onProjectChange">
                        <option value="" selected disabled></option>
                        <option :value="project.id" v-for="project in projects" :key="project.id">
                            {{ project.project_name }}
                        </option>
                    </select>
                </f7-list-item>

                <f7-list-input
                        :label="trans('app.title')"
                        validate-on-blur
                        clear-button
                        autocorrect="off"
                        type="text"
                        :error-message="trans('validation.required', trans('app.title'))"
                        :placeholder="trans('app.title')"
                        :value="item.heading"
                        @input="item.heading = $event.target.value"
                ></f7-list-input>
                <f7-list-input
                        :label="trans('app.description')"
                        required
                        clear-button
                        autocorrect="off"
                        type="texteditor"
                        :placeholder="trans('app.description')"
                        :textEditorParams="{ buttons: textEditorButtons }"
                        :value="item.description"
                        @texteditor:change="(v) => (item.description = v)"
                ></f7-list-input>

                <f7-list-input
                        :label="trans('app.startDate')"
                        clear-button
                        type="datepicker"
                        readonly
                        :calendar-params="{ dateFormat: getCompanyDatePickerFormat }"
                        :placeholder="trans('app.startDate')"
                        :value="[new Date()]"
                        @change="onStartDateChange($event.target.value)"
                ></f7-list-input>

                <f7-list-input
                        :label="trans('app.endDate')"
                        clear-button
                        type="datepicker"
                        readonly
                        :calendar-params="{ dateFormat: getCompanyDatePickerFormat }"
                        :placeholder="trans('app.endDate')"
                        :value="[new Date()]"
                        @change="onEndDateChange($event.target.value)"
                ></f7-list-input>

                <f7-list-item
                        v-if="!isEmployeeRoute"
                        :title="trans('modules.tasks.users')"
                        smart-select
                        users-select
                        class="users-select"
                        @change="onUserChange"
                        :smart-select-params="{ openIn: 'popup', searchbar: true, searchbarPlaceholder: trans('app.search') }"
                >
                    <select name="employee" @change="onUserChange" multiple id="users-select">
                        <option :value="user.id" v-for="user in employees" :key="user.id">{{ user.name }}</option>
                    </select>
                </f7-list-item>

                <f7-list-input
                        :label="trans('modules.tasks.taskCategory')"
                        type="select"
                        @change="onCategoryChange"
                        :placeholder="trans('modules.tasks.selectTaskCategory')"
                >
                    <option value="" v-if="categories.length === 0">{{ trans('modules.tasks.noTaskCategory') }}</option>
                    <option v-else :value="category.id" v-for="category in categories" :key="category.id">
                        {{ category.category_name }}
                    </option>
                </f7-list-input>
                <f7-list-input
                        :label="trans('app.status')"
                        type="select"
                        @change="onColumnChange"
                        :placeholder="trans('app.selectStatus')"
                >
                    <option :value="column.id" v-for="column in columns" :key="column.id">{{
                            column.column_name
                        }}
                    </option>
                </f7-list-input>

                <f7-list-input
                        :label="trans('modules.tasks.priority')"
                        type="select"
                        @change="onPriorityChange"
                        :placeholder="trans('modules.tasks.selectPriority')"
                >
                    <option :value="priority" v-for="priority in priorities" :key="priority">{{ priority }}</option>
                </f7-list-input>

                <f7-list-input hidden="hidden"></f7-list-input>
                <br>
                <f7-button fill color="green" class="login-btn" large raised @click="submit"
                >{{ trans('app.submit') }}
                </f7-button>
            </f7-list>
            <br/>
            <br/>

            <f7-block class="error-block" v-if="$store.state.error && $store.state.error.code === 0"
            >{{ trans('messages.internetConnectionError') }}
            </f7-block>
        </f7-card>
    </f7-page>
</template>

<script type="text/babel">
import Cache from '../../js/vue/scripts/cache';
import CommonMixin from '../../js/vue/mixins/common.vue';
import ModuleMixin from './mixin.vue';
import Dom7 from "dom7";
import {f7} from "framework7-vue";
import axiosHttp from "@/js/vue/boot/axiosHttp";

export default {
    props: {
        f7route: Object,
        f7router: Object,
    },
    mixins: [CommonMixin, ModuleMixin],
    data() {
        return {
            item: {
                heading: null,
                description: null,
                start_date: null,
                due_date: null,
                category: {
                    id: null,
                },
                project: null,
                board_column: {
                    id: null,
                },
                task_users: [],
                is_private: 1,
                status: 'incomplete',
                priority: 'low',
            },
            categories: [],
            priorities: ['low', 'medium', 'high'],
            columns: [],
            employees: [],
            projects: [],
            error: null,
            push: null,
        };
    },
    computed: {
        formValid() {
            const $$ = Dom7;
            return this.item.project_name && this.item.start_date;
        },
    },
    methods: {
        init() {
            f7.preloader.show();

            const promises = [];
            promises.push(this.getCategories());
            promises.push(this.getProjects());
            promises.push(this.getBoardColumns());
            promises.push(this.getEmployees());

            Promise.all(promises).then(
                () => {
                    this.item.category = this.categories[0];
                    this.item.board_column = this.columns[0];
                    this.item.task_users[0] = this.isEmployeeRoute ? this.$store.state.user : this.employees[0];

                    f7.preloader.hide();
                },
                () => {
                    f7.preloader.hide();
                }
            );
        },

        pageLoad(page) {
            this.init();
        },
        submit() {
            f7.preloader.show();

            axiosHttp.post(`/task`, this.item).then(
                () => {
                    f7.preloader.hide();
                    Cache.removeMatching('task');
                    this.$store.commit('sendCacheInvalidate', 'task');
                    this.f7router.back();
                },
                () => {
                    f7.preloader.hide();
                }
            );
        },
    },
};
</script>
<style>
.smart-select-page .list li.disabled {
    display: none;
}
</style>
