<template>
    <f7-page @page:init="pageLoad">
        <f7-navbar :back-link="true" :title="trans('modules.expenses.editExpense')" sliding layout="light" theme="white"></f7-navbar>
        <f7-block v-if="item">
            <f7-card>
                <f7-card-content>
                    <f7-list inset form @submit.prevent="false" id="editForm">
                        <f7-list-item :title="trans('app.employee')" :after="item.user.name"></f7-list-item>

                        <f7-list-item
                            :title="trans('app.project')"
                            @change="onProjectChange"
                            smart-select
                            id="projectSmartSelect"
                            :smart-select-params="{ openIn: 'popup', searchbar: true, searchbarPlaceholder: trans('app.search') }"
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
                            :label="trans('app.currency')"
                            type="select"
                            name="currency"
                            @change="onCurrencyChange"
                            :placeholder="trans('app.selectCurrency')"
                        >
                            <option
                                :value="currency.id"
                                :selected="currency.id === item.currency.id"
                                v-for="currency in currencies"
                                :key="currency.id"
                            >
                                {{ currency.currency_code + '-(' + currency.currency_symbol + ')' }}
                            </option>
                        </f7-list-input>
                        <f7-list-input
                            :label="trans('modules.expenses.itemName')"
                            floating-label
                            required
                            validate-on-blur
                            clear-button
                            autocorrect="off"
                            type="text"
                            :error-message="trans('validation.required', trans('modules.expenses.itemName'))"
                            :placeholder="trans('modules.expenses.itemName')"
                            :value="item.item_name"
                            @input="item.item_name = $event.target.value"
                        ></f7-list-input>
                        <f7-list-input
                            :label="trans('app.price')"
                            floating-label
                            required
                            validate-on-blur
                            clear-button
                            autocorrect="off"
                            type="number"
                            :error-message="trans('validation.required', trans('app.price'))"
                            :placeholder="trans('app.price')"
                            :value="item.price"
                            @input="item.price = $event.target.value"
                        ></f7-list-input>
                        <f7-list-input
                            :label="trans('modules.expenses.purchaseFrom')"
                            floating-label
                            required
                            validate-on-blur
                            clear-button
                            autocorrect="off"
                            type="text"
                            :error-message="trans('validation.required', trans('modules.expenses.purchaseFrom'))"
                            :placeholder="trans('modules.expenses.purchaseFrom')"
                            :value="item.purchase_from"
                            @input="item.purchase_from = $event.target.value"
                        ></f7-list-input>
                        <f7-list-input
                            :label="trans('modules.expenses.purchaseDate')"
                            clear-button
                            type="datepicker"
                            readonly
                            :calendar-params="{ dateFormat: getCompanyDatePickerFormat }"
                            :placeholder="trans('modules.expenses.purchaseDate')"
                            :value="[moment(item.purchase_date)]"
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
                                :selected="singleStatus === item.status"
                                v-for="singleStatus in status"
                                :key="singleStatus"
                            >
                                {{ formatStatus(singleStatus) }}
                            </option>
                        </f7-list-input>
                        <f7-block class="error-block" v-if="$store.state.error && $store.state.error.code === 0"
                            >{{ trans('messages.internetConnectionError') }}
                        </f7-block>
                    </f7-list>
                    <!--               <f7-block inner class="margin-top">-->
                    <!--                  <f7-block-title class="form-input-label">{{ trans('app.bill') }}</f7-block-title>-->
                    <!--                  <f7-row>-->
                    <!--                     <f7-col>-->
                    <!--                        <f7-button @click="openActionSheet" fill>{{ trans('modules.expenses.attachBill') }}</f7-button>-->
                    <!--                     </f7-col>-->
                    <!--                     <f7-col v-if="this.item.bill || this.billImage">-->
                    <!--                        <f7-button @click="removeBill" fill color="red">{{ trans('modules.expenses.removeBill') }}</f7-button>-->
                    <!--                     </f7-col>-->
                    <!--                  </f7-row>-->
                    <!--                  <img v-if="billImageUrl" :src="billImageUrl" style="margin-top: 15px; width: 100%;"/>-->
                    <!--               </f7-block>-->
                    <!--               <f7-block inset>&nbsp;</f7-block>-->
                    <!--               <br>-->
                    <!--               <f7-block-title class="form-input-label">{{ trans('app.bill') }}</f7-block-title>-->
                    <!--               <f7-block inner>-->
                    <!--                  <div class="row">-->
                    <!--                     <f7-col>-->
                    <!--                        <f7-button @click="openActionSheet" fill>{{ trans('modules.expenses.attachBill') }}</f7-button>-->
                    <!--                     </f7-col>-->
                    <!--                     <f7-col v-if="this.item.bill || this.billImage">-->
                    <!--                        <f7-button @click="removeBill" fill color="red">{{ trans('modules.expenses.removeBill') }}</f7-button>-->
                    <!--                     </f7-col>-->
                    <!--                  </div>-->
                    <!--                  <img v-if="billImageUrl" :src="billImageUrl" style="margin-top: 15px; width: 100%;"/>-->
                    <!--               </f7-block>-->
                    <br />
                    <f7-button fill color="green" class="login-btn" large raised round @click="submit" :disabled="!formValid"
                        >{{ trans('app.submit') }}
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
                    bill: null,
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
            fileAction() {
                if (!this.action.startsWith('http')) {
                    return `${this.$store.state.api_url + this.action}?type=expense-invoice`;
                } else {
                    return `${this.action}?type=expense-invoice`;
                }
            },
        },
        methods: {
            onDeviceReady() {
                this.deviceReady = true;
            },
            init() {
                f7.preloader.show();

                const promises = [];
                promises.push(this.getUsers());
                promises.push(this.getProjects(this.isEmployeeRoute ? 'me' : null));
                promises.push(this.getCurrencies());
                promises.push(this.getItem());

                Promise.all(promises).then(
                    () => {
                        let projectSmartSelect = f7.smartSelect.get('#projectSmartSelect .smart-select');
                        projectSmartSelect.setValue(this.item.project.id);

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

                // const promiseArray = [];
                //
                // if (this.billImage) {
                //    const filePromise = this.uploadFile(this.billImage);
                //    console.log('filePromise'+filePromise);
                //    filePromise.then((response) => {
                //       itemToSend.bill = response.data.name;
                //       this.billUrl = response.data.download_url;
                //    }, (error) => {
                //       if (error) {
                //          this.busy = false;
                //       }
                //    });
                //
                //    promiseArray.push(filePromise);
                // }
                //
                // Promise.all(promiseArray).then(() => {
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
                // });
            },
        },
    };
</script>
