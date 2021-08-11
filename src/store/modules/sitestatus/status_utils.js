
const parseTrueFalse = s => {
  if (undefined == s) {
    return false;
  }
  if (typeof s === "boolean") {
    return s
  }
  else if (s.toLowerCase() == "true") { return true }
  else if (s.toLowerCase() == "false") { return false }
  return false
}

const display_colors = {
  red: "orangered",
  yellow: "yellow",
  green: "greenyellow",
  missing: "grey",
}

export {
  parseTrueFalse,
  display_colors,
}