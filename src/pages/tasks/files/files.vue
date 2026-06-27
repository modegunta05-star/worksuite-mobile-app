<template>
    <f7-page>
        <f7-navbar :title=" `Files | ${trans('app.task')} #${item.task_short_code} `">
            <f7-nav-right>
                <f7-link popup-close>{{ trans('app.close') }}</f7-link>
            </f7-nav-right>
        </f7-navbar>
        <f7-list media-list dividers>
            <f7-list-item
                    v-for="(file,index) in item.files"
                    v-bind:key="file.id"
                    :title="file.filename"
                    :footer="file.created_at"
                    @click="handleClick(file)">
                <template #media>
                    <img slot="media" :src="file.file_url" alt="" v-if="file.icon === 'images'" width="44"/>
                    <f7-icon slot="media" :f7="formatIcon(file)" v-else></f7-icon>
                </template>

            </f7-list-item>
            <f7-block v-if="item.files.length === 0" style="text-align: center">
                {{ trans('messages.noTaskFilesFound') }}
            </f7-block>
        </f7-list>
        <f7-block>
        </f7-block>
        <f7-photo-browser :photos="image" type="popup" theme="light" :toolbar="false"
                          ref="popupimage"></f7-photo-browser>
    </f7-page>
</template>

<script>
import CommonMixin from '../../../js/vue/mixins/common.vue';

export default {
    mixins: [CommonMixin],
    data() {
        return {
            image: [],
            busy: false,
        };
    },
    props: ['item'],
    name: 'subtasks',
    methods: {
        formatIcon(file) {
            if (file.icon === 'images') {
                return 'photo';
            }
            return 'arrow_down_doc';
        },
        handleClick(file) {
            if (file.icon !== 'images') {
                window.open(file.file_url, '_system');
                return true;
            }
            this.image = [file.file_url];
            setTimeout(() => {
                this.$refs.popupimage.open();
            }, 100);
        },
    },
};
</script>

<style scoped></style>
