<script type="text/babel">
import moment from 'moment';
import axiosHttp from "@/js/vue/boot/axiosHttp";
import _ from "lodash";

export default {
    props: {
        f7route: Object,
        f7router: Object,
    },
    computed: {
        selfUrl() {
            let self_url = '/ticket/';
            // if (this.isEmployeeRoute) {
            //     self_url = '/self' + self_url;
            // }
            return self_url;
        },
    },
    methods: {
        /** Data getters **/
        getItem() {
            return axiosHttp
                .get(
                    // `/ticket/${this.f7route.params.id}?fields=${encodeURIComponent(
                    `/ticket/11?fields=${encodeURIComponent(
                        'id,subject,priority,created_at,status,requester.limit(1000){id,name},agent.limit(1000){id,name},reply.limit(1000).order(chronological){id,message,created_at},reply:user.limit(1000){id,name,image,image_url},reply:files.limit(1000){id,filename,file_url,hashname}'
                    )}`
                )
                .then((response) => {
                    this.item = response.data.data;
                });
        },
        getRequesters() {
            return axiosHttp.get(`/user?limit=1000&filters=status eq "active"`).then((response) => {
                this.requesters = response.data.data;
            });
        },
        getTicketTypes() {
            return axiosHttp.get(`/ticket-type?limit=1000`).then((response) => {
                this.ticketTypes = response.data.data;
            });
        },
        getTicketGroups() {
            return axiosHttp
                .get(`/ticket-group?fields=${encodeURIComponent('id,group_name,agents.limit(1000)')}&limit=1000`)
                .then((response) => {
                    this.ticketGroups = response.data.data;
                    for (let i = 0; i < this.ticketGroups.length; i++) {
                        for (let j = 0; j < this.ticketGroups[i].agents.length; j++) {
                            this.ticketAgents.push(this.ticketGroups[i].agents[j]);
                        }
                    }
                });
        },
        getTicketChannels() {
            return axiosHttp.get(`/ticket-channel?limit=1000`).then((response) => {
                this.ticketChannels = response.data.data;
            });
        },

        /** Formatters **/
        formatStatus(item) {
            return this.capitalize(item);
        },
        onStartDateChange(date) {
            if (date) {
                this.item.purchase_date = moment(date).format('YYYY-MM-DD');
            }
        },
        onPriorityChange(event) {
            this.item.priority = event.target.value;
        },
        onStatusChange(event) {
            this.item.status = event.target.value;
        },
        onRequesterChange(event) {
            const id = event.target.value * 1;
            this.item.requester = _.find(this.requesters, (item) => item.id === id);
        },
        onTicketTypeChange(event) {
            const id = event.target.value * 1;
            this.item.type = _.find(this.ticketTypes, (item) => item.id === id);
        },
        onTicketChannelChange(event) {
            const id = event.target.value * 1;
            this.item.channel = _.find(this.ticketChannels, (item) => item.id === id);
        },
        onAgentChange(event) {
            const id = event.target.value * 1;
            this.item.agent = _.find(this.ticketAgents, (item) => item.id === id);
        },
        formatStatusColor(item) {
            if (item.status === 'resolved') {
                return 'green';
            }
            if (item.status === 'closed') {
                return 'green';
            }
            if (item.status === 'open') {
                return 'red';
            }
            if (item.status === 'pending') {
                return 'yellow';
            }
        },
        formatSheetStatusColor(status) {
            if (status === 'resolved') {
                return 'green';
            }
            if (status === 'closed') {
                return 'green';
            }
            if (status === 'open') {
                return 'red';
            }
            if (status === 'pending') {
                return 'yellow';
            }
        },
        formatDueDate(date) {
            if (date) {
                return moment(date).format(this.getCompanyMomentDateFormat);
            }
            return '';
        },
    },
};
</script>
