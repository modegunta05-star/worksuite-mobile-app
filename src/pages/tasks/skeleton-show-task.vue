<template>
    <!-- SKELETON-->
    <div class="skeleton-text skeleton-effect-wave">
        <f7-block-title text-color="blue">Heading</f7-block-title>

        <f7-block class="skeleton-text skeleton-effect-wave">
            <div class="margin-top-half padding-top-half">
                <div>
                    <f7-icon f7="layers"></f7-icon>
                    Project NAME
                </div>
            </div>

            <div class="same-line margin-top">
                <div class="w-80">
                    Start date &rarr; Due date
                </div>
                <div class="text-align-right">
                    <f7-link sheet-open=".board-actions">
                        Badge
                    </f7-link>
                </div>
            </div>
            <div class="grid grid-cols-1 margin-top">
                <div class="user-list">
                    <div class="display-flex">
                        <f7-skeleton-block class="margin-right-half" style=" width: 25px; height: 25px; "/>
                        <f7-skeleton-block class="margin-right-half" style="width: 25px; height: 25px; "/>
                        <f7-skeleton-block class="margin-right-half" style="width: 25px; height: 25px; "/>
                    </div>
                </div>
            </div>
        </f7-block>

        <f7-block-title>Description</f7-block-title>
        <f7-block>
            <p id="description" class="description">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
            </p>
        </f7-block>
        <!-- SKELETON END-->
    </div>
</template>
