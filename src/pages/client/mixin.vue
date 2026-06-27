<script type="text/babel">
    import axiosHttp from '../../js/vue/boot/axiosHttp';

    export default {
        props: {
            f7route: Object,
            f7router: Object,
        },
        computed: {},
        methods: {
            /** Data getters **/
            getItem() {
                return axiosHttp
                    .get(
                        `/client/${this.f7route.params.id}?fields=${encodeURIComponent(
                            'id,name,email,gender,client_details{id,company_name,address,website,note,skype,gst_number,linkedin,facebook,twitter}'
                        )}`
                    )
                    .then((response) => {
                        this.item = response.data.data;
                    });
            },

            /** Formatters **/
            formatStatus(item) {
                return this.capitalize(item.status);
            },

            formatStatusColor(item) {
                if (item.status === 'active') {
                    return 'orange';
                }
                if (item.status === 'active') {
                    return 'green';
                }
                if (item.status === 'inactive') {
                    return 'red';
                }
            },
        },
    };
</script>
