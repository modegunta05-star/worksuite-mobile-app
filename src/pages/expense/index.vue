<style type="text/css" scoped>
#selected {
    background-color: rgba(0, 0, 0, 0.15);
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
            id="task-list"
    >
        <!-- Top Navbar -->
        <f7-navbar :sliding="false">
            <f7-nav-left>
                <f7-link icon-ios="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
            </f7-nav-left>
            <f7-nav-title>{{ trans('app.menu.expenses') }}</f7-nav-title>
            <f7-nav-right>
                <f7-link href="#" sheet-open=".filter-actions" icon-f7="slider_horizontal_3"></f7-link>
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
        <f7-block v-if="!busy && items.length === 0" style="text-align: center">
            {{ trans('messages.noExpensesFound') }}
        </f7-block>

        <f7-block class="search-list">
            <f7-card v-for="item in items" v-bind:key="item.id" @click.native="show(item)">
                <f7-card-content>
                    <div class="grid grid-cols-2 ">
                        <div>{{ item.item_name }}</div>
                        <div class="text-align-right">
                            <f7-icon f7="calendar"></f7-icon>
                            {{ formatDueDate(item.purchase_date) }}
                        </div>
                    </div>
                    <div class="grid grid-cols-2 grid-gap margin-top text-align-right">
                        <div class="text-align-left">
                            {{ item.currency.currency_symbol + item.price }}
                        </div>
                        <div>
                            <f7-badge :color="formatStatusColor(item)">
                                {{ formatStatus(item.status) }}
                            </f7-badge>
                        </div>
                    </div>
                </f7-card-content>
            </f7-card>
        </f7-block>
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
                        :title="formatStatus(state)"
                        :id="state === selectedFilter ? `selected` : ``"
                        :key="index"
                        @click="changeStatus(state)"
                        v-for="(state, index) in status"
                >
                    <!--               <f7-badge :color="formatSheetStatusColor(state)"></f7-badge>-->
                    <f7-badge :style="`background-color:${formatSheetStatusColor(state)}`"></f7-badge>
                </f7-list-item>
            </f7-list>
        </f7-sheet>
        <!-- FAB Right Bottom (Orange) -->

        <!-- Extended FAB Center Bottom (Red) -->
        <f7-fab position="right-bottom" slot="fixed" :href="selfUrl + 'create/'" color="blue">
            <f7-icon ios="f7:plus" aurora="f7:plus" md="material:add"></f7-icon>
        </f7-fab>
    </f7-page>
</template>

<script type="text/babel">
import IndexMixin from '../../js/vue/mixins/index.vue';
import CommonMixin from '../../js/vue/mixins/common.vue';
import ModuleMixin from './mixin.vue';
import {f7} from "framework7-vue";

export default {
    props: {
        f7route: Object,
        f7router: Object,
    },
    mixins: [IndexMixin, CommonMixin, ModuleMixin],
    data() {
        return {
            endpoint: 'expense',
            fields: 'id,item_name,purchase_date,price,status,user.limit(1000){id,name},project.limit(1000){id,project_name},currency.limit(1000){id,currency_code,currency_symbol}',
            order: 'expenses.id desc',
            currentItem: [],
            status: ['all', 'approved', 'pending', 'rejected'],
            selectedFilter: 'all',
            filters: '',
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
                filters += `item_name lk "${this.search_query}%" and `;
            }
            if (this.selectedFilter !== 'all') {
                filters += `status eq "${this.selectedFilter}" and `;
            }
            if (this.isEmployeeRoute) {
                // This is employee self-service route, add employee id filter
                filters += `user_id eq ${this.$store.state.user.id} and `;
            }
            // Remove trailing 'and' and encode for URI
            filters = encodeURIComponent(filters.substring(0, filters.length - 4));

            return filters;
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
