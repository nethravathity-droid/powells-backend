const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }
  return digits;
}

function isValidEmail(email) {
  return emailRegex.test(String(email || "").trim());
}

function isValidPhone(phone) {
  return /^[0-9]{10}$/.test(normalizePhone(phone));
}

module.exports = { normalizePhone, isValidEmail, isValidPhone };
