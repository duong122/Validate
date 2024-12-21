

function Validator(options) {

    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form)
    
    if(formElement) {
        
        

    } else {
        console.error('Không có form')
    }
    
}

Validator.isRequired = function(selector) {

}

Validator.isEmail = function(selector) {

}
