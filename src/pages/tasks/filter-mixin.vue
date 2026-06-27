<script type="text/babel">
import moment from 'moment';
import Badge from './badge.vue';
import Cache from '../../js/vue/scripts/cache';
import axiosHttp from '../../js/vue/boot/axiosHttp';
import _ from "lodash";
import Dom7 from "dom7";

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
            return axiosHttp
                .get(
                    `/task/${this.f7route.params.id}?fields=${encodeURIComponent(
                        'id,heading,start_date,due_date,description,priority,status,category{id,category_name},project{id,project_name},users{id,name,image,image_url},board_column{id,column_name,slug,label_color},files{id,external_link,hashname,file_url,icon,filename},subtasks{id,title,start_date,due_date,status},all_board_columns'
                    )}`
                )
                .then((response) => {
                    this.item = response.data.data;
                });
        },
        getProjects(allOption = false) {
            this.projects = [];
            return axiosHttp.get(`/project?limit=1000`).then((response) => {
                this.projects = allOption
                    ? [
                        {
                            id: 0,
                            project_name: this.trans('app.all'),
                        },
                        ...response.data.data,
                    ]
                    : response.data.data;
            });
        },
        getMyProjects() {
            this.myProjects = [];
            return Cache.httpGet(`/project/me?limit=1000`).then((response) => {
                this.myProjects = [{id: 0, project_name: this.trans('app.all')}, ...response.data];
            });
        },
        getClients(allOption = false) {
            this.clients = [];
            return Cache.httpGet(`/client?limit=1000`).then((response) => {
                this.clients = allOption
                    ? [
                        {
                            id: 0,
                            name: this.trans('app.all'),
                        },
                        ...response.data,
                    ]
                    : response.data;
            });
        },
        getEmployees() {
            return Cache.httpGet(`/employee?limit=1000&filters=status eq "active"`).then((response) => {
                this.employees = response.data;
            });
        },
        getCategories(allOption = false) {
            this.categories = [];
            return Cache.httpGet('/task-category?fields=id,category_name&limit=1000').then((response) => {
                this.categories = allOption
                    ? [
                        {
                            id: 0,
                            category_name: this.trans('app.all'),
                        },
                        ...response.data,
                    ]
                    : response.data;
            });
        },
        getBoardColumns(allOption = false) {
            this.columns = [];
            return Cache.httpGet('/taskboard-columns?limit=1000').then((response) => {
                this.columns = allOption
                    ? [
                        {
                            id: 0,
                            column_name: this.trans('app.all'),
                        },
                        ...response.data,
                    ]
                    : response.data;
            });
        },

        /** Formatters **/
        formatStatus(item) {
            return this.capitalize(item.status);
        },
        onStartDateChange(date) {
            if (date) {
                this.item.start_date = moment(date).format('YYYY-MM-DD');
            }
        },
        onEndDateChange(date) {
            if (date) {
                this.item.due_date = moment(date).format('YYYY-MM-DD');
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
            if (event.target.value !== 0) {
                const id = event.target.value * 1;
                this.item.category.id = _.find(this.categories, (item) => item.id === id).id;
            } else {
                this.item.category.id = 0;
            }
        },
        onTaskUserChange(event) {
            if (event.target.value !== 0) {
                const id = event.target.value * 1;
                this.item.employee.id = _.find(this.employees, (item) => item.id === id).id;
            } else {
                this.item.employee.id = 0;
            }
        },
        onAssignedByChange(event) {
            if (event.target.value !== 0) {
                const id = event.target.value * 1;
                this.item.assignedBy.id = _.find(this.employees, (item) => item.id === id).id;
            } else {
                this.item.assignedBy.id = 0;
            }
        },
        onColumnChange(event) {
            if (event.target.value !== 0) {
                const id = event.target.value * 1;
                this.item.board_column.id = _.find(this.columns, (item) => item.id === id).id;
            } else {
                this.item.board_column.id = 0;
            }
        },
        onPriorityChange(event) {
            this.item.priority = event.target.value;
        },
        onProjectChange(event) {
            if (event.target.value !== 0) {
                const id = event.target.value * 1;
                this.item.project.id = _.find(this.projects, (item) => item.id === id).id;
            } else {
                this.item.project.id = 0;
            }
        },
        onMyProjectChange(event) {
            if (event.target.value !== 0) {
                const id = event.target.value * 1;
                this.item.project.id = _.find(this.myProjects, (item) => item.id === id).id;
            } else {
                this.item.project.id = 0;
            }
        },
        onClientChange(event) {
            if (event.target.value !== 0) {
                const id = event.target.value * 1;
                this.item.client.id = _.find(this.clients, (item) => item.id === id).id;
            } else {
                this.item.client.id = 0;
            }
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
