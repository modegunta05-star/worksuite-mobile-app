<template>
    <f7-block>
        <f7-list form @submit.prevent="false" id="form" no-hairlines>
            <f7-list-item
                :title="trans('modules.projects.addMemberTitle')"
                smart-select
                users-select
                class="users-select"
                id="user-select"
                :smart-select-params="{ openIn: 'popup', searchbar: true, searchbarPlaceholder: trans('app.search') }"
            >
                <select name="project" @change="onUserChange" multiple id="users-select">
                    <option :value="user.id" v-for="user in employees" :key="user.id">{{ user.name }}</option>
                </select>
            </f7-list-item>
        </f7-list>
        <f7-button  large fill color="info" class="login-btn" @click="submit" :disabled="!formValid"
            >{{ trans('app.submit') }}
        </f7-button>
    </f7-block>
</template>

<script>
    import Cache from '../../../js/vue/scripts/cache';
    import CommonMixin from '../../../js/vue/mixins/common.vue';
    import ModuleMixin from '../mixin.vue';
    import {f7} from "framework7-vue";
    import axiosHttp from "@/js/vue/boot/axiosHttp";
    import _ from "lodash";
    export default {
        mixins: [CommonMixin, ModuleMixin],
        name: 'members-create',
        props: ['item'],
        data() {
            return {
                busy: false,
                employees: [],
                members: [],
            };
        },
        computed: {
            formValid() {
                return this.members[0];
            },
        },
        mounted() {
            this.init();
        },
        methods: {
            init() {
                f7.preloader.show();
                const promises = [];
                promises.push(this.getEmployees());

                Promise.all(promises).then(
                    () => {
                        f7.preloader.hide();
                    },
                    () => {
                        f7.preloader.hide();
                    }
                );
            },

            submit() {
                f7.preloader.show();
                this.busy = true;
                _.each(this.item.members, (member) => {
                    this.members.push({ id: member.id });
                });
                axiosHttp.post(`/project/${this.item.id}/members`, { members: this.members }).then(
                    (response) => {
                        f7.preloader.hide();
                        Cache.removeMatching('project');
                        this.$emit('fetch');
                        let userSmartSelect = f7.smartSelect.get('#user-select  .smart-select');
                        userSmartSelect.unsetValue();
                    },
                    (response) => {
                        this.busy = false;
                        f7.preloader.hide();
                        f7.dialog.alert(response.response.data.error.message);
                    }
                );
            },
        },
    };
</script>
