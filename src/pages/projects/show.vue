<style type="text/css">
.badge-profile-image {
    height: 40px;
    width: 40px;
    border-radius: 50%;
}

.page > .toolbar {
    min-height: 56px;
}
</style>
<template>
    <f7-page hide-toolbar-on-scroll @page:init="pageLoad" ptr @ptr:refresh="pageLoad" tabs>

        <f7-navbar :sliding="false" back-link>
            <f7-nav-title sliding v-if="item">{{ item.project_short_code }} - {{ item.project_name }}</f7-nav-title>
            <f7-nav-right v-if="!isEmployeeRoute">
                <f7-link sheet-open=".project-actions" icon-f7="ellipsis_vertical"></f7-link>
            </f7-nav-right>
            <f7-nav-right v-else></f7-nav-right>
        </f7-navbar>

        <skeleton-show-project v-if="busy"></skeleton-show-project>
        <template v-if="item">
            <f7-block class="margin-bottom-half">
                <div class="grid grid-cols-2 margin-bottom">
                    <div>
                        <f7-block-title class="no-margin">
                            {{ trans('modules.projects.projectDetails') }}
                        </f7-block-title>
                    </div>
                    <div class="text-align-right">
                        <f7-link sheet-open=".status-actions">
                            <f7-badge :color="formatStatusColor(item)">{{ formatStatus(item) }}</f7-badge>
                        </f7-link>
                    </div>
                </div>
            </f7-block>

            <f7-block strong v-if="item.project_summary" class="no-margin-top">
                <p v-html="item.project_summary" id="description" class="description" @click="handleClick"></p>
            </f7-block>
            <f7-block strong v-else> &nbsp;</f7-block>

            <f7-block>
                <div class="grid grid-cols-2">
                    <div class="text-align-center">
                        <strong class="text-color-purple">{{
                                item.currency && item.project_budget ? item.currency.currency_symbol : ''
                            }}
                            {{ item.project_budget ? item.project_budget : '-' }}
                        </strong>
                        <br/>
                        {{ trans('modules.projects.projectBudget') }}
                    </div>
                    <div class="text-align-center">
                        <strong class="text-color-green">
                            {{ item.currency ? item.currency.currency_symbol : '' }}
                            {{ item.total_earnings ? item.total_earnings : '0' }}
                        </strong>
                        <br/>{{ trans('app.earnings') }}
                    </div>
                </div>

                <div class="grid grid-cols-2 margin-top">
                    <div class="text-align-center">
                        <strong class="text-color-blue">{{ item.hours_allocated ? item.hours_allocated : '-' }}</strong>
                        <br/>{{ trans('modules.projects.hours_allocated') }}
                    </div>
                    <div class="text-align-center"><strong
                            class="text-color-green">{{ item.hours_logged ? item.hours_logged : '-' }}</strong>
                        <br/>{{ trans('modules.projects.hoursLogged') }}
                    </div>
                </div>

            </f7-block>

            <f7-block-title>{{ trans('app.client') }}</f7-block-title>
            <f7-list media-list
                     dividers
                     strong
                     class="margin-bottom margin-top-half"
            >
                <f7-list-item
                        v-if="item.client"
                        v-bind:key="item.client.id"
                        :title="item.client.name"
                        :text="item.client?.client_details?.company_name"
                        :subtitle="item.client.email"
                >
                    <template #media>
                        <img slot="media" :src="item.client.image_url" width="50" height="50" class="lazy lazy-fade-in "
                             alt=""/>
                    </template>
                </f7-list-item>
                <f7-list-item v-else>
                    <div class="text-align-center"><span class="text-color-gray">- </span></div>
                </f7-list-item>
            </f7-list>

            <f7-block-title>{{ trans('modules.projects.members') }}</f7-block-title>
            <f7-block strong>
                <div class="grid grid-cols-2 grid-gap">
                    <div v-if="item.members && item.members.length > 0"  v-for="member in item.members" class="no-margin-top">

                            <f7-chip :text="member.user.name">
                                <template #media>
                                    <img :src="member.user.image_url" :alt="member.user.name"/>
                                </template>
                            </f7-chip>


                    </div>
                    <div v-else class="text-align-center"><span
                            class="text-color-gray"> {{ trans('messages.noMemberAddedToProject') }} </span></div>
                </div>


            </f7-block>

            <f7-block>
                <div class="grid grid-cols-2 margin-top">
                    <div><strong class="text-color-blue">{{ formatDate(item) }}</strong>
                        <br/>{{ trans('modules.projects.deadline') }}
                    </div>
                </div>
            </f7-block>

            <f7-popup class="demo-popup" @popup:closed="popupOpened = false">
                <f7-page>
                    <f7-navbar :title="trans('modules.projects.projectDetails')">
                        <f7-nav-right>
                            <f7-link popup-close>{{ trans('app.close') }}</f7-link>
                        </f7-nav-right>
                    </f7-navbar>
                    <f7-block>
                        <p v-html="item.project_summary" class="description" @click="handleClick"></p>
                    </f7-block>
                </f7-page>
            </f7-popup>

            <f7-popup push class="member-popup" :swipe-to-close="true" @popup:closed="popupOpened = false">
                <members-list :item="item" v-on:fetch="getItem"></members-list>
            </f7-popup>

            <f7-sheet class="status-actions" style="height: auto;" swipe-to-close backdrop>
                <f7-toolbar>
                    <div class="left padding-left">{{ trans('app.status') }}</div>
                    <div class="right">
                        <f7-link sheet-close>{{ trans('app.close') }}</f7-link>
                    </div>
                </f7-toolbar>

                <!-- Scrollable sheet content -->
                <f7-list dividers outline>
                    <f7-list-item
                            view=".view-main"
                            sheet-close
                            :title="capitalize(state)"
                            :key="index"
                            @click="changeStatus(state)"
                            v-for="(state, index) in filteredStatus"
                    >
                        <f7-badge :color="formatSheetStatusColor(state)"></f7-badge>
                    </f7-list-item>
                </f7-list>
            </f7-sheet>

            <f7-sheet class="project-actions" style="height: auto;" swipe-to-close backdrop>
                <f7-toolbar>
                    <div class="left padding-left">{{ trans('app.action') }}</div>
                    <div class="right">
                        <f7-link sheet-close>{{ trans('app.close') }}</f7-link>
                    </div>
                </f7-toolbar>

                <!-- Scrollable sheet content -->
                <f7-list outline dividers>
                    <f7-list-item view=".view-main" sheet-close title="Edit" @click.prevent="edit(item)">
                        <f7-icon f7="pencil"></f7-icon>
                    </f7-list-item>
                    <f7-list-item view=".view-main" @click="remove" title="Delete">
                        <f7-icon f7="trash"></f7-icon>
                    </f7-list-item>
                </f7-list>
            </f7-sheet>
        </template>

        <f7-photo-browser :photos="images" type="popup" theme="dark" :toolbar="false" ref="popup"></f7-photo-browser>


        <f7-toolbar tabbar icons position="bottom" v-if="item">
            <f7-link tab-link-active
                     tab-link="#tab-1"
                     text="Overview"
                     icon-ios="f7:layers"
                     icon-aurora="f7:layers"
                     icon-md="material:layers">
            </f7-link>
            <f7-link
                    popup-open=".member-popup"
                    tab-link="#tab-1"
                    text="Members"
                    icon-ios="f7:person_2"
                    icon-aurora="f7:person_2"
                    icon-md="material:people"
            ></f7-link>
            <f7-link
                    v-snap-permission="'tasks'"
                    tab-link="#tab-1"
                    :href="`/project/${item.id}/tasks`"
                    text="Tasks"
                    icon-ios="f7:checkmark_square"
                    icon-aurora="f7:checkmark_square"
                    icon-md="material:check_box"
            ></f7-link>
        </f7-toolbar>
    </f7-page>
</template>

<script type="text/babel">
import Cache from '../../js/vue/scripts/cache';

import CommonMixin from '../../js/vue/mixins/common.vue';
import ModuleMixin from './mixin.vue';
import Tasks from '../tasks/index.vue';
import MembersList from './members/members-list.vue';
import {f7} from "framework7-vue";
import axiosHttp from "@/js/vue/boot/axiosHttp";
import SkeletonShowProject from "@/pages/projects/skeleton-show-project.vue";

export default {
    props: {
        f7route: Object,
        f7router: Object,
    },
    mixins: [CommonMixin, ModuleMixin],
    components: {
        SkeletonShowProject,
        Tasks,
        MembersList,
    },
    data() {
        return {
            endpoint: 'project',
            item: null,
            busy: true,
            status: ['finished', 'in progress', 'not started', 'canceled', 'on hold'],
        };
    },
    computed: {
        filteredStatus() {
            return this.status.filter(state => state !== this.item.status);
        },
    },
    methods: {
        init() {
            this.item = null;
            this.busy = true;

            // f7.preloader.show();

            this.getItem().then(() => {
                // f7.preloader.hide();
                this.busy = false;
                this.removePtrClass();
            });
        },
        pageLoad(page) {
            this.init();
        },

        edit(item) {
            f7.sheet.close();
            this.f7router.navigate('/project/' + item.id + '/edit', {
                params: {
                    item: item,
                },
            });
        },

        remove() {
            f7.dialog.confirm(`${this.trans('messages.confirmation.projectDelete')}`, '', () => {
                f7.sheet.close();
                f7.preloader.show();

                axiosHttp.delete(`/project/${this.item.id}`).then(
                    () => {
                        f7.preloader.hide();
                        Cache.removeMatching('project');
                        this.$store.commit('sendCacheInvalidate', 'project');
                        this.f7router.back();
                    },
                    (response) => {
                        f7.preloader.hide();
                        f7.dialog.alert(response.response.data.error.message);
                    }
                );
            });
        },
        changeStatus(status) {
            f7.sheet.close();
            // f7.preloader.show();

            this.item.status = status;

            axiosHttp.put(`/project/${this.item.id}`, {status: status}).then(
                () => {
                    f7.preloader.hide();

                    Cache.removeMatching('project');
                    this.$store.commit('sendCacheInvalidate', 'project');

                },
                (response) => {
                    f7.preloader.hide();
                    f7.dialog.alert(response.response.data.error.message);
                }
            );
        },

        formatStatus() {
            return this.item.status.charAt(0).toUpperCase() + this.item.status.slice(1);
        },
    },
};
</script>
