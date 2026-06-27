<script type="text/babel">
import moment from 'moment-timezone';
import Badge from './badge.vue';
import Cache from '../../js/vue/scripts/cache';
import axiosHttp from '../../js/vue/boot/axiosHttp';
import Dom7 from "dom7";
import _ from "lodash";

export default {
    props: {
        f7route: Object,
        f7router: Object,
    },
    computed: {
        selfUrl() {
            let self_url = '/task/';
            if (this.isEmployeeRoute) {
                self_url = '/self' + self_url;
            }
            return self_url;
        },
    },
    components: {
        badge: Badge,
    },
    methods: {
        /** Data getters **/
        getItem() {
            // this.f7route.params.id = 55;

            const fields = [
                'id',
                'task_short_code',
                'heading',
                'start_date',
                'due_date',
                'description',
                'priority',
                'status',
                'category{id,category_name}',
                'project{id,project_name}',
                'users{id,name,image,image_url}',
                'board_column{id,column_name,slug,label_color}',
                'files{id,external_link,hashname,file_url,icon,filename,created_at}',
                'subtasks.order(reverse_chronological){id,title,start_date,due_date,status}',
                'all_board_columns',
                'notes.order(chronological){id,note}',
                'notes:user{id,name,image,image_url}',
                'comments.order(chronological){id,comment,created_at,added_by}',
                'comments:user{id,name,image,image_url}',
                'timeLogged{id,memo,start_time,end_time,total_hours,total_minutes}',
                'timeLogged:user{id,name,image,image_url}',
            ];

            const encodedFields = encodeURIComponent(fields.join(','));

            return Cache
                .httpGet(`/task/${this.f7route.params.id}?fields=${encodedFields}`)
                .then(response => {
                    this.item = response.data;
                });

        },
        getProjects() {
            return axiosHttp.get(`/project?limit=1000`).then((response) => {
                this.projects = response.data.data;
            });
        },
        getClients() {
            return axiosHttp.get(`/client?limit=1000`).then((response) => {
                this.clients = response.data.data;
            });
        },
        getEmployees() {
            return axiosHttp.get(`/employee?limit=1000&filters=status eq "active"`).then((response) => {
                this.employees = response.data.data;
            });
        },
        getCategories() {
            return Cache.httpGet('/task-category?fields=id,category_name&limit=1000').then((response) => {
                this.categories = response.data;
            });
        },
        getBoardColumns() {
            return Cache.httpGet('/taskboard-columns?limit=1000').then((response) => {
                this.columns = response.data;
            });
        },

        /** Formatters **/
        formatStatus(item) {
            return this.capitalize(item.status);
        },

        onStartDateChange(date) {
            if (date) {
                let momentDate = moment(date, this.getCompanyMomentDateFormat);
                this.item.start_date = momentDate.format('YYYY-MM-DD');
            }
        },
        onEndDateChange(date) {
            if (date) {
                let momentDate = moment(date, this.getCompanyMomentDateFormat);
                this.item.due_date = momentDate.format('YYYY-MM-DD');
            }
        },
        onUserChange(event) {
            const $$ = Dom7;
            const selected = $$('#users-select').val();
            this.item.task_users = [];

            _.each(selected, (item) => {
                this.item.task_users.push({id: item});
            });
        },
        onCategoryChange(event) {
            const id = event.target.value * 1;
            this.item.category = _.find(this.categories, (item) => item.id === id);
        },
        onTaskUserChange(event) {
            const id = event.target.value * 1;
            this.item.employee = _.find(this.employees, (item) => item.id === id);
        },
        onAssignedByChange(event) {
            const id = event.target.value * 1;
            this.item.assignedBy = _.find(this.employees, (item) => item.id === id).id;
        },
        onColumnChange(event) {
            const id = event.target.value * 1;
            this.item.board_column = _.find(this.columns, (item) => item.id === id);
        },
        onPriorityChange(event) {
            this.item.priority = event.target.value;
        },
        onProjectChange(event) {
            const id = event.target.value * 1;
            this.item.project = _.find(this.projects, (item) => item.id === id);
        },
        onClientChange(event) {
            const id = event.target.value * 1;
            this.item.client = _.find(this.clients, (item) => item.id === id);
        },
        formatStatusColor(item) {
            if (item.status === 'active') {
                return 'green';
            }
            if (item.status === 'inactive') {
                return 'red';
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
