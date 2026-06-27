<style>
.eye-icon {
    position: absolute;
    right: 15px;
    top: 70%;
    transform: translateY(-50%);
    cursor: pointer;
}
</style>
<template>
    <!-- LOGIN SCREEN -->
    <f7-page login-screen v-show="!showdomain" :no-swipeback="true">
        <f7-block style="padding:0px">
            <f7-login-screen-title>
                <img :src="logo" height="50px" class="login-screen-logo" alt=""/>
                <div v-if="$store.state && $store.state.company"> {{ $store.state.company.app_name }}</div>
            </f7-login-screen-title>
            <f7-block>
                <div class="grid-cols-1 text-center">
                    <f7-block class="error-block" v-if="error && !busy">
                        <template v-if="error.code === 1">{{ trans('messages.serverSideErrorOccurred') }}</template>
                        <template v-if="error.innererror && error.innererror.code === 2001">
                            {{ trans('validation.invalidEmailPassword') }}
                        </template>
                    </f7-block>
                </div>
            </f7-block>
            <f7-list form @submit.prevent="login" class="login-form" strong-ios dividers-ios inset-ios>

                <f7-list-input
                        autofocus
                        clear-button
                        :label="trans('app.email')"
                        autocorrect="off"
                        name="email"
                        placeholder="Your Email"
                        type="email"
                        @input="credentials.email = $event.target.value"
                ></f7-list-input>
                <f7-list-input
                        name="password"
                        minlength="6"
                        placeholder="Your Password"
                        :label="trans('app.password')"
                        :type="passwordFieldType"
                        :value="credentials.password"
                        @input="credentials.password = $event.target.value"
                >
                    <template #inner class="passwordShowHide">
                        <f7-link @click="switchVisibility" class="eye-icon">
                            <f7-icon size="18" :f7="passwordEyeIcon" ></f7-icon>
                        </f7-link>
                    </template>

                </f7-list-input>

                <f7-list-input hidden="hidden"></f7-list-input>
                <f7-block-footer>
                    <f7-block>
                        <div class="grid-cols-1">
                            <f7-button @click="login" :disabled="!loginFormValid || busy" large fill color="info">
                                Login
                            </f7-button>
                        </div>
                        <f7-button class="margin-top" color="black" @click="changeCompany">Sign in to different
                            domain
                        </f7-button>

                    </f7-block>
                </f7-block-footer>
            </f7-list>

        </f7-block>
    </f7-page>

</template>

<script>
import {f7} from 'framework7-vue';
import axios from 'axios';
import axiosHttp from '../js/vue/boot/axiosHttp';
import CommonMixin from '../js/vue/mixins/common.vue';
import Dom7 from "dom7";
import Domain from "@/pages/domain.vue";
import PushNotification from "@/js/cordova-app";

export default {
    components: {Domain},
    props: {
        f7route: Object,
        f7router: Object,
    },
    mixins: [CommonMixin],
    data() {
        return {
            username: '',
            password: '',
            passwordFieldType: 'password',
            passwordEyeIcon: 'eye',
            domain: null,

            credentials: {
                email: '',
                password: '',
                remember_me: true,
            },

            error: null,

            busy: false,
        };
    },
    computed: {
        showdomain() {
            return this.$store.state.host === null || this.$store.state.host === 'null';
        },
        logo() {
            if (this.$store.state.company !== null) {
                return this.$store.state.company.logo_url;
            }
        },
        loginFormValid() {
            return this.credentials.password != '' && this.credentials.email != '';
        },
    },

    methods: {
        resetErrors() {
            this.error = null;
            this.$store.state.error = null;
        },
        changeCompany() {
            f7.preloader.show();
            this.$store.commit('updateCompany', null);
            this.$store.commit('updateHost', null);
            f7.preloader.hide();

        },

        login() {
            this.busy = true;
            this.resetErrors();
            f7.preloader.show();
            let endpoint = '/auth/login';

            axiosHttp.post(endpoint, this.credentials).then(
                (response) => {
                    f7.preloader.hide();

                    if (typeof response.data === 'object') {
                        this.$store.commit('updateToken', response.data.data.token);
                        this.$store.commit('updateExpires', response.data.data.expires);
                        this.$store.commit('updateUser', response.data.data.user);
                        this.error = null;
                        this.credentials.email = '';
                        this.credentials.password = '';
                    } else {
                        f7.preloader.hide();
                        this.error = {code: 1};
                    }
                    if (this.$store.state.user.locale !== 'en') {
                        this.getTranslations();
                    }
                    this.busy = false;
                    // this.registerDevice();
                },
                (error) => {
                    f7.preloader.hide();
                    this.busy = false;
                    this.error = error.response.data.error;
                }
            );
        },

        switchVisibility() {
            this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
            this.passwordEyeIcon = this.passwordEyeIcon === 'eye' ? 'eye_slash' : 'eye';
        },
        getTranslations() {
            axiosHttp.get(`/lang`).then((response) => {
                this.$store.commit('updateTranslation', response.data.data);
            });
        },
    },
};
</script>

