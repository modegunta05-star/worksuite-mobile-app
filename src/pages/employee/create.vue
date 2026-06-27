<template>
    <f7-page @page:init="pageLoad">
        <f7-navbar
            :back-link="true"
            :title="trans('modules.employees.addNewEmployee')"
            sliding
            layout="light"
            theme="white"
            snapPageScrollToTransparentNavbar
        >
        </f7-navbar>
            <f7-card>
                <f7-card-content>
                    <f7-list  strong-ios dividers-ios inset-ios form @submit.prevent="false" id="form">
                        <f7-list-input
                            :label="trans('modules.employees.employeeId')"
                            required
                            validate
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
                            floating-label
                            required
                            validate-on-blur
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
                                ><f7-icon :f7="passwordEyeIcon"></f7-icon
                            ></f7-link>
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
                            <option :value="department.id" v-for="department in departments" :key="department.id">
                                {{ department.team_name }}
                            </option>
                        </f7-list-input>

                        <f7-list-input
                            :label="trans('modules.employees.designation')"
                            type="select"
                            @change="onDesignationChange"
                            :placeholder="trans('modules.employees.chooseDesignation')"
                        >
                            <option :value="designation.id" v-for="designation in designations" :key="designation.id">
                                {{ designation.name }}
                            </option>
                        </f7-list-input>
                        <f7-list-input hidden="hidden"></f7-list-input>
                    </f7-list>
                    <br />
                    <br />
                    <f7-button fill color="green" class="login-btn" large raised round @click="submit" :disabled="!formValid"
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
    import {f7} from "framework7-vue";
    import axiosHttp from "@/js/vue/boot/axiosHttp";
    import Dom7 from "dom7";

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
                error: null,
                push: null,
            };
        },
        computed: {
            formValid() {
                const $$ = Dom7;
                return (
                    this.item.name &&
                    this.item.password &&
                    this.item.employee_detail.employee_id &&
                    $$('#form')[0] &&
                    $$('#form')[0].checkValidity()
                );
            },
        },
        methods: {
            init() {
                f7.preloader.show();

                const promises = [];
                promises.push(this.getDepartments());
                promises.push(this.getDesignations());
                promises.push(this.getEmployeeId());

                Promise.all(promises).then(
                    () => {
                        this.item.employee_detail.designation = this.designations[0];
                        this.item.employee_detail.department = this.departments[0];
                        console.log(this.item.employee_detail.employee_id);
                        f7.preloader.hide();
                    },
                    () => {
                        f7.preloader.hide();
                    }
                );
            },

            pageLoad(page) {
                this.init();
            },
            submit() {
                f7.preloader.show();

                axiosHttp.post(`/employee`, this.item).then(
                    (response) => {
                        f7.preloader.hide();
                        Cache.removeMatching('employee');
                        this.$store.commit('sendCacheInvalidate', 'employee');
                        this.f7router.navigate('/employees');
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
