let display = document.getElementById('display');
let currentInput = '0';

function updateDisplay() {
    display.textContent = currentInput;
}

function clearDisplay() {
    currentInput = '0';
    updateDisplay();
}

function deleteLast() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

function appendToDisplay(value) {
    const lastChar = currentInput.slice(-1);
    
    if (currentInput === '0' && value !== '.') {
        currentInput = value;
    } else if (currentInput === 'Error') {
        currentInput = value;
    } else {
        if (value === '.') {
            if (!canAddDot(currentInput)) return;
        } else if (['+', '-', '×', '/'].includes(value)) {
            if (lastChar === '.') return;
            if (lastChar === '+' || lastChar === '-' || lastChar === '×' || lastChar === '/') return;
        }
        
        currentInput += value;
    }
    updateDisplay();
}

function canAddDot(input) {
    const operators = /[\+\-\*\/]/g;
    const lastOperatorIndex = input.search(operators);
    const lastPart = lastOperatorIndex >= 0 ? input.slice(lastOperatorIndex + 1) : input;
    
    const dotCount = (lastPart.match(/\./g) || []).length;
    return dotCount === 0;
}

function calculate() {
    try {
        let expression = currentInput.replace(/×/g, '*');
        let tokens = tokenize(expression);
        let result = evaluate(tokens);
        
        if (!isFinite(result)) {
            throw new Error('Invalid');
        }
        
        currentInput = String(Math.round(result * 100000000) / 100000000);
        
    } catch {
        currentInput = 'Error';
    }
    updateDisplay();
}

function tokenize(expression) {
    const tokens = [];
    let number = '';
    
    for (let i = 0; i < expression.length; i++) {
        const char = expression[i];
        if ('0123456789.'.includes(char)) {
            number += char;
        } else if ('+-*/'.includes(char)) {
            if (number) {
                tokens.push(parseFloat(number));
                number = '';
            }
            tokens.push(char);
        }
    }
    if (number) tokens.push(parseFloat(number));
    
    return tokens;
}

function evaluate(tokens) {
    for (let i = tokens.length - 1; i > 0; i--) {
        if (tokens[i - 1] === '*' || tokens[i - 1] === '/') {
            let a = tokens[i - 2];
            let op = tokens[i - 1];
            let b = tokens[i];
            
            let result = op === '*' ? a * b : a / b;
            tokens.splice(i - 2, 3, result);
            i -= 2;
        }
    }
    
    for (let i = tokens.length - 1; i > 0; i--) {
        if (tokens[i - 1] === '+' || tokens[i - 1] === '-') {
            let a = tokens[i - 2];
            let op = tokens[i - 1];
            let b = tokens[i];
            
            let result = op === '+' ? a + b : a - b;
            tokens.splice(i - 2, 3, result);
            i -= 2;
        }
    }
    
    return tokens[0];
}

document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    if (key >= '0' && key <= '9') {
        appendToDisplay(key);
    } else if (key === '.') {
        appendToDisplay('.');
    } else if (key === '+') {
        appendToDisplay('+');
    } else if (key === '-') {
        appendToDisplay('-');
    } else if (key === '*') {
        appendToDisplay('×');
    } else if (key === '/') {
        appendToDisplay('/');
    } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        clearDisplay();
    } else if (key === 'Backspace') {
        deleteLast();
    }
});

updateDisplay();