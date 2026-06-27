<template>
    <f7-page @page:init="pageLoad">
        <f7-navbar :back-link="true" :title="getTitle()" sliding layout="light" theme="white"
                   snapPageScrollToTransparentNavbar>
        </f7-navbar>
        <f7-block style="padding:0">
            <f7-list strong-ios dividers-ios inset-ios form @submit.prevent="false" id="form">
                <f7-list-item
                        v-if="!isEmployeeRoute"
                        :title="trans('app.employee')"
                        smart-select
                        id="userSmartSelect"
                        @change="onUserChange"
                        :smart-select-params="{
                                    openIn: 'popup',
                                     searchbar: true,
                                      searchbarPlaceholder: trans('app.search')
                                }">
                    <select name="employee" @change="onUserChange">
                        <option :value="user.id" v-for="user in users" :key="user.user_id">{{
                                user.name
                            }}
                        </option>
                    </select>
                </f7-list-item>
                <f7-input v-if="isEmployeeRoute" name="employee" type="hidden"
                          :value="$store.state.user.id"></f7-input>

                <f7-list-input
                        :label="trans('modules.leaves.leaveType')"
                        type="select"
                        name="type"
                        @change="onTypeChange"
                        :placeholder="trans('app.select') + ' ' + trans('app.leaves')"
                >
                    <option :value="type.id" v-for="type in types" :key="type.id">{{ type.type_name }}</option>
                </f7-list-input>

                <f7-list-input
                        v-if="!isEmployeeRoute"
                        :label="trans('app.status')"
                        type="select"
                        name="status"
                        @change="onStatusChange"
                        :placeholder="trans('app.selectStatus')"
                >
                    <option :value="singleStatus" v-for="singleStatus in status" :key="singleStatus">
                        {{ formatStatus(singleStatus) }}
                    </option>
                </f7-list-input>

                <f7-list-input
                        :label="trans('modules.leaves.leaveDate')"
                        clear-button
                        type="datepicker"
                        readonly
                        :calendar-params="{ dateFormat: getCompanyDatePickerFormat }"
                        :placeholder="trans('modules.leaves.leaveDate')"
                        @change="onStartDateChange($event.target.value)"
                ></f7-list-input>

                <f7-list-input
                        :label="trans('modules.leaves.reason')"
                        floating-label
                        required
                        validate-on-blur
                        clear-button
                        autocorrect="off"
                        type="textarea"
                        :error-message="trans('validation.required', trans('modules.leaves.reason'))"
                        :placeholder="trans('modules.leaves.reason')"
                        :value="item.reason"
                        @input="item.reason = $event.target.value"
                ></f7-list-input>
                <f7-list-input hidden="hidden"></f7-list-input>
                <f7-block-footer>
                    <f7-block>
                        <div class="grid-cols-1">
                            <f7-button
                                    @click="submit" :disabled="!formValid" large fill color="info"
                                    class="login-btn"> {{ trans('app.submit') }}
                            </f7-button>
                        </div>
                    </f7-block>
                    <!--                <f7-button  color="black" @click="openCrmWebsite()">Don't have an account?</f7-button>-->
                </f7-block-footer>
            </f7-list>
            <f7-block class="error-block" v-if="$store.state.error && $store.state.error.code === 0"
            >{{ trans('messages.internetConnectionError') }}
            </f7-block>
        </f7-block>
    </f7-page>
</template>

<script type="text/babel">
import Cache from '../../js/vue/scripts/cache';
import CommonMixin from '../../js/vue/mixins/common.vue';
import ModuleMixin from './mixin.vue';
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
                leave_date: null,
                user: {
                    id: null,
                },
                type: {
                    id: null,
                },
                reason: null,
                duration: 'single',
                status: 'pending',
            },
            users: [],
            types: [],
            status: ['approved', 'pending'],
            error: null,
            push: null,
        };
    },
    computed: {
        formValid() {
            return (
                this.item.leave_date &&
                this.item.status &&
                this.item.type.id &&
                this.item.reason &&
                this.item.user.id
            );
        },
    },
    methods: {
        init() {
            f7.preloader.show();

            const promises = [];
            promises.push(this.getUsers());
            promises.push(this.getTypes());

            Promise.all(promises).then(
                () => {
                    this.item.type = this.types[0];

                    if (this.isEmployeeRoute) {
                        this.item.user = this.$store.state.user
                    } else {
                        this.item.user = this.users[0];
                        let userSmartSelect = f7.smartSelect.get('#userSmartSelect .smart-select');
                        userSmartSelect.setValue(this.item.user.id);
                    }

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

            axiosHttp.post(`/leave`, this.item).then(
                (response) => {
                    f7.preloader.hide();
                    Cache.removeMatching('leave');
                    this.$store.commit('sendCacheInvalidate', 'leave');
                    this.f7router.back();
                },
                () => {
                    f7.preloader.hide();
                }
            );
        },
        getTitle() {
            if (this.isEmployeeRoute) {
                return `${this.trans('modules.leaves.addLeave')}`;
            }

            return `${this.trans('modules.leaves.applyLeave')}`;

        },
    },
};
</script>
