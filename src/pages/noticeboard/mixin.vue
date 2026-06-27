<script type="text/babel">
import axiosHttp from '../../js/vue/boot/axiosHttp';
import moment from 'moment';

export default {
    computed: {},
    methods: {
        /** Data getters **/
        getItem() {
            return axiosHttp
                .get(`/notice/${this.f7route.params.id}?fields=${encodeURIComponent('id,heading,description,to,created_at}')}`)
                .then((response) => {
                    this.item = response.data.data;
                });
        },
        /** Formatters **/
        formatCreatedDate(item) {
            return moment(item.created_at).format(this.getCompanyMomentDateFormat);
        },

        formatDescription(item) {
            if (item.description) {
                return item.description.replace(/<(?:.|\n)*?>/gm, '').substring(0, 100);
            }
            return '-';

        },
    },
};
</script>
