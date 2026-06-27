<template>
    <!-- Skeleton Loading-->
    <f7-card class="skeleton-text skeleton-effect-wave" v-for="n in 3" :key="n">
        <f7-card-content>
            <div class="grid grid-cols-2">
                <div class="text-align-left">
                    <span class="user-name"> Issue not resolved </span>
                </div>
                <div class="deadline text-align-right text-color-gray">
                    <f7-icon f7="calendar"></f7-icon>
                    27 June 2024
                </div>
            </div>
            <div class="grid grid-cols-2 margin-top-half">
                <div class="text-color-gray">
                    Froiden
                </div>
                <div class="text-align-right deadline">
                    pending
                </div>
            </div>
            <div class="grid grid-cols-2 margin-top-half">
                <div class="text-color-gray">
                    Froiden
                </div>
                <div class="text-align-right deadline">
                    High
                </div>
            </div>
        </f7-card-content>
    </f7-card>
    <!--  Skelton End here    -->
</template>
