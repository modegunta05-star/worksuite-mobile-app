<style type="text/css">
#employee-list .badge {
    min-width: unset;
    width: 12px;
    height: 12px
}
</style>
<template>
    <f7-page
            infinite
            @infinite="onInfiniteScroll"
            ptr
            @ptr:refresh="refresh"
            :infinite-preloader="infiniteScrollInProgress"
            @page:init="pageLoad"
            @page:beforeremove="onPageBeforeRemove"
            @page:beforeout="onPageBeforeOut"
    >
        <!-- Top Navbar -->
        <f7-navbar :sliding="false">
            <f7-nav-left>
                <f7-link icon-ios="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
            </f7-nav-left>
            <f7-nav-title>{{ trans('app.menu.employees') }}</f7-nav-title>
            <f7-nav-right>
                <f7-link href="#" sheet-open=".filter-actions" icon-f7="slider_horizontal_3"></f7-link>
            </f7-nav-right>
        </f7-navbar>
        <f7-subnavbar :inner="false">
            <f7-searchbar
                    class="item-search"
                    search-container=".search-list"
                    :disable-button-text="trans('app.cancel')"
                    :placeholder="trans('app.search')"
                    :clear-button="true"
                    :custom-search="true"
                    @searchbar:search="onSearch"
                    @searchbar:clear="onSearchClear"
            ></f7-searchbar>
        </f7-subnavbar>
        <f7-block v-if="!busy && !isRefreshing && items.length === 0" style="text-align: center">
            {{ trans('messages.noEmployeesFound') }}
        </f7-block>

        <skeleton v-if="busy && !isRefreshing"></skeleton>

        <f7-list media-list
                 dividers-ios
                 strong-ios
                 inset
                 id="employee-list"
                 class="search-list searchbar-found">

            <f7-list-item
                    v-for="item in items"
                    v-bind:key="item.id"
                    link="#"
                    :title="item.name"
                    :text="item?.employee_detail?.employee_id"
                    badge="&nbsp;"
                    :subtitle="item?.employee_detail?.designation.name"
                    :badge-color="formatStatusColor(item)"
                    @click="show(item)"
            >
                <template #media>
                    <img slot="media" :src="item.image_url" width="44" height="44" class="lazy lazy-fade-in " alt=""/>
                </template>
            </f7-list-item>
        </f7-list>
        <!-- FAB Right Bottom (Orange) -->
        <f7-sheet class="filter-actions" style="height: auto;" swipe-to-close backdrop>
            <f7-toolbar>
                <div class="left padding-left">{{ trans('app.filters') }}</div>
                <div class="right">
                    <f7-link sheet-close>{{ trans('app.close') }}</f7-link>
                </div>
            </f7-toolbar>

            <!-- Scrollable sheet content -->
            <f7-list dividers outline>
                <f7-list-item
                        view=".view-main"
                        sheet-close
                        :title="formatSheetStatus(state)"
                        :id="state === selectedFilter ? `selected` : ``"
                        :key="index"
                        @click="changeStatus(state)"
                        v-for="(state, index) in status"
                >
                    <f7-badge :color="formatSheetStatusColor(state)"></f7-badge>
                </f7-list-item>
            </f7-list>
        </f7-sheet>
        <!-- Extended FAB Center Bottom (Red) -->
        <f7-fab position="right-bottom" slot="fixed" href="/employee/create" color="blue">
            <f7-icon ios="f7:plus" md="material:add"></f7-icon>
        </f7-fab>
    </f7-page>
</template>

<script type="text/babel">
import {f7} from 'framework7-vue';
import IndexMixin from '../../js/vue/mixins/index.vue';
import CommonMixin from '../../js/vue/mixins/common.vue';
import ModuleMixin from './mixin.vue';
import Skeleton from "./skeleton.vue";
import axiosHttp from "@/js/vue/boot/axiosHttp";

export default {
    components: {Skeleton},
    props: {
        f7route: Object,
        f7router: Object,
    },
    mixins: [IndexMixin, CommonMixin, ModuleMixin],
    data() {
        return {
            endpoint: 'employee',
            fields: 'id,name,email,image,image_url,status,pending_task,leaves_taken,projects_count,employeeDetail.limit(1000){id,employee_id},employeeDetail:department{id,team_name},employeeDetail:designation{id,name}',
            order: 'users.id desc',
            status: ['all', 'active', 'deactive'],
            selectedFilter: 'active',
        };
    },
    created() {
        this.pageId = Math.round(Math.random() * 100);
    },
    mounted() {
    },
    methods: {
        getFilters() {
            let filters = '';

            if (this.search_query !== null) {
                filters = `users.name lk "%${this.search_query}%" and `;
            }
            if (this.selectedFilter !== 'all') {
                filters += `status eq "${this.selectedFilter}" and `;
            }
            // Remove trailing 'and' and encode for URI
            filters = encodeURIComponent(filters.substring(0, filters.length - 4));

            return filters;
        },

        formatData(item) {
            return `${this.capitalize(item.name)} <span class="color-gray">(${this.capitalize(item.name)})</span>`;
        },
        remove(item) {
            f7.dialog.confirm(`${this.trans('messages.confirmation.employeeDelete')}`, '', () => {
                f7.sheet.close();
                f7.preloader.show();

                axiosHttp.delete(`/employee/${item.id}`).then(
                    () => {
                        f7.preloader.hide();
                        Cache.removeMatching('employee');
                        this.$store.commit('sendCacheInvalidate', 'employee');
                        this.f7router.refreshPage();
                    },
                    (response) => {
                        f7.preloader.hide();
                        f7.dialog.alert(response.response.data.error.message);
                    }
                );
            });
        },

        show(item) {
            this.f7router.navigate({
                name: 'employee.show',
                params: {
                    id: item.id,
                },
                query: {
                    item: JSON.stringify(item),
                },
            });
        },
    },
};
</script>
