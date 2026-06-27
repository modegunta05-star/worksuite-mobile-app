<template>
    <f7-page login-screen v-show="showdomain" class="demo-login-screen" :no-swipeback="true">
        <f7-block style="padding:0">
            <f7-login-screen-title>
                <img :src="mainLogo" height="50px" class="login-screen-logo"
                     alt=""/></f7-login-screen-title>
            <f7-block class="error-block" v-if="error">
                <template v-if="error.code === 6">
                    Please verify that you are entering the correct URL and ensure that your application is running at
                    this URL.
                </template>
                <template v-else>{{ trans(error.message) }}</template>
            </f7-block>
            <f7-list form @submit.prevent="saveCompany" strong dividers inset>
                <f7-list-input
                        autofocus
                        label="Domain URL"
                        type="url"
                        error-message="Please enter valid domain url"
                        placeholder="https://your-url.domain.com"
                        :value="domain"
                        required
                        clear-button
                        @input="domain = $event.target.value"
                >
                </f7-list-input>

                <f7-list-input hidden="hidden"></f7-list-input>
                <f7-block-footer>
                    <f7-block>
                        <div class="grid-cols-1">
                            <f7-button
                                    @click="saveCompany" :disabled="!isValidURL || busy" large fill color="info"
                                    class="login-btn">Save
                            </f7-button>
                        </div>
                    </f7-block>
                    <!--                <f7-button  color="black" @click="openCrmWebsite()">Don't have an account?</f7-button>-->
                </f7-block-footer>

            </f7-list>

        </f7-block>
    </f7-page>
</template>

<script>
import {f7} from 'framework7-vue';
import axios from 'axios';
import CommonMixin from '../js/vue/mixins/common.vue';
import {DOMAIN, DOMAIN_LOGO} from "@/js/vue/config";

export default {
    props: {
        f7route: Object,
        f7router: Object,
    },
    mixins: [CommonMixin],
    data() {
        return {
            domain: null,
            error: null,
            push: null,
            showAddToHomeScreen: false,
            deferredPrompt: null,
            busy: false,
        };
    },
    computed: {
        showdomain() {
            return this.$store.state.host === null || this.$store.state.host === 'null';
        },
        mainLogo() {
            return DOMAIN_LOGO;
        },
        isValidURL() {
            let domain = this.domain;

            if (domain === '' || domain === null || domain === 'your-url') {
                return false;
            }

            this.error = {};

            // Check if the domain is valid
            // We first check if using is typing ht in url or not. We are doing so user do not have to type a lot to see the erro
            // On he type ht , it may be the case the url own domain starts with ht. We will also check complete https
            if ((domain.length > 1 && !/(ht)/i.test(domain)) || (domain.length > 7 && !/(http(s?)):\/\//i.test(domain))) {
                this.error = {code: 7, message: "Please ensure the URL starts with either https:// or http://"};
                return false;
            }

            const urlPattern = new RegExp(
                '^(https?:\\/\\/)' + // require protocol
                '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.?)+[a-zA-Z]{2,}|' + // domain name
                '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
                '(\\:\\d+)?' + // port
                '(\\/[-a-zA-Z\\d%_.~+]*)*' + // path
                '(\\?[;&a-zA-Z\\d%_.~+=-]*)?' + // query string
                '(\\#[-a-zA-Z\\d_]*)?$', // fragment locator
                'i' // case insensitive
            );

            return !!urlPattern.test(domain);
        },
    },

    methods: {
        openCrmWebsite() {
            window.open(DOMAIN, '_system');
        },
        resetErrors() {
            this.error = null;
            this.$store.state.error = null;
        },
        saveCompany() {
            this.busy = true;
            this.resetErrors();

            let domain = this.domain;

            if (domain === '' || domain === null || domain === 'your-url') {
                this.error = {
                    code: 2,
                };
                this.busy = false;
                return;
            }

            domain = this.domain.replace(/\/(login\/?)?$/, '');
            domain = domain.toLowerCase();

            f7.preloader.show();
            // f7.dialog.preloader('Please wait for a while we are fetching details..');
            axios.get(`${domain}/api/v1/purchased-module`)
                .then(response => {
                    const {data} = response.data;
                    const restAPIPlugin = data.hasOwnProperty('RestAPI');
                    const errorMessage = data.message;

                    if (errorMessage) {
                        this.error = {code: 7, message: errorMessage};
                        f7.preloader.hide();
                        // f7.dialog.close();
                        this.busy = false;
                        return;
                    }

                    if (!restAPIPlugin) {
                        this.error = {code: 5, message: 'You have not installed RestAPI Module'};
                        this.busy = false;
                        f7.preloader.hide();
                        return;
                    }

                    // FETCHING LANGUAGE
                    this.fetchingTranslations(domain);

                    // Fetching App
                    this.fetchAppData(domain);

                })
                .catch(error => {
                    alert(error.message);
                    f7.preloader.hide();
                    // f7.dialog.close();
                    this.busy = false;
                    const errorResponse = error && error.response && error.response.data.error;
                    this.error = errorResponse ? errorResponse : {
                        code: 6,
                        message: 'Please verify that you are entering the correct URL and ensure that your application is running at this URL.'
                    };
                });

        },

        fetchingTranslations(domain) {
            // FETCHING LANGUAGE
            axios.get(`${domain}/api/v1/lang`).then(response => {
                this.$store.commit('updateTranslation', response.data.data);
                this.$store.commit('updateCompanyTranslation', response.data.data);
            });
        },
        fetchAppData(domain) {
            axios.get(`${domain}/api/v1/app`)
                .then(response => {
                    const responseData = response.data.data;

                    if (typeof responseData === 'object') {
                        this.$store.commit('updateHost', domain);
                        this.$store.commit('updateCompany', responseData);
                        this.error = null;
                    } else {
                        this.error = {code: 1};
                    }
                    this.busy = false;
                    f7.preloader.hide();
                    // f7.dialog.close();
                })
                .catch(error => {
                    console.log(error)
                    f7.preloader.hide();
                    // f7.dialog.close();
                    this.busy = false;
                    this.error = error.response.data.error;
                });
        }
    },
};
</script>
