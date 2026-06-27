<script type="text/babel">
    import Cache from '../../js/vue/scripts/cache';
    import moment from 'moment';
    import axiosHttp from '../../js/vue/boot/axiosHttp';

    export default {
        props: {
            f7route: Object,
            f7router: Object,
        },
        computed: {
            selfUrl() {
                let self_url = '/project/';
                if (this.isEmployeeRoute) {
                    self_url = '/self' + self_url;
                }
                return self_url;
            },
        },
        methods: {
            /** Data getters **/
            getItem() {
                return this.$http
                    .get(
                        `/project/${this.f7route.params.id}?fields=${encodeURIComponent(
                            'id,project_name,deadline,status,project_summary,project_budget,completion_percent,hours_allocated,total_earnings,tasks{id,heading},client{id,name,email,image,image_url},client:client_details{id,company_name,address},members{id,name,email,image,image_url},hours_logged,category,currency.limit(1000){id,currency_code,currency_symbol}'
                        )}`
                    )
                    .then((response) => {
                        this.item = response.data.data;
                    });
            },
            getEmployees() {
                return axiosHttp.get(`/employee?limit=1000&filters=status eq "active"`).then((response) => {
                    this.employees = response.data.data;
                });
            },
            /** Formatters **/

            formatStatusColor(item) {
                if (item.status === 'finished') {
                    return 'green';
                }
                if (item.status === 'in progress') {
                    return 'blue';
                }
                if (item.status === 'not started') {
                    return 'gray';
                }
                if (item.status === 'canceled') {
                    return 'red';
                }
                if (item.status === 'on hold') {
                    return 'orange';
                }
            },
            formatSheetStatusColor(status) {
                if (status === 'finished') {
                    return 'green';
                }
                if (status === 'in progress') {
                    return 'blue';
                }
                if (status === 'not started') {
                    return 'gray';
                }
                if (status === 'canceled') {
                    return 'red';
                }
                if (status === 'on hold') {
                    return 'orange';
                }
            },
            getCategories(allOption = false) {
                this.categories = [];
                return Cache.httpGet('/project-category?fields=id,category_name&limit=1000').then((response) => {
                    this.categories = allOption
                        ? [
                              {
                                  id: 0,
                                  category_name: this.trans('app.all'),
                              },
                              ...response.data,
                          ]
                        : response.data;
                });
            },
            getCurrencies() {
                return Cache.httpGet('/currency?fields=id,currency_code&limit=1000').then((response) => {
                    this.currencies = response.data;
                });
            },
            onUserChange(event) {
                const $$ = Dom7;
                const selected = $$('#users-select').val();
                this.members = [];
                _.each(selected, (member) => {
                    this.members.push({ id: member });
                });
            },
            getClients(allOption = false) {
                this.clients = [];
                return axiosHttp.get(`/client?limit=1000`).then((response) => {
                    this.clients = allOption
                        ? [
                              {
                                  id: 0,
                                  name: this.trans('app.all'),
                              },
                              ...response.data.data,
                          ]
                        : response.data.data;
                });
            },
            /** Formatters **/
            formatStatus(item) {
                return this.capitalize(item.status);
            },
            onStartDateChange(date) {
                if (date) {
                    this.item.start_date = moment(date).format('YYYY-MM-DD');
                }
            },
            onDeadlineChange(date) {
                if (date) {
                    this.item.deadline = moment(date).format('YYYY-MM-DD');
                }
            },
            onCategoryChange(event) {
                if (event.target.value !== 0) {
                    const id = event.target.value * 1;
                    this.item.category.id = _.find(this.categories, (item) => item.id === id).id;
                } else {
                    this.item.category.id = 0;
                }
            },
            onCurrencyChange(event) {
                const id = event.target.value * 1;
                this.item.currency = _.find(this.currencies, (item) => item.id === id);
            },
            onChangeStatus(event) {
                this.selectedFilter = event.target.value;
            },
            onClientChange(event) {
                if (event.target.value !== 0) {
                    const id = event.target.value * 1;
                    this.item.client.id = _.find(this.clients, (item) => item.id === id).id;
                } else {
                    this.item.client.id = 0;
                }
            },
            onProjectMemberChange(event) {
                if (event.target.value !== 0) {
                    const id = event.target.value * 1;
                    this.item.member.id = _.find(this.employees, (item) => item.id === id).id;
                } else {
                    this.item.member.id = 0;
                }
            },
            formatProgressColor(item) {
                if (item.completion_percent < 50) {
                    return 'red';
                }
                if (item.completion_percent >= 50 && item.completion_percent < 75) {
                    return 'orange';
                }

                return 'green';
            },

            formatDate(item) {
                if (item) {
                    if (!item.deadline) {
                        return '-';
                    }

                    return moment(item.deadline).format(this.getCompanyMomentDateFormat);
                }
            },

            openActionSheet() {
                var buttons = [
                    {
                        text: 'Camera',
                        bold: true,
                        onClick: () => {
                            const srcType = Camera.PictureSourceType.CAMERA;
                            const options = this.setOptions(srcType);

                            navigator.camera.getPicture(
                                (imageData) => {
                                    var image = 'data:image/jpeg;base64,' + imageData;
                                    this.billImageUrl = image;

                                    this.billImage = this.dataURItoBlob(image);
                                },
                                function cameraError(error) {
                                    f7.dialog.alert(
                                        'Unable to access camera. Please ensure you have granted crm access to the camera.',
                                        null
                                    );
                                },
                                options
                            );
                        },
                    },
                    {
                        text: 'Gallery',
                        onClick: () => {
                            const srcType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
                            const options = this.setOptions(srcType);

                            navigator.camera.getPicture(
                                (imageUri) => {
                                    var image = 'data:image/jpeg;base64,' + imageUri;
                                    this.billImageUrl = image;

                                    this.billImage = this.dataURItoBlob(image);
                                },
                                function cameraError(error) {
                                    f7.dialog.alert(
                                        'Unable to access gallery. Please ensure you have granted crm access to the gallery.',
                                        null
                                    );
                                },
                                options
                            );

                            setTimeout(() => {
                                // Hack because callback is not returned
                                if (window.device.platform == 'browser') {
                                    document.querySelector('.cordova-camera-select').click();
                                }
                            }, 500);
                        },
                    },
                ];
                f7.actions(buttons);
            },

            removeBill() {
                this.billImage = null;
                this.item.receipt = null;
                this.item.receipt_url = null;
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
                        console.log(error);
                        reject(error);
                        return;
                    }

                    xhr.open('POST', this.fileAction, true);
                    if (this.headers) {
                        Object.keys(this.headers).forEach((header) => {
                            if (this.headers.hasOwnProperty(header)) {
                                xhr.setRequestHeader(header, this.headers[header]);
                            }
                        });
                    }

                    xhr.onload = function () {
                        if (xhr.status === 200) {
                            const error = JSON.parse(xhr.response);
                            resolve(error);
                        } else {
                            const error = JSON.parse(xhr.responseText);

                            if (xhr.responseURL.indexOf('/file') !== -1 && error.error.code === 422 && error.error.details === undefined) {
                                // Upload to file endpoint caused error but details contain nothing. That means file upload was not successful
                                f7.addNotification({
                                    title: 'Maximum File Size',
                                    message:
                                        'Maximum file size allowed for upload is 8MB. For uploading larger files, please contact support.',
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
