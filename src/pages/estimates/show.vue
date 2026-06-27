<style type="text/css">
    .badge-profile-image {
        height: 40px;
        width: 40px;
        border-radius: 50%;
    }

    .title-item {
        border-right: 1px solid #ccc;
        padding: 5px;
    }
</style>
<template>
    <f7-page @page:init="pageLoad" @page:beforeout="onPageBeforeOut" @page:beforeremove="onPageBeforeRemove">
        <f7-navbar :sliding="false" back-link layout="dark" theme="white">
            <f7-nav-title sliding v-if="item">{{ trans('app.menu.estimates') }} {{ item.estimate_number }} </f7-nav-title>
            <f7-nav-right v-if="item">
                <f7-link sheet-open=".estimate-actions" icon-f7="ellipsis_vertical"></f7-link>
            </f7-nav-right>
        </f7-navbar>
        <template v-if="item">
            <f7-card>
                <f7-card-content>
                    <div class="grid grid-cols-1 text-align-center margin-bottom">
                        <f7-login-screen-title>
                            <img :src="logo" class="login-screen-logo" width="50px" />
                        </f7-login-screen-title>
                    </div>
                    <div class="grid grid-cols-2">
                        <div class="text-align-left">
                            <b>{{ trans('modules.estimates.estimateTo') }}</b>
                            <br />
                            {{ item.client.name }}
                        </div>
                        <div class="text-align-right">
                            <b>{{ trans('modules.estimates.createDate') }}</b
                            ><br />
                            <span>{{ formatDueDate(item.created_at) }}</span>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 margin-top">
                        <div class="text-align-left">
                            <b>{{ trans('modules.estimates.address') }}</b
                            ><br />
                            <span>{{ item.client.client_details.address }}</span>
                        </div>
                        <div class="text-align-right">
                            <b>{{ trans('modules.estimates.validTill') }}:</b><br />
                            <span>{{ formatDueDate(item.valid_till) }}</span
                            ><br />
                            <b>{{ trans('app.status') }}:</b><br />
                            <f7-badge :style="`background-color:${formatStatusColor(item)}`">
                                {{ formatStatus(item.status) }}
                            </f7-badge>
                        </div>
                    </div>
                    <f7-block class="margin-top margin-bottom" v-if="item && item.items">
                        <div class="grid grid-cols-4" :style="`border:1px solid #ccc;`">
                            <div :style="`border-right:1px solid #ccc; padding:5px`">
                                <b>{{ trans('modules.estimates.item') }}</b>
                            </div>
                            <div class="text-align-center" :style="`border-right:1px solid #ccc; padding:5px`">
                                <b>{{ trans('modules.estimates.price') }}</b>
                            </div>
                            <div class="text-align-center" :style="`border-right:1px solid #ccc; padding:5px`">
                                <b>{{ trans('modules.estimates.qty') }}</b>
                            </div>
                            <div class="text-align-center" :style="`padding:5px`">
                                <b>{{ trans('modules.estimates.total') }}</b>
                            </div>
                        </div>
                        <div
                            class="grid grid-cols-4"
                            :style="`border:1px solid #ccc; border-top-width:0px;`"
                            v-for="estimateItem in item.items"
                            :key="estimateItem.id"
                        >
                            <div :style="`border-right:1px solid #ccc; padding:5px`">
                                {{ estimateItem.item_name }}
                            </div>
                            <div class="text-align-center" :style="`border-right:1px solid #ccc; padding:5px`">
                                {{ estimateItem.unit_price }}
                            </div>
                            <div class="text-align-center" :style="`border-right:1px solid #ccc; padding:5px`">
                                {{ estimateItem.quantity }}
                            </div>
                            <div class="text-align-center" :style="`padding:5px`">{{ estimateItem.amount }}</div>
                        </div>
                        <div class="grid grid-cols-3 margin-top">
                            <div></div>
                            <div class="text-align-right margin-right">
                                {{ trans('modules.estimates.subtotal') }}
                            </div>
                            <div class="text-align-right">{{ item.currency.currency_symbol }} {{ item.sub_total }}</div>
                        </div>
                        <div class="grid grid-cols-3" v-if="estimateTaxes" v-for="(estimateTax, index) in estimateTaxes" :key="index">
                            <div></div>
                            <div class="text-align-right margin-right">{{ index }}</div>
                            <div class="text-align-right">{{ item.currency.currency_symbol }}{{ estimateTax }}</div>
                        </div>
                        <div class="grid grid-cols-3" v-if="item.discount && item.discount > 0">
                            <div></div>
                            <div class="text-align-right margin-right">
                                {{ trans('modules.estimates.discount') }}
                                {{ item.discount_type === 'percent' ? '(%)' : '(Flat)' }}
                            </div>
                            <div class="text-align-right">
                                -{{ item.currency.currency_symbol
                                }}{{ item.discount_type === 'percent' ? (estimateTotalAmount * item.discount) / 100 : item.discount }}
                            </div>
                        </div>
                        <div class="grid grid-cols-3">
                            <div></div>
                            <div class="text-align-right margin-right">
                                <b>{{ trans('modules.estimates.total') }}</b>
                            </div>
                            <div class="text-align-right">
                                <b>{{ item.currency.currency_symbol }}{{ item.total }}</b>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 margin-top" v-if="item && item.note">
                            <div class="text-align-left">
                                <b>{{ trans('modules.estimates.notes') }}:</b>
                            </div>
                            <div>
                                <span style="white-space: pre-line">{{ item.note }}</span>
                            </div>
                        </div>
                    </f7-block>
                </f7-card-content>
            </f7-card>
            <f7-sheet class="estimate-actions" style="height: auto;" swipe-to-close backdrop>
                <f7-toolbar>
                    <div class="left padding-left">{{ trans('app.action') }}</div>
                    <div class="right">
                        <f7-link sheet-close>{{ trans('app.close') }}</f7-link>
                    </div>
                </f7-toolbar>

                <!-- Scrollable sheet content -->
                <f7-list dividers outline>
                    <f7-list-item
                        v-if="item"
                        view=".view-main"
                        sheet-close
                        :title="trans('modules.estimates.sendEstimate')"
                        @click.prevent="sendEstimate(item)"
                    >
                        <f7-icon f7="envelope"></f7-icon>
                    </f7-list-item>
                </f7-list>
            </f7-sheet>
        </template>
    </f7-page>
</template>

<script type="text/babel">
    import { f7 } from 'framework7-vue';
    import CommonMixin from '../../js/vue/mixins/common.vue';
    import ModuleMixin from './mixin.vue';
    import axiosHttp from '../../js/vue/boot/axiosHttp';
    import _ from 'lodash';

    export default {
        props: {
            f7route: Object,
            f7router: Object,
        },
        mixins: [CommonMixin, ModuleMixin],
        data() {
            return {
                endpoint: '/estimate',
                item: null,
                invoiceTotalAmount: 0,
                allTaxes: [],
                busy: false,
            };
        },
        mounted() {
            console.log(this.item);
        },
        methods: {
            init() {
                this.item = null;
                f7.preloader.show();

                const promises = [];
                promises.push(this.getItem());
                promises.push(this.getTaxes());

                Promise.all(promises).then(
                    () => {
                        f7.preloader.hide();
                    },
                    () => {
                        f7.preloader.hide();
                    }
                );
            },
            sendEstimate() {
                f7.sheet.close();
                f7.preloader.show();
                axiosHttp.get(`/estimate/send/${this.item.id}`).then(
                    (response) => {
                        const toast = f7.toast.create({
                            text: response.data.message,
                            position: 'center',
                            closeTimeout: 2000,
                        });

                        toast.open();
                        this.getItem().then(() => {
                            f7.preloader.hide();
                        });
                    },
                    (response) => {
                        f7.preloader.hide();
                        f7.dialog.alert(response.response.data.error.message);
                    }
                );
            },
            pageLoad(page) {
                this.init();
            },

            formatStatus() {
                return this.item.status.charAt(0).toUpperCase() + this.item.status.slice(1);
            },
        },
        computed: {
            estimateTaxes() {
                this.estimateTotalAmount = this.item.sub_total;
                let appliedTaxes = [];
                const estimateItems = _.filter(this.item.items, (item) => item.taxes !== null);

                for (let j = 0; j < estimateItems.length; j++) {
                    let estimateItemsTaxes = JSON.parse(estimateItems[j].taxes);

                    for (let i = 0; i < estimateItemsTaxes.length; i++) {
                        let getTax = _.filter(this.allTaxes, (item) => item.id === parseInt(estimateItemsTaxes[i]))[0];
                        let estimateItemTax = (estimateItems[j].amount * getTax.rate_percent) / 100;
                        let taxName = getTax.tax_name + ': (' + getTax.rate_percent + '%)';
                        if (appliedTaxes.hasOwnProperty(taxName)) {
                            appliedTaxes[taxName] = appliedTaxes[taxName] + estimateItemTax;
                        } else {
                            appliedTaxes[taxName] = estimateItemTax;
                        }
                        this.estimateTotalAmount = this.estimateTotalAmount + estimateItemTax;
                    }
                }
                return Object.assign({}, appliedTaxes);
            },
            logo() {
                if (this.$store.state.company !== null) {
                    return this.$store.state.company.logo_url;
                }
            },
        },
    };
</script>
