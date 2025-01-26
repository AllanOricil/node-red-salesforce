function setConnectionResult(message, color) {
  const testConnectionResult = document.querySelector(
    '#connection #test-connection-result',
  );
  testConnectionResult.textContent = message;
  testConnectionResult.style.color = color;
}

export { setConnectionResult };
