<template>
    <f7-page ptr @ptr:refresh="refresh" @page:init="pageLoad" id="task-list">
        <f7-navbar :sliding="false">
            <f7-nav-left>
                <f7-link icon-ios="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
            </f7-nav-left>
            <f7-nav-title sliding>{{ trans('app.menu.dashboard') }}</f7-nav-title>
        </f7-navbar>

        <clocking v-snap-permission="'attendance'" ref="clockingref" v-if="this.isEmployeeRoute"></clocking>
        <attendance v-snap-permission="'attendance'" ref="attendanceref" v-else></attendance>

        <f7-card :class="`${busy ? 'skeleton-text skeleton-effect-wave' : ''}`" @click="f7router.navigate(this.isEmployeeRoute?'/self/projects/from-dashboard':'/projects/from-dashboard'),{
}">
            <f7-card-content>
                <f7-list dividers-ios strong-ios outline-ios>
                    <f7-list-item title="Total Projects" :badge="totalProjects" badge-color="green">
                        <template #media>
                            <f7-icon f7="list_dash" class="bg-success-gradient dashboard-widget-icon"></f7-icon>
                        </template>
                    </f7-list-item>
                </f7-list>
            </f7-card-content>
        </f7-card>
        <f7-card :class="`${busy ? 'skeleton-text skeleton-effect-wave' : ''}`"
                 @click="f7router.navigate(this.isEmployeeRoute ?'/self/tasks/from-dashboard':'/tasks/from-dashboard')">
            <f7-card-content>
                <f7-list dividers-ios strong-ios outline-ios>
                    <f7-list-item title="Pending Tasks" :badge="pendingTasks" badge-color="green">
                        <template #media>
                            <f7-icon f7="list_number_rtl" class="bg-success-gradient dashboard-widget-icon"></f7-icon>
                        </template>
                    </f7-list-item>
                </f7-list>
            </f7-card-content>
        </f7-card>
        <f7-card v-if="!this.isEmployeeRoute" :class="`${busy ? 'skeleton-text skeleton-effect-wave' : ''}`"
                 @click="f7router.navigate('/invoices/from-dashboard')">
            <f7-card-content>
                <f7-list dividers-ios strong-ios outline-ios>
                    <f7-list-item title="Unpaid Invoices" :badge="unpaidInvoices" badge-color="green">
                        <template #media>
                            <f7-icon f7="layers_alt" class="bg-success-gradient dashboard-widget-icon"></f7-icon>
                        </template>
                    </f7-list-item>
                </f7-list>
            </f7-card-content>
        </f7-card>
    </f7-page>
</template>
<script>
import Attendance from './attendance.vue';
import Clocking from './clocking.vue';
import CommonMixin from '../js/vue/mixins/common.vue';
import IndexMixin from '../js/vue/mixins/index.vue';
import Cache from "@/js/vue/scripts/cache";

export default {
    props: {
        f7route: Object,
        f7router: Object,
    },
    mixins: [CommonMixin, IndexMixin],
    components: {
        Attendance,
        Clocking,
    },
    data() {
        return {
            currentPage: 1,
            infiniteScrollInProgress: false,
            infiniteScrollPreloader: false,
            totalProjects: 0,
            pendingTasks: 0,
            unpaidInvoices: 0,
            busy: true,
        };
    },
    methods: {
        pageLoad(page) {

            this.init();
        },
        init(refresh) {
            this.busy = true;

            !this.isEmployeeRoute ? this.$refs.attendanceref.init(refresh) : this.$refs.clockingref.loadData(refresh);

            let dashboardUrl = '/dashboard';

            if (this.isEmployeeRoute) {
                dashboardUrl = '/dashboard/me';
            }
            Cache.httpGet(dashboardUrl).then((response) => {
                this.totalProjects = response.data.totalProjects;
                this.pendingTasks = response.data.pendingTasks;
                this.unpaidInvoices = response.data.unpaidInvoices;

                this.busy = false;
            });
        },
        refresh() {
            this.init(true);
        },
    },
};
</script>
