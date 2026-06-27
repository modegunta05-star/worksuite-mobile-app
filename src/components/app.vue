<template>

    <f7-app v-bind="f7params">


        <!--   Show Login and domain page on  user is not logged in  -->
        <template v-if="!$store.getters.isLoggedIn">
            <domain></domain>
            <login></login>
        </template>

        <!-- Left Panel -->

        <side-menu v-if="$store.getters.isLoggedIn"></side-menu>

        <!-- Main Views -->
        <!-- Your main view, should have "view-main" class -->
        <f7-views v-if="$store.getters.isLoggedIn">
            <!--   Show self dashboard page      -->
            <f7-view class="safe-area" url="/self/dashboard" main></f7-view>
        </f7-views>
    </f7-app>
</template>

<script>
import {f7, f7ready} from 'framework7-vue';
import {getDevice} from 'framework7/lite-bundle';
import cordovaApp from '../js/cordova-app.js';
import routes from '../js/routes.js';
import store from '../js/vue/store/index.js';
import SideMenu from '../pages/sidemenu.vue';
import axiosHttp from '../js/vue/boot/axiosHttp';
import _ from "lodash";
import Domain from "@/pages/domain.vue";
import Login from "@/pages/login.vue";

export default {
    props: {
        f7route: Object,
        f7router: Object,
    },
    components: {
        Login,
        Domain,
        SideMenu,
    },
    data() {
        const device = getDevice();

        return {
            device: device,
            f7params: {
                name: 'Worksuite', // App name
                theme: 'auto', // Automatic theme detection
                pushState: true,
                // App store
                store: store,

                // App routes
                routes: routes,

                // Register service worker (only on production build)
                serviceWorker:
                    process.env.NODE_ENV === 'production'
                        ? {
                            path: '/service-worker.js',
                        }
                        : {},

                // Input settings
                input: {
                    scrollIntoViewOnFocus: device.cordova,
                    scrollIntoViewCentered: device.cordova,
                },
                // Cordova Statusbar settings
                statusbar: {
                    enabled: true,
                    iosTextColor: 'black', // Can be 'white' or 'black'
                    androidTextColor: 'black', // Can be 'white' or 'black'
                }
            },
            push: null,
            showAddToHomeScreen: false,
            deferredPrompt: null,

        }
    },
    mounted() {
        f7ready(() => {
            console.log(this.device, f7.device.os);
            // Init cordova APIs (see cordova-app.js)
            if (this.device.cordova) {
                cordovaApp.init(f7);
            }

            // Call F7 APIs here
            // window.addEventListener('beforeinstallprompt', function (event) {
            //     event.preventDefault();
            //     self.deferredPrompt = event;
            //     self.showAddToHomeScreen = true;
            // });
            document.addEventListener("deviceready", this.onDeviceReady, false);
            document.addEventListener("resume", this.onResume, false);
        });
    },
    created() {

        // Generate device id with which we can identify this device uniquely, because
        // registration id can change
        if (window.localStorage.getItem('crm_device_id') === null) {
            window.localStorage.setItem('crm_device_id', Math.floor(Math.random() * 18446744073709551615));
        }

        // Alter defaults after instance has been created

        axiosHttp.interceptors.request.use(
            (config) => {
                const token = this.$store.state.token;
                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        axiosHttp.interceptors.request.use(
            (config) => {
                const url = config.url;
                if (!url.startsWith('http')) {
                    config.url = this.$store.state.api_url + url;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        axiosHttp.interceptors.response.use(
            (response) => {
                // Clear any existing errors if the response is successful
                this.$store.state.error = null;
                return response;
            },
            (error) => {
                if (!error.response) {
                    // Handle connection error
                    this.$store.state.error = {
                        code: 0,
                        message: 'Connection error',
                    };
                } else {
                    const response = error.response;
                    const responseData = response.data;

                    if (
                        typeof responseData === 'object' &&
                        (!responseData.error.innererror ||
                            (responseData.error.innererror &&
                                responseData.error.innererror.code !== 2000 &&
                                responseData.error.innererror.code !== 2001))
                    ) {
                        this.$store.state.error = responseData.error;

                        if (responseData.error.code === 401) {
                            this.$store.dispatch('logout');
                            let mainView = f7.view.main;

                            mainView.router.navigate('/', {
                                reloadCurrent: true,
                                ignoreCache: true,
                            })
                            return Promise.reject(error);
                        }

                        if (responseData.error.code === 422 && responseData.error.details !== undefined) {
                            let message = 'Please fix the errors below:<br/><br/>';

                            if (this.$store.state.translation) {
                                message = _.get(this.$store.state.translation, 'messages.fixTheErrorsBelow', message);
                            }

                            _.forEach(Object.keys(responseData.error.details), (key) => {
                                message += `${responseData.error.details[key][0]}<br/>`;
                            });

                            f7.dialog.alert(message, null);
                        } else {
                            f7.dialog.alert(responseData.error.message, null);
                        }
                    }
                }

                return Promise.reject(error);
            }
        );


        // Get /app end point
        if (this.$store.state.host !== null) {
            this.$store.dispatch('updateCompany');
        }

        //
        if (this.$store.state.api_url == null) {
            this.$store.dispatch('logout');
        }

        // // Get current user if logged in
        if (this.$store.getters.isLoggedIn) {
            this.$store.dispatch('updateUser');
        }

    },
    methods: {
        callInstallPrompt() {
            const self = this;
            self.showAddToHomeScreen = true;
            self.deferredPrompt.prompt();

            // Wait for the user to respond to the prompt
            self.deferredPrompt.userChoice
                .then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the A2HS prompt');
                    } else {
                        console.log('User dismissed the A2HS prompt');
                    }
                    self.deferredPrompt = null;
                });
        },
        onDeviceReady() {
            this.setStatusBar();
            this.resetBadgeCount();
            this.registerFireBaseToken();
            this.showPushNotificationBackGround();
            this.showPushNotificationForeground();
        },
        showPushNotificationBackGround() {
            const self = this;
            cordova.plugins.firebase.messaging.onBackgroundMessage(function (payload) {
                console.log('BACKGROUND MESSAGE');
                self.catchMessage(payload, false);
            });
        },
        registerFireBaseToken() {
            const self = this;
            // Request permission to receive notifications
            cordova.plugins.firebase.messaging.requestPermission().then(function () {
                // Now get the FCM token
                cordova.plugins.firebase.messaging.getToken().then(function (token) {
                    self.registerDeviceData(token);
                }).catch(function (error) {
                    console.log("Failed to get FCM token. Please try again later." + error);
                });
            }).catch(function (error) {
                console.log("Notification permission denied. Please enable notifications in settings." + error);
            });
        },
        setStatusBar() {
            f7.statusbar.show();
            f7.statusbar.setTextColor('black'); // Can be 'white' or 'black'
        },
        onResume() {
            this.resetBadgeCount();
        },
        showPushNotificationForeground() {
            const self = this;
            cordova.plugins.firebase.messaging.onMessage(function (payload) {
                console.log("New foreground FCM message: ", payload);
                console.log("Full Payload: ", JSON.stringify(payload));
                self.catchMessage(payload, true);
            });
        },
        catchMessage(payload, foreground) {
            const self = this;

            // Access and log specific fields within the payload
            if (payload['gcm.notification.type']) {
                console.log("Notification ID: ", payload['gcm.notification.id']);
                console.log("Notification type: ", payload['gcm.notification.type']);
                console.log("Notification Role: ", payload['gcm.notification.role']);
            }

            if (payload['google.c.sender.id']) {
                console.log("Sender ID: ", payload['google.c.sender.id']);
            }

            if (payload.aps && payload.aps.alert) {
                console.log("Notification Title: ", payload.aps.alert.title);
                console.log("Notification Body: ", payload.aps.alert.body);
            }

            let {id, role, type} = {};

            // Check the OS type and assign data accordingly
            const data = f7.device.os === 'android' ? payload : payload.aps?.alert;

            // Assign id, role, and type based on the OS type
            if (f7.device.os === 'android' && data?.id) {
                ({id, role, type} = data);
            } else if (f7.device.os === 'ios' && payload['gcm.notification.id']) {
                id = payload['gcm.notification.id'];
                role = payload['gcm.notification.role'];
                type = payload['gcm.notification.type'];
            }

            if (id) {

                let url;
                const roleUrl = role !== 'admin' ? '/self' : '';

                switch (type) {
                    case 'task-reminder':
                    case 'task':
                        url = `${roleUrl}/task/${id}`;
                        break;
                    case 'project-member':
                    case 'project-reminder':
                        url = `${roleUrl}/project/${id}`;
                        break;
                    case 'notice-update':
                    case 'new-notice':
                        url = `${roleUrl}/notice/${id}`;
                        break;
                    case 'expense-member':
                    case 'expense-admin':
                    case 'expense-updated':
                        url = `${roleUrl}/expense/${id}`;
                        break;
                    case 'leave-updated':
                    case 'leave-approved':
                    case 'leave-reject':
                    case 'leave-single':
                        url = `${roleUrl}/leave/${id}`;
                        break;
                    case 'leave-multiple':
                        url = `${roleUrl}/leaves`;
                        break;
                    default:
                        url = null;
                }


                // Message came when app is opened
                if (foreground) {
                    if (url) {
                        f7.notification.create({
                            title: self.$store.state.company.company_name,
                            titleRightText: 'now',
                            subtitle: data.title,
                            text: data.body,
                            closeOnClick: true,
                            on: {
                                click: function () {
                                    self.redirectUrl(url);
                                },
                            },
                        }).open();

                    }
                } else {
                    self.redirectUrl(url);
                }

            }

        },
        registerDevice() {
            // this.resetBadgeCount();
        },
        redirectUrl(url) {
            console.log('URL', url)
            const mainView = f7.view.main;
            if (mainView.router.currentRoute.url === url) {
                mainView.router.refreshPage();
            } else {
                mainView.router.navigate(url);
            }
        },
        registerDeviceData(token) {
            if (this.$store.state.user) {
                // data.device = f7.device;

                const postData = {
                    device_id: window.localStorage.getItem('crm_device_id'),
                    registration_id: token,
                    details: JSON.stringify(f7.device),
                    type: f7.device.os,
                };

                console.log(postData);
                axiosHttp.post('/device/register', postData);
            }
        },
        resetBadgeCount() {
            cordova.plugins.firebase.messaging.clearNotifications();
        },
    }
};
</script>
