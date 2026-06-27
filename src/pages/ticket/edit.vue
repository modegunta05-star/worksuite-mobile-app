<template>
    <f7-page @page:init="pageLoad">
        <f7-navbar
            :back-link="true"
            :title="`${trans('app.edit')} ${trans('app.ticket')}`"
            sliding
            layout="light"
            theme="white"
        ></f7-navbar>
        <f7-block v-if="item">
            <f7-card>
                <f7-card-content>
                    <f7-list inset form @submit.prevent="false" id="editForm">
                        <f7-list-item :title="trans('modules.tickets.requester')" :after="item.user.name"></f7-list-item>

                        <f7-list-item
                            title="Project"
                            @change="onProjectChange"
                            smart-select
                            :smart-select-params="{ openIn: 'popup', searchbar: true, searchbarPlaceholder: 'Search Project' }"
                        >
                            <select name="project" @change="onProjectChange">
                                <option
                                    :selected="item.project && project.id === item.project.id"
                                    :value="project.id"
                                    v-for="project in projects"
                                    :key="project.user_id"
                                >
                                    {{ project.project_name }}
                                </option>
                            </select>
                        </f7-list-item>

                        <f7-list-input
                            label="Currency"
                            type="select"
                            name="currency"
                            @change="onCurrencyChange"
                            placeholder="Please choose..."
                        >
                            <option
                                :value="currency.id"
                                :selected="currency.id == item.currency.id"
                                v-for="currency in currencies"
                                :key="currency.id"
                            >
                                {{ currency.currency_code + '-(' + currency.currency_symbol + ')' }}
                            </option>
                        </f7-list-input>
                        <f7-list-input
                            label="Item Name"
                            floating-label
                            required
                            validate-on-blur
                            clear-button
                            autocorrect="off"
                            type="text"
                            placeholder="Item Name"
                            :value="item.item_name"
                            @input="item.item_name = $event.target.value"
                        ></f7-list-input>
                        <f7-list-input
                            label="Price"
                            floating-label
                            required
                            validate-on-blur
                            clear-button
                            autocorrect="off"
                            type="number"
                            placeholder="Price"
                            :value="item.price"
                            @input="item.price = $event.target.value"
                        ></f7-list-input>
                        <f7-list-input
                            label="Purchase From"
                            floating-label
                            required
                            validate-on-blur
                            clear-button
                            autocorrect="off"
                            type="text"
                            placeholder="Purchase From"
                            :value="item.purchase_from"
                            @input="item.purchase_from = $event.target.value"
                        ></f7-list-input>
                        <f7-list-input
                            label="Purchase Date"
                            clear-button
                            type="datepicker"
                            readonly
                            :calendar-params="{ dateFormat: getCompanyDatePickerFormat }"
                            placeholder="Purchase Date"
                            :value="[moment(item.purchase_date)]"
                            @change="onStartDateChange($event.target.value)"
                        ></f7-list-input>
                        <f7-list-input
                            v-if="!isEmployeeRoute"
                            label="Status"
                            type="select"
                            name="status"
                            @change="onStatusChange"
                            placeholder="Please choose..."
                        >
                            <option
                                :value="singleStatus"
                                :selected="singleStatus == item.status"
                                v-for="singleStatus in status"
                                :key="singleStatus"
                            >
                                {{ formatStatus(singleStatus) }}
                            </option>
                        </f7-list-input>

                        <f7-block class="error-block" v-if="$store.state.error && $store.state.error.code === 0"
                            >Connection Error! Please make sure you are connected to internet.
                        </f7-block>
                    </f7-list>
                    <br />
                    <br />
                    <f7-button fill color="green" class="login-btn" large raised round @click="submit" :disabled="!formValid"
                        >Submit
                    </f7-button>
                </f7-card-content>
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
                    item_name: null,
                    purchase_from: null,
                    price: null,
                    purchase_date: null,
                    user: {
                        id: null,
                    },
                    project: {
                        id: null,
                    },
                    currency: {
                        id: null,
                    },
                    status: 'pending',
                },
                users: [],
                projects: [],
                currencies: [],
                status: ['approved', 'pending', 'rejected'],
                error: null,
                push: null,
            };
        },
        computed: {
            formValid() {
                // console.log(this.item);
                const $$ = Dom7;
                return (
                    this.item.purchase_date &&
                    this.item.status &&
                    this.item.item_name &&
                    this.item.purchase_from &&
                    this.item.price &&
                    $$('#editForm')[0] &&
                    $$('#editForm')[0].checkValidity()
                );
            },
        },
        methods: {
            init() {
                f7.preloader.show();

                const promises = [];
                promises.push(this.getUsers());
                promises.push(this.getProjects(this.isEmployeeRoute ? 'me' : null));
                promises.push(this.getCurrencies());
                promises.push(this.getItem());

                Promise.all(promises).then(
                    () => {
                        // console.log(this.item);
                        // this.item.project = _.find(this.projects, (item) => item.id === id)
                        f7.preloader.hide();
                    },
                    () => {
                        f7.preloader.hide();
                    }
                );
            },

            pageLoad(page) {
                // console.log('page',page,this.f7route.params);
                // if (page.detail.page.query.item !== undefined && page.detail.page.query.item !== null) {
                //   this.originalItem = page.detail.page.query.item;
                // }
                this.init();
            },
            submit() {
                f7.preloader.show();
                const itemToSend = {
                    id: this.item.id,
                    item_name: this.item.item_name,
                    purchase_from: this.item.purchase_from,
                    price: this.item.price,
                    purchase_date: this.item.purchase_date,
                    status: this.item.status,
                    project: {
                        id: this.item.project.id,
                    },
                    currency: {
                        id: this.item.currency.id,
                    },
                };

                axiosHttp.put(`/expense/${this.item.id}`, itemToSend).then(
                    (response) => {
                        f7.preloader.hide();
                        Cache.removeMatching('expense');
                        this.$store.commit('sendCacheInvalidate', 'expense');
                        this.f7router.back({ force: true });
                    },
                    () => {
                        f7.preloader.hide();
                    }
                );
            },
        },
    };
</script>
