$(window).on('load', prepSvg);

/**
 * Hook up javascript for interactivity.
 */
function prepSvg() {
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
    $(getSubtree(tgl)).addClass('subtree');
  }
  // hide all tooltips
  $(svg).find('.tooltip').
      get(0).transform.baseVal.clear();
  // enable tooltips
  $(svg).find('.inform').hover(showTooltip, hideTooltip);
  window.setTimeout(function() {
    $('#loading').css('display', 'none');
    $('#test-choice').addClass('loaded');
    $.scrollTo($(svg).find('#root'));
  }, 600);
}

/**
 * Toggle the display of sub-trees in the diagram based
 * on which node has received a click event
 *
 * @param {Event} event The event that triggered the callback.
 */
function toggleSubtree(event) {
  const target = getSubtree(event.target);
  toggle(target);
  if ($(target).is('.visible')) {
    const focus = $(target).children('g').first().children('.choice').first();
    $.scrollTo(focus, 300, {
      over: {left: 0.5, top: 0.5},
      offset: {
        left: -$(window).width() / 2,
        top: -$(window).height() / 2},
    });
  }
}

/**
 * Toggle the visibility of a subtree
 * @param {Element} subtree
 */
function toggle(subtree) {
  $(subtree).toggleClass('visible');
}

/**
 * Get embedded SVG object
 * @return {Object} SVG object
 */
function getSvg() {
  return $('#test-choice').contents().find('svg')[0];
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
  $(svg).find('#' + id).css('display', 'block').removeClass('visible').
      one('transitionend', function(event) {
        $(event.target).css('display', '');
      });
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
  if (isVisible(target)) {
    const id = target.dataset.tooltip;
    const tooltip = $(svg).find('#' + id).css('display', 'block');
    const translation = getTranslation(tooltip.get(0), target);
    tooltip.get(0).transform.baseVal.appendItem(translation);
    tooltip.addClass('visible');
    tooltip.get(0).transform.baseVal.consolidate();
    tooltip.css('display', '');
  }
}

/**
 * Test whether an element on the page is visible. Elements
 * with obacity 0 or visibility 'hidden' are not considered to be
 * visible.
 * @param {Element} elem An element to be tested for visibility.
 * @return {Boolean}
 */
function isVisible(elem) {
  if (!$(elem).is(':visible') ||
      $(elem).css('opacity') == 0 ||
      $(elem).css('visibility') == 'hidden') {
    return false;
  }
  if ($(elem).is('svg')) {
    return true;
  }
  return isVisible(elem.parentElement);
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
