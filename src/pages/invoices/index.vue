<template>
    <f7-page
        infinite
        @infinite="onInfiniteScroll"
        ptr
        @ptr:refresh="refresh"
        :infinite-preloader="infiniteScrollInProgress"
        @page:init="pageLoad"
        id="invoice-list"
    >
        <!-- Top Navbar -->
        <f7-navbar :sliding="false" back-link v-if="f7route.params.from">
            <f7-nav-title>{{ trans('app.menu.invoices') }}</f7-nav-title>
            <f7-nav-right>
                <f7-link href="#" sheet-open=".filter-actions" icon-f7="slider_horizontal_3"></f7-link>
            </f7-nav-right>
        </f7-navbar>
        <f7-navbar :sliding="false">
            <f7-nav-left>
                <f7-link icon-ios="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
            </f7-nav-left>
            <f7-nav-title>{{ trans('app.menu.invoices') }}</f7-nav-title>
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
            {{ trans('messages.noInvoicesFound') }}
        </f7-block>

        <f7-block class="search-list" >
            <skeleton v-if="busy && !isRefreshing"></skeleton>

            <f7-card v-for="item in items" v-bind:key="item.id" @click.native="show(item)" :padding="false"
                     raised>
                <f7-card-content>
                    <div class="grid grid-cols-1">
                        <div>
                            <strong>{{ item.invoice_number }}</strong>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 medium-grid-cols-2 grid-gap margin-top-half">
                        <div>
                            <span class="user-name" v-if="item.client">{{ item.client.name }}</span>
                            <span class="user-name" v-else-if="item.project && item.project.client">{{ item.project.client.name }}</span>
                        </div>
                        <div class="text-align-right">
                            <f7-icon f7="calendar"></f7-icon>
                            {{ formatDueDate(item.due_date) }}
                        </div>
                    </div>
                    <div class="grid grid-cols-2 medium-grid-cols-2 grid-gap margin-top-half">
                        <div>{{ item.currency.currency_symbol + item.total }}</div>
                        <div class="text-align-right">
                            <f7-badge :style="`background-color:${formatStatusColor(item)}`">
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
                    <f7-badge :color="formatSheetStatusColor(state)"></f7-badge>
                </f7-list-item>
            </f7-list>
        </f7-sheet>
        <!-- FAB Right Bottom (Orange) -->
    </f7-page>
</template>

<script type="text/babel">
    import IndexMixin from '../../js/vue/mixins/index.vue';
    import CommonMixin from '../../js/vue/mixins/common.vue';
    import ModuleMixin from './mixin.vue';
    import Skeleton from './skeleton.vue';

    export default {
        components: { Skeleton },
        props: {
            f7route: Object,
            f7router: Object,
        },

        mixins: [IndexMixin, CommonMixin, ModuleMixin],
        data() {
            return {
                endpoint: 'invoice',
                fields: 'id,invoice_number,due_date,total,status,client.limit(1000){id,name},currency.limit(1000){id,currency_code,currency_symbol},project.limit(1000){id,project_name,client_id},project:client.limit(1000){id,name}',
                order: 'invoices.id desc',
                currentItem: [],
                status: ['all', 'paid', 'accepted', 'unpaid', 'partial', 'canceled', 'draft'],
                selectedFilter: 'all',
                filters: '',
            };
        },
        created() {
            this.pageId = Math.round(Math.random() * 100);
        },
        mounted() {},
        methods: {
            getFilters() {
                let filters = '';
                if (this.search_query !== null) {
                    filters = `invoice_number lk "%${this.search_query}%" and `;
                }
                if (this.selectedFilter !== 'all') {
                    filters += `status eq "${this.selectedFilter}" and `;
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
