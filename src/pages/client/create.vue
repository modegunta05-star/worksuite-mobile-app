<style type="text/css">
    .badge-profile-image {
        height: 40px;
        width: 40px;
        border-radius: 50%;
    }
</style>
<template>
    <f7-page>
        <f7-navbar :back-link="true" :title="trans('modules.client.addNewClient')" sliding layout="dark" theme="white"> </f7-navbar>
        <f7-block>
            <f7-card style="margin-top: 50px">
                <f7-card-content>
                    <f7-list form @submit.prevent="false" id="form">
                        <f7-list-input
                            :label="trans('modules.client.clientName')"
                            floating-label
                            required
                            validate-on-blur
                            clear-button
                            info=""
                            autocorrect="off"
                            name="name"
                            type="text"
                            :error-message="trans('validation.required', trans('modules.client.clientName'))"
                            :placeholder="trans('modules.client.clientName')"
                            :value="user.name"
                            @input="user.name = $event.target.value"
                        ></f7-list-input>

                        <f7-list-input
                            :label="trans('modules.client.clientEmail')"
                            floating-label
                            required
                            validate-on-blur
                            clear-button
                            name="email"
                            type="email"
                            :error-message="trans('validation.required', trans('modules.client.clientEmail'))"
                            :placeholder="trans('modules.client.clientEmail')"
                            :value="user.email"
                            @input="user.email = $event.target.value"
                        ></f7-list-input>
                        <f7-list-input
                            :label="trans('modules.client.password')"
                            floating-label
                            required
                            clear-button
                            validate-on-blur
                            name="password"
                            type="password"
                            :placeholder="trans('modules.client.password')"
                            :error-message="trans('messages.noSpacePlease')"
                            pattern="[^\s]+"
                            minlength="6"
                            :value="user.password"
                            @input="user.password = $event.target.value"
                        ></f7-list-input>

                        <f7-list-input
                            :label="trans('modules.client.companyName')"
                            floating-label
                            clear-button
                            name="company_name"
                            type="text"
                            :error-message="trans('validation.required', trans('modules.client.companyName'))"
                            :placeholder="trans('modules.client.companyName')"
                            :value="user.company_name"
                            @input="user.company_name = $event.target.value"
                        ></f7-list-input>
                    </f7-list>
                    <br />
                    <br />
                    <f7-button fill color="green" class="login-btn" large raised round @click="submit" :disabled="!formValid"
                        >{{ trans('app.submit') }}
                    </f7-button>
                </f7-card-content>

                <f7-block class="error-block" v-if="$store.state.error && $store.state.error.code === 0"
                    >{{ trans('messages.internetConnectionError') }}
                </f7-block>
            </f7-card>
        </f7-block>
    </f7-page>
</template>

<script type="text/babel">
    import Cache from '../../js/vue/scripts/cache';
    import CommonMixin from '../../js/vue/mixins/common.vue';
    import Dom7 from "dom7";
    import {f7} from "framework7-vue";

    export default {
        mixins: [CommonMixin],
        data() {
            return {
                user: {
                    name: null,
                    email: null,
                    password: null,
                    company_name: null,
                },

                error: null,
                push: null,
            };
        },
        computed: {
            formValid() {
                return this.user.name;
            },
        },
        methods: {
            submit() {
                f7.preloader.show();

                axiosHttp.post(`/client`, this.user).then(
                    (response) => {
                        f7.preloader.hide();
                        Cache.removeMatching('client');
                        this.$store.commit('sendCacheInvalidate', 'client');
                        this.f7router.back();
                    },
                    () => {
                        f7.preloader.hide();
                    }
                );
            },
        },
    };
</script>
