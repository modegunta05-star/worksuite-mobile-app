<style type="text/css">
.badge-profile-image {
    height: 40px;
    width: 40px;
    border-radius: 50%;
}
</style>
<template>
    <f7-page ptr @ptr:refresh="refresh">
        <f7-navbar :back-link="true" :title="trans('app.client')" sliding layout="dark" theme="white">
            <f7-nav-right>
                <f7-link href="#" @click.prevent="edit(item)" icon-f7="compose"></f7-link>
                <!--        <f7-link href="#" @click.prevent="remove" icon-f7="trash"></f7-link>-->
            </f7-nav-right>
        </f7-navbar>
        <f7-card id="employee-details" v-if="item">
            <f7-card-content>
                <div>
                    <strong>{{ item.name }}</strong>
                    <br/>{{ formatBadgeSubtitle(item) }}

                    <p>{{ item.client_details ? item.client_details.company_name : '' }}</p>
                </div>
            </f7-card-content>
        </f7-card>
        <f7-block-title>{{ trans('modules.client.clientDetails') }}</f7-block-title>
        <f7-card id="employee-details" v-if="item">
            <f7-card-content>
                <f7-list media-list class="no-margin" >
                    <f7-list-item :title="trans('app.email') + ':'" :text="item.email"></f7-list-item>
                    <f7-list-item :title="trans('modules.employees.gender') + ':'" :text="item.gender"></f7-list-item>

                    <f7-list-item title="Website:"
                                  :text="item.client_details ? item.client_details.website:'-'"></f7-list-item>
                    <f7-list-item title="Address:"
                                  :text="item.client_details ? item.client_details.address:'-'"></f7-list-item>
                    <f7-list-item title="Shipping Address:"
                                  :text="item.client_details ? item.client_details.shipping_address:'-'"></f7-list-item>
                    <f7-list-item title="Skype:"
                                  :text="item.client_details ? item.client_details.skype:'-'"></f7-list-item>
                    <f7-list-item title="Facebook:"
                                  :text="item.client_details ?item.client_details.facebook:'-'"></f7-list-item>
                    <f7-list-item title="Status" :badge="formatStatus(item)"
                                  :badge-color="formatStatusColor(item)"></f7-list-item>
                </f7-list>
            </f7-card-content>
        </f7-card>
        <f7-block v-if="item">&nbsp;</f7-block>
    </f7-page>
</template>

<script type="text/babel">
import Cache from '../../js/vue/scripts/cache';

import CommonMixin from '../../js/vue/mixins/common.vue';
import ModuleMixin from './mixin.vue';
import axiosHttp from '../../js/vue/boot/axiosHttp';
import {f7} from 'framework7-vue';

export default {
    props: {
        f7route: Object,
        f7router: Object,
    },
    mixins: [CommonMixin, ModuleMixin],
    data() {
        return {
            endpoint: '/client',
            item: null,
            busy: false,
        };
    },
    mounted() {
        if (this.f7route.query) {
            this.item = JSON.parse(this.f7route.query.item);
        } else {
            this.refresh();
        }
    },
    methods: {
        refresh() {

            this.getItem().then(() => {
                this.removePtrClass();
            });
        },

        edit(item) {
            this.router.load({
                url: '/client/' + item.id + '/edit',
                query: {
                    item: item,
                },
            });
        },

        remove() {
            f7.dialog.confirm(`${this.trans('messages.confirmation.clientDelete')}`, 'SnapHRM', () => {
                f7.preloader.show();

                axiosHttp.delete(`/client/${this.item.id}`).then(
                    (response) => {
                        f7.preloader.hide();
                        Cache.removeMatching('client');
                        this.$store.commit('sendCacheInvalidate', 'client');
                        this.f7router.back();
                    },
                    (response) => {
                        f7.preloader.hide();
                        f7.dialog.alert(response.data.error.message);
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
