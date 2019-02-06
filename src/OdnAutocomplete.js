import {debounce, QChipsInput, QInfiniteScroll, QInput, QItem, QItemWrapper, QList, QPopover, QSpinner} from 'quasar';
import OdnChipsInput from './OdnChipsInput.js';
import KeyboardSelectionMixin from 'quasar-framework/src/mixins/keyboard-selection.js';

import Vue from 'vue';

const marginal = {
    type: Array,
    validator: v => v.every(i => 'icon' in i)
};

const autocomplete = {
    name: 'OdnAutocomplete',
    mixins: [KeyboardSelectionMixin],
    props: {
        chips: Boolean,
        value: { required: true},
        noResultsMsg: String,
        displayValue: {
            type: String,
            required: true
        },
        search: {
            type: Function,
            required: true
        },
        notFoundClick: Function,
        minCharacters: {
            type: Number,
            default: 0
        },
        maxHeight: {
            type: String,
            default: '300px'
        },
        debounce: {
            type: Number,
            default: 500
        },
        stackLabel: String,
        floatLabel: String,
        placeholder: String,
        error: Boolean,
        warning: Boolean,
        disable: Boolean,
        readonly: Boolean,
        clearable: Boolean,
        color: {
            type: String,
            default: 'primary'
        },
        dark: Boolean,
        before: marginal,
        after: marginal,
        inverted: Boolean,
        invertedLight: Boolean,
        hideUnderline: Boolean,
        clearValue: ''
    },
    watch: {
        value(v) {
            if (v) {
                if (this.chips) {
                    this.viewValue = v.map((value) => {
                        return this.evalField(value, this.displayValue);
                    });
                } else {
                    this.viewValue = this.evalField(v, this.displayValue);
                }
            }
        }
    },
    data() {
        return {
            viewValue: this.chips ? [] : '',
            searchValue: '',
            list: [],
            page: 1,
            startSearch: debounce(() => {
                this.loadingHandler.then(() => {
                    !this.chips && this.$emit('input', null);
                    this.doSearch();
                });
            }, this.debounce),
            width: 0,
            // keyboardIndex: -1,
            isLoading: true,
            loadingHandler: Promise.resolve(true),
            notFoundMsg: this.noResultsMsg || this.$odnAutocomplete ? this.$odnAutocomplete.noResultsMsg : 'No records found.'
        }
    },
    mounted() {
        this.width = window.getComputedStyle(this.$el).getPropertyValue('width');
        if (this.value == null) {
            this.$emit('input', this.chips ? [] : '');
        }

        this.$nextTick(() => {
            if (this.$refs.input) {
                this.inputEl = this.$refs.input.shadow.getEl();
                this.inputEl.addEventListener('keydown', this.__keyboardHandleKey)
            }
        })
    },
    computed: {
        keyboardMaxIndex() {
            return this.list.length - 1;
        }
    },
    methods: {
        __keyboardSetSelection(index, navigation) {
            !navigation && this.selectItem(this.list[index]);
        },
        __keyboardCustomKeyHandle(key) {
            switch (key) {
                case 38: // UP key
                case 40: // DOWN key
                case 9: // TAB key
                    this.__keyboardSetCurrentSelection(true);
                    break
            }
        },
        __keyboardShowTrigger() {
            this.startSearch();
        },
        __keyboardIsSelectableIndex(index) {
            return true;
        },
        hide() {
            this.$refs.popover.hide();
        },
        doSearch() {
            this.isLoading = true;
            if (this.$refs && this.$refs.popover && !this.$refs.popover.showing && this.searchValue.length >= this.minCharacters) {
                this.$refs.popover.show();
            }
            this.list = [];
            this.page = 1;
            this.resetInfiniteScroll();
        },
        onFocus() {
            this.doSearch();
        },
        loadMore(index, done) {
            this.loadingHandler = new Promise((resolve) => {
                this.search({query: this.searchValue, page: this.page}, (itens, hasMore) => {
                    this.list = this.list.concat(itens);
                    if (hasMore && itens.length) {
                        this.page += 1;
                        done();
                    } else {
                        done(true);//invokes stop() when true
                    }
                    this.isLoading = false;
                    resolve(true);

                    if (this.list.length === 0 && this.searchValue.length === 0) {
                        this.hide();
                    }
                });
            });
        },
        selectItem(item) {
            if (this.chips) {
                let exists = this.value.filter((i) => {
                    return i.id && item.id && i.id == item.id;
                });

                if (exists.length > 0) {
                    return;
                }
            }

            this.$emit('input', this.chips ? [...this.value, item] : item);



            !this.chips && this.$nextTick(() => {
                this.hide();
            });
        },
        resetInfiniteScroll() {
            this.$refs.infiniteScroll.reset();
            this.$nextTick(() => {
                this.$refs.infiniteScroll.resume();
            });
        },
        evalField(context, expression) {
            'use strict';
            let value = (new Function(...Object.keys(context), 'return ' + expression))(...Object.values(context));
            return value + '';
        }
    },
    render(createElement) {
        let hasSlot = this.$scopedSlots && this.$scopedSlots.default;
        let hasNotFoundSlot = this.$scopedSlots && this.$scopedSlots.noResults;
        return createElement(this.chips ? OdnChipsInput : QInput, {
                ref: 'input',
                props: {
                    value: this.viewValue,
                    stackLabel: this.stackLabel,
                    floatLabel: this.floatLabel,
                    placeholder: this.placeholder,
                    clearable: this.clearable,
                    color: this.color,
                    dark: this.dark,
                    before: this.before,
                    after: this.after,
                    inverted: this.inverted,
                    invertedLight: this.invertedLight,
                    hideUnderline: this.hideUnderline,
                    clearValue: this.clearValue,
                    error: this.error,
                    warning: this.warning,
                    disable: this.disable,
                    editable: false
                },
                on: {
                    input: (value) => {
                        !this.chips && (this.searchValue = this.viewValue = value) && this.startSearch();
                    },
                    chipInput: (value) => {
                        this.chips && (this.searchValue = value) && this.startSearch();
                    },
                    focus: () => {
                        this.onFocus();
                    },
                    remove: this.chips
                        ? (index) => {
                            let values = [...this.value];
                            values.splice(index, 1);
                            this.$emit('input', values);
                        }
                        : () => {
                        }
                }
            },
            [createElement(QPopover, {
                    ref: 'popover',
                    'class': this.dark ? 'bg-dark' : null,
                    props: {
                        fit: true,
                        keepOnScreen: true,
                        anchorClick: false,
                        maxHeight: this.maxHeight,
                        noFocus: true,
                        noRefocus: true,
                        disable: this.disable
                    },
                    on: {
                        hide: () => {
                            !this.chips && !this.value && this.viewValue && (this.searchValue = this.viewValue = '')
                        }
                    }
                },
                [
                    createElement(QList, {
                            props: {
                                dark: this.dark,
                                noBorder: true
                            },
                            style: {
                                'max-width': this.width,
                                'width': '100%',
                            }
                        },
                        [
                            createElement(QInfiniteScroll,
                                {
                                    ref: 'infiniteScroll',
                                    props: {
                                        handler: this.loadMore,
                                        offset: Number(this.maxHeight.replace(/\D/g, '')) / 2
                                    }
                                },
                                [
                                    ...this.list.map((result, index) => {
                                        let atributes = {
                                            key: result.id || index,
                                            'class': {
                                                'q-select-highlight': this.keyboardIndex === index
                                            },
                                            nativeOn: {
                                                mouseenter: () => {
                                                    (hasSlot || !hasSlot && !result.disable) && (this.keyboardIndex = index)
                                                },
                                                click: () => {
                                                    (hasSlot || !hasSlot && !result.disable) && this.selectItem(result)
                                                }
                                            }
                                        };

                                        if (!hasSlot) {
                                            atributes['class']['cursor-pointer'] = !result.disable;
                                            atributes['class']['text-faded'] = result.disable;
                                            atributes['props'] = {cfg: result};
                                        }

                                        return createElement(hasSlot ? QItem : QItemWrapper, atributes, hasSlot ? this.$scopedSlots.default(result) : []);
                                    }),
                                    this.searchValue.length >= Math.max(this.minCharacters, 1) && !this.isLoading && this.list.length === 0 ? (() => {
                                        let atributes = {
                                            'class': {
                                                'q-select-highlight': this.keyboardIndex === 0
                                            },
                                            nativeOn: {
                                                mouseenter: () => {
                                                    this.notFoundClick && (this.keyboardIndex = 0)
                                                },
                                                click: () => {
                                                    this.notFoundClick && this.notFoundClick(this.searchValue)
                                                }
                                            }
                                        };

                                        if (!hasNotFoundSlot) {
                                            atributes['props'] = {
                                                cfg: {
                                                    label: this.notFoundMsg
                                                }
                                            };
                                        }

                                        return createElement(hasNotFoundSlot ? QItem : QItemWrapper, atributes, hasNotFoundSlot ? this.$scopedSlots.noResults({text: this.searchValue}) : [])
                                    })() : null,
                                    this.isLoading ? createElement('div', {
                                            'class': {
                                                'row': true,
                                                'justify-center': true,
                                                'q-py-sm': true
                                            }
                                        },
                                        [
                                            createElement(QSpinner, {
                                                props: {
                                                    color: this.color
                                                }
                                            })
                                        ]) : null
                                ]
                            )
                        ]
                    )
                ]
            )]
        )

    }
};

export default Vue.component('OdnAutocomplete', autocomplete);
