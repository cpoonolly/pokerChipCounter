function round(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

function formatChipsText(chips) {
  if (chips > 10E9) {
    return `$${round(chips / 10E9, 1)}B`;
  } else if (chips > 10E6) {
    return `$${round(chips / 10E6, 1)}M`;
  } else if (chips > 10E3) {
    return `$${round(chips / 10E3, 1)}k`;
  } else {
    return `$${round(chips, 1)}`;
  }
}

export { round, formatChipsText }