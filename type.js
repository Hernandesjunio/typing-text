function typingJS(options) {
  const createStyle = () => {
    if (document.querySelector("#typingStyle")) return;
    const css = `.hide-element-typing{opacity:0;font-size:20px}.show-element-typing{opacity:1;transition:opacity .3s;font-size:20px}.cursor-typing{position:absolute;color:transparent}.cursor-typing:before{content:".";width:4px;height:10px;background-color:green;color:green;animation:cursor .8s infinite}@keyframes cursor{0%{opacity:1}50%{opacity:0}100%{opacity:1}}`;
    const $style = document.createElement("style");
    $style.innerHTML = css;
    $style.id = "typingStyle";
    document.head.appendChild($style);
  };

  const processText = (element) => {
    let index = 0;
    const wrapChar = (char) => `<span class="hide-element-typing char">${char}</span>`;
    const replaceHtmlSymbols = (text) => text.replace(/&\w+;/g, (c) => wrapChar(c));

    const split = replaceHtmlSymbols(element.innerHTML).split("");

    const hasSplitElements = () => index < split.length;

    const skipTag = () => {
      const isNotTagOpening = () => split[index] != "<";
      const isTagClosing = () => split[index - 1] == ">";

      if (isNotTagOpening()) return;

      while (hasSplitElements()) {
        index++;
        if (isTagClosing()) break;
      }
    };

    const skipHtmlOpeningClosingSymbols = () => {
      const isNotHtmlOpeningTagSymbol = () => split.slice(index - 1, index + 1).join("") != ">&";

      const isNotHtmlClosingTagSymbol = () => split.slice(index - 1, index + 1).join("") != ";<";

      if (isNotHtmlOpeningTagSymbol()) return;

      while (hasSplitElements() && isNotHtmlClosingTagSymbol()) {
        index++;
      }
    };

    const processArray = () => {
      const isOpeningTag = () => split[index] == "<";

      while (hasSplitElements() && !isOpeningTag()) {
        split[index] = wrapChar(split[index]);
        index++;
      }
    };

    if (element.classList.contains("typing-ready")) return;

    element.classList.add("typing-ready");

    const steps = [skipTag, skipHtmlOpeningClosingSymbols, processArray];

    while (hasSplitElements()) {
      steps.forEach((stepFn) => stepFn());
    }

    element.innerHTML = split.join("");
  };

  function processHiddenElements(cursorElement, options) {
    let index = 0;
    const hiddenElements = [...document.querySelectorAll(".hide-element-typing")].filter((c) => c.innerText.length);

    const currentHiddenElement = () => hiddenElements[index];

    const calculateDelayTime = () => {
      const result = [
        {
          keyFn: () => index == 0,
          value: 1000,
        },
        {
          keyFn: () => currentHiddenElement().innerText.trim().length == 0,
          value: 0,
        },
        {
          keyFn: () => currentHiddenElement().classList.contains(options.typingDelaySpeedClass),
          value: options.typingDelaySpeed,
        },
        { keyFn: () => true, value: 20 },
      ].find((truthy) => truthy.keyFn());

      return result.value;
    };

    const setCursorOnLastElementCharacter = () => {
      const lastElement = hiddenElements.filter((c) => c.classList.contains("char")).slice(-1)[0];

      lastElement.append(cursorElement);

      cursorElement.setAttribute("style", `top:auto;left:auto;position:absolute;opacity:1`);
    };

    (function removeClass() {
      if (index == hiddenElements.length) {
        setCursorOnLastElementCharacter();
        options.callback();
        return;
      }

      let time = calculateDelayTime();

      setCursorPosition(currentHiddenElement(), cursorElement);
      currentHiddenElement().classList.add("show-element-typing");

      setTimeout(() => {
        index++;
        removeClass();
      }, time);
    })();
  }

  const setCursorPosition = (element, cursorElement) => {
    const offsetY = 2 + window.scrollY,
      offsetX = 8 + window.scrollX;

    if (!element.classList.contains("char")) return;

    const { x, y } = element.getBoundingClientRect();

    cursorElement.setAttribute("style", `top:${y + offsetY}px;left:${x + offsetX}px;opacity:1`);
  };

  const setClassDeepElements = (element, tagNames) => {
    for (let child of element.children || []) {
      setClassDeepElements(child, tagNames);
    }

    element.classList.contains("hide-element-typing") === false && element.classList.add("hide-element-typing");
    element.classList.contains("show-element-typing") && element.classList.remove("show-element-typing");

    tagNames.includes(element.tagName) && element.classList.add("char");
  };

  createCursor = () => {
    const cursor = document.createElement("span");
    cursor.classList.add("cursor-typing", "hide-element-typing");
    cursor.innerText = ".";
    document.body.append(cursor);
    return cursor;
  };

  getCursor = () => {
    const cursor = document.querySelector(".cursor-typing");
    cursor && cursor.parentNode.removeChild(cursor);
    return createCursor();
  };

  options = options || {};
  const defaultOptions = {
    typingDelaySpeedClass: "stop",
    containerSelector: ".container-typing",
    speedTypingMillisecond: 20,
    typingDelaySpeed: 500,
    tagNamesToHide: ["LI"],
    callback: () => {},
  };

  options = { ...defaultOptions, ...options };

  const containersElements = [options.containerSelector].flat().map((selector) => ({
    selector: selector,
    element: document.querySelector(selector),
  }));

  const invalidSelector = containersElements.find((d) => !d.element);

  if (invalidSelector)
    throw new Error(
      `Property 'containerSelector' doesn't contains a valid element selector for ${invalidSelector.selector}`
    );

  containersElements.forEach((container) => container.element.classList.add("hide-element-typing"));

  if (typeof typingJS.executing == "undefined") typingJS.executing = false;

  const proxy = options.callback;

  options.callback = () => {
    typingJS.executing = false;
    proxy();
  };

  createStyle();

  const step1 = (ctx) => (ctx.cursorElement = getCursor());
  const step2 = () =>
    containersElements.forEach((container) => setClassDeepElements(container.element, options.tagNamesToHide));
  const step3 = () => containersElements.forEach((container) => processText(container.element));
  const step4 = (ctx) => processHiddenElements(ctx.cursorElement, options);

  const chainOfResponsability = {
    steps: [step1, step2, step3, step4],
    context: {},
    execute: function () {
      this.steps.forEach((stepFn) => {
        stepFn(this.context);
      });
    },
  };

  const executeFn = () => {
    if (typingJS.executing) {
      console.warn("Already executing");
      return;
    }

    typingJS.executing = true;

    chainOfResponsability.execute();
  };
  return { execute: executeFn };
}
