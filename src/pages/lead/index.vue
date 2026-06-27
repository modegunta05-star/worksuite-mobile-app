<template>
    <f7-page
            infinite
            @infinite="onInfiniteScroll"
            ptr
            @ptr:refresh="refresh"
            :infinite-preloader="infiniteScrollInProgress"
            @page:init="pageLoad"
    >
        <!-- Top Navbar -->
        <f7-navbar :sliding="false">
            <f7-nav-left>
                <f7-link icon-ios="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
            </f7-nav-left>
            <f7-nav-title sliding>{{ trans('app.menu.leads') }}</f7-nav-title>
        </f7-navbar>
        <f7-subnavbar :inner="false">
            <f7-searchbar
                    :disable-button-text="trans('app.cancel')"
                    :placeholder="trans('app.search')"
                    :clear-button="true"
                    :custom-search="true"
                    @searchbar:search="onSearch"
                    @searchbar:clear="onSearchClear"
            ></f7-searchbar>
        </f7-subnavbar>
        <f7-block v-if="!busy && items.length === 0" style="text-align: center">
            {{ trans('messages.noLeadFound') }}
        </f7-block>

        <skeleton v-if="busy && !isRefreshing"></skeleton>

        <f7-list media-list dividers-ios strong-ios
                 inset>
            <f7-list-item
                    v-for="item in items"
                    v-bind:key="item.id"
                    :title="item.client_name"
                    :subtitle="item.company_name">
            </f7-list-item>
        </f7-list>
    </f7-page>
</template>

<script type="text/babel">
import IndexMixin from '../../js/vue/mixins/index.vue';
import CommonMixin from '../../js/vue/mixins/common.vue';
import ModuleMixin from './mixin.vue';
import Skeleton from "@/pages/lead/skeleton.vue";

export default {
    components: {Skeleton},
    props: {
        f7route: Object,
        f7router: Object,
    },
    mixins: [IndexMixin, CommonMixin, ModuleMixin],
    data() {
        return {
            endpoint: 'lead',
            fields: 'id,client_name,company_name',
            order: 'id desc',
        };
    },
    created() {
        this.pageId = Math.round(Math.random() * 100);
    },
    methods: {
        getFilters() {
            let filters = '';

            if (this.search_query !== null) {
                filters = `(client_name lk "${this.search_query}%" or client_name lk "${this.search_query}%" or  status lk "${this.search_query}%")`;
            }
            // Remove trailing 'and' and encode for URI
            filters = encodeURIComponent(filters);

            return filters;
        },

        formatData(item) {
            return `${this.capitalize(item.name)} <span class="color-gray">(${this.capitalize(item.name)})</span>`;
        },

        show(item) {
            this.f7router.navigate('/lead/' + item.id, {
                query: {
                    item: item,
                },
            });
        },
    },
};
</script>
