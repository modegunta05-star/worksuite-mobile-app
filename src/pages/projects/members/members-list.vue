<template>
    <f7-page>
        <f7-navbar :title="trans('modules.projects.projectMembers')">
            <f7-nav-right>
                <f7-link popup-close>Close</f7-link>
            </f7-nav-right>
        </f7-navbar>
        <member-create :item="item" v-on:fetch="$emit('fetch')"></member-create>

        <f7-list media-list
                 dividers
                 strong
                 inset
                 class="margin-bottom margin-top-half"
        >
            <f7-list-item
                    v-for="(employee, index) in item.members"
                    v-bind:key="employee.user.id"
                    :title="employee.user.name"
                    :text="employee.user?.employee_detail?.employee_id"
            >
                <template #media>
                    <img slot="media" :src="employee.user.image_url" width="50" height="50" class="lazy lazy-fade-in " alt=""/>
                </template>
                <template #after>
                    <f7-link @click="remove(employee)" class="float-right">
                        <f7-icon f7="trash_circle_fill" color="red"></f7-icon>
                    </f7-link>
                </template>
            </f7-list-item>
            <f7-list-item v-if="item.members.length === 0" class="text-align-center">
                {{ trans('messages.noMemberAddedToProject') }}
            </f7-list-item>

        </f7-list>

    </f7-page>
</template>

<script>
import Cache from '../../../js/vue/scripts/cache';
import CommonMixin from '../../../js/vue/mixins/common.vue';
import ModuleMixin from '../mixin.vue';

import MemberCreate from './create.vue';
import axiosHttp from "@/js/vue/boot/axiosHttp";
import {f7} from "framework7-vue";

export default {
    mixins: [CommonMixin, ModuleMixin],
    props: ['item'],
    name: 'members',
    data() {
        return {
            busy: false,
        };
    },
    components: {
        MemberCreate,
    },

    methods: {
        remove(member) {
            f7.preloader.show();
            axiosHttp.delete(`/project/${this.item.id}/member/${member.id}`).then(
                (response) => {
                    f7.preloader.hide();
                    Cache.removeMatching('project');
                    this.$emit('fetch');
                },
                () => {
                    f7.preloader.hide();
                }
            );
        },
        removeFromList(subtask) {
            const index = this.item.subtasks.indexOf(subtask);
            this.item.subtasks.splice(index, 1);
        },
    },
};
</script>

