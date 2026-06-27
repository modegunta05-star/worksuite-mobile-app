<style type="text/css" scoped>
#selected {
    background-color: rgba(0, 0, 0, 0.15);
}
</style>
<template>
    <f7-page

            id="my-projects-list"
            infinite
            @infinite="onInfiniteScroll"
            ptr
            @ptr:refresh="refresh"
            :infinite-preloader="infiniteScrollInProgress"
            @page:init="pageLoad"
    >

        <f7-navbar :sliding="false" back-link v-if="f7route.params.from">
            <f7-nav-title>{{ trans('app.project') }}</f7-nav-title>
        </f7-navbar>
        <f7-navbar :sliding="false" v-else >
            <f7-nav-left>
                <f7-link icon-ios="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
            </f7-nav-left>
            <f7-nav-title>{{ trans('app.project') }}</f7-nav-title>
            <f7-nav-right>
                <f7-link href="#" sheet-open=".project-filter" icon-f7="slider_horizontal_3"></f7-link>
            </f7-nav-right>
        </f7-navbar>

        <f7-subnavbar :inner="false">
            <f7-searchbar
                    class="item-search"
                    :disable-button-text="trans('app.cancel')"
                    :placeholder="trans('app.search')"
                    :clear-button="true"
                    :custom-search="true"
                    @searchbar:search="onSearch"
                    @searchbar:clear="onSearchClear"
            ></f7-searchbar>
        </f7-subnavbar>

        <f7-block class="search-list">

            <skeleton v-if="busy && !isRefreshing"></skeleton>

            <f7-card v-for="item in items" v-bind:key="item.id" @click.native="show(item)" v-if="!busy"
                     :padding="false"
                     raised>
                <f7-card-content>
                    <div class="same-line">
                        <div class="w-70">
                            <span class="project-name"><strong>{{ item.project_short_code }}</strong> {{
                                    item.project_name
                                }}</span>
                        </div>
                        <div class="text-align-right">

                            <f7-badge :color="formatStatusColor(item)">{{ formatStatus(item) }}</f7-badge>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 margin-top">

                        <div>
                            <f7-progressbar :color="formatProgressColor(item)"
                                            :progress="item.completion_percent"></f7-progressbar>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 medium-grid-cols-2 grid-gap margin-top">
                        <div>
                            <img
                                    :src="member.user.image_url"
                                    width="25"
                                    height="25"
                                    class="lazy lazy-fade-in margin-right-half"
                                    v-for="member in item.members"
                                    :alt="member.user.name"/>
                        </div>
                        <div class="deadline text-align-right text-color-gray" v-if="item.deadline">
                            <f7-icon f7="calendar"></f7-icon>
                            {{ formatDate(item) }}
                        </div>

                    </div>
                </f7-card-content>
            </f7-card>
        </f7-block>

        <f7-sheet class="my-project-filter filter-actions"  style="height: auto;" swipe-to-close backdrop>
            <f7-toolbar>
                <div class="left padding-left">{{ trans('app.filters') }}</div>
                <div class="text-align-right">
                    <f7-link sheet-close>{{ trans('app.close') }}</f7-link>
                </div>
            </f7-toolbar>

            <!-- Scrollable sheet content -->
            <f7-list dividers outline>
                <f7-list-item
                        view=".view-main"
                        sheet-close
                        :title="capitalize(state)"
                        :id="state === selectedFilter ? `selected` : ``"
                        :key="index"
                        @click="changeStatus(state)"
                        v-for="(state, index) in status"
                >
                    <f7-badge :color="formatSheetStatusColor(state)"></f7-badge>
                </f7-list-item>
            </f7-list>
        </f7-sheet>

        <f7-fab v-if="!isEmployeeRoute" position="right-bottom" slot="fixed" href="/project/create" color="blue">
            <f7-icon ios="f7:plus" aurora="f7:plus" md="material:add"></f7-icon>
        </f7-fab>
    </f7-page>
</template>

<script type="text/babel">
import IndexMixin from '../../js/vue/mixins/index.vue';
import CommonMixin from '../../js/vue/mixins/common.vue';
import FilterMixin from './filter-mixin.vue';
import Skeleton from "./skeleton.vue";

export default {
    components: {Skeleton},
    props: {
        f7route: Object,
        f7router: Object,
    },
    mixins: [IndexMixin, CommonMixin, FilterMixin],
    data() {
        return {
            endpoint: '',
            fields: 'id,project_name,project_short_code,status,deadline,completion_percent,client.limit(1000){id,name},members:user.limit(1000){id,name,email,image,image_url}',
            order: 'id desc',
            currentItem: [],
            status: ['all', 'finished', 'in progress', 'not started', 'canceled', 'on hold'],
            selectedFilter: 'all',
        };
    },
    mounted() {
        this.endpoint = 'project/me';
    },
    created() {
        this.pageId = Math.round(Math.random() * 100);
    },

    methods: {
        getFilters() {
            let filters = '';
            if (this.search_query !== null) {
                filters += `(project_name lk "%${this.search_query}%" ) and `;
            }
            if (this.selectedFilter !== 'all') {
                filters += `status eq "${this.selectedFilter}" and `;
            }
            // Remove trailing 'and' and encode for URI
            filters = encodeURIComponent(filters.substring(0, filters.length - 4));
            return filters;
        },
        formatData(item) {
            return `${this.capitalize(item.project_name)} <span class="color-gray">(${this.capitalize(item.project_name)})</span>`;
        },
        show(item) {
            this.f7router.navigate(this.selfUrl + item.id, {
                query: {
                    item: item,
                },
            });
        },
    },
};
</script>
