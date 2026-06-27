<template>
    <!-- SKELETON-->
    <f7-card class="skeleton-text skeleton-effect-wave" v-for="n in 3" :key="n">
        <f7-card-content>
            <div class="same-line">
                <div class="w-75"><span class="project-name">Task Heading</span></div>
                <div class="text-align-right">IDNUMBER123</div>
            </div>
            <div class="same-line">
                <div class="w-75">Social media platform</div>
                <div class="text-align-right">Badge</div>
            </div>
            <div class="grid grid-cols-2 medium-grid-cols-2 grid-gap margin-top">
                <div class="display-flex">
                    <f7-skeleton-block class="margin-right-half" style=" width: 25px; height: 25px; " />
                    <f7-skeleton-block class="margin-right-half" style="width: 25px; height: 25px; " />
                    <f7-skeleton-block class="margin-right-half" style="width: 25px; height: 25px; " />
                </div>
                <div class="text-align-right">
                    <f7-icon f7="calendar"></f7-icon>
                    27 June 2024
                </div>
            </div>

        </f7-card-content>
    </f7-card>
    <!-- SKELETON END-->

</template>
