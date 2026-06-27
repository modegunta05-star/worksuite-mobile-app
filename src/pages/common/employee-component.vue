<template>
    <f7-list media-list
             dividers
             strong
             inset
             class="margin-bottom margin-top-half"
    >
        <f7-list-item
                v-bind:key="employee.id"
                :badge="formatStatus()"
                :badge-color="formatStatusColor()"
                :title="employee.name"
                :text="employee?.employee_detail?.employee_id"
                :subtitle="formatSubtitle()"
        >
            <template #media>
                <img slot="media" :src="employee.image_url" width="50" height="50" class="lazy lazy-fade-in " alt=""/>
            </template>
        </f7-list-item>

    </f7-list>
</template>
<script>

export default {
    props: ['employee'],

    methods:{
        formatStatusColor() {
            if (this.employee.status === 'active') {
                return 'green';
            }
            if (this.employee.status === 'deactive') {
                return 'red';
            }
        },
        formatStatus() {
            return this.employee.status.charAt(0).toUpperCase() + this.employee.status.slice(1);
        },
        formatSubtitle() {
            const detail = this.employee?.employee_detail;

            return [
                detail?.designation?.name,
                detail?.department?.team_name
            ].filter(Boolean).join(', ');
        }

    }
}
</script>
