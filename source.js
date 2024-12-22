

// Contructor function 
function Validator(obj) {

    // Xóa bỏ class Invalid ở thẻ cha của inputElement
    function removeInvalid(inputElement) {
        var parentElement = inputElement.parentElement
        parentElement.querySelector('.form-message').innerText = ''
        parentElement.classList.remove('invalid')
    }

    // Hàm thực hiện validate trường dữ liệu inputElement
    function validate(inputElement, rule) {
        var errorMessage = rule.test(inputElement.value)
        if (errorMessage) {
            var errorElement = inputElement.parentElement.querySelector('.form-message')
            if (errorElement) {
                errorElement.innerText = errorMessage
                inputElement.parentElement.classList.add('invalid')
            }
        } 
        else {
            removeInvalid(inputElement)
        }
        return !errorMessage
    }

    var formElement = document.querySelector(obj.form)
    if (formElement) {

        // Khi submit form
        formElement.onsubmit = (e) => {
            e.preventDefault()

            // Duyệt lại từng rule kiểm tra trường nào còn thiếu
            let isValidate = true
            obj.rules.forEach((rule) => {
                var inputElement = formElement.querySelector(rule.selector)
                if (inputElement) {
                    isValidate = validate(inputElement, rule)
                    if (!isValidate) {
                        isValidate = false
                    }
                }
            })

            if (isValidate) {
                let inputElements = formElement.querySelectorAll('[name]')
                let formValues = Array.from(inputElements).reduce((values, input) => {
                    values[input.name] = input.value
                    return values
                }, {})

                obj.onSubmit(formValues)
            } else {
                console.log('Absent of essential data !!')
            }
        }

        // Duyệt qua từng rule trong obj.rules và thực hiện validate
        obj.rules.forEach((rule) => {
            var inputElement = formElement.querySelector(rule.selector)
            if (inputElement) {
                 // Xư lý trường hợp blur ra khỏi input
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
        });
    } else {
        console.error(`${obj.form} không tồn tại`)
    }
}

Validator.isRequired = function (selector) {
    return {
        selector,
        test: function (value) {
            return value ? undefined : 'Vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = function (selector) {
    return {
        selector,
        test: function (value) {
            var regex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/
            return regex.test(value) ? undefined : 'Trường này phải là email'
        }
    }
}

Validator.minLengthPassword = (selector, min) => {
    return {
        selector,
        test: function (value) {
            return value.length >= min ? undefined : `Mật khẩu phải có ít nhất ${min} kí tự`
        }
    }
}

Validator.isPasswordConfirmed = (selector, confirmValue) => {
    return {
        selector,
        test: function (value) {
            return value === confirmValue() && value != '' ? undefined : 'Mật khẩu nhập lại không chính xác'
        }
    }
}

