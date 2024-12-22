
// Đối tượng `Validator`
function Validator(options) {

    // Hàm thực hiện lấy ra thẻ cha của nó
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    var selectorRules = {}

    // Hàm thực hiện validate các trường dữ liệu
    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage = rule.test(inputElement.value)

        // Lấy qua các rule của selector    
        var rules = selectorRules[rule.selector]

        // Lặp qua từng rule và kiểm tra
        // Nếu có lỗi thì dừng việc kiểm tra
        for (var i = 0; i < rules.length; ++i) {
            switch (inputElement.type) {
                case 'checkbox':
                case 'radio':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'))
                    break;
                default:
                    errorMessage = rules[i](inputElement.value)
            }
            if (errorMessage) break
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        } else {
            errorElement.innerText = ''
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }

        return !errorMessage
    }

    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form)
    if (formElement) {
        // Khi submit
        formElement.onsubmit = (e) => {
            e.preventDefault()

            var isFormValid = true;

            // Thực hiện lặp qua từng rule và validate
            options.rules.forEach((rule) => {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if(!isValid) {
                    isFormValid = false
                }
            })

            if (isFormValid) {
                // Trường hợp submit với javascript
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]')
                    var formValues = Array.from(enableInputs).reduce((values, input) => {
                        switch(input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                                break;
                            case 'checkbox':
                                if(!input.matches(':checked')) {
                                    values[input.name] = ''
                                    return values;
                                }
                                
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                } 
                                values[input.name].push(input.value)
                                break;
                            case 'file':
                                values[input.name] = input.files    
                                break;
                            default: 
                                values[input.name] = input.value
                        }
                        return values
                    }, {})

                    options.onSubmit({
                        formValues
                    })
                }
            } else {
                console.error('Absent of essential input data !!')
            }
        }

        // Lặp qua mỗi rule và xử lý( lắng nghe sự kiện onblur, oninput)
        options.rules.forEach((rule) => {
            
            // Lưu lại các rule cho mỗi input 
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }

            var inputElements = formElement.querySelectorAll(rule.selector)
            console.log(inputElements)

            Array.from(inputElements).forEach((inputElement) => {
                if (inputElement) {
                    // Xử lý trường hợp blur khỏi input
                    inputElement.onblur = function () {
                        validate(inputElement, rule)
                    }

                    // Xử lý mỗi khi người dùng nhập vào input
                    inputElement.oninput = function () {
                        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                        errorElement.innerText = ''
                        getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                    }
                }
            })
        });
    } else {
        console.log(`${formElement} do not exist !!`)
    }
}

// Định nghĩa các rules
// Nguyên tắc của các rule
// 1. Khi có lỗi => trả ra mesage lỗi
// 2. Khi hợp lệ => Không trả ra gì cả (undefined)
Validator.isRequired = function (selector, message) {
    return {
        selector,
        test: function (value) {
            return value ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = function (selector, message) {
    return {
        selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message || 'Trường này phải là email'
        }
    }
}

Validator.minLength = function (selector, min, message) {
    return {
        selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự`
        }
    }
}

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    }
}