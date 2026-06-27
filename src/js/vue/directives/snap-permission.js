import store from './../store';

export default {
    mounted(el, binding) {
        let permissions = [];

        if (typeof binding.value === 'string') {
            permissions = [binding.value];
        } else {
            permissions = binding.value;
        }

        let userPermissions = undefined;

        if (store.state.user) {
            userPermissions = store.state.user.modules;
        }

        let found = false;

        if (userPermissions && permissions) {
            permissions.forEach((permission) => {
                if (userPermissions.indexOf(permission) !== -1) {
                    found = true;
                }
            });

            if (!found) {
                el.remove();
                // el.parentNode.removeChild(el);
            }
        }
    },
};
