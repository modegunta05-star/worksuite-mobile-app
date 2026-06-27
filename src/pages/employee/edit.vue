<template>
    <f7-page @page:init="pageLoad">
        <f7-navbar :back-link="true" :title="trans('modules.employees.editEmployee')" sliding layout="light"
                   theme="white"></f7-navbar>
        <f7-card>
            <f7-card-content>
                <f7-list strong-ios dividers-ios inset-ios form @submit.prevent="false" id="form">
                    <f7-list-input
                            :label="trans('modules.employees.employeeId')"
                            required
                            clear-button
                            autocorrect="off"
                            type="text"
                            :error-message="trans('validation.required', trans('modules.employees.employeeId'))"
                            :placeholder="trans('modules.employees.employeeId')"
                            :value="item.employee_detail.employee_id"
                            @input="item.employee_detail.employee_id = $event.target.value"
                    ></f7-list-input>
                    <f7-list-input
                            :label="trans('modules.employees.employeeName')"
                            required
                            clear-button
                            autocorrect="off"
                            type="text"
                            :error-message="trans('validation.required', trans('modules.employees.employeeName'))"
                            :placeholder="trans('modules.employees.employeeName')"
                            :value="item.name"
                            @input="item.name = $event.target.value"
                    ></f7-list-input>

                    <f7-list-input
                            :label="trans('modules.employees.employeeEmail')"
                            floating-label
                            required
                            validate-on-blur
                            clear-button
                            type="email"
                            :placeholder="trans('modules.employees.employeeEmail')"
                            :value="item.email"
                            @input="item.email = $event.target.value"
                    ></f7-list-input>
                    <f7-list-input
                            :label="trans('modules.employees.employeePassword')"
                            floating-label
                            name="password"
                            :type="passwordFieldType"
                            :placeholder="trans('modules.employees.employeePassword')"
                            :value="item.password"
                            @input="item.password = $event.target.value"
                    >
                        <f7-link slot="inner-end" @click="switchVisibility" class="passwordShowHide"
                        >
                            <f7-icon :f7="passwordEyeIcon"></f7-icon
                            >
                        </f7-link>
                    </f7-list-input>

                    <f7-list-input
                            :label="trans('modules.employees.joiningDate')"
                            clear-button
                            type="datepicker"
                            readonly
                            :calendar-params="{ dateFormat: getCompanyDatePickerFormat }"
                            :placeholder="trans('modules.employees.joiningDate')"
                            :value="[new Date()]"
                            @change="onBillDateChange($event.target.value)"
                    ></f7-list-input>

                    <f7-list-input
                            :label="trans('modules.employees.department')"
                            type="select"
                            @change="onDepartmentChange"
                            :placeholder="trans('modules.employees.chooseDepartment')"
                    >
                        <option
                                :value="department.id"
                                :selected="department.id == item.employee_detail.department.id"
                                v-for="department in departments"
                                :key="department.id"
                        >
                            {{ department.team_name }}
                        </option>
                    </f7-list-input>

                    <f7-list-input
                            :label="trans('modules.employees.designation')"
                            type="select"
                            @change="onDesignationChange"
                            :placeholder="trans('modules.employees.chooseDesignation')"
                    >
                        <option
                                :value="designation.id"
                                :selected="designation.id == item.employee_detail.designation.id"
                                v-for="designation in designations"
                                :key="designation.id"
                        >
                            {{ designation.name }}
                        </option>
                    </f7-list-input>

                    <f7-list-input
                            :label="trans('modules.employees.status')"
                            type="select"
                            name="status"
                            @change="onStatusChange"
                            :placeholder="trans('modules.employees.chooseStatus')"
                    >
                        <option
                                :value="singleStatus"
                                :selected="singleStatus === item.status"
                                v-for="singleStatus in status"
                                :key="singleStatus"
                        >
                            {{ formatStatus(singleStatus) }}
                        </option>
                    </f7-list-input>
                </f7-list>
                <br/>
                <br/>
                <f7-button fill color="green" class="login-btn" large raised round @click="submit"
                           :disabled="!formValid"
                >{{ trans('app.submit') }}
                </f7-button>
            </f7-card-content>

            <f7-block class="error-block" v-if="$store.state.error && $store.state.error.code === 0"
            >{{ trans('messages.internetConnectionError') }}
            </f7-block>
        </f7-card>
    </f7-page>
</template>

<script type="text/babel">
import Cache from '../../js/vue/scripts/cache';
import CommonMixin from '../../js/vue/mixins/common.vue';
import ModuleMixin from './mixin.vue';
import Dom7 from "dom7";
import {f7} from "framework7-vue";
import axiosHttp from "@/js/vue/boot/axiosHttp";

export default {
    props: {
        f7route: Object,
        f7router: Object,
    },
    mixins: [CommonMixin, ModuleMixin],
    data() {
        return {
            item: {
                name: null,
                status: null,
                employee_detail: {
                    employee_id: null,
                    department: {
                        id: null,
                    },
                    designation: {
                        id: null,
                    },
                    joining_date: null,
                },
                email: null,
                password: null,
            },
            passwordFieldType: 'password',
            passwordEyeIcon: 'eye',
            departments: [],
            designations: [],
            status: ['active', 'deactive'],
            error: null,
            push: null,
        };
    },
    computed: {
        formValid() {
            const $$ = Dom7;
            return this.item.name && this.item.employee_detail.employee_id;
        },
    },
    methods: {
        init() {
            f7.preloader.show();

            const promises = [];
            promises.push(this.getDepartments());
            promises.push(this.getDesignations());
            promises.push(this.getItem());

            Promise.all(promises).then(
                () => {
                    console.log(this.item);
                    f7.preloader.hide();
                },
                () => {
                    f7.preloader.hide();
                }
            );
        },

        pageLoad(page) {
            console.log('page', page, this.f7route.params);
            // if (page.detail.page.query.item !== undefined && page.detail.page.query.item !== null) {
            //   this.originalItem = page.detail.page.query.item;
            // }
            this.init();
        },
        formatStatus(status) {
            return this.capitalize(status);
        },
        submit() {
            f7.preloader.show();
            const itemToSend = {
                id: this.item.id,
                password: this.item.password,
                status: this.item.status,
                employee_detail: {
                    id: this.item.employee_detail.id,
                    employee_id: this.item.employee_detail.employee_id,
                    department: {
                        id: this.item.employee_detail.department.id,
                    },
                    designation: {
                        id: this.item.employee_detail.designation.id,
                    },
                },
                name: this.item.name,
                email: this.item.email,
            };

            axiosHttp.put(`/employee/${this.item.id}`, itemToSend).then(
                (response) => {
                    f7.preloader.hide();
                    Cache.removeMatching('employee');
                    this.$store.commit('sendCacheInvalidate', 'employee');
                    this.f7router.back({force: true});
                },
                () => {
                    f7.preloader.hide();
                }
            );
        },
        switchVisibility() {
            this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
            this.passwordEyeIcon = this.passwordEyeIcon === 'eye' ? 'eye_slash' : 'eye';
        },
    },
};
</script>
<style>
.passwordShowHide {
    z-index: 9;
    padding: 18px;
    position: absolute;
    right: 0;
}

.passwordShowHide div {
    display: none !important;
}

.passwordShowHide i {
    font-size: 18px;
    color: #888;
}
</style>
