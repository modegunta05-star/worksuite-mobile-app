<template>
    <f7-page @page:init="pageLoad">
        <f7-navbar
                :back-link="true"
                :title="trans('modules.expenses.addExpense')"
                sliding
                layout="light"
                theme="white"
                snapPageScrollToTransparentNavbar
        >
        </f7-navbar>
        <f7-card>
            <f7-card-content style="padding-left: unset;padding-right: unset;">
                <f7-list strong-ios dividers-ios inset-ios form @submit.prevent="false" id="form">
                    <f7-list-item
                            :title="trans('app.employee')"
                            smart-select
                            v-if="!isEmployeeRoute"
                            id="userSmartSelect"
                            @change="onUserChange"
                            :smart-select-params="{ openIn: 'popup', searchbar: true, searchbarPlaceholder: trans('app.search') }"
                    >
                        <select name="employee" @change="onUserChange">
                            <option :value="user.id" v-for="user in users" :key="user.user_id">{{ user.name }}</option>
                        </select>
                    </f7-list-item>
                    <f7-input v-if="isEmployeeRoute" name="employee" type="hidden"
                              :value="$store.state.user.id"></f7-input>

                    <f7-list-item
                            :title="trans('app.project')"
                            @change="onProjectChange"
                            smart-select
                            id="projectSmartSelect"
                            :smart-select-params="{ openIn: 'popup', searchbar: true, searchbarPlaceholder: trans('app.search') }"
                    >
                        <select name="project" @change="onProjectChange">
                            <option :value="project.id" v-for="project in projects" :key="project.user_id">
                                {{ project.project_name }}
                            </option>
                        </select>
                    </f7-list-item>

                    <f7-list-item
                            smart-select
                            :title="trans('app.currency')"
                            name="currency"
                            @change="onCurrencyChange"
                            :smart-select-params="{ openIn: 'popup', searchbar: true, searchbarPlaceholder: trans('app.search') }"
                    >
                        <select name="currency" @change="onCurrencyChange">
                            <option :value="currency.id" v-for="currency in currencies" :key="currency.id">
                                {{ currency.currency_code + '-(' + currency.currency_symbol + ')' }}
                            </option>
                        </select>
                    </f7-list-item>
                    <f7-list-input
                            :label="trans('modules.expenses.itemName')"
                            required
                            clear-button
                            autocorrect="off"
                            type="text"
                            :error-message="trans('validation.required', trans('modules.expenses.itemName'))"
                            :placeholder="trans('modules.expenses.itemName')"
                            @input="item.item_name = $event.target.value"
                    ></f7-list-input>
                    <f7-list-input
                            :label="trans('app.price')"
                            required
                            clear-button
                            autocorrect="off"
                            type="number"
                            :error-message="trans('validation.required', trans('app.price'))"
                            :placeholder="trans('app.price')"
                            @input="item.price = $event.target.value"
                    ></f7-list-input>
                    <f7-list-input
                            :label="trans('modules.expenses.purchaseFrom')"
                            required
                            clear-button
                            autocorrect="off"
                            type="text"
                            :error-message="trans('validation.required', trans('modules.expenses.purchaseFrom'))"
                            :placeholder="trans('modules.expenses.purchaseFrom')"
                            @input="item.purchase_from = $event.target.value"
                    ></f7-list-input>
                    <f7-list-input
                            :label="trans('modules.expenses.purchaseDate')"
                            clear-button
                            type="datepicker"
                            readonly
                            :calendar-params="{ dateFormat: getCompanyDatePickerFormat }"
                            :placeholder="trans('modules.expenses.purchaseDate')"
                            @change="onStartDateChange($event.target.value)"
                    ></f7-list-input>
                    <f7-list-input
                            v-if="!isEmployeeRoute"
                            :label="trans('app.status')"
                            type="select"
                            name="status"
                            @change="onStatusChange"
                            :placeholder="trans('app.selectStatus')"
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
                    <f7-list-input hidden="hidden"></f7-list-input>
                    <!--                    <f7-list-item>-->
                    <!--                        <f7-block-title class="form-input-label">{{ trans('app.bill') }}</f7-block-title>-->
                    <!--                        <div class="grid grid-cols-2 medium-grid-cols-2 grid-gap">-->
                    <!--                            <div class="text-align-left">-->
                    <!--                                <f7-button @click="openActionSheet" fill>{{-->
                    <!--                                        trans('modules.expenses.attachBill')-->
                    <!--                                    }}-->
                    <!--                                </f7-button>-->
                    <!--                            </div>-->
                    <!--                            <div v-show="this.item.bill || this.billImage">-->
                    <!--                                <f7-button @click="removeBill" fill color="red">{{-->
                    <!--                                        trans('modules.expenses.removeBill')-->
                    <!--                                    }}-->
                    <!--                                </f7-button>-->
                    <!--                            </div>-->

                    <!--                        </div>-->


                    <!--                    </f7-list-item>-->
                </f7-list>


                <f7-button style="margin:20px" inset fill color="green" class="login-btn" large raised
                           @click="submit"
                           :disabled="!formValid"
                >{{ trans('app.submit') }}
                </f7-button>
            </f7-card-content>

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
// import { Device } from 'framework7/framework7-lite.esm.bundle';

export default {
    props: {
        f7route: Object,
        f7router: Object,
    },
    mixins: [CommonMixin, ModuleMixin],
    data() {
        return {
            item: {
                item_name: null,
                purchase_date: null,
                price: null,
                user: {
                    id: null,
                },
                project: {
                    id: null,
                },
                currency: {
                    id: null,
                },
                bill: null,
                status: 'pending',
            },
            action: '/file',
            headers: {
                Authorization: `Bearer ${this.$store.state.token}`,
            },
            users: [],
            projects: [],
            currencies: [],
            status: ['approved', 'pending', 'rejected'],
            deviceReady: false,
            billUrl: null,
            billImage: null,
            billImageUrl: null,
            error: null,
            push: null,
        };
    },
    computed: {
        formValid() {
            return (
                this.item.item_name &&
                this.item.purchase_date &&
                this.item.price &&
                this.item.status &&
                this.item.project.id &&
                this.item.currency.id
            );
        },
        fileAction() {
            if (!this.action.startsWith('http')) {
                return `${this.$store.state.api_url + this.action}?type=expense-invoice`;
            }
            return `${this.action}?type=expense-invoice`;

        },
    },
    mounted() {
        // document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    methods: {
        onDeviceReady() {
            // this.deviceReady = true;
        },
        init() {
            f7.preloader.show();

            const promises = [];

            if (!this.isEmployeeRoute) {
                promises.push(this.getUsers());
            }

            promises.push(this.getProjects(this.isEmployeeRoute ? 'me' : null));
            promises.push(this.getCurrencies());

            Promise.all(promises).then(
                () => {
                    this.item.project = this.projects[0];
                    let projectSmartSelect = f7.smartSelect.get('#projectSmartSelect .smart-select');
                    projectSmartSelect.setValue(this.item.project.id);
                    this.item.currency = this.currencies[0];


                    if (!this.isEmployeeRoute) {
                        this.item.user = this.users[0];
                        let userSmartSelect = f7.smartSelect.get('#userSmartSelect .smart-select');
                        userSmartSelect.setValue(this.item.user.id);
                    } else {
                        this.item.user.id = this.$store.state.user.id
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

            const promiseArray = [];

            if (this.billImage) {
                const filePromise = this.uploadFile(this.billImage);
                console.log('filePromise' + filePromise);
                filePromise.then((response) => {
                    this.item.bill = response.data.name;
                    this.billUrl = response.data.download_url;
                }, (error) => {
                    this.busy = false;
                });

                promiseArray.push(filePromise);
            }

            Promise.all(promiseArray).then(() => {
                axiosHttp.post(`/expense`, this.item).then(
                    () => {
                        f7.preloader.hide();
                        Cache.removeMatching('expense');
                        this.$store.commit('sendCacheInvalidate', 'expense');
                        this.f7router.back();
                    },
                    () => {
                        f7.preloader.hide();
                    }
                );
            });
        },
    },
};
</script>
