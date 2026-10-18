const display = document.getElementById("display");

let expression = "";
let justCalculated = false;

function updateDisplay() {
    display.value = expression || "0";
}

function addValue(value) {
    if (justCalculated) {
        if (/^[0-9.]$/.test(value)) {
            expression = "";
        }
        justCalculated = false;
    }

    expression += value;
    updateDisplay();
}

function clearAll() {
    expression = "";
    justCalculated = false;
    updateDisplay();
}

function deleteLast() {
    expression = expression.slice(0, -1);
    justCalculated = false;
    updateDisplay();
}

function squareValue() {
    if (!expression) return;
    expression = "(" + expression + ")^2";
    justCalculated = false;
    updateDisplay();
}

function changeSign() {
    if (!expression) {
        expression = "-";
    } else {
        expression = "-(" + expression + ")";
    }
    justCalculated = false;
    updateDisplay();
}

function safeMath(input) {
    let exp = input
        .replace(/π/g, "Math.PI")
        .replace(/\^/g, "**");

    // Calculate scientific functions from the innermost brackets.
    const functionPattern = /\b(sin|cos|tan|sqrt|log|ln)\(([^()]*)\)/;

    while (functionPattern.test(exp)) {
        exp = exp.replace(functionPattern, (match, fn, arg) => {
            const value = safeMath(arg);

            switch (fn) {
                case "sin":
                    return Math.sin(value * Math.PI / 180);
                case "cos":
                    return Math.cos(value * Math.PI / 180);
                case "tan":
                    return Math.tan(value * Math.PI / 180);
                case "sqrt":
                    return Math.sqrt(value);
                case "log":
                    return Math.log10(value);
                case "ln":
                    return Math.log(value);
            }
        });
    }

    // Only allow mathematical characters and Math.PI.
    const cleaned = exp.replace(/Math\.PI/g, "P");

    if (!/^[0-9+\-*/().\sP]*$/.test(cleaned)) {
        throw new Error("Invalid expression");
    }

    if (/\bP\b/.test(cleaned)) {
        exp = exp.replace(/Math\.PI/g, "(" + Math.PI + ")");
    }

    return Function('"use strict"; return (' + exp + ')')();
}

function calculate() {
    if (!expression) return;

    try {
        const result = safeMath(expression);

        if (!Number.isFinite(result)) {
            throw new Error("Invalid result");
        }

        expression = String(Number(result.toPrecision(12)));
        updateDisplay();
        justCalculated = true;
    } catch (error) {
        display.value = "Invalid Expression";
        expression = "";
        justCalculated = false;
    }
}

document.querySelectorAll("[data-value]").forEach(button => {
    button.addEventListener("click", () => {
        addValue(button.dataset.value);
    });
});

document.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", () => {
        const action = button.dataset.action;

        if (action === "clear") clearAll();
        if (action === "delete") deleteLast();
        if (action === "square") squareValue();
        if (action === "sign") changeSign();
        if (action === "calculate") calculate();
    });
});

document.addEventListener("keydown", event => {
    if (/^[0-9.+\-*/()]$/.test(event.key)) {
        addValue(event.key);
    } else if (event.key === "Enter" || event.key === "=") {
        calculate();
    } else if (event.key === "Backspace") {
        deleteLast();
    } else if (event.key === "Escape") {
        clearAll();
    }
});

updateDisplay();