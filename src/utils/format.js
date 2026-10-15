export const formatMoney = (v) => {
  const num = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.')) || 0;
  return 'R$ ' + num.toFixed(2).replace('.', ',');
};

export const formatPhone = (val) => {
  const d = String(val || '').replace(/\D/g, '').slice(0, 11);
  if (d.length > 10) return d.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
  if (d.length > 6) return d.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
  if (d.length > 2) return d.replace(/^(\d{2})(\d*)/, '($1) $2');
  return d;
};
