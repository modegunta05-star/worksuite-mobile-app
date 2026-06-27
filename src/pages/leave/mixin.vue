<script type="text/babel">
    import axiosHttp from '../../js/vue/boot/axiosHttp';
    import Cache from '../../js/vue/scripts/cache';
    import moment from 'moment-timezone';
    import _ from "lodash";

    export default {
        props: {
            f7route: Object,
            f7router: Object,
        },
        computed: {
            selfUrl() {
                let self_url = '/leave/';
                if (this.isEmployeeRoute) {
                    self_url = '/self' + self_url;
                }
                return self_url;
            },
        },
        methods: {
            /** Data getters **/
            getItem() {
                return axiosHttp
                    .get(
                        `/leave/${this.f7route.params.id}?fields=${encodeURIComponent(
                            'id,leave_date,status,reason,reject_reason,user.limit(1000){id,name,image,image_url},type.limit(1000){id,type_name}'
                        )}`
                    )
                    .then((response) => {
                        this.item = response.data.data;
                    });
            },
            getUsers() {
                return axiosHttp.get(`/employee?limit=1000&filters=status eq "active"`).then((response) => {
                    this.users = response.data.data;
                });
            },
            getTypes() {
                return Cache.httpGet(`/leave-type?limit=1000`).then((response) => {
                    this.types = response.data;
                });
            },

            /** Formatters **/
            formatStatus(item) {
                return this.capitalize(item);
            },
            onStartDateChange(date) {
                if (date) {
                    let momentDate = moment(date, this.getCompanyMomentDateFormat);
                    this.item.leave_date = momentDate.format('YYYY-MM-DD');
                }
            },
            onStatusChange(event) {
                this.item.status = event.target.value;
            },
            onUserChange(event) {
                const id = event.target.value * 1;
                this.item.user = _.find(this.users, (item) => item.id === id);
            },
            onTypeChange(event) {
                const id = event.target.value * 1;
                this.item.type = _.find(this.types, (item) => item.id === id);
            },
            formatStatusColor(item) {
                if (item.status === 'approved') {
                    return 'green';
                }
                if (item.status === 'rejected') {
                    return 'red';
                }
                if (item.status === 'pending') {
                    return 'yellow';
                }
            },
            formatSheetStatusColor(status) {
                if (status === 'approved') {
                    return 'green';
                }
                if (status === 'rejected') {
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
