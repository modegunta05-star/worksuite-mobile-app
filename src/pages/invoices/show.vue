<style type="text/css">
.badge-profile-image {
    height: 40px;
    width: 40px;
    border-radius: 50%;
}
</style>
<template>
    <f7-page
            @page:init="pageLoad"
            @page:beforeout="onPageBeforeOut"
            @page:beforeremove="onPageBeforeRemove"
    >
        <f7-navbar :sliding="false" back-link layout="dark" theme="white">
            <f7-nav-title sliding v-if="item">Invoice {{ item.invoice_number }}</f7-nav-title>
            <f7-nav-right v-if="item && item.status !== 'canceled'">
                <f7-link sheet-open=".invoice-actions" icon-f7="ellipsis_vertical"></f7-link>
            </f7-nav-right>
        </f7-navbar>
        <template v-if="item">
            <f7-card>
                <f7-card-content>
                    <div class="grid grid-cols-1 ">
                        <div class="text-align-center margin-bottom">
                            <f7-login-screen-title><img :src="logo" class="login-screen-logo" width="50"/>
                            </f7-login-screen-title
                            >
                        </div>
                    </div>

                    <div class="grid grid-cols-2">
                        <div class="text-align-left">
                            <b>{{ trans('modules.invoices.billedTo') }}:</b>
                            <br/>
                            <span v-if="this.invoiceClient">{{ this.invoiceClient.name }}</span></div>
                        <div class="text-align-right"><b>{{ trans('modules.invoices.invoiceDate') }}:</b><br/>
                            <span>{{ formatDueDate(item.issue_date) }}</span></div>
                    </div>

                    <div class="grid grid-cols-2 margin-top">
                        <div class="text-align-left"><b>{{ trans('app.address') }}:</b><br/>
                            <span v-if="item.client && item.client.client_details">{{
                                    item.client.client_details.address
                                }}</span>
                        </div>
                        <div class="text-align-right"><b>{{ trans('modules.invoices.dueDate') }}:</b><br/>
                            <span>{{ formatDueDate(item.due_date) }}</span><br/>
                            <br>
                            <b class="margin-top">{{ trans('app.status') }}:</b><br/>
                            <f7-badge :style="`background-color:${formatStatusColor(item)}`">
                                {{ formatStatus(item.status) }}
                            </f7-badge>
                        </div>
                    </div>

                    <f7-block class="margin-top margin-bottom" v-if="item && item.items">
                        <div class="grid grid-cols-4" :style="`border:1px solid #ccc;`">
                            <div :style="`border-right:1px solid #ccc; padding:5px`"
                            ><b>{{ trans('modules.estimates.item') }}</b></div
                            >
                            <div class="text-align-center"
                                 :style="`border-right:1px solid #ccc; padding:5px`"
                            ><b>{{ trans('modules.estimates.price') }}</b></div
                            >
                            <div class="text-align-center"
                                 :style="`border-right:1px solid #ccc; padding:5px`"
                            ><b>{{ trans('modules.estimates.qty') }}</b></div
                            >
                            <div class="text-align-center" :style="`padding:5px`">
                                <b>{{ trans('modules.estimates.total') }}</b></div
                            >
                        </div>
                        <div class="grid grid-cols-4"
                             :style="`border:1px solid #ccc; border-top-width:0px;`"
                             v-for="invoiceItem in item.items"
                             :key="invoiceItem.id"
                        >
                            <div :style="`border-right:1px solid #ccc; padding:5px`">
                                {{ invoiceItem.item_name }}
                            </div>
                            <div class="text-align-center" :style="`border-right:1px solid #ccc; padding:5px`">
                                {{ invoiceItem.unit_price }}
                            </div>
                            <div class="text-align-center" :style="`border-right:1px solid #ccc; padding:5px`">
                                {{ invoiceItem.quantity }}
                            </div>
                            <div class="text-align-center" :style="`padding:5px`">{{ invoiceItem.amount }}
                            </div>
                        </div>
                        <div class="grid grid-cols-4 margin-top">
                            <div></div>
                            <div></div>
                            <div class="text-align-right ">
                                {{ trans('modules.estimates.subtotal') }}:
                            </div>
                            <div class="text-align-right">{{ item.currency.currency_symbol + '' + item.sub_total }}
                            </div>
                        </div>
                        <div class="grid grid-cols-3 margin-top" v-if="invoiceTaxes"
                             v-for="(invoiceTax, index) in invoiceTaxes" :key="index">
                            <div></div>
                            <div class="text-align-right margin-right">{{ index }}</div>
                            <div class="text-align-right">{{ item.currency.currency_symbol }}{{ invoiceTax }}
                            </div>
                        </div>
                        <div class="grid grid-cols-3 margin-top" v-if="item.discount && item.discount > 0">
                            <div></div>
                            <div class="text-align-right margin-right"
                            >{{ trans('modules.estimates.discount') }}
                                {{ item.discount_type === 'percent' ? '(%)' : '(Flat)' }}
                            </div>
                            <div class="text-align-right">
                                -{{ item.currency.currency_symbol }}
                                {{
                                    item.discount_type === 'percent' ? (invoiceTotalAmount * item.discount) / 100 : item.discount
                                }}
                            </div>
                        </div>
                        <div class="grid grid-cols-4 margin-top">
                            <div></div>
                            <div></div>
                            <div class="text-align-right">
                                <b>{{ trans('modules.estimates.total') }}:</b>
                            </div>
                            <div class="text-align-right">
                                <b>{{ item.currency.currency_symbol }}{{ item.total }}</b></div>
                        </div>
                        <div class="grid grid-cols-4 margin-top" v-if="item && item.note">
                            <div class="text-align-left">
                                <b>{{ trans('modules.estimates.notes') }}:</b>
                            </div>
                            <div>
                                <span>{{ item.note }}</span>
                            </div>
                        </div>
                    </f7-block>
                </f7-card-content>
            </f7-card>
            <f7-sheet class="invoice-actions" style="height: auto;" swipe-to-close backdrop>
                <f7-toolbar>
                    <div class="left padding-left">{{ trans('app.action') }}</div>
                    <div class="right">
                        <f7-link sheet-close>{{ trans('app.close') }}</f7-link>
                    </div>
                </f7-toolbar>
                <!-- Scrollable sheet content -->
                <f7-list dividers outline>
                    <f7-list-item
                            v-if="item && item.status !== 'canceled'"
                            view=".view-main"
                            sheet-close
                            title="Send Invoice"
                            @click.prevent="sendInvoice(item)"
                    >
                        <f7-icon f7="envelope"></f7-icon>
                    </f7-list-item>
                </f7-list>
            </f7-sheet>
        </template>
    </f7-page>
</template>

<script type="text/babel">
import Cache from '../../js/vue/scripts/cache';

import CommonMixin from '../../js/vue/mixins/common.vue';
import ModuleMixin from './mixin.vue';
import {f7} from "framework7-vue";
import axiosHttp from "@/js/vue/boot/axiosHttp";
import _ from "lodash";

export default {
    props: {
        f7route: Object,
        f7router: Object,
    },
    mixins: [CommonMixin, ModuleMixin],
    data() {
        return {
            endpoint: '/invoice',
            item: null,
            invoiceTotalAmount: 0,
            invoiceClient: [],
            allTaxes: [],
            busy: false,
        };
    },
    mounted() {
        console.log(this.item);
    },
    methods: {
        init() {
            // this.item = null;
            f7.preloader.show();

            const promises = [];
            promises.push(this.getItem());
            promises.push(this.getTaxes());

            Promise.all(promises).then(
                () => {
                    if (this.item && this.item.client) {
                        this.invoiceClient = this.item.client;
                    } else if (this.item && this.item.project && this.item.project.client) {
                        this.invoiceClient = this.item.project.client;
                    }

                    f7.preloader.hide();
                },
                () => {
                    f7.preloader.hide();
                }
            );
        },
        sendInvoice() {
            f7.sheet.close();
            f7.preloader.show();
            axiosHttp.get(`/invoice/send/${this.item.id}`).then(
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
        invoiceTaxes() {
            this.invoiceTotalAmount = this.item.sub_total;
            let appliedTaxes = [];
            const invoiceItems = _.filter(this.item.items, (item) => item.taxes !== null);

            for (let j = 0; j < invoiceItems.length; j++) {
                let invoiceItemsTaxes = JSON.parse(invoiceItems[j].taxes);

                for (let i = 0; i < invoiceItemsTaxes.length; i++) {
                    let getTax = _.filter(this.allTaxes, (item) => item.id === parseInt(invoiceItemsTaxes[i]))[0];
                    let invoiceItemTax = (invoiceItems[j].amount * getTax.rate_percent) / 100;
                    let taxName = getTax.tax_name + ': (' + getTax.rate_percent + '%)';
                    if (appliedTaxes.hasOwnProperty(taxName)) {
                        appliedTaxes[taxName] = appliedTaxes[taxName] + invoiceItemTax;
                    } else {
                        appliedTaxes[taxName] = invoiceItemTax;
                    }
                    this.invoiceTotalAmount = this.invoiceTotalAmount + invoiceItemTax;
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
