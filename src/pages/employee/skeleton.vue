<template>
    <f7-list media-list dividers-ios strong-ios inset class="search-list searchbar-found skeleton-text skeleton-effect-wave">
    <!-- Skeleton Loading-->
    <f7-list-item
            class="skeleton-text skeleton-effect-wave"
            v-for="n in 5"
            :key="n"
            link="#"
            title="Employee name"
            text="employee_id"
            subtitle="designation.name"
            badge-color="formatStatusColor(item)"
    >

        <template #media>
            <f7-skeleton-block style="width: 40px; height: 40px; " />
        </template>
    </f7-list-item>
    </f7-list>
</template>
