

// Contructor function 
function Validator(obj) {

    //  Các rule liên quan đến một input sẽ nằm trong mảng là value của một key là id của thẻ input cần kiểm tra
    var inputRules = {}

    // Hàm lấy ra thẻ cha của inputElement khớp với selector được truyền vào
    function getParentElement(inputElement, selector) {
        while (inputElement.parentElement) {
            if (inputElement.parentElement.matches(selector)) {
                return inputElement.parentElement
            }
            inputElement = inputElement.parentElement
        }
    }

    // Xóa bỏ class Invalid ở thẻ cha của inputElement
    function removeInvalid(inputElement) {
        var parentElement = getParentElement(inputElement, '.form-group')
        // console.log(parentElement)
        parentElement.querySelector('.form-message').innerText = ''
        parentElement.classList.remove('invalid')    
    }

    // Hàm thực hiện validate trường dữ liệu inputElement (có thể tồn tại nhiều rule trên một inputElement)
    function validate(inputElement, rule) {       
        // console.log(inputElement)
        var rules = inputRules[rule.selector]
        var errorMessage = ''
        for(var i = 0; i < rules.length; ++i) {
           switch(inputElement.type) {
                case 'checkbox':
                case 'radio':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'))
                    break;  
                default:
                    errorMessage = rules[i](inputElement.value)
                    break;
           }
            if (errorMessage) break;
        } 

        if (errorMessage) {
            var errorElement = getParentElement(inputElement, '.form-group').querySelector('.form-message')    
            console.log(errorElement)
            if (errorElement) {
                errorElement.innerText = errorMessage
                getParentElement(inputElement, '.form-group').classList.add('invalid')
            } 
        } 
        else {
            removeInvalid(inputElement)
        }

        return !errorMessage
    }

    // Lấy ra form cần validate
    var formElement = document.querySelector(obj.form)
    if (formElement) {

        // Khi submit form
        formElement.onsubmit = (e) => {
            e.preventDefault()

            // Duyệt lại từng rule kiểm tra trường nào còn thiếu
            let isValidate = true
            obj.rules.forEach((rule) => {
                var inputElements = formElement.querySelectorAll(rule.selector)
                Array.from(inputElements).forEach((inputElement) => {
                    if (inputElement) {
                        isValidate = validate(inputElement, rule)
                        if (!isValidate) {
                            isValidate = false
                        }
                    }
                })
            })

            if (isValidate) {
                let inputElements = formElement.querySelectorAll('[name]')
                let formValues = Array.from(inputElements).reduce((values, input) => {
                    switch(input.type) {
                        case 'checkbox':     
                            values[input.name] = []
                            var checkboxChecked = formElement.querySelectorAll('input[name="' + input.name + '"]' + ':checked')
                            Array.from(checkboxChecked).forEach((element) => {
                                values[input.name].push(element.value)
                            })
                            break;
                        case 'radio':
                            let elementChecked = formElement.querySelector('input[name="' + input.name + '"]' + ':checked')
                            if (elementChecked) {
                                values[input.name] = elementChecked.value
                            } else {
                                values[input.name] = ''
                            }
                            break;
                        default:
                            values[input.name] = input.value
                    }
                    return values
                }, {})

                obj.onSubmit(formValues)
            } else {
                console.log('Absent of essential data !!')
            }
        }

        // Duyệt qua từng rule trong obj.rules và thực hiện validate
        obj.rules.forEach((rule) => {
            var inputElements = formElement.querySelectorAll(rule.selector)

            Array.from(inputElements).forEach((inputElement) => {
                if (inputElement) {
                    // Lưu lại các rule cho mỗi input 
                    if(Array.isArray(inputRules[rule.selector])) {
                        inputRules[rule.selector].push(rule.test)
                    } else {
                        inputRules[rule.selector] = [rule.test]
                    }
        
                     // Xử lý trường hợp blur ra khỏi input
                    inputElement.onblur = () => {
                        validate(inputElement, rule)
                    }
    
                    // Xư lý mỗi khi ngươi dùng nhập input
                    inputElement.oninput = () => {
                        removeInvalid(inputElement)
                    }
                } else {
                    console.error(`không tìm thấy selector ${rule.selector}`)
                }
            })
        });
    } else {
        console.error(`${obj.form} không tồn tại`)
    }
}

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
            var regex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/
            return regex.test(value) ? undefined : message || 'Trường này phải là email'
        }
    }
}

Validator.minLengthPassword = (selector, min, message) => {
    return {
        selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Mật khẩu phải có ít nhất ${min} kí tự`
        }
    }
}

Validator.isPasswordConfirmed = (selector, confirmValue, message) => {
    return {
        selector,
        test: function (value) {
            return value === confirmValue() && value != '' ? undefined : message || 'Mật khẩu nhập lại không chính xác'
        }
    }
}

