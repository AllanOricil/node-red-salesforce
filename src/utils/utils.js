function isValidSalesforceId(id) {
  if (typeof id !== 'string') {
    return false;
  }
  const validIdPattern = /^[a-zA-Z0-9]{15}$|^[a-zA-Z0-9]{18}$/;
  return validIdPattern.test(id);
}

export { isValidSalesforceId };
