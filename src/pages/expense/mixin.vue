<script type="text/babel">
import axiosHttp from '../../js/vue/boot/axiosHttp';
import Cache from '../../js/vue/scripts/cache';
import moment from 'moment-timezone';
import _ from "lodash";
import {f7} from "framework7-vue";

export default {
    computed: {
        selfUrl() {
            let self_url = '/expense/';
            if (this.isEmployeeRoute) {
                self_url = '/self' + self_url;
            }
            return self_url;
        },
    },
    methods: {
        /** Data getters **/
        getItem() {
            return axiosHttp
                .get(
                    `/expense/${this.f7route.params.id}?fields=${encodeURIComponent(
                        'id,item_name,purchase_date,price,status,purchase_from,bill,bill_url,user.limit(1000){id,name},project.limit(1000){id,project_name},currency.limit(1000){id,currency_code,currency_symbol}'
                    )}`
                )
                .then((response) => {
                    this.item = response.data.data;
                    this.billImageUrl = this.item.bill_url;
                });
        },
        getUsers() {
            return axiosHttp.get(`/employee?limit=1000&filters=status eq "active"`).then((response) => {
                this.users = response.data.data;
            });
        },
        getProjects(isEmployee = null) {
            let url = '/project';

            if (isEmployee === 'me') {
                url = url + '/me';
            }

            return axiosHttp.get(url + `?limit=1000`).then((response) => {
                this.projects = response.data.data;
            });
        },
        getCurrencies() {
            return Cache.httpGet(`/currency?fields=id,currency_code,currency_symbol&limit=1000`).then((response) => {
                this.currencies = response.data;
            });
        },

        /** Formatters **/
        formatStatus(item) {
            return this.capitalize(item);
        },
        onStartDateChange(date) {
            if (date) {
                let momentDate = moment(date, this.getCompanyMomentDateFormat);
                this.item.purchase_date = momentDate.format('YYYY-MM-DD');
            }
        },
        onStatusChange(event) {
            this.item.status = event.target.value;
        },
        onUserChange(event) {
            const id = event.target.value * 1;
            this.item.user = _.find(this.users, (item) => item.id === id);
        },
        onProjectChange(event) {
            const id = event.target.value * 1;
            this.item.project = _.find(this.projects, (item) => item.id === id);
        },
        onCurrencyChange(event) {
            const id = event.target.value * 1;
            this.item.currency = _.find(this.currencies, (item) => item.id === id);
        },
        formatStatusColor(item) {
            if (item.status === 'approved') {
                return 'green';
            }
            if (item.status === 'rejected') {
                return 'red';
            }
            if (item.status === 'pending') {
                return 'yellow';
            }
        },
        formatSheetStatusColor(status) {
            if (status === 'approved') {
                return 'green';
            }
            if (status === 'rejected') {
                return 'red';
            }
            if (status === 'pending') {
                return '#ffcc00';
            }
        },
        formatDueDate(date) {
            if (date) {
                return moment(date).format(this.getCompanyMomentDateFormat);
            }
            return '';
        },
        openActionSheet() {
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
                                this.billImageUrl = image;

                                this.billImage = this.converterDataURItoBlob(image);
                                console.log('billImage' + this.billImage);
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
                                this.billImageUrl = image;

                                this.billImage = this.converterDataURItoBlob(image);
                                console.log('billImage' + this.billImage);
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
            var ac5 = f7.actions.create({buttons: buttons});
            ac5.open();
        },

        removeBill() {
            this.billImage = null;
            this.item.bill = null;
            this.billUrl = null;
            this.billImageUrl = null;
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

            return new Blob([ia], {type: mimeString});
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

            return new Blob([u8arr], filename, {type: mime});
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

                            f7.preloader.hide();
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
        converterDataURItoBlob(dataURI) {
            let byteString;
            let mimeString;
            let ia;

            if (dataURI.split(',')[0].indexOf('base64') >= 0) {
                byteString = atob(dataURI.split(',')[1]);
            } else {
                byteString = encodeURI(dataURI.split(',')[1]);
            }
            // separate out the mime component
            mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            // write the bytes of the string to a typed array
            ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            return new Blob([ia], {type: mimeString});
        },
    },
};
</script>
