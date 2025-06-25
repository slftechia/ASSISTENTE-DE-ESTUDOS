function removeAcentos(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function removeAcentosLower(str) {
  return removeAcentos(str).toLowerCase();
}

module.exports = {
  removeAcentos,
  removeAcentosLower
}; 