<template>
    <f7-page>
        <f7-navbar :title="`${trans('modules.tasks.comment')} | ${trans('app.task')} #${item.task_short_code}` ">
            <f7-nav-right>
                <f7-link popup-close>{{ trans('app.close') }}</f7-link>
            </f7-nav-right>
        </f7-navbar>

        <f7-block>
            <f7-list media-list dividers>

                <f7-list-item v-for="(item, index) in filteredList" v-bind:key="item.id">

                    <template #title>
                        <f7-chip :text="item.user.name">
                            <template #media>
                                <img :src="item.user.image_url" alt=""/>
                            </template>
                        </f7-chip>
                    </template>

                    <template #footer v-html="item.comment">
                        <div v-html="item.comment"></div>
                    </template>
<!--                    <template #after>-->
<!--                        <f7-link @click="remove(item)">-->
<!--                            <f7-icon f7="trash_circle_fill" color="red"></f7-icon>-->
<!--                        </f7-link>-->
<!--                    </template>-->
                    <!--                <template #text>{{ formatDueDate(item.created_at) }}</template>-->
                </f7-list-item>
            </f7-list>
            <f7-block v-if="!busy && item.comments.length === 0" class="text-align-center">
                {{ trans('messages.noCommentFound') }}
            </f7-block>
        </f7-block>

        <sub-task-create :item="item" v-on:fetch="getItem"></sub-task-create>

        <!-- Extended FAB Center Bottom (Red) -->
<!--        <f7-fab position="right-bottom" slot="fixed" @click="f7().popup.open('.new-sub-task-popup')" color="blue">-->
<!--            <f7-icon ios="f7:plus" aurora="f7:plus" md="material:add"></f7-icon>-->
<!--        </f7-fab>-->
    </f7-page>
</template>

<script>
import Cache from '../../../js/vue/scripts/cache';
import ModuleMixin from '../mixin.vue';

import SubTaskCreate from './create.vue';
import CommonMixin from '../../../js/vue/mixins/common.vue';
import {f7} from "framework7-vue";
import axiosHttp from "@/js/vue/boot/axiosHttp";

export default {
    mixins: [CommonMixin, ModuleMixin],
    props: ['item'],
    name: 'subtasks',
    data() {
        return {
            busy: false,
        };
    },
    components: {
        SubTaskCreate,
    },
    computed: {
        filteredList() {
            return this.item.comments;
        },
    },
    methods: {
        f7() {
            return f7
        },

        remove(item) {
            f7.preloader.show();
            axiosHttp.delete(`/task/${this.item.id}/comment/${item.id}`).then(
                (response) => {
                    this.removeFromList(item);
                    f7.preloader.hide();
                    Cache.removeMatching('comment');
                },
                () => {
                    f7.preloader.hide();
                }
            );
        },
        removeFromList(subtask) {
            const index = this.item.comments.indexOf(subtask);
            this.item.comments.splice(index, 1);
        },
    },
};
</script>

<style scoped></style>
