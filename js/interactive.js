window.onload = function() {
  const svg = getSvg();
  // add stylesheet
  const styleLink = svg.parentNode.createProcessingInstruction('xml-stylesheet',
      'href="../css/svg_style.css" type="text/css"');
  svg.parentNode.insertBefore(styleLink, svg);

  // setup interactivity
  const toggles = svg.getElementsByClassName('toggle');
  for (const tgl of toggles) {
    // Add callbacks for toggle elements
    tgl.addEventListener('click', toggleSubtree);
    // hide all subtrees
    toggle(getSubtree(tgl));
  }
  // hide all tooltips
  $(svg).find('.tooltip').
      get(0).transform.baseVal.clear();
  // enable tooltips
  $(svg).find('.inform').hover(showTooltip, hideTooltip);
  $.scrollTo($(svg).find('#root'));
};

/**
 * Toggle the display of sub-trees in the diagram based
 * on which node has received a click event
 *
 * @param {Event} event The event that triggered the callback.
 */
function toggleSubtree(event) {
  const target = getSubtree(event.target);
  toggle(target);
  if (target.style.display === 'block') {
    $.scrollTo(target, 300, {
      over: {left: 0.5, top: 0.5},
      offset: {left: -$(window).width() / 2, top: -$(window).height() / 2},
    });
  }
}

/**
 * Toggle the visibility of a subtree
 * @param {Element} subtree
 */
function toggle(subtree) {
  if (subtree.style.display === 'none') {
    subtree.style.display = 'block';
  } else {
    subtree.style.display = 'none';
  }
}

/**
 * Get embedded SVG object
 * @return {Object} SVG object
 */
function getSvg() {
  const obj = document.getElementById('test-choice');
  const doc = obj.contentDocument || obj.contentWindow.document;
  return doc.getElementsByTagName('svg')[0];
}

/**
 * Obtain a subtree of the diagram attached to a toggle node
 * @param {Element} target Target of a user interaction to toggle visibility
 *    of a subtree.
 * @return {Element} The subtree attached to the toggle.
 */
function getSubtree(target) {
  const svg = getSvg();
  while (target.getAttribute('class') !== 'toggle' && target != svg) {
    target = target.parentElement;
  }
  const subId = target.dataset.subtree;
  return svg.getElementById(subId);
}

/**
 * Hide tooltip
 * @param {Event} event Event that triggered tooltip display
 */
function hideTooltip(event) {
  const svg = getSvg();
  let target = event.target;
  while (! $(target).is('g.inform') && target != svg) {
    target = target.parentElement;
  }
  const id = target.dataset.tooltip;
  $(svg).find('#' + id).removeClass('visible');
}

/**
 * Show and position tooltip
 * @param {Event} event Event that triggered tooltip display
 */
function showTooltip(event) {
  const svg = getSvg();
  let target = event.target;
  while (! $(target).is('g.inform') && target != svg) {
    target = target.parentElement;
  }
  const id = target.dataset.tooltip;
  const tooltip = $(svg).find('#' + id);
  const translation = getTranslation(tooltip.get(0), target);
  tooltip.get(0).transform.baseVal.appendItem(translation);
  tooltip.addClass('visible');
  tooltip.get(0).transform.baseVal.consolidate();
}

/**
 * Obtain translation required to position obj next to target.
 * @param {Element} obj The element to be moved
 * @param {Element} target The element in the target area
 *
 * @return {SVGTransform} x and y coordinates of translation
 */
function getTranslation(obj, target) {
  const objPos = obj.getBoundingClientRect();
  const targetPos = target.getBoundingClientRect();
  const svg = getSvg();
  const ptObj = svg.createSVGPoint();
  ptObj.x = objPos.right;
  ptObj.y = objPos.bottom;
  const ptTarget = svg.createSVGPoint();
  ptTarget.x = targetPos.left + 0.25 * targetPos.width;
  ptTarget.y = targetPos.top + 0.25 * targetPos.height;

  const svgPtObj = ptObj.matrixTransform(target.getScreenCTM().inverse());
  const svgPtTarget = ptTarget.matrixTransform(target.getScreenCTM().inverse());

  const translation = svg.createSVGTransform();
  translation.setTranslate(
      svgPtTarget.x - svgPtObj.x,
      svgPtTarget.y - svgPtObj.y);
  return translation;
}
