<template>
    <!-- Skeleton Loading-->
    <f7-card class="skeleton-text skeleton-effect-wave"  v-for="n in 3" :key="n">
        <f7-card-content>
            <div class="grid grid-cols-2 medium-grid-cols-2 grid-gap ">
                <div>
                    <span class="project-name">Skeleton Project Name Here</span>
                </div>
                <div class="text-align-right">
                    <span class="badge-here">Project Name</span>
                </div>
            </div>
            <div class="grid grid-cols-1 margin-top ">
                <div>
                    <f7-progressbar color="blue" :progress="100"></f7-progressbar>
                </div>
            </div>
            <div class="grid grid-cols-2 medium-grid-cols-2 grid-gap margin-top">
                <div class="display-flex">
                    <f7-skeleton-block class="margin-right-half" style=" width: 25px; height: 25px; "/>
                    <f7-skeleton-block class="margin-right-half" style="width: 25px; height: 25px; "/>
                    <f7-skeleton-block class="margin-right-half" style="width: 25px; height: 25px; "/>
                </div>
                <div class="deadline text-align-right text-color-gray">
                    <f7-icon f7="calendar"></f7-icon>
                    27 June 2024
                </div>
            </div>
        </f7-card-content>
    </f7-card>
    <!--  Skelton End here    -->
</template>
