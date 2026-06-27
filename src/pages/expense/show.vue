<style type="text/css">
.badge-profile-image {
    height: 40px;
    width: 40px;
    border-radius: 50%;
}
</style>
<template>
    <f7-page @page:init="pageLoad" @page:beforeout="onPageBeforeOut" @page:beforeremove="onPageBeforeRemove">
        <f7-navbar :sliding="false" back-link layout="dark" theme="white">
            <f7-nav-title sliding v-if="item">{{ trans('app.expense') }}</f7-nav-title>
            <f7-nav-right>
                <f7-link sheet-open=".expense-actions" icon-f7="ellipsis_vertical"></f7-link>
            </f7-nav-right>
        </f7-navbar>
        <f7-block v-if="item">
                    <f7-list media-list dividers strong outline class="no-margin">
                        <f7-list-item :title="trans('app.employee')" :after="item.user.name"></f7-list-item>
                        <f7-list-item :title="trans('modules.expenses.itemName')"
                                      :after="item.item_name"></f7-list-item>
                        <f7-list-item :title="trans('modules.expenses.purchaseDate')"
                                      :after="formatDueDate(item.purchase_date)"></f7-list-item>
                        <f7-list-item :title="trans('modules.expenses.purchaseFrom')"
                                      :after="item.purchase_from"></f7-list-item>
                        <f7-list-item :title="trans('app.price')" :after="item.currency.currency_symbol + item.price"></f7-list-item>
                        <!--           <f7-list-item :title="trans('app.bill')" >-->
                        <!--              <f7-link slot="after" href="#" @click="downloadImage(item.bill_url)">{{ trans('app.download') }}</f7-link>-->
                        <!--           </f7-list-item>-->
                        <f7-list-item v-if="item.project" :title="trans('app.project')" :text="item.project.project_name"></f7-list-item>
                        <f7-list-item
                                :title="trans('app.status')"
                                :badge="formatStatus(item.status)"
                                :badge-color="formatStatusColor(item)"
                        >
                        </f7-list-item>

                    </f7-list>
                    <f7-toolbar v-if="item && item.status === 'pending' && !isEmployeeRoute" :bottom="true">
                        <f7-link
                                href="#"
                                @click.prevent="accept"
                                icon-ios="f7:check"
                                icon-aurora="f7:check"
                                icon-md="material:check"
                                icon-color="white"
                                :text="trans('app.accept')"
                        ></f7-link>
                        <f7-link
                                href="#"
                                @click.prevent="reject"
                                icon-ios="f7:close"
                                icon-aurora="f7:close"
                                icon-md="material:close"
                                icon-color="red"
                                :text="trans('app.reject')"
                        ></f7-link>
                    </f7-toolbar>

                    <f7-sheet class="expense-actions" style="height: auto;" swipe-to-close backdrop>
                        <f7-toolbar>
                            <div class="left padding-left">{{ trans('app.action') }}</div>
                            <div class="right">
                                <f7-link sheet-close>{{ trans('app.close') }}</f7-link>
                            </div>
                        </f7-toolbar>
                        <!-- Scrollable sheet content -->
                        <f7-list v-if="item && isEmployeeRoute && item.status === 'pending'">
                            <f7-list-item view=".view-main" sheet-close :title="trans('app.edit')"
                                          @click.prevent="edit(item)">
                                <f7-icon f7="pencil"></f7-icon>
                            </f7-list-item>
                            <f7-list-item view=".view-main" @click="remove" :title="trans('app.delete')">
                                <f7-icon f7="trash"></f7-icon>
                            </f7-list-item>
                        </f7-list>
                        <f7-list v-else-if="!isEmployeeRoute">
                            <f7-list-item view=".view-main" sheet-close :title="trans('app.edit')"
                                          @click.prevent="edit(item)">
                                <f7-icon f7="pencil"></f7-icon>
                            </f7-list-item>
                            <f7-list-item view=".view-main" @click="remove" :title="trans('app.delete')">
                                <f7-icon f7="trash"></f7-icon>
                            </f7-list-item>
                        </f7-list>
                    </f7-sheet>

        </f7-block>
    </f7-page>
</template>

<script type="text/babel">
import Cache from '../../js/vue/scripts/cache';

import CommonMixin from '../../js/vue/mixins/common.vue';
import ModuleMixin from './mixin.vue';
import {f7} from 'framework7-vue';
import axiosHttp from '../../js/vue/boot/axiosHttp';

export default {
    props: {
        f7route: Object,
        f7router: Object,
    },
    mixins: [CommonMixin, ModuleMixin],
    data() {
        return {
            endpoint: '/expense',
            item: null,
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
            this.getItem().then(() => {
                f7.preloader.hide();
            });
        },
        pageLoad(page) {
            this.init();
        },
        billDownload(url) {
            if (url) {
                return `<a href="#">${this.trans('app.download')}</a>`;
            } else {
                return '@';
            }
        },
        downloadImage(url) {
            cordova.InAppBrowser.open(url, '_blank');
            // cordova.InAppBrowser.open(url, '_blank');
        },

        edit(item) {
            this.f7router.navigate(this.selfUrl + item.id + '/edit', {
                params: {
                    item: item,
                },
            });
        },

        remove() {
            f7.dialog.confirm(`${this.trans('messages.confirmation.expenseDelete')}`, '', () => {
                f7.sheet.close();
                f7.preloader.show();

                axiosHttp.delete(`/expense/${this.item.id}`).then(
                    () => {
                        f7.preloader.hide();
                        Cache.removeMatching('expense');
                        this.$store.commit('sendCacheInvalidate', 'expense');
                        this.f7router.back();
                    },
                    (response) => {
                        f7.preloader.hide();
                        f7.dialog.alert(response.response.data.error.message);
                    }
                );
            });
        },

        accept() {
            f7.dialog.confirm(`${this.trans('messages.confirmation.approveExpense')}`, '', () => {
                f7.sheet.close();
                f7.preloader.show();
                axiosHttp.put(`/expense/${this.item.id}`, {status: 'approved'}).then(
                    (response) => {
                        f7.preloader.hide();

                        Cache.removeMatching('expense');
                        this.$store.commit('sendCacheInvalidate', 'expense');

                        this.item.status = 'approved';
                    },
                    (response) => {
                        f7.preloader.hide();
                        f7.dialog.alert(response.response.data.error.message);
                    }
                );
            });
        },
        reject() {
            f7.dialog.confirm(`${this.trans('messages.confirmation.rejectExpense')}`, '', () => {
                // f7.sheet.close();
                f7.preloader.show();
                axiosHttp.put(`/expense/${this.item.id}`, {status: 'rejected'}).then(
                    (response) => {
                        f7.preloader.hide();

                        Cache.removeMatching('expense');
                        this.$store.commit('sendCacheInvalidate', 'expense');

                        this.item.status = 'rejected';
                    },
                    (response) => {
                        f7.preloader.hide();
                        f7.dialog.alert(response.response.data.error.message);
                    }
                );
            });
        },

        formatStatus() {
            return this.item.status.charAt(0).toUpperCase() + this.item.status.slice(1);
        },
    },
};
</script>
