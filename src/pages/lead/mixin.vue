<script type="text/babel">
    import Cache from '../../js/vue/scripts/cache';
    import moment from 'moment';

    export default {
        computed: {},
        methods: {
            /** Data getters **/
            getItem() {
                return axiosHttp.get(`/lead/${this.f7route.params.id}) }`).then((response) => {
                    this.item = response.data.data;
                });
            },

            /** Formatters **/
            formatStatus(item) {
                return this.capitalize(item.status);
            },

            formatStatusColor(item) {
                console.log(item.status);
                if (item.status === 'pending') {
                    return 'orange';
                } else if (item.status === 'approved') {
                    return 'green';
                } else if (item.status === 'rejected') {
                    return 'red';
                }
            },
        },
    };
</script>
