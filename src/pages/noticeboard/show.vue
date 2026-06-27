<template>
    <f7-page ptr @ptr:refresh="refresh">
        <f7-navbar :back-link="true" :title="trans('modules.notices.notice')" sliding layout="dark"
                   theme="white"></f7-navbar>
        <f7-card id="employee-details" v-if="item">
            <f7-card-content>
                <div>
                    <strong>{{ item.heading }}</strong>
                    <br/>
                    <p>{{ formatCreatedDate(item) }}</p>

                    <div v-html="item.description"></div>
                </div>
            </f7-card-content>
        </f7-card>

    </f7-page>
</template>

<script type="text/babel">
import Cache from '../../js/vue/scripts/cache';

import CommonMixin from '../../js/vue/mixins/common.vue';
import ModuleMixin from './mixin.vue';
import {f7} from 'framework7-vue';
import axiosHttp from "@/js/vue/boot/axiosHttp";

export default {
    props: {
        f7route: Object,
        f7router: Object,
    },
    mixins: [CommonMixin, ModuleMixin],
    data() {
        return {
            endpoint: '/notice',
            item: null,
            busy: false,
        };
    },
    mounted() {
        // Check if the query parameters contain 'item'
        const itemQuery = this.f7route.query?.item;

        // If 'item' exists in the query parameters, parse and assign it to 'this.item'
        if (itemQuery) {
            this.item = JSON.parse(itemQuery);
        } else {
            // Otherwise, call the refresh method
            this.refresh();
        }
    },
    methods: {

        refresh(page) {

            this.getItem().then(() => {
                this.removePtrClass()
            });
        },

        edit(item) {
            this.f7router.navigate('/notice/' + item.id + '/edit', {
                params: {
                    item: item,
                },
            });
        },

        remove() {
            f7.dialog.confirm(`${this.trans('messages.confirmation.noticeDelete')}`, '', () => {
                f7.sheet.close();
                f7.preloader.show();

                axiosHttp.delete(`/notice/${this.item.id}`).then(
                    () => {
                        f7.preloader.hide();
                        Cache.removeMatching('notice');
                        this.$store.commit('sendCacheInvalidate', 'notice');
                        this.f7router.back();
                    },
                    (response) => {
                        f7.preloader.hide();
                        f7.dialog.alert(response.response.data.error.message);
                    }
                );
            });
        },
    },
};
</script>
