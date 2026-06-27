<template>
    <!-- SKELETON-->
    <div class="skeleton-text skeleton-effect-wave">
        <f7-block class="margin-bottom-half">
            <div class="grid grid-cols-2 margin-bottom">
                <div>
                    <f7-block-title class="no-margin">
                        modules.projects.projectDetails
                    </f7-block-title>
                </div>
                <div class="text-align-right">
                    <f7-link sheet-open=".status-actions">
                        Badge
                    </f7-link>
                </div>
            </div>
        </f7-block>

        <f7-block strong  class="no-margin-top">
           <p>
               Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
               industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
           </p>
        </f7-block>

        <f7-block>
            <div class="grid grid-cols-2">
                <div class="text-align-center">
                    <strong >50</strong>
                    <br/>
                    projectBudget
                </div>
                <div class="text-align-center">
                    <strong>
                       50
                    </strong>
                    <br/>
                    earnings
                </div>
            </div>

            <div class="grid grid-cols-2 margin-top" >
                <div class="text-align-center">
                    <strong >50</strong>
                    <br/>
                    hours_allocated
                </div>
                <div class="text-align-center"><strong>50</strong>
                    <br/>
                    hoursLogged
                </div>
            </div>

        </f7-block>

        <f7-block-title>client</f7-block-title>
        <f7-list media-list
                 dividers
                 strong
                 class="margin-bottom margin-top-half"
        >
            <f7-list-item
                    title="Ajay Kumar Choudhary"
                    text="Froiden Technologies Private Limited"
                    subtitle="item.client.email"
            >
                <template #media>
                    <f7-skeleton-block class="margin-right-half" style=" width: 50px; height: 50px; " />
                </template>
            </f7-list-item>

        </f7-list>

        <f7-block-title>projects.members</f7-block-title>
        <f7-block strong>
            <div class="grid grid-cols-2">
                <div class="display-flex">
                    <f7-skeleton-block class="margin-right-half" style=" width: 25px; height: 25px; " />
                    <f7-skeleton-block class="margin-right-half" style="width: 25px; height: 25px; " />
                    <f7-skeleton-block class="margin-right-half" style="width: 25px; height: 25px; " />
                </div>
            </div>

        </f7-block>

        <f7-block>
            <div class="grid grid-cols-2 margin-top">
                <div><strong>Date</strong>
                    <br/>modules.projects.deadline
                </div>
            </div>
        </f7-block>
        <!-- SKELETON END-->
    </div>
</template>
