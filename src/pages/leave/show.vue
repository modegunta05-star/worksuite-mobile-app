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
            <f7-nav-title sliding v-if="item">{{ item.user.name }}</f7-nav-title>
            <f7-nav-right>
                <f7-link
                        v-if="item && !(isEmployeeRoute && item.status === 'approved') && item.status !== 'approved'"
                        sheet-open=".leave-actions"
                        icon-f7="ellipsis_vertical"
                ></f7-link>
            </f7-nav-right>
        </f7-navbar>
        <f7-card v-if="item">
            <f7-card-content>
                <f7-block>
                    <f7-list media-list dividers-ios strong-ios outline-ios medium-inset class="no-margin">
                        <f7-list-item :title="trans('app.employee')" :after="item.user.name"></f7-list-item>
                        <f7-list-item
                                :title="trans('app.status')"
                                :badge="formatStatus(item.status)"
                                :badge-color="formatStatusColor(item)"
                        >
                        </f7-list-item>

                        <f7-list-item :title="trans('app.type')"
                                      :after="item.type ? item.type.type_name : '-'"></f7-list-item>
                        <f7-list-item :title="trans('modules.leaves.leaveDate')"
                                      :after="formatDueDate(item.leave_date)"></f7-list-item>

                        <f7-list-item :title="trans('modules.leaves.reason')">{{item.reason}}</f7-list-item>
                    </f7-list>


                    <f7-block class="margin-bottom-half" v-if="item && item.status === 'rejected'">
                        <div class="margin-top no-margin-bottom">
                            <div>
                                <f7-block-title class="no-margin">{{
                                        trans('modules.leaves.rejectReason')
                                    }}
                                </f7-block-title>
                            </div>
                        </div>
                    </f7-block>
                    <f7-block strong v-if="item && item.status === 'rejected'" class="no-margin-top">
                        <p v-html="item.reject_reason" id="reject_reason"></p>
                    </f7-block>

                    <f7-block>&nbsp;</f7-block>
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

                    <f7-sheet class="leave-actions" style="height: auto;" swipe-to-close backdrop>
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
            </f7-card-content>
        </f7-card>
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
            endpoint: '/leave',
            item: null,
            busy: false,
        };
    },
    mounted() {
        //
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

        edit(item) {
            this.f7router.navigate(this.selfUrl + item.id + '/edit', {
                params: {
                    item: item,
                },
            });
        },

        remove() {
            f7.dialog.confirm(`${this.trans('messages.confirmation.leaveDelete')}`, '', () => {
                f7.sheet.close();
                f7.preloader.show();

                axiosHttp.delete(`/leave/${this.item.id}`).then(
                    () => {
                        f7.preloader.hide();
                        Cache.removeMatching('leave');
                        this.$store.commit('sendCacheInvalidate', 'leave');
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
            f7.dialog.confirm(`${this.trans('messages.confirmation.approveLeave')}`, '', () => {
                f7.sheet.close();
                f7.preloader.show();
                axiosHttp.put(`/leave/${this.item.id}`, {status: 'approved'}).then(
                    (response) => {
                        f7.preloader.hide();

                        Cache.removeMatching('leave');
                        this.$store.commit('sendCacheInvalidate', 'leave');

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
            f7.dialog.prompt(`${this.trans('messages.confirmation.rejectLeave')}`, '', (reason) => {
                // f7.sheet.close();
                f7.preloader.show();
                axiosHttp.put(`/leave/${this.item.id}`, {status: 'rejected', reject_reason: reason}).then(
                    (response) => {
                        f7.preloader.hide();

                        Cache.removeMatching('leave');
                        this.$store.commit('sendCacheInvalidate', 'leave');

                        this.item.status = 'rejected';
                        this.item.reject_reason = reason;
                    },
                    (response) => {
                        f7.preloader.hide();
                        f7.dialog.alert(response.response.data.error.message);
                    }
                );
            });
        },
    },
};
</script>
