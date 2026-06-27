<style type="text/css">
.badge-profile-image {
    height: 40px;
    width: 40px;
    border-radius: 50%;
}
</style>
<template>
    <f7-page ptr @ptr:refresh="refresh" @page:beforeout="onPageBeforeOut" @page:beforeremove="onPageBeforeRemove">
        <f7-navbar :sliding="false" back-link layout="dark" theme="white">
            <f7-nav-title sliding v-if="item">{{ item.name }}</f7-nav-title>

            <f7-nav-right>
                <f7-link sheet-open=".employee-actions" icon-f7="ellipsis_vertical"></f7-link>
            </f7-nav-right>
        </f7-navbar>
        <template v-if="item">
            <f7-card id="employee-details">
                <f7-card-content>

                    <employee-component :employee="item"></employee-component>

                    <div class="grid grid-cols-3 medium-grid-cols-3 grid-gap margin-top">
                        <div class="text-align-center">
                            <strong class="text-align-center">{{ item.pending_task }}</strong>
                            <br/>{{ trans('modules.employees.pendingTasks') }}
                        </div>
                        <div class="text-align-center">
                            <strong>{{ item.leaves_taken }}</strong>
                            <br/>{{ trans('modules.employees.leavesTaken') }}
                        </div>
                        <div class="text-align-center">
                            <strong>{{ item.projects_count }}</strong>
                            <br/>{{ trans('modules.module.projects') }}
                        </div>
                    </div>
                </f7-card-content>
            </f7-card>
            <f7-block-title>Profile</f7-block-title>
            <f7-card id="employee-details">

                <f7-card-content>
                    <f7-list class="no-margin" v-if="item">
                        <f7-list-item :title="trans('app.email')"
                                      :after="item.email"></f7-list-item>
                        <f7-list-item :title="trans('modules.employees.employeeId')"
                                      :after="item.employee_detail ? item.employee_detail.employee_id:'-' "></f7-list-item>
                        <!--                <f7-list-item-->
                        <!--                        :title="trans('modules.employees.role')"-->
                        <!--                        :badge="capitalize(item.user_other_role)"-->
                        <!--                        badge-color="green"-->
                        <!--                ></f7-list-item>-->
                        <f7-list-item
                                :title="trans('modules.employees.department')"
                                :after="item.employee_detail && item.employee_detail.department ? item.employee_detail.department.team_name : '-'"
                        ></f7-list-item>
                        <f7-list-item
                                :title="trans('modules.employees.designation')"
                                :after="item.employee_detail && item.employee_detail.designation ? item.employee_detail.designation.name : '-'"
                        ></f7-list-item>
                        <f7-list-item :title="trans('app.phone')"
                                      :after="item.mobile ? item.mobile : '-'"></f7-list-item>
                    </f7-list>
                </f7-card-content>
            </f7-card>


            <f7-sheet class="employee-actions"
                      style="height: auto;" swipe-to-close backdrop>
                <f7-toolbar>
                    <div class="left padding-left">{{ trans('app.action') }}</div>
                    <div class="right">
                        <f7-link sheet-close>{{ trans('app.close') }}</f7-link>
                    </div>
                </f7-toolbar>

                <!-- Scrollable sheet content -->
                <f7-list dividers outline>
                    <f7-list-item view=".view-main" sheet-close :title="trans('app.edit')" @click.prevent="edit(item)">
                        <f7-icon f7="pencil"></f7-icon>
                    </f7-list-item>
                    <f7-list-item view=".view-main" @click="remove" :title="trans('app.delete')">
                        <f7-icon f7="trash"></f7-icon>
                    </f7-list-item>
                </f7-list>
            </f7-sheet>
        </template>
    </f7-page>
</template>

<script type="text/babel">
import {f7} from 'framework7-vue';
import Cache from '../../js/vue/scripts/cache';
import CommonMixin from '../../js/vue/mixins/common.vue';
import ModuleMixin from './mixin.vue';
import axiosHttp from '../../js/vue/boot/axiosHttp';
import EmployeeComponent from "@/pages/common/employee-component.vue";

export default {
    components: {EmployeeComponent},
    props: {
        f7route: Object,
        f7router: Object,
    },
    mixins: [CommonMixin, ModuleMixin],
    data() {
        return {
            endpoint: '/employee',
            item: null,
            busy: false,
        };
    },
    mounted() {
        if (this.f7route.query && this.f7route.query.item) {
            this.item = JSON.parse(this.f7route.query.item);
        } else {
            this.refresh();
        }
    },
    methods: {
        refresh() {
            this.item = null;

            f7.preloader.show();

            this.getItem().then(() => {
                f7.preloader.hide();
            });
        },
        edit(item) {
            this.f7router.navigate('/employee/' + item.id + '/edit', {
                params: {
                    item: item,
                },
            });
        },

        remove() {
            f7.dialog.confirm(`${this.trans('messages.confirmation.employeeDelete')}`, '', () => {
                f7.sheet.close();
                f7.preloader.show();

                axiosHttp.delete(`/employee/${this.item.id}`).then(
                    () => {
                        f7.preloader.hide();
                        Cache.removeMatching('employee');
                        this.$store.commit('sendCacheInvalidate', 'employee');
                        this.f7router.back();
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
