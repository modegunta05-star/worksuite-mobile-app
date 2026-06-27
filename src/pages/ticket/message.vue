<template>
    <f7-page>
        <f7-navbar :title="trans('app.reply')">
            <f7-nav-right>
                <f7-link popup-close>{{ trans('app.close') }}</f7-link>
            </f7-nav-right>
        </f7-navbar>

        <f7-messagebar :placeholder="placeholder" ref="messagebar" :attachments-visible="attachmentsVisible" :sheet-visible="sheetVisible">
            <f7-link
                icon-ios="f7:arrow_up_circle_fill"
                icon-aurora="f7:arrow_up_circle_fill"
                icon-md="material:send"
                slot="inner-end"
                @click="sendMessage"
            ></f7-link>
            <f7-messagebar-attachments>
                <f7-messagebar-attachment
                    v-for="(image, index) in attachments"
                    :key="index"
                    :image="image"
                    @attachment:delete="deleteAttachment(image)"
                ></f7-messagebar-attachment>
            </f7-messagebar-attachments>
            <f7-messagebar-sheet>
                <f7-messagebar-sheet-image
                    v-for="(image, index) in images"
                    :key="index"
                    :image="image"
                    :checked="attachments.indexOf(image) >= 0"
                    @change="handleAttachment"
                ></f7-messagebar-sheet-image>
            </f7-messagebar-sheet>
        </f7-messagebar>

        <f7-messages ref="messages">
            <!--         <f7-messages-title><b>Sunday, Feb 9,</b> 12:58</f7-messages-title>-->
            <f7-message
                v-for="(message, index) in messagesData"
                scroll-messages
                :key="index"
                :type="message.type"
                :name="message.name"
                :avatar="message.avatar"
                :first="isFirstMessage(message, index)"
                :last="isLastMessage(message, index)"
                :tail="isTailMessage(message, index)"
                :footer="message.replyDate"
            >
                <span slot="image" v-if="message.file" @click="handleClick(message.file.file_url)">
                    <img :src="message.file.file_url" alt="" v-if="message.file.icon === 'images'" />
                    <f7-icon :f7="formatIcon(message.file)" v-else></f7-icon>
                    {{ message.file.filename }}
                </span>
                <span slot="text" v-if="message.text" v-html="message.text"></span>
            </f7-message>
        </f7-messages>
        <f7-photo-browser :photos="image" type="popup" theme="light" :toolbar="false" ref="popupimage"></f7-photo-browser>
    </f7-page>
</template>
<script>
    import moment from 'moment';
    import Cache from '../../js/vue/scripts/cache';
    import CommonMixin from '../../js/vue/mixins/common.vue';
    import { f7, f7ready } from 'framework7-vue';

    export default {
        mixins: [CommonMixin],
        props: ['item'],
        name: 'message',
        data() {
            return {
                attachments: [],
                sheetVisible: false,
                image: [],
                typingMessage: null,
                messagesData: [],
                sendImage: null,
                sendImageUrl: null,
                action: '/ticket-reply-file',
                headers: {
                    Authorization: `Bearer ${this.$store.state.token}`,
                },
                responseInProgress: false,
            };
        },
        computed: {
            attachmentsVisible() {
                const self = this;
                return self.attachments.length > 0;
            },
            placeholder() {
                const self = this;
                return self.attachments.length > 0 ? 'Add comment or Send' : 'Message';
            },
            fileAction() {
                if (!this.action.startsWith('http')) {
                    return `${this.$store.state.api_url + this.action}`;
                } else {
                    return `${this.action}`;
                }
            },
        },
        mounted() {
            this.replyData();
            const self = this;
            f7ready(() => {
                self.messagebar = self.$refs.messagebar.f7Messagebar;
                self.messages = self.$refs.messages.f7Messages;
            });
        },
        methods: {
            replyData() {
                const messagesToSend = [];
                this.item.reply.forEach((reply) => {
                    let replyDate = this.moment(reply.created_at);
                    if (reply.message) {
                        messagesToSend.push({
                            name: reply.user.name,
                            id: reply.id,
                            type: this.$store.state.user.id === reply.user.id ? 'sent' : 'received',
                            text: reply.message ? reply.message : null,
                            avatar: reply.user.image_url,
                            replyDate: replyDate.fromNow(),
                        });
                    }
                    if (reply.files.length > 0) {
                        reply.files.forEach((file) => {
                            messagesToSend.push({
                                name: reply.user.name,
                                id: reply.id,
                                type: this.$store.state.user.id === reply.user.id ? 'sent' : 'received',
                                avatar: reply.user.image_url,
                                file: file,
                                file_url: file.file_url,
                                replyDate: replyDate.fromNow(),
                            });
                        });
                    }
                });
                this.messagesData.push(...messagesToSend);
            },
            moment(date) {
                return moment(date);
            },
            formatIcon(file) {
                if (file.icon === 'images') {
                    return 'photo';
                }
                return 'arrow_down_doc';
            },
            handleClick(file) {
                cordova.InAppBrowser.open(file, '_blank');
                return true;
            },
            isFirstMessage(message, index) {
                const self = this;
                const previousMessage = self.messagesData[index - 1];
                if (message.isTitle) return false;
                return !previousMessage || previousMessage.type !== message.type || previousMessage.name !== message.name;
            },
            isLastMessage(message, index) {
                const self = this;
                const nextMessage = self.messagesData[index + 1];
                if (message.isTitle) return false;
                return !nextMessage || nextMessage.type !== message.type || nextMessage.name !== message.name;
            },
            isTailMessage(message, index) {
                const self = this;
                const nextMessage = self.messagesData[index + 1];
                if (message.isTitle) return false;
                return !nextMessage || nextMessage.type !== message.type || nextMessage.name !== message.name;
            },
            deleteAttachment(image) {
                const self = this;
                const index = self.attachments.indexOf(image);
                self.attachments.splice(index, 1)[0]; // eslint-disable-line
            },
            handleAttachment(e) {
                const self = this;
                const index = self.$$(e.target).parents('label.checkbox').index();
                const image = self.images[index];
                if (e.target.checked) {
                    // Add to attachments
                    self.attachments.unshift(image);
                } else {
                    // Remove from attachments
                    self.attachments.splice(self.attachments.indexOf(image), 1);
                }
            },
            sendMessage() {
                f7.preloader.show();
                const self = this;
                const text = self.messagebar.getValue().replace(/\n/g, '<br>').trim();
                const messagesToSend = [];
                self.attachments.forEach((attachment) => {
                    messagesToSend.push({
                        image: attachment,
                    });
                });
                if (text.trim().length) {
                    messagesToSend.push({
                        text,
                        name: this.$store.state.user.name,
                        type: 'sent',
                        avatar: this.$store.state.user.image_url,
                        replyDate: moment().fromNow(),
                    });
                }
                if (messagesToSend.length === 0) {
                    return;
                }

                if (this.sendImage) {
                    new Promise((resolve, reject) => {
                        const form = new FormData();
                        const xhr = new XMLHttpRequest();
                        try {
                            form.append('Content-Type', this.sendImage.type || 'application/octet-stream');
                            form.append('content_type', this.sendImage.type || 'application/octet-stream');
                            form.append('file', this.sendImage);
                            form.append('ticket_id', this.item.id);
                            form.append('message', text);
                        } catch (error) {
                            console.log('error' + error);
                            reject(error);
                            return;
                        }

                        xhr.open('POST', this.fileAction, true);
                        if (this.headers) {
                            console.log('headers' + this.headers);
                            Object.keys(this.headers).forEach((header) => {
                                if (this.headers.hasOwnProperty(header)) {
                                    xhr.setRequestHeader(header, this.headers[header]);
                                }
                            });
                        }

                        xhr.onload = function () {
                            if (xhr.status === 200) {
                                const error = JSON.parse(xhr.response);
                                console.log('error' + error);
                                resolve(error);
                            } else {
                                const error = JSON.parse(xhr.responseText);

                                if (
                                    xhr.responseURL.indexOf('/file') !== -1 &&
                                    error.error.code === 422 &&
                                    error.error.details === undefined
                                ) {
                                    // Upload to file endpoint caused error but details contain nothing. That means file upload was not successful
                                    f7.addNotification({
                                        title: `${this.trans('modules.mobile.maximumFileSize')}`,
                                        message: `${this.trans('messages.mobile.maximumFileSize')}`,
                                    });

                                    f7.hideIndicator();
                                }

                                error.status = xhr.status;
                                error.statusText = xhr.statusText;
                                reject(error);
                            }
                        };

                        xhr.onerror = function () {
                            const error = JSON.parse(xhr.responseText);
                            console.log('error1' + error);
                            error.status = xhr.status;
                            error.statusText = xhr.statusText;
                            reject(error);
                        };

                        xhr.send(form);
                        f7.preloader.hide();
                        Cache.removeMatching('ticket');
                        this.$store.commit('sendCacheInvalidate', 'ticket');
                    });
                } else {
                    const itemToSend = {
                        message: text,
                        ticket: {
                            id: this.item.id,
                        },
                        user: {
                            id: this.$store.state.user.id,
                        },
                    };

                    axiosHttp.post(`/ticket-reply`, itemToSend).then(
                        (response) => {
                            f7.preloader.hide();
                            Cache.removeMatching('ticket');
                            this.$store.commit('sendCacheInvalidate', 'ticket');
                        },
                        () => {}
                    );
                }

                // Reset attachments
                self.attachments = [];
                // Hide sheet
                self.sheetVisible = false;
                // Clear area
                self.messagebar.clear();
                // Focus area
                if (text.length) self.messagebar.focus();
                // Send message
                self.messagesData.push(...messagesToSend);
            },
            openActionSheet() {
                this.attachments = [];
                var buttons = [
                    {
                        text: this.trans('modules.mobile.camera'),
                        bold: true,
                        onClick: () => {
                            const srcType = Camera.PictureSourceType.CAMERA;
                            const options = this.setOptions(srcType);

                            navigator.camera.getPicture(
                                (imageData) => {
                                    var image = 'data:image/jpeg;base64,' + imageData;
                                    this.sendImageUrl = image;
                                    this.attachments.unshift(image);
                                    this.sendImage = this.dataURItoBlob(image);
                                    console.log('sendImage' + this.sendImage);
                                },
                                function cameraError(error) {
                                    f7.dialog.alert(`${this.trans('messages.mobile.unableToAccessCamera')}`, 'CRM');
                                },
                                options
                            );
                        },
                    },
                    {
                        text: this.trans('modules.mobile.gallery'),
                        onClick: () => {
                            const srcType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
                            const options = this.setOptions(srcType);

                            navigator.camera.getPicture(
                                (imageUri) => {
                                    var image = 'data:image/jpeg;base64,' + imageUri;
                                    this.sendImageUrl = image;
                                    this.attachments.unshift(image);
                                    this.sendImage = this.dataURItoBlob(image);
                                    console.log('sendImage' + this.sendImage);
                                },
                                function cameraError(error) {
                                    f7.dialog.alert(`${this.trans('messages.mobile.unableToAccessCamera')}`, 'CRM');
                                },
                                options
                            );

                            setTimeout(() => {
                                // Hack because callback is not returned
                                if (window.device.platform === 'browser') {
                                    document.querySelector('.cordova-camera-select').click();
                                }
                            }, 500);
                        },
                    },
                ];
                var ac5 = f7.actions.create({ buttons: buttons });
                ac5.open();
            },

            removeBill() {
                this.sendImage = null;
                this.sendImageUrl = null;
            },
            // Taken from https://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
            dataURItoBlob(dataURI) {
                // convert base64/URLEncoded data component to raw binary data held in a string
                var byteString;
                if (dataURI.split(',')[0].indexOf('base64') >= 0) byteString = atob(dataURI.split(',')[1]);
                else byteString = unescape(dataURI.split(',')[1]);

                // separate out the mime component
                var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

                // write the bytes of the string to a typed array
                var ia = new Uint8Array(byteString.length);
                for (var i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }

                return new Blob([ia], { type: mimeString });
            },

            dataURLtoFile(dataurl, filename) {
                var arr = dataurl.split(','),
                    mime = arr[0].match(/:(.*?);/)[1],
                    bstr = atob(arr[1]),
                    n = bstr.length,
                    u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }

                return new Blob([u8arr], filename, { type: mime });
            },

            setOptions(srcType) {
                const options = {
                    // Some common settings are 20, 50, and 100
                    quality: 50,
                    destinationType: Camera.DestinationType.DATA_URL,
                    // In this app, dynamically set the picture source, Camera or photo gallery
                    sourceType: srcType,
                    encodingType: Camera.EncodingType.JPEG,
                    mediaType: Camera.MediaType.PICTURE,
                    allowEdit: true,
                };

                return options;
            },

            uploadFile(file) {
                return new Promise((resolve, reject) => {
                    const form = new FormData();
                    const xhr = new XMLHttpRequest();
                    try {
                        form.append('Content-Type', file.type || 'application/octet-stream');
                        form.append('file', file);
                    } catch (error) {
                        console.log('error' + error);
                        reject(error);
                        return;
                    }

                    xhr.open('POST', this.fileAction, true);
                    if (this.headers) {
                        console.log('headers' + this.headers);
                        Object.keys(this.headers).forEach((header) => {
                            if (this.headers.hasOwnProperty(header)) {
                                xhr.setRequestHeader(header, this.headers[header]);
                            }
                        });
                    }

                    xhr.onload = function () {
                        if (xhr.status === 200) {
                            const error = JSON.parse(xhr.response);
                            console.log('error' + error);
                            resolve(error);
                        } else {
                            const error = JSON.parse(xhr.responseText);

                            if (xhr.responseURL.indexOf('/file') !== -1 && error.error.code === 422 && error.error.details === undefined) {
                                // Upload to file endpoint caused error but details contain nothing. That means file upload was not successful
                                f7.addNotification({
                                    title: `${this.trans('modules.mobile.maximumFileSize')}`,
                                    message: `${this.trans('messages.mobile.maximumFileSize')}`,
                                });

                                f7.hideIndicator();
                            }

                            error.status = xhr.status;
                            error.statusText = xhr.statusText;
                            reject(error);
                        }
                    };

                    xhr.onerror = function () {
                        const error = JSON.parse(xhr.responseText);
                        console.log('error' + error);
                        error.status = xhr.status;
                        error.statusText = xhr.statusText;
                        reject(error);
                    };

                    xhr.send(form);
                });
            },
        },
    };
</script>
<style>
    .message-footer {
        margin-top: 4px !important;
        margin-bottom: 0;
    }
</style>
