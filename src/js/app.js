// Import Vue
import {createApp} from 'vue';

// Import Framework7
import Framework7 from 'framework7/lite-bundle';
// Import Framework7-Vue Plugin
import Framework7Vue, {registerComponents} from 'framework7-vue/bundle';

// Import Framework7 Styles
import 'framework7/css/bundle';

// Import Icons and App Custom Styles
import '../css/icons.css';
import '../css/app.scss';


// Import App Component
import App from '../components/app.vue';
import store from './vue/store/index.js';

import SnapPermission from '../js/vue/directives/index.js';

// Global directives

// Init Framework7-Vue Plugin
Framework7.use(Framework7Vue);

// Init App
const app = createApp(App);
app.directive('snap-permission', SnapPermission);
app.use(store);

import $ from 'jquery';

window.jQuery = window.$ = $;
// Register Framework7 Vue components
registerComponents(app);

// Mount the app
app.mount('#app');
