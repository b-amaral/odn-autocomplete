let defaults = {
    noResultsMsg: 'No records found'
};

export default {
    setDefaults(opts) {
        Object.assign(defaults, opts);
    },
    install(Vue, options) {
        Vue.prototype.$odnAutocomplete = {...defaults, setDefaults: this.setDefaults};
    }
}
