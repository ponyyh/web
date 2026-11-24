const displayEl = document.getElementById("display");
const expressionEl = document.getElementById("expression");

const state = {
  display: "0",
  stored: null,
  operator: null,
  waiting: false,
  expression: "",
};

const symbols = { "+": "+", "-": "−", "*": "×", "/": "÷" };

function format(value) {
  if (!Number.isFinite(value)) return "错误";
  const text = String(value);
  if (text.length <= 12) return text;
  return Number(value.toPrecision(10)).toString();
}

function render() {
  displayEl.textContent = state.display;
  expressionEl.textContent = state.expression;
}

function inputDigit(digit) {
  if (state.display === "错误") reset();
  if (state.waiting) {
    state.display = digit;
    state.waiting = false;
    return;
  }
  state.display = state.display === "0" ? digit : state.display + digit;
}

function inputDecimal() {
  if (state.display === "错误") reset();
  if (state.waiting) {
    state.display = "0.";
    state.waiting = false;
    return;
  }
  if (!state.display.includes(".")) state.display += ".";
}

function setOperator(next) {
  if (state.display === "错误") return;
  const current = Number(state.display);
  if (state.operator && !state.waiting) {
    const result = calculate(state.stored, current, state.operator);
    state.display = format(result);
    state.stored = Number.isFinite(result) ? result : null;
  } else {
    state.stored = current;
  }
  state.operator = next;
  state.waiting = true;
  state.expression = `${format(state.stored)} ${symbols[next]}`;
}

function equals() {
  if (state.operator === null || state.waiting || state.display === "错误") return;
  const current = Number(state.display);
  const result = calculate(state.stored, current, state.operator);
  state.expression = `${format(state.stored)} ${symbols[state.operator]} ${state.display} =`;
  state.display = format(result);
  state.stored = null;
  state.operator = null;
  state.waiting = true;
}

function calculate(left, right, operator) {
  if (operator === "+") return left + right;
  if (operator === "-") return left - right;
  if (operator === "*") return left * right;
  if (operator === "/" && right === 0) return NaN;
  if (operator === "/") return left / right;
  return right;
}

function clearAll() {
  reset();
}

function reset() {
  state.display = "0";
  state.stored = null;
  state.operator = null;
  state.waiting = false;
  state.expression = "";
}

function toggleSign() {
  if (state.display === "错误" || state.display === "0") return;
  state.display = state.display.startsWith("-")
    ? state.display.slice(1)
    : `-${state.display}`;
}

function percent() {
  if (state.display === "错误") return;
  state.display = format(Number(state.display) / 100);
}

document.querySelector(".keys").addEventListener("click", (event) => {
  const key = event.target.closest("button");
  if (!key) return;
  const action = key.dataset.action;

  if (action === "digit") inputDigit(key.dataset.value);
  if (action === "decimal") inputDecimal();
  if (action === "operator") setOperator(key.dataset.value);
  if (action === "equals") equals();
  if (action === "clear") clearAll();
  if (action === "sign") toggleSign();
  if (action === "percent") percent();
  render();
});

document.addEventListener("keydown", (event) => {
  if (/^[0-9]$/.test(event.key)) inputDigit(event.key);
  else if (event.key === ".") inputDecimal();
  else if (["+", "-", "*", "/"].includes(event.key)) setOperator(event.key);
  else if (event.key === "Enter" || event.key === "=") equals();
  else if (event.key === "Escape") clearAll();
  else if (event.key === "Backspace") {
    if (state.waiting || state.display === "错误") return;
    state.display = state.display.length > 1 ? state.display.slice(0, -1) : "0";
    if (state.display === "-") state.display = "0";
  } else {
    return;
  }
  event.preventDefault();
  render();
});

render();
