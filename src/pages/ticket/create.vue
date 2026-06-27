<template>
    <f7-page @page:init="pageLoad">
        <f7-navbar
            :back-link="true"
            :title="`${trans('app.add')} ${trans('app.ticket')}`"
            sliding
            layout="light"
            theme="white"
            snapPageScrollToTransparentNavbar
        >
        </f7-navbar>
        <f7-block>
            <f7-card>
                <f7-card-content>
                    <f7-list inset form @submit.prevent="false" id="form">
                        <f7-list-item
                            :title="trans('modules.tickets.requester')"
                            id="requesterSmartSelect"
                            smart-select
                            v-if="!isEmployeeRoute"
                            @change="onRequesterChange"
                            :smart-select-params="{
                                openIn: 'popup',
                                closeOnSelect: true,
                                searchbar: true,
                                searchbarPlaceholder: trans('app.search'),
                            }"
                        >
                            <select name="requester" @change="onRequesterChange">
                                <option
                                    :value="user.id"
                                    v-for="user in requesters"
                                    :key="user.user_id"
                                    :selected="item.requester && user.id === item.requester.id ? 'selected' : ''"
                                >
                                    {{ user.name }}
                                </option>
                            </select>
                        </f7-list-item>
                        <f7-input v-if="isEmployeeRoute" name="requester" type="hidden" :value="$store.state.user.id"></f7-input>

                        <f7-list-item
                            :title="trans('modules.tickets.agents')"
                            id="agentSmartSelect"
                            smart-select
                            v-if="!isEmployeeRoute"
                            @change="onAgentChange"
                            :smart-select-params="{
                                openIn: 'popup',
                                closeOnSelect: true,
                                searchbar: true,
                                searchbarPlaceholder: trans('app.search'),
                            }"
                        >
                            <select name="agent" @change="onAgentChange">
                                <optgroup :label="ticketGroup.group_name" v-for="ticketGroup in ticketGroups" :key="ticketGroup.id">
                                    <option
                                        :value="ticketAgent.id"
                                        v-for="ticketAgent in ticketGroup.agents"
                                        :key="ticketAgent.id"
                                        :selected="item.agent && ticketAgent.id === item.agent.id ? 'selected' : ''"
                                    >
                                        {{ ticketAgent.name }}
                                    </option>
                                </optgroup>
                            </select>
                        </f7-list-item>

                        <f7-list-item
                            :title="trans('modules.tickets.ticketType')"
                            id="ticketTypeSmartSelect"
                            smart-select
                            v-if="!isEmployeeRoute"
                            @change="onTicketTypeChange"
                            :smart-select-params="{
                                openIn: 'popup',
                                closeOnSelect: true,
                                searchbar: true,
                                searchbarPlaceholder: trans('app.search'),
                            }"
                        >
                            <select name="type" @change="onTicketTypeChange">
                                <option
                                    :value="ticketType.id"
                                    v-for="ticketType in ticketTypes"
                                    :key="ticketType.id"
                                    :selected="item.type && ticketType.id === item.type.id ? 'selected' : ''"
                                >
                                    {{ ticketType.type }}
                                </option>
                            </select>
                        </f7-list-item>

                        <f7-list-input
                            v-if="!isEmployeeRoute"
                            :label="trans('modules.tickets.priority')"
                            type="select"
                            name="priority"
                            @change="onPriorityChange"
                            :placeholder="trans('modules.tickets.selectPriority')"
                        >
                            <option :value="priority" :selected="priority === item.priority" v-for="priority in priorities" :key="priority">
                                {{ formatStatus(priority) }}
                            </option>
                        </f7-list-input>

                        <f7-list-item
                            :title="trans('modules.tickets.ticketChannel')"
                            id="ticketChannelSmartSelect"
                            smart-select
                            v-if="!isEmployeeRoute"
                            @change="onTicketChannelChange"
                            :smart-select-params="{
                                openIn: 'popup',
                                closeOnSelect: true,
                                searchbar: true,
                                searchbarPlaceholder: trans('app.search'),
                            }"
                        >
                            <select name="channel" @change="onTicketChannelChange">
                                <option
                                    :value="ticketChannel.id"
                                    v-for="ticketChannel in ticketChannels"
                                    :key="ticketChannel.id"
                                    :selected="item.channel && ticketChannel.id === item.channel.id ? 'selected' : ''"
                                >
                                    {{ ticketChannel.channel_name }}
                                </option>
                            </select>
                        </f7-list-item>

                        <f7-list-input
                            v-if="!isEmployeeRoute"
                            :label="trans('app.status')"
                            type="select"
                            name="status"
                            @change="onStatusChange"
                            :placeholder="trans('app.selectStatus')"
                        >
                            <option
                                :value="singleStatus"
                                :selected="singleStatus === item.status"
                                v-for="singleStatus in status"
                                :key="singleStatus"
                            >
                                {{ formatStatus(singleStatus) }}
                            </option>
                        </f7-list-input>

                        <f7-list-input
                            :label="trans('modules.tickets.ticketSubject')"
                            floating-label
                            required
                            validate-on-blur
                            clear-button
                            autocorrect="off"
                            type="text"
                            :error-message="trans('validation.required', trans('modules.tickets.ticketSubject'))"
                            :placeholder="trans('modules.tickets.ticketSubject')"
                            :value="item.subject"
                            @input="item.subject = $event.target.value"
                        >
                        </f7-list-input>
                        <f7-list-input
                            :label="trans('modules.tickets.ticketDescription')"
                            floating-label
                            required
                            validate-on-blur
                            clear-button
                            autocorrect="off"
                            type="texteditor"
                            :textEditorParams="{ buttons: textEditorButtons }"
                            :placeholder="trans('modules.tickets.ticketDescription')"
                            :value="item.description"
                            @input="item.description = $event.target.value"
                        ></f7-list-input>
                    </f7-list>
                    <br />
                    <br />
                    <f7-button fill color="green" class="login-btn" large raised round @click="submit" :disabled="!formValid">
                        {{ trans('app.submit') }}
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
    import ModuleMixin from './mixin.vue';

    export default {
        mixins: [CommonMixin, ModuleMixin],
        data() {
            return {
                item: {
                    subject: null,
                    description: null,
                    requester: {
                        id: null,
                    },
                    agent: {
                        id: null,
                    },
                    type: {
                        id: null,
                    },
                    channel: {
                        id: null,
                    },
                    priority: 'low',
                    status: 'open',
                },
                requesters: [],
                ticketTypes: [],
                ticketGroups: [],
                ticketChannels: [],
                ticketAgents: [],
                priorities: ['low', 'medium', 'high', 'urgent'],
                status: ['open', 'pending', 'resolved', 'closed'],
                error: null,
                push: null,
            };
        },
        computed: {
            formValid() {
                const $$ = Dom7;
                // return this.item.item_name && this.item.purchase_date && this.item.price && this.item.status && this.item.user.id && this.item.project.id && this.item.currency.id && $$('#form')[0] && $$('#form')[0].checkValidity();
                return true;
            },
        },
        methods: {
            init() {
                f7.preloader.show();

                const promises = [];
                promises.push(this.getRequesters());
                promises.push(this.getTicketTypes());
                promises.push(this.getTicketGroups());
                promises.push(this.getTicketChannels());

                Promise.all(promises).then(
                    () => {
                        this.item.requester = this.requesters[0];
                        let requesterSmartSelect = f7.smartSelect.get('#requesterSmartSelect .smart-select');
                        requesterSmartSelect.setValue(this.item.requester.id);
                        this.item.type = this.ticketTypes[0];
                        let ticketTypeSmartSelect = f7.smartSelect.get('#ticketTypeSmartSelect .smart-select');
                        ticketTypeSmartSelect.setValue(this.item.type.id);

                        this.item.agent = this.ticketAgents[0];
                        let agentSmartSelect = f7.smartSelect.get('#agentSmartSelect .smart-select');
                        agentSmartSelect.setValue(this.item.agent.id);

                        this.item.channel = this.ticketChannels[0];
                        let ticketChannelSmartSelect = f7.smartSelect.get('#ticketChannelSmartSelect .smart-select');
                        ticketChannelSmartSelect.setValue(this.item.channel.id);
                        f7.preloader.hide();
                    },
                    () => {
                        f7.preloader.hide();
                    }
                );
            },

            pageLoad(page) {
                this.init();
            },
            submit() {
                f7.preloader.show();

                axiosHttp.post(`/ticket`, this.item).then(
                    (response) => {
                        f7.preloader.hide();
                        Cache.removeMatching('ticket');
                        this.$store.commit('sendCacheInvalidate', 'ticket');
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
