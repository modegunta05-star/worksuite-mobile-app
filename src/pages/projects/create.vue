<template>
    <f7-page @page:init="pageLoad">
        <f7-navbar :back-link="true" :title="trans('modules.projects.createTitle')" sliding layout="light" theme="white"> </f7-navbar>
        <f7-block>
            <f7-card>
                <f7-card-content>
                    <f7-list inset form @submit.prevent="false" id="form">
                        <!--:error-message="trans('modules.projects.projectName')"-->
                        <f7-list-input
                            :label="trans('modules.projects.projectName')"
                            floating-label
                            required
                            validate-on-blur
                            clear-button
                            autocorrect="off"
                            type="text"
                            :error-message="trans('validation.required', trans('modules.projects.projectName'))"
                            :placeholder="trans('modules.projects.projectName')"
                            :value="item.project_name"
                            @input="item.project_name = $event.target.value"
                        ></f7-list-input>
                        <f7-list-input
                            :label="trans('modules.projects.projectSummary')"
                            floating-label
                            required
                            validate-on-blur
                            clear-button
                            autocorrect="off"
                            type="texteditor"
                            :placeholder="trans('modules.projects.projectSummary')"
                            :textEditorParams="{ buttons: textEditorButtons }"
                            :value="item.project_summary"
                            @texteditor:change="(v) => (item.project_summary = v)"
                        ></f7-list-input>
                        <f7-list-input
                            :label="trans('modules.projects.projectBudget')"
                            floating-label
                            required
                            validate-on-blur
                            clear-button
                            autocorrect="off"
                            type="text"
                            :error-message="trans('validation.required', trans('modules.projects.projectBudget'))"
                            :placeholder="trans('modules.projects.projectBudget')"
                            :value="item.project_budget"
                            @input="item.project_budget = $event.target.value"
                        ></f7-list-input>

                        <f7-list-input
                            :label="trans('modules.projects.startDate')"
                            clear-button
                            type="datepicker"
                            readonly
                            :calendar-params="{ dateFormat: getCompanyDatePickerFormat }"
                            :placeholder="trans('modules.projects.startDate')"
                            :value="[new Date()]"
                            @change="onStartDateChange($event.target.value)"
                        ></f7-list-input>

                        <f7-list-input
                            v-if="!without_deadline"
                            :label="trans('modules.projects.deadline')"
                            clear-button
                            type="datepicker"
                            readonly
                            :calendar-params="{ dateFormat: getCompanyDatePickerFormat }"
                            :placeholder="trans('modules.projects.deadline')"
                            :value="[new Date()]"
                            @change="onDeadlineChange($event.target.value)"
                        ></f7-list-input>
                        <f7-list-item
                            checkbox
                            :title="trans('modules.projects.withoutDeadline')"
                            name="without-deadline"
                            :checked="without_deadline"
                            @change="onWithoutDeadlineChange"
                        ></f7-list-item>
                        <f7-list-item
                            :title="trans('app.client')"
                            smart-select
                            id="clientSmartSelect"
                            clear-button
                            @change="onClientChange"
                            :smart-select-params="{ openIn: 'popup', searchbar: true, searchbarPlaceholder: trans('app.search') }"
                        >
                            <select name="client" @change="onClientChange">
                                <option value="" selected disabled></option>
                                <option :value="client.id" v-for="client in clients" :key="client.id">{{ client.name }}</option>
                            </select>
                        </f7-list-item>

                        <f7-list-input
                            :label="trans('modules.projects.projectCategory')"
                            type="select"
                            @change="onCategoryChange"
                            :placeholder="trans('app.select')"
                        >
                            <option :value="category.id" v-for="category in categories" :key="category.id">
                                {{ category.category_name }}
                            </option>
                        </f7-list-input>
                        <f7-list-input
                            :label="trans('app.currency')"
                            type="select"
                            @change="onCurrencyChange"
                            :placeholder="trans('app.select')"
                        >
                            <option :value="currency.id" v-for="currency in currencies" :key="currency.id">
                                {{ currency.currency_code }}
                            </option>
                        </f7-list-input>
                    </f7-list>
                    <br />
                    <br />
                    <f7-button fill color="green" class="login-btn" large raised round @click="submit"
                        >{{ trans('app.submit') }}
                    </f7-button>
                </f7-card-content>

                <f7-block class="error-block" v-if="$store.state.error && $store.state.error.code === 0"
                    >{{ trans('messages.internetConnectionError') }}
                </f7-block>
            </f7-card>
        </f7-block>
    </f7-page>
</template>

<script type="text/babel">
    import Cache from '../../js/vue/scripts/cache';
    import CommonMixin from '../../js/vue/mixins/common.vue';
    import ModuleMixin from './mixin.vue';
    import {f7} from "framework7-vue";
    import axiosHttp from "@/js/vue/boot/axiosHttp";
    import Dom7 from "dom7";

    export default {
        props: {
            f7route: Object,
            f7router: Object,
        },
        mixins: [CommonMixin, ModuleMixin],
        data() {
            return {
                item: {
                    project_name: null,
                    project_summary: null,
                    notes: null,
                    deadline: null,
                    start_date: null,
                    category: {
                        id: null,
                    },
                    client: null,
                    project_budget: null,
                    currency: null,
                    hours_allocated: null,
                    status: 'not started',
                },
                categories: [],
                currencies: [],
                clients: [],
                without_deadline: false,
                error: null,
                push: null,
            };
        },
        computed: {
            formValid() {
                const $$ = Dom7;
                return this.item.project_name && this.item.start_date && $$('#form')[0] && $$('#form')[0].checkValidity();
            },
        },
        methods: {
            init() {
                f7.preloader.show();

                const promises = [];
                promises.push(this.getCategories());
                promises.push(this.getCurrencies());
                promises.push(this.getClients());

                Promise.all(promises).then(
                    () => {
                        this.item.category = this.categories[0];
                        this.item.currency = this.currencies[0];

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

                if (this.without_deadline) {
                    this.item.deadline = null;
                    Object.assign(this.item, { without_deadline: true });
                }
                axiosHttp.post(`/project`, this.item).then(
                    () => {
                        f7.preloader.hide();
                        Cache.removeMatching('project');
                        this.$store.commit('sendCacheInvalidate', 'project');
                        this.f7router.back();
                    },
                    () => {
                        f7.preloader.hide();
                    }
                );
            },
            onWithoutDeadlineChange: function (e) {
                this.without_deadline = !!e.target.checked;
            },
        },
    };
</script>
