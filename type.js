function processarTexto(element) {
  const texto = element.innerHTML;
  const split = texto.split("");
  const wrapChar = (char) => `<span class="hide char">${char}</span>`;
  let index = 0;

  const pularTag = () => {
    if (split[index] != "<") return;

    while (index < split.length) {
      if (split[index] == ">") break;
      index++;
    }

    index++;
  };

  const processarArray = () => {
    const texto = [];
    while (index < split.length) {
      if (split[index] == "<") {
        break;
      }
      split[index] = wrapChar(split[index]);
      index++;
    }
    return texto.join("");
  };

  while (index < split.length) {
    pularTag();
    processarArray();
  }

  const caracteresTransformados = split.join("");
  element.innerHTML = caracteresTransformados;
}

function processarHiddenElements(cursorElement) {
  var hiddenElements = [...document.querySelectorAll(".hide")].filter(
    (c) => c.innerText.length
  );
  let index = 0;

  var currentHiddenElement = () => hiddenElements[index];
  var calcStop = () => {
    const result = [
      {
        keyFn: () => currentHiddenElement().innerText.trim().length == 0,
        value: 0,
      },
      {
        keyFn: () => currentHiddenElement().classList.contains("stop"),
        value: 500,
      },
      { keyFn: () => true, value: 10 },
    ].find((truthy) => truthy.keyFn());
    return result.value;
  };

  const setCursorLastCharElement = () => {
    hiddenElements
      .filter((c) => c.classList.contains("char"))
      .slice(-1)[0]
      .append(cursorElement);

    cursorElement.setAttribute("style", `top:auto;left:auto;position:relative`);
  };
  function removeClass() {
    if (index == hiddenElements.length) {
      setCursorLastCharElement();
      return;
    }
    let time = calcStop();

    currentHiddenElement().classList.add("show");
    setCursorPosition(currentHiddenElement(), cursorElement);
    setTimeout(() => {
      index++;
      removeClass();
    }, time);
  }

  removeClass();
}

function setCursorPosition(element, cursorElement) {
  const offsetY = 2,
    offsetX = 8;
  if (!element.classList.contains("char")) return;

  const {
    x = Math.ceil(x),
    y = Math.ceil(y),
  } = element.getBoundingClientRect();

  cursorElement.setAttribute(
    "style",
    `top:${y + offsetY}px;left:${x + offsetX}px`
  );
}

function setClassDeepElements(element, tagNames) {
  for (var child of element.children || []) {
    setClassDeepElements(child, tagNames);
  }
  element.classList.add("hide");

  if (tagNames.includes(element.tagName)) {
    element.classList.add("char");
  }
}

(function () {
  var tagNames = ["LI"];
  const cursor = document.querySelector(".cursor-typing");
  const container = document.querySelector(".container-typing");

  setClassDeepElements(container, tagNames);
  processarTexto(container);
  processarHiddenElements(cursor);
})();
