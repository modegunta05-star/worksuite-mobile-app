<template>
    <f7-page @page:init="pageLoad">
        <f7-navbar :back-link="true" :title="trans('modules.leaves.editLeave')" sliding layout="light"
                   theme="white"></f7-navbar>
        <f7-block>
            <f7-card>
                <f7-card-content>
                    <f7-list inset form @submit.prevent="false" id="editForm">
                        <f7-list-item :title="trans('app.employee')" :after="item.user.name"></f7-list-item>
                        <f7-list-input
                                :label="trans('modules.leaves.leaveType')"
                                type="select"
                                name="type"
                                @change="onTypeChange"
                                :placeholder="trans('app.select') + ' ' + trans('app.leaves')"
                        >
                            <option :value="type.id" :selected="type.id == item.type.id" v-for="type in types"
                                    :key="type.id">
                                {{ type.type_name }}
                            </option>
                        </f7-list-input>
                        <f7-list-input
                                v-if="!isEmployeeRoute"
                                :label="trans('app.status')"
                                type="select"
                                name="status"
                                @change="onStatusChange"
                                :placeholder="trans('app.selectStatus')"
                        >
                            <option
                                    :value="singleStatus"
                                    :selected="singleStatus == item.status"
                                    v-for="singleStatus in status"
                                    :key="singleStatus"
                            >
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
                                :value="[moment(item.leave_date)]"
                                @change="onStartDateChange($event.target.value)"
                        ></f7-list-input>

                        <f7-list-input
                                v-if="this.item.status !== 'rejected'"
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

                        <f7-list-input
                                v-if="this.item.status === 'rejected'"
                                :label="trans('modules.leaves.rejectReason')"
                                floating-label
                                validate-on-blur
                                clear-button
                                autocorrect="off"
                                type="textarea"
                                :error-message="trans('validation.required', trans('modules.leaves.rejectReason'))"
                                :placeholder="trans('modules.leaves.rejectReason')"
                                :value="item.reject_reason"
                                @input="item.reject_reason = $event.target.value"
                        ></f7-list-input>

                        <f7-block class="error-block" v-if="$store.state.error && $store.state.error.code === 0"
                        >{{ trans('messages.internetConnectionError') }}
                        </f7-block>
                    </f7-list>
                    <br/>
                    <br/>
                    <f7-button fill color="green" class="login-btn" large raised round @click="submit"
                               :disabled="!formValid"
                    >{{ trans('app.submit') }}
                    </f7-button>
                </f7-card-content>
            </f7-card>
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
            status: ['approved', 'pending', 'rejected'],
            error: null,
            push: null,
        };
    },
    computed: {
        formValid() {
            const $$ = Dom7;
            return (
                this.item.leave_date &&
                this.item.status &&
                this.item.type.id
                // &&
                // $$('#editForm')[0] &&
                // $$('#editForm')[0].checkValidity()
            );
        },
    },
    methods: {
        init() {
            f7.preloader.show();

            const promises = [];
            promises.push(this.getUsers());
            promises.push(this.getTypes());
            promises.push(this.getItem());

            Promise.all(promises).then(
                () => {
                    f7.preloader.hide();
                },
                () => {
                    f7.preloader.hide();
                }
            );
        },

        pageLoad(page) {
            this.init();
            console.log(this.item);
        },
        submit() {
            f7.preloader.show();
            const itemToSend = {
                id: this.item.id,
                leave_date: this.item.leave_date,
                status: this.item.status,
                reason: this.item.reason,
                reject_reason: this.item.reject_reason,
                duration: 'single',
                type: {
                    id: this.item.type.id,
                },
            };

            axiosHttp.put(`/leave/${this.item.id}`, itemToSend).then(
                (response) => {
                    f7.preloader.hide();
                    Cache.removeMatching('leave');
                    this.$store.commit('sendCacheInvalidate', 'leave');
                    this.f7router.back({force: true});
                },
                () => {
                    f7.preloader.hide();
                }
            );
        },
    },
};
</script>
