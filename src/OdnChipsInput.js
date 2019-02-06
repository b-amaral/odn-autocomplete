import {QChip, QChipsInput, QIcon, QInputFrame} from 'quasar';
import Vue from 'vue';

const chipsInput = {
    name: 'OdnChipsInput',
    mixins: [QChipsInput],
    render(h) {
        return h(QInputFrame, {
            staticClass: 'q-chips-input',
            props: {
                prefix: this.prefix,
                suffix: this.suffix,
                stackLabel: this.stackLabel,
                floatLabel: this.floatLabel,
                error: this.error,
                warning: this.warning,
                disable: this.disable,
                readonly: this.readonly,
                inverted: this.inverted,
                invertedLight: this.invertedLight,
                dark: this.dark,
                hideUnderline: this.hideUnderline,
                before: this.before,
                after: this.after,
                color: this.color,
                noParentField: this.noParentField,
                focused: this.focused,
                length: this.length,
                additionalLength: this.input.length > 0
            },
            on: {click: this.__onClick}
        }, [
            h('div', {
                    staticClass: 'col row items-center q-input-chips'
                },
                this.model.map((label, index) => {
                    return h(QChip, {
                        key: `${label}#${index}`,
                        props: {
                            small: true,
                            closable: this.editable,
                            color: this.computedChipBgColor,
                            textColor: this.computedChipTextColor
                        },
                        attrs: {
                            tabindex: this.editable && this.focused ? 0 : -1
                        },
                        on: {
                            blur: this.__onInputBlur,
                            focus: this.__clearTimer,
                            hide: () => {
                                this.remove(index)
                            }
                        },
                        nativeOn: {
                            blur: this.__onInputBlur,
                            focus: this.__clearTimer
                        }
                    }, label)
                }).concat([
                    h('input', {
                        ref: 'input',
                        staticClass: 'col q-input-target',
                        'class': this.inputClasses,
                        domProps: {
                            value: this.input
                        },
                        attrs: Object.assign({}, this.$attrs, {
                            placeholder: this.inputPlaceholder,
                            disabled: this.disable,
                            readonly: this.readonly
                        }),
                        on: {
                            input: e => {
                                this.input = e.target.value;
                                this.$emit('chipInput', this.input);
                            },
                            focus: this.__onFocus,
                            blur: this.__onInputBlur,
                            keyup: this.__onKeyup
                        }
                    })
                ])),

            (this.isClearable && h(QIcon, {
                slot: 'after',
                staticClass: 'q-if-control',
                props: {
                    name: this.$q.icon.input[`clear${this.isInverted ? 'Inverted' : ''}`]
                },
                nativeOn: {
                    mousedown: this.__clearTimer,
                    touchstart: this.__clearTimer,
                    click: this.clear
                }
            })) || void 0
        ].concat(this.$slots.default
            ? h('div', {staticClass: 'absolute-full no-pointer-events', slot: 'after'}, this.$slots.default)
            : void 0
        ))
    }
};

export default Vue.component('OdnChipsInput', chipsInput);
