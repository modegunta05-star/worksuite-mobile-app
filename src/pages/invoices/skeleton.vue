<template>
    <!-- Skeleton Loading-->
    <f7-card class="skeleton-text skeleton-effect-wave"  v-for="n in 3" :key="n">
        <f7-card-content>
            <div class="grid grid-cols-1">
                <div> <strong> item.invoice_number </strong></div>
            </div>
            <div class="grid grid-cols-2 medium-grid-cols-2 grid-gap margin-top-half">
                <div>
                    <span class="user-name" >item.client.name</span>
                </div>
                <div class="text-align-right">
                    <f7-icon f7="calendar"></f7-icon>
                    27th June 2024
                </div>
            </div>
            <div class="grid grid-cols-1 medium-grid-cols-2 grid-gap margin-top-half">
                <div>1000</div>
                <div class="text-align-right">
                    paid
                </div>
            </div>

        </f7-card-content>
    </f7-card>
    <!--  Skelton End here    -->
</template>
