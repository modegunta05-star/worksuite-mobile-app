<template>
    <f7-page @page:init="pageLoad">
        <f7-navbar :back-link="true" title="Edit Project" sliding layout="light" theme="white"> </f7-navbar>
        <f7-block v-if="item.start_date">
            <f7-card>
                <f7-card-content>
                    <f7-list inset form @submit.prevent="false" id="form">
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
                            :value="[moment(item.start_date)]"
                            @change="onStartDateChange($event.target.value)"
                        ></f7-list-input>

                        <f7-list-input
                            v-if="without_deadline"
                            :label="trans('modules.projects.deadline')"
                            clear-button
                            type="datepicker"
                            readonly
                            :calendar-params="{ dateFormat: getCompanyDatePickerFormat }"
                            :placeholder="trans('modules.projects.deadline')"
                            :value="[!without_deadline ? moment(item.deadline) : new Date()]"
                            @change="onDeadlineChange($event.target.value)"
                        ></f7-list-input>
                        <f7-list-item
                            checkbox
                            :title="trans('modules.projects.withoutDeadline')"
                            name="without-deadline"
                            :checked="!without_deadline"
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
                                <option :value="client.id" v-for="client in clients" :key="client.id">{{ client.name }}</option>
                            </select>
                        </f7-list-item>
                        <f7-list-input
                            :label="trans('modules.projects.projectCategory')"
                            type="select"
                            @change="onCategoryChange"
                            :placeholder="trans('app.select')"
                        >
                            <option
                                :value="category.id"
                                :selected="item.category && category.id === item.category.id"
                                v-for="category in categories"
                                :key="category.id"
                            >
                                {{ category.category_name }}
                            </option>
                        </f7-list-input>
                        <f7-list-input
                            :label="trans('app.currency')"
                            type="select"
                            @change="onCurrencyChange"
                            :placeholder="trans('app.select')"
                        >
                            <option
                                :value="currency.id"
                                :selected="item.currency && currency.id === item.currency.id"
                                v-for="currency in currencies"
                                :key="currency.id"
                            >
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

    export default {
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
                    currency: {
                        id: null,
                    },
                    hours_allocated: null,
                    status: 'not started',
                },
                without_deadline: false,
                categories: [],
                currencies: [],
                clients: [],
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
                promises.push(this.getItem());
                Promise.all(promises).then(
                    () => {
                        this.item.category = this.item.category ? this.item.category : this.categories[0];
                        this.item.currency = this.item.currency ? this.item.currency : this.currencies[0];
                        this.without_deadline = !!this.item.deadline;
                        if (this.item.client) {
                            // console.log('without_deadline'+this.without_deadline);
                            let clientSmartSelect = f7.smartSelect.get('#clientSmartSelect .smart-select');
                            clientSmartSelect.setValue(this.item.client.id);
                        }
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
                console.log(this.item);
                const dataToSend = {
                    project_name: this.item.project_name,
                    project_summary: this.item.project_summary,
                    notes: this.item.notes,
                    deadline: this.item.deadline,
                    start_date: this.item.start_date,
                    category: {
                        id: this.item.category ? this.item.category.id : '',
                    },
                    client: {
                        id: this.item.client ? this.item.client.id : '',
                    },
                    project_budget: this.item.project_budget,
                    hours_allocated: this.item.hours_allocated,
                    status: 'not started',
                };
                if (this.item.project_budget !== null && this.item.project_budget > 0) {
                    Object.assign(dataToSend, { currency: { id: this.item.currency ? this.item.currency.id : '' } });
                }
                console.log('deadline' + !this.without_deadline);
                if (!this.without_deadline) {
                    this.item.deadline = null;
                    Object.assign(dataToSend, { without_deadline: true });
                }

                axiosHttp.put(`/project/${this.f7route.params.id}`, dataToSend).then(
                    () => {
                        f7.preloader.hide();
                        Cache.removeMatching('project');
                        this.$store.commit('sendCacheInvalidate', 'project');
                        this.f7router.back({ force: true });
                    },
                    () => {
                        f7.preloader.hide();
                    }
                );
            },
            onWithoutDeadlineChange: function (e) {
                this.without_deadline = !e.target.checked;
            },
        },
    };
</script>
