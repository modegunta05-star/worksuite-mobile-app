<template>
    <f7-page>
        <f7-navbar :title="trans('app.about')" back-link sliding></f7-navbar>

        <f7-block class="text-align-center ">
            <img :src="$store.state.company.logo_url" class="about-icon" width="100px"
                 alt="$store.state.company.company_name"/>
            <h2>{{ $store.state.company.company_name }}</h2>
            <div class="text-align-center">
                <p>Version {{ version }}</p>
                <p v-if="build">Build {{ build }}</p>
                <p>Device ID: {{ deviceId() }}</p>
            </div>
        </f7-block>
    </f7-page>
</template>
<script type="text/babel">
import CommonMixin from '../js/vue/mixins/common.vue';
import {version} from '../../package.json';

export default {
    mixins: [CommonMixin],
    data() {
        return {
            version: version,
            build: null,
        };
    },
    mounted() {
        document.addEventListener("deviceready", this.onDeviceReady, false);
    },

    methods: {
        onDeviceReady(){
            this.version = AppVersion.version;
            this.build = AppVersion.build;
        },
        deviceId() {
            return window.localStorage.getItem('crm_device_id');
        },
    },
};
</script>
